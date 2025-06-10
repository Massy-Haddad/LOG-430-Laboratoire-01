export default class IInventoryRepository {
	async getStock(storeId, productId) {}
	async decrementStock(storeId, productId, quantity) {}
	async incrementStock(storeId, productId, quantity) {}
	async getAll() {}
	async getAllInventoryForStore(storeId) {}
	async getInventoryByStoreAndProduct(storeId, productId) {}
	async transferStock(fromStoreId, toStoreId, productId, quantity) {}
}
