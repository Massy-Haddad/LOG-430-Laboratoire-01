import { orderRepository } from '../infrastructure/postgres/repositories/orderRepository.js';
import { cartRepository } from '../infrastructure/postgres/repositories/cartRepository.js';

/**
 * Checkout Service
 * Handles business logic for order processing and checkout
 */
export class CheckoutService {
  /**
   * Process checkout and create order
   * @param {string} userId - User ID
   * @param {Object} checkoutData - Checkout data
   * @returns {Promise<Object>} Created order
   */
  async processCheckout(userId, checkoutData) {
    try {
      // Use provided items from checkoutData
      const items = checkoutData.items;
      
      if (!items || items.length === 0) {
        throw new Error('No items provided for checkout');
      }

      // Calculate total amount from provided items
      const totalAmount = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Prepare order data
      const orderData = {
        orderNumber: this._generateOrderNumber(),
        userId,
        status: 'pending',
        totalAmount: totalAmount.toFixed(2),
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: parseFloat(item.price),
          quantity: item.quantity
        })),
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        paymentMethod: this._sanitizePaymentMethod(checkoutData.paymentMethod),
        paymentStatus: 'pending'
      };

      // Create order
      const order = await orderRepository.create(orderData);

      // Process payment
      const paymentResult = await this._processPayment(order, checkoutData.paymentMethod);

      // Update order based on payment result
      if (paymentResult.success) {
        await orderRepository.updatePaymentStatus(order.id, 'completed');
        await orderRepository.updateStatus(order.id, 'confirmed');
        
        // Reserve stock in store service (using provided items)
        await this._reserveStock(items);
        
        // Clear cart after successful checkout (optional - keep cart items for now)
        // await cartRepository.clearCart(userId);
      } else {
        await orderRepository.updatePaymentStatus(order.id, 'failed');
        throw new Error(`Payment failed: ${paymentResult.error}`);
      }

      // Return updated order
      const finalOrder = await orderRepository.findById(order.id);
      return finalOrder.toObject();

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Order data
   */
  async getOrder(orderId, userId) {
    try {
      const order = await orderRepository.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify order belongs to the user
      if (order.userId !== userId) {
        throw new Error('Unauthorized access to order');
      }

      return order.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get orders for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated orders
   */
  async getUserOrders(userId, options = {}) {
    try {
      const result = await orderRepository.getUserOrders(userId, options);
      
      return {
        ...result,
        orders: result.orders.map(order => order.getSummary())
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(orderId, userId, reason = '') {
    try {
      const order = await orderRepository.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify order belongs to the user
      if (order.userId !== userId) {
        throw new Error('Unauthorized access to order');
      }

      // Check if order can be cancelled
      if (!order.isCancellable()) {
        throw new Error(`Order cannot be cancelled. Current status: ${order.status}`);
      }

      // Update order status
      await orderRepository.updateStatus(orderId, 'cancelled');

      // If payment was completed, initiate refund
      if (order.paymentStatus === 'completed') {
        await this._processRefund(order);
        await orderRepository.updatePaymentStatus(orderId, 'refunded');
      }

      // Release reserved stock
      await this._releaseStock(order.items);

      // Return updated order
      const updatedOrder = await orderRepository.findById(orderId);
      return updatedOrder.toObject();

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Date/status filters
   * @returns {Promise<Object>} Order statistics
   */
  async getUserStatistics(userId, filters = {}) {
    try {
      const stats = await orderRepository.getUserStatistics(userId, filters);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track order status
   * @param {string} orderNumber - Order number
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Order tracking info
   */
  async trackOrder(orderNumber, userId) {
    try {
      const order = await orderRepository.findByOrderNumber(orderNumber);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify order belongs to the user
      if (order.userId !== userId) {
        throw new Error('Unauthorized access to order');
      }

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedDelivery: this._calculateEstimatedDelivery(order),
        trackingSteps: this._getTrackingSteps(order)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate cart stock availability
   * @private
   * @param {Array} cartItems - Cart items
   * @throws {Error} If stock is insufficient
   */
  async _validateCartStock(cartItems) {
    // Mock validation - in real scenario, this would call store service
    for (const item of cartItems) {
      const productData = await this._getProductFromStoreService(item.productId);
      
      if (!productData) {
        throw new Error(`Product ${item.productName} is no longer available`);
      }

      if (productData.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}. Available: ${productData.stock}, Requested: ${item.quantity}`);
      }
    }
  }

  /**
   * Process payment
   * @private
   * @param {Object} order - Order data
   * @param {Object} paymentMethod - Payment method
   * @returns {Promise<Object>} Payment result
   */
  async _processPayment(order, paymentMethod) {
    try {
      // Mock payment processing
      // In real scenario, this would integrate with payment gateway
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        return {
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          amount: order.totalAmount,
          currency: 'USD',
          processedAt: new Date()
        };
      } else {
        return {
          success: false,
          error: 'Payment declined by bank',
          code: 'CARD_DECLINED'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Process refund
   * @private
   * @param {Object} order - Order data
   * @returns {Promise<Object>} Refund result
   */
  async _processRefund(order) {
    try {
      // Mock refund processing
      // In real scenario, this would integrate with payment gateway
      
      return {
        success: true,
        refundId: `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: order.totalAmount,
        processedAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reserve stock in store service
   * @private
   * @param {Array} cartItems - Cart items
   */
  async _reserveStock(cartItems) {
    // Mock implementation
    // In real scenario, this would call store service API
    console.log('Reserving stock for items:', cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })));
  }

  /**
   * Release reserved stock
   * @private
   * @param {Array} orderItems - Order items
   */
  async _releaseStock(orderItems) {
    // Mock implementation
    // In real scenario, this would call store service API
    console.log('Releasing stock for items:', orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })));
  }

  /**
   * Get product data from store service
   * @private
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product data
   */
  async _getProductFromStoreService(productId) {
    // Mock implementation
    return {
      id: productId,
      name: `Product ${productId}`,
      price: 29.99,
      stock: 100
    };
  }

  /**
   * Sanitize payment method data
   * @private
   * @param {Object} paymentMethod - Payment method
   * @returns {Object} Sanitized payment method
   */
  _sanitizePaymentMethod(paymentMethod) {
    const sanitized = { ...paymentMethod };
    
    // Remove sensitive data before storing
    if (sanitized.cardNumber) {
      sanitized.cardNumber = `****-****-****-${sanitized.cardNumber.slice(-4)}`;
    }
    delete sanitized.cvv;
    
    return sanitized;
  }

  /**
   * Calculate estimated delivery date
   * @private
   * @param {Object} order - Order data
   * @returns {Date} Estimated delivery date
   */
  _calculateEstimatedDelivery(order) {
    const businessDays = 5; // 5 business days
    const estimatedDate = new Date(order.createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + businessDays);
    return estimatedDate;
  }

  /**
   * Get tracking steps for order
   * @private
   * @param {Object} order - Order data
   * @returns {Array} Tracking steps
   */
  _getTrackingSteps(order) {
    const steps = [
      { status: 'pending', label: 'Order Placed', completed: true, timestamp: order.createdAt },
      { status: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered' }
    ];

    return steps;
  }

  /**
   * Generate unique order number
   * @private
   * @returns {string} Order number
   */
  _generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}
