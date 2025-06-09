import { InventoryModel, ProductModel } from '../models/index.js'

export const inventoryRepository = {
	async getStock(storeId, productId) {
		const inventory = await InventoryModel.findOne({
			where: { storeId, productId },
		})
		return inventory ? inventory.stock : null
	},

	async decrementStock(storeId, productId, quantity) {
		const inventory = await InventoryModel.findOne({
			where: { storeId, productId },
		})
		if (!inventory)
			throw new Error('Stock introuvable pour ce magasin/produit.')
		if (inventory.stock < quantity) throw new Error('Stock insuffisant.')
		inventory.stock -= quantity
		await inventory.save()
	},

	async incrementStock(storeId, productId, quantity) {
		const inventory = await InventoryModel.findOne({
			where: { storeId, productId },
		})
		if (!inventory)
			throw new Error('Stock introuvable pour ce magasin/produit.')
		inventory.stock += quantity
		await inventory.save()
	},

	async getAllInventoryForStore(storeId) {
		return await InventoryModel.findAll({
			where: { storeId },
			include: [ProductModel],
			order: [['productId', 'ASC']],
		})
	},
}
