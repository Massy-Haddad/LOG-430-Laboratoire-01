import { inventoryRepository } from '../infrastructure/postgres/repositories/inventoryRepository.js';
import { productRepository } from '../infrastructure/postgres/repositories/productRepository.js';

// Récupère l’inventaire d’un magasin par son identifiant
export const getInventoryByStore = async (storeId) => {
  if (!storeId) throw new Error("storeId requis");
  return await inventoryRepository.getAllInventoryForStore(storeId);
};

// Récupère le stock du centre logistique (convention : storeId = 0)
export const getInventoryFromLogisticCenter = async () => {
  return await inventoryRepository.getAllInventoryForStore(0);
};

// Met à jour un produit (ne pas confondre avec l'inventaire)
export const updateProduct = async (productId, updates) => {
  if (!productId || !updates) throw new Error("Paramètres invalides");

  const product = await productRepository.findById(productId);
  if (!product) throw new Error("Produit non trouvé");

  return await productRepository.update(productId, updates);
};