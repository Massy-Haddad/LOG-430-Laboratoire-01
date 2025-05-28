export default class Product {
  constructor({ id, name, category, price, stock }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.stock = stock;
  }

  isInStock(quantity) {
    return this.stock >= quantity;
  }

  reduceStock(quantity) {
    if (!this.isInStock(quantity)) {
			throw new Error('Stock insuffisant')
		}
    this.stock -= quantity;
  }
}
