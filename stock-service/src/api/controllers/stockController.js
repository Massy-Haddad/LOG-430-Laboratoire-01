import redisClient from '../../infrastructure/redis/redisClient.js';
import {
  getInventoryByStore,
  updateProduct
} from '../../services/stockService.js';

// Vérifier le stock d’un magasin
export const checkStoreStockController = async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);

  if (isNaN(storeId)) {
    return res.status(400).json({ error: 'Invalid storeId parameter' });
  }

  const cacheKey = `stock:store:${storeId}`; // nommage plus explicite

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      try {
        console.log(`Cache hit for ${cacheKey}`);
        return res.status(200).json(JSON.parse(cached));
      } catch (parseError) {
        console.warn(`⚠️ Cache corrompu pour ${cacheKey}, rechargement depuis DB`);
      }
    }

    const inventory = await getInventoryByStore(storeId);

    const response = {
      storeId,
      items: inventory.map(item => ({
        productId: item.Product?.id || null,
        name: item.Product?.name || null,
        stock: item.stock,
        threshold: item.threshold
      }))
    };

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });
    console.log(`Cache miss for ${cacheKey} - loaded from DB and cached`);

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Modifier un produit
export const updateProductController = async (req, res) => {
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Invalid or missing request body' });
  }

  try {
    const updatedProduct = await updateProduct(productId, updates);

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optionnel : invalider le cache lié (si le produit appartient à un magasin connu)
    // const storeId = ... (à récupérer si tu as cette info)
    // await redisClient.del(`stock:store:${storeId}`);

    return res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
