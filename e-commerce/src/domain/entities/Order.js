/**
 * Order Entity
 * Represents a completed order in the e-commerce system
 */
export class Order {
  constructor({
    id,
    userId,
    orderNumber,
    status = 'pending',
    totalAmount,
    items = [],
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentStatus = 'pending',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.userId = userId;
    this.orderNumber = orderNumber || this.generateOrderNumber();
    this.status = status;
    this.totalAmount = parseFloat(totalAmount || 0);
    this.items = items;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Generate a unique order number
   * @returns {string} Order number
   */
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Calculate total amount from items
   * @returns {number} Total amount
   */
  calculateTotalAmount() {
    return this.items.reduce((total, item) => {
      return total + (item.quantity * item.productPrice);
    }, 0);
  }

  /**
   * Add item to order
   * @param {object} item - Order item
   */
  addItem(item) {
    this.items.push({
      productId: item.productId,
      productName: item.productName,
      productPrice: parseFloat(item.productPrice),
      quantity: parseInt(item.quantity)
    });
    this.totalAmount = this.calculateTotalAmount();
    this.updatedAt = new Date();
  }

  /**
   * Update order status
   * @param {string} newStatus - New status
   */
  updateStatus(newStatus) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Update payment status
   * @param {string} newPaymentStatus - New payment status
   */
  updatePaymentStatus(newPaymentStatus) {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(newPaymentStatus)) {
      throw new Error(`Invalid payment status: ${newPaymentStatus}`);
    }
    this.paymentStatus = newPaymentStatus;
    this.updatedAt = new Date();
  }

  /**
   * Check if order can be cancelled
   * @returns {boolean} True if cancellable
   */
  isCancellable() {
    return ['pending', 'confirmed'].includes(this.status);
  }

  /**
   * Get order as plain object
   * @returns {object} Order data
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      orderNumber: this.orderNumber,
      status: this.status,
      totalAmount: this.totalAmount,
      itemCount: this.items.length,
      items: this.items,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Get order summary (without detailed items)
   * @returns {object} Order summary
   */
  getSummary() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      status: this.status,
      totalAmount: this.totalAmount,
      itemCount: this.items.length,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Validate order data
   * @returns {boolean} True if valid
   */
  isValid() {
    return !!(
      this.userId &&
      this.orderNumber &&
      this.totalAmount >= 0 &&
      this.items.length > 0 &&
      this.shippingAddress &&
      this.paymentMethod
    );
  }
}
