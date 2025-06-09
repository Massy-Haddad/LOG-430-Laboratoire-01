export function makeCheckStockUseCase({ inventoryRepository }) {
	return {
		async getInventoryByStore(storeId) {
			return await inventoryRepository.getAllInventoryForStore(storeId)
		},
	}
}
