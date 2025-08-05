/**
 * Order Repository Interface
 * Defines the contract for order data operations
 */
export class IOrderRepository {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  async create(orderData) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Order|null>} Order or null
   */
  async findById(id) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise<Order|null>} Order or null
   */
  async findByOrderNumber(orderNumber) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find orders by account ID
   * @param {string} accountId - Account ID
   * @param {Object} options - Query options
   * @returns {Promise<{orders: Order[], total: number}>} Paginated orders
   */
  async findByAccountId(accountId, options = {}) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Order>} Updated order
   */
  async update(id, updateData) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Order>} Updated order
   */
  async updateStatus(id, status) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update payment status
   * @param {string} id - Order ID
   * @param {string} paymentStatus - New payment status
   * @returns {Promise<Order>} Updated order
   */
  async updatePaymentStatus(id, paymentStatus) {
    throw new Error('Method must be implemented');
  }

  /**
   * Find all orders with filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<{orders: Order[], total: number}>} Paginated orders
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get order statistics
   * @param {Object} filters - Date/status filters
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(filters = {}) {
    throw new Error('Method must be implemented');
  }
}
