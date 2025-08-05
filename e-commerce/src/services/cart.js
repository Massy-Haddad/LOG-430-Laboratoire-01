import { cartRepository } from '../infrastructure/postgres/repositories/cartRepository.js';

/**
 * Cart Service
 * Handles business logic for shopping cart operations
 */
export class CartService {
  /**
   * Add item to cart
   * @param {string} userId - User ID
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Cart item
   */
  async addItem(userId, itemData) {
    try {
      const { productId, productName, productPrice, quantity = 1 } = itemData;
      
      // Validate product exists in store service
      const productData = await this._getProductFromStoreService(productId);
      if (!productData) {
        throw new Error('Product not found');
      }

      // Validate stock availability
      if (productData.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${productData.stock}, Requested: ${quantity}`);
      }

      // Add item to cart
      const cartItem = await cartRepository.addItem(
        userId, 
        productId, 
        productName || productData.name, 
        productPrice || productData.price, 
        quantity
      );

      return cartItem.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart items for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart data
   */
  async getCart(userId) {
    try {
      const items = await cartRepository.getCartItems(userId);
      const summary = await cartRepository.getCartSummary(userId);

      return {
        items: items.map(item => item.toObject()),
        summary
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateItemQuantity(userId, productId, quantity) {
    try {
      // Validate quantity
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      // Validate product stock
      const productData = await this._getProductFromStoreService(productId);
      if (productData && productData.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${productData.stock}, Requested: ${quantity}`);
      }

      const updatedItem = await cartRepository.updateItemQuantity(userId, productId, quantity);
      return updatedItem.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeItem(userId, productId) {
    try {
      const removed = await cartRepository.removeItem(userId, productId);
      
      if (!removed) {
        throw new Error('Cart item not found');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear entire cart
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async clearCart(userId) {
    try {
      const clearedCount = await cartRepository.clearCart(userId);
      return clearedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary(userId) {
    try {
      return await cartRepository.getCartSummary(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate cart before checkout
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Validation result
   */
  async validateCart(userId) {
    try {
      const items = await cartRepository.getCartItems(userId);
      
      if (items.length === 0) {
        return {
          valid: false,
          errors: ['Cart is empty']
        };
      }

      const errors = [];
      const validItems = [];

      // Validate each item
      for (const item of items) {
        const productData = await this._getProductFromStoreService(item.productId);
        
        if (!productData) {
          errors.push(`Product ${item.productName} is no longer available`);
          continue;
        }

        if (productData.stock < item.quantity) {
          errors.push(`Insufficient stock for ${item.productName}. Available: ${productData.stock}, In cart: ${item.quantity}`);
          continue;
        }

        // Check if price has changed
        if (parseFloat(productData.price) !== parseFloat(item.productPrice)) {
          errors.push(`Price changed for ${item.productName}. Current: $${productData.price}, In cart: $${item.productPrice}`);
        }

        validItems.push(item);
      }

      return {
        valid: errors.length === 0,
        errors,
        validItems: validItems.map(item => item.toObject()),
        totalAmount: validItems.reduce((total, item) => total + item.getTotalPrice(), 0)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product data from store service
   * @private
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product data
   */
  async _getProductFromStoreService(productId) {
    try {
      // Mock implementation - in real scenario, this would call store service API
      // Example: const response = await fetch(`${process.env.STORE_SERVICE_URL}/api/v1/products/${productId}`);
      
      return {
        id: productId,
        name: `Product ${productId}`,
        price: 29.99,
        stock: 100
      };
    } catch (error) {
      console.error('Error fetching product from store service:', error);
      return null;
    }
  }
}
