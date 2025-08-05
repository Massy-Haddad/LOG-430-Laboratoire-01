/**
 * Cart Repository Interface
 * Defines the contract for cart data operations
 */
export class ICartRepository {
  /**
   * Add item to cart
   * @param {Object} cartItemData - Cart item data
   * @returns {Promise<CartItem>} Created cart item
   */
  async addItem(cartItemData) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get all cart items for an account
   * @param {string} accountId - Account ID
   * @returns {Promise<CartItem[]>} Cart items
   */
  async getCartItems(accountId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find cart item by account and product
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @returns {Promise<CartItem|null>} Cart item or null
   */
  async findItem(accountId, productId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update cart item quantity
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<CartItem>} Updated cart item
   */
  async updateItemQuantity(accountId, productId, quantity) {
    throw new Error('Method must be implemented');
  }

  /**
   * Remove item from cart
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeItem(accountId, productId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Clear all items from cart
   * @param {string} accountId - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async clearCart(accountId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get cart total
   * @param {string} accountId - Account ID
   * @returns {Promise<number>} Cart total amount
   */
  async getCartTotal(accountId) {
    throw new Error('Method must be implemented');
  }
}
