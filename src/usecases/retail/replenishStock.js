export function makeReplenishStockUseCase({ inventoryRepository }) {
  return {
    async getLocalStockBelowThreshold(storeId, threshold) {
      const stock = await inventoryRepository.getAllInventoryForStore(storeId);
      return stock.filter(item => item.stock < threshold);
    },

    async getLogisticStockForProduct(productId) {
      return await inventoryRepository.getInventoryByStoreAndProduct(0, productId);
    },

    async transferFromLogisticCenter(toStoreId, productId, quantity) {
      await inventoryRepository.transferStock(0, toStoreId, productId, quantity);
    }
  };
}
