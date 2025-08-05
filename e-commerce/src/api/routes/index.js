import express from 'express';
import { CartController } from '../controllers/cartController.js';
import { CheckoutController } from '../controllers/checkoutController.js';
import { validateJWT, strictRateLimit } from '../middlewares/authMiddleware.js';
import { metricsHandler, healthCheckHandler } from '../middlewares/metricsMiddleware.js';

const router = express.Router();

// Initialize controllers
const cartController = new CartController();
const checkoutController = new CheckoutController();

// Health check
router.get('/health', healthCheckHandler);

// Metrics endpoint
router.get('/metrics', metricsHandler);

// Debug endpoint to see headers (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug-headers', (req, res) => {
    res.json({
      headers: req.headers,
      user: req.user,
      'X-User-Id': req.get('X-User-Id'),
      'X-User-Name': req.get('X-User-Name'),
      'X-User-Role': req.get('X-User-Role'),
      'X-Store-Id': req.get('X-Store-Id')
    });
  });
}

// Apply JWT validation to protected routes
router.use(validateJWT);

// Cart routes  
router.get('/cart', strictRateLimit, cartController.getCart);
router.post('/cart', strictRateLimit, cartController.addItem);
router.put('/cart/:productId', strictRateLimit, cartController.updateItem);
router.delete('/cart/:productId', strictRateLimit, cartController.removeItem);
router.delete('/cart', strictRateLimit, cartController.clearCart);
router.get('/cart/summary', strictRateLimit, cartController.getCartSummary);
router.post('/cart/validate', strictRateLimit, cartController.validateCart);

// Checkout routes
router.post('/checkout', strictRateLimit, checkoutController.processCheckout);

// Order routes
router.get('/orders', checkoutController.getOrders);
router.get('/orders/statistics', checkoutController.getOrderStatistics);
router.get('/orders/:orderId', checkoutController.getOrder);
router.post('/orders/:orderId/cancel', checkoutController.cancelOrder);
router.get('/orders/:orderNumber/track', checkoutController.trackOrder);

export default router;
