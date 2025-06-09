export default class IInventoryRepository {
	async getStock(storeId, productId) {}

	async decrementStock(storeId, productId, quantity) {}

	async incrementStock(storeId, productId, quantity) {}

	async getAllInventoryForStore(storeId) {}
}
