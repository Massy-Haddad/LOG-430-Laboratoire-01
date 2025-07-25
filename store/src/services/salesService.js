import { productRepository } from '../infrastructure/postgres/repositories/productRepository.js'
import { inventoryRepository } from '../infrastructure/postgres/repositories/inventoryRepository.js'
import { saleRepository } from '../infrastructure/postgres/repositories/saleRepository.js'

/**
 * Effectue une vente de produit pour un magasin
 * @param {number} storeId - ID du magasin
 * @param {number} productId - ID du produit
 * @param {number} quantity - Quantité vendue
 * @param {number} userId - ID de l'utilisateur (optionnel selon modèle)
 */
export async function sellProduct(storeId, productId, quantity, userId = null) {
  // Vérifier que le produit existe
  const product = await productRepository.getById(productId)
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND')
  }

  // Vérifier le stock disponible
  const stockEntry = await inventoryRepository.getStock(storeId, productId)
  if (!stockEntry || stockEntry.stock < quantity) {
    throw new Error('INSUFFICIENT_STOCK')
  }

  // Créer la vente
  const saleData = {
    storeId,
    productId,
    quantity,
    userId,
    date: new Date(),
  }

  const sale = await saleRepository.createSale(saleData)

  // Mettre à jour le stock
  await inventoryRepository.decreaseStock(storeId, productId, quantity)

  return sale
}
