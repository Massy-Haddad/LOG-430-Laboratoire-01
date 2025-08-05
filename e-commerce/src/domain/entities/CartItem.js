/**
 * CartItem Entity
 * Represents an item in a shopping cart
 */
export class CartItem {
  constructor({
    id,
    userId,
    productId,
    productName,
    productPrice,
    quantity = 1,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.userId = userId;
    this.productId = productId;
    this.productName = productName;
    this.productPrice = parseFloat(productPrice);
    this.quantity = parseInt(quantity);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Calculate total price for this cart item
   * @returns {number} Total price (quantity * unit price)
   */
  getTotalPrice() {
    return this.quantity * this.productPrice;
  }

  /**
   * Update quantity
   * @param {number} newQuantity - New quantity
   * @throws {Error} If quantity is invalid
   */
  updateQuantity(newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    this.quantity = quantity;
    this.updatedAt = new Date();
  }

  /**
   * Get cart item as plain object
   * @returns {object} Cart item data
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      productId: this.productId,
      productName: this.productName,
      productPrice: this.productPrice,
      quantity: this.quantity,
      totalPrice: this.getTotalPrice(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Validate cart item data
   * @returns {boolean} True if valid
   */
  isValid() {
    return !!(
      this.userId &&
      this.productId &&
      this.productName &&
      this.productPrice >= 0 &&
      this.quantity > 0
    );
  }
}
