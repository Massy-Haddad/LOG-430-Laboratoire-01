import { CheckoutService } from '../../services/checkoutService.js';
import { validate, orderSchemas } from '../../domain/validators/schemas.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { recordOrderOperation, recordCheckoutDuration } from '../middlewares/metricsMiddleware.js';

/**
 * Checkout Controller
 * Handles HTTP requests for checkout and order operations
 */
export class CheckoutController {
  constructor() {
    this.checkoutService = new CheckoutService();
  }

  /**
   * Process checkout
   * POST /api/v1/checkout
   */
  processCheckout = asyncHandler(async (req, res) => {
    const { error, value } = orderSchemas.create.validate(req.body);
    if (error) {
      recordOrderOperation('checkout', 'validation_error');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const startTime = Date.now();
    
    try {
      const order = await this.checkoutService.processCheckout(req.userId, value);
      const duration = (Date.now() - startTime) / 1000;
      
      recordOrderOperation('checkout');
      recordCheckoutDuration(duration);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      recordOrderOperation('checkout', 'error');
      recordCheckoutDuration(duration, 'error');
      throw error;
    }
  });

  /**
   * Get user's orders
   * GET /api/v1/orders
   */
  getOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      ...(status && { status })
    };

    const result = await this.checkoutService.getUserOrders(req.userId, options);
    recordOrderOperation('get_orders');
    
    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get order by ID
   * GET /api/v1/orders/:orderId
   */
  getOrder = asyncHandler(async (req, res) => {
    const order = await this.checkoutService.getOrder(req.params.orderId, req.userId);
    recordOrderOperation('get_order');
    
    res.json({
      success: true,
      data: { order }
    });
  });

  /**
   * Cancel order
   * POST /api/v1/orders/:orderId/cancel
   */
  cancelOrder = asyncHandler(async (req, res) => {
    const { reason = '' } = req.body;
    
    try {
      const order = await this.checkoutService.cancelOrder(
        req.params.orderId, 
        req.userId, 
        reason
      );
      recordOrderOperation('cancel_order');
      
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order }
      });
    } catch (error) {
      recordOrderOperation('cancel_order', 'error');
      throw error;
    }
  });

  /**
   * Track order
   * GET /api/v1/orders/:orderNumber/track
   */
  trackOrder = asyncHandler(async (req, res) => {
    const tracking = await this.checkoutService.trackOrder(
      req.params.orderNumber, 
      req.userId
    );
    recordOrderOperation('track_order');
    
    res.json({
      success: true,
      data: { tracking }
    });
  });

  /**
   * Get order statistics
   * GET /api/v1/orders/statistics
   */
  getOrderStatistics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const stats = await this.checkoutService.getOrderStatistics(req.userId, filters);
    recordOrderOperation('get_statistics');
    
    res.json({
      success: true,
      data: { statistics: stats }
    });
  });
}
