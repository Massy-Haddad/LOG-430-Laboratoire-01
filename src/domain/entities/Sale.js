export default class Sale {
  constructor({ id, userId, productId, quantity, total, date }) {
    this.id = id;
    this.userId = userId;
    this.productId = productId;
    this.quantity = quantity;
    this.total = total;
    this.date = date;
  }
}
