import { CartService } from '../../services/cart.js';
import { validate, cartSchemas } from '../../domain/validators/schemas.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { recordCartOperation } from '../middlewares/metricsMiddleware.js';

/**
 * Cart Controller
 * Handles HTTP requests for cart operations
 */
export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Get user's cart
   * GET /api/v1/cart
   */
  getCart = asyncHandler(async (req, res) => {
    const cart = await this.cartService.getCart(req.userId);
    recordCartOperation('get_cart');
    
    res.json({
      success: true,
      data: cart
    });
  });

  /**
   * Add item to cart
   * POST /api/v1/cart
   */
  addItem = asyncHandler(async (req, res) => {
    const { error, value } = cartSchemas.addItem.validate(req.body);
    if (error) {
      recordCartOperation('add_item', 'validation_error');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    try {
      const cartItem = await this.cartService.addItem(req.userId, value);
      recordCartOperation('add_item');
      
      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: { cartItem }
      });
    } catch (error) {
      recordCartOperation('add_item', 'error');
      throw error;
    }
  });

  /**
   * Update cart item quantity
   * PUT /api/v1/cart/:productId
   */
  updateItem = asyncHandler(async (req, res) => {
    const { error, value } = cartSchemas.updateItem.validate(req.body);
    if (error) {
      recordCartOperation('update_item', 'validation_error');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    try {
      const updatedItem = await this.cartService.updateItemQuantity(
        req.userId, 
        req.params.productId, 
        value.quantity
      );
      recordCartOperation('update_item');
      
      res.json({
        success: true,
        message: 'Cart item updated',
        data: { cartItem: updatedItem }
      });
    } catch (error) {
      recordCartOperation('update_item', 'error');
      throw error;
    }
  });

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/:productId
   */
  removeItem = asyncHandler(async (req, res) => {
    try {
      await this.cartService.removeItem(req.userId, req.params.productId);
      recordCartOperation('remove_item');
      
      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      recordCartOperation('remove_item', 'error');
      throw error;
    }
  });

  /**
   * Clear entire cart
   * DELETE /api/v1/cart
   */
  clearCart = asyncHandler(async (req, res) => {
    try {
      await this.cartService.clearCart(req.userId);
      recordCartOperation('clear_cart');
      
      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } catch (error) {
      recordCartOperation('clear_cart', 'error');
      throw error;
    }
  });

  /**
   * Get cart summary
   * GET /api/v1/cart/summary
   */
  getCartSummary = asyncHandler(async (req, res) => {
    const summary = await this.cartService.getCartSummary(req.userId);
    recordCartOperation('get_summary');
    
    res.json({
      success: true,
      data: { summary }
    });
  });

  /**
   * Validate cart
   * POST /api/v1/cart/validate
   */
  validateCart = asyncHandler(async (req, res) => {
    const validation = await this.cartService.validateCart(req.userId);
    recordCartOperation('validate_cart');
    
    res.json({
      success: true,
      data: validation
    });
  });
}
