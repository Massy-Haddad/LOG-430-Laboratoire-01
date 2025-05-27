import { productRepository } from '../infrastructure/repositories/productRepository.js';

export async function getAllProducts() {
  return await productRepository.getAll();
}
