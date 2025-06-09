export function makeCheckStockUseCase({ inventoryRepository }) {
  return {
    async getInventoryByStore(storeId) {
      return await inventoryRepository.getAllInventoryForStore(storeId);
    },

    async getInventoryFromLogisticCenter() {
      return await inventoryRepository.getAllInventoryForStore(0); // convention storeId=0 for logistic center
    }
  };
}
