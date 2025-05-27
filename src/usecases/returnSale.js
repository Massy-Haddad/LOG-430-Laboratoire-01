import { saleRepository } from '../infrastructure/repositories/saleRepository.js';
import { productRepository } from '../infrastructure/repositories/productRepository.js';

export async function getSalesByUser(userId) {
  return await saleRepository.findByUser(userId);
}

export async function cancelSale(saleId) {
  const sale = await saleRepository.findById(saleId);

  if (!sale) throw new Error('Vente introuvable.');

  const product = sale.product;
  const newStock = product.stock + sale.quantity;

  await productRepository.updateStock(product.id, newStock);
  await saleRepository.deleteById(saleId);
}
