import { productRepository } from '../infrastructure/repositories/productRepository.js';
import { saleRepository } from '../infrastructure/repositories/saleRepository.js';

export async function getAllProducts() {
  return await productRepository.getAll();
}

export async function sellProduct(userId, selectedProducts) {
  for (const item of selectedProducts) {
    const product = item.product;
    const quantity = item.quantity;

    const total = product.price * quantity;

    await saleRepository.createSale({
      userId,
      productId: product.id,
      quantity,
      total,
      date: new Date()
    });

    product.stock -= quantity;
    await productRepository.updateStock(product.id, product.stock);
  }
}
