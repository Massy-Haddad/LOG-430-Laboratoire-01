import { PostgreSQLCartRepository } from '../infrastructure/postgres/cartRepository.js';

/**
 * Cart Service
 * Handles business logic for shopping cart operations
 */
export class CartService {
  constructor() {
    this.cartRepository = new PostgreSQLCartRepository();
  }

  /**
   * Get cart items for an account
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Cart data with items and summary
   */
  async getCart(accountId) {
    try {
      const [cartItems, cartSummary] = await Promise.all([
        this.cartRepository.getCartItems(accountId),
        this.cartRepository.getCartSummary(accountId)
      ]);

      return {
        items: cartItems.map(item => item.toObject()),
        summary: cartSummary
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to cart
   * @param {string} accountId - Account ID
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Updated cart item
   */
  async addToCart(accountId, itemData) {
    try {
      // Validate product exists by calling store service
      const productData = await this._getProductFromStoreService(itemData.productId);
      
      if (!productData) {
        throw new Error('Product not found');
      }

      // Check stock availability
      if (productData.stock < itemData.quantity) {
        throw new Error(`Insufficient stock. Available: ${productData.stock}`);
      }

      // Prepare cart item data
      const cartItemData = {
        accountId,
        productId: itemData.productId,
        productName: productData.name,
        productPrice: productData.price,
        quantity: itemData.quantity || 1
      };

      const cartItem = await this.cartRepository.addItem(cartItemData);

      return cartItem.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateCartItem(accountId, productId, quantity) {
    try {
      // Validate product exists and check stock
      const productData = await this._getProductFromStoreService(productId);
      
      if (!productData) {
        throw new Error('Product not found');
      }

      if (productData.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${productData.stock}`);
      }

      const cartItem = await this.cartRepository.updateItemQuantity(accountId, productId, quantity);

      return cartItem.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeFromCart(accountId, productId) {
    try {
      const success = await this.cartRepository.removeItem(accountId, productId);
      
      if (!success) {
        throw new Error('Cart item not found');
      }

      return success;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear entire cart
   * @param {string} accountId - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async clearCart(accountId) {
    try {
      return await this.cartRepository.clearCart(accountId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart summary (totals)
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary(accountId) {
    try {
      return await this.cartRepository.getCartSummary(accountId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate cart items before checkout
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Validation result
   */
  async validateCartForCheckout(accountId) {
    try {
      const cartItems = await this.cartRepository.getCartItems(accountId);

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const validationResults = {
        isValid: true,
        errors: [],
        warnings: [],
        validItems: [],
        invalidItems: []
      };

      // Validate each cart item
      for (const cartItem of cartItems) {
        try {
          const productData = await this._getProductFromStoreService(cartItem.productId);
          
          if (!productData) {
            validationResults.invalidItems.push({
              ...cartItem.toObject(),
              error: 'Product no longer exists'
            });
            validationResults.errors.push(`Product "${cartItem.productName}" no longer exists`);
            continue;
          }

          // Check stock availability
          if (productData.stock < cartItem.quantity) {
            if (productData.stock === 0) {
              validationResults.invalidItems.push({
                ...cartItem.toObject(),
                error: 'Product out of stock'
              });
              validationResults.errors.push(`Product "${cartItem.productName}" is out of stock`);
            } else {
              validationResults.warnings.push(
                `Only ${productData.stock} units available for "${cartItem.productName}". Requested: ${cartItem.quantity}`
              );
              validationResults.validItems.push({
                ...cartItem.toObject(),
                adjustedQuantity: productData.stock,
                originalQuantity: cartItem.quantity
              });
            }
            continue;
          }

          // Check price changes
          if (parseFloat(productData.price) !== parseFloat(cartItem.productPrice)) {
            validationResults.warnings.push(
              `Price changed for "${cartItem.productName}". Old: $${cartItem.productPrice}, New: $${productData.price}`
            );
          }

          validationResults.validItems.push({
            ...cartItem.toObject(),
            currentPrice: productData.price,
            currentStock: productData.stock
          });

        } catch (error) {
          validationResults.invalidItems.push({
            ...cartItem.toObject(),
            error: 'Unable to validate product'
          });
          validationResults.errors.push(`Unable to validate product "${cartItem.productName}"`);
        }
      }

      validationResults.isValid = validationResults.errors.length === 0;

      return validationResults;
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
      // Mock implementation - in real scenario, this would call the store service API
      // For now, return mock data to prevent blocking
      return {
        id: productId,
        name: `Product ${productId}`,
        price: 29.99,
        stock: 100
      };
      
      // TODO: Implement actual HTTP call to store service
      // const response = await fetch(`${process.env.STORE_SERVICE_URL}/api/v1/store/products/${productId}`);
      // if (!response.ok) {
      //   return null;
      // }
      // return await response.json();
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  }

  /**
   * Sync cart item with updated product data
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<number>} Number of updated cart items
   */
  async syncProductData(productId, productData) {
    try {
      return await this.cartRepository.updateProductDetails(productId, productData);
    } catch (error) {
      throw error;
    }
  }
}
