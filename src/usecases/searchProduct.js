import { productRepository } from '../infrastructure/repositories/productRepository.js';

export async function searchProduct(keyword, type) {
  return await productRepository.findBy(keyword, type);
}
