import { InventoryModel, ProductModel, StoreModel } from '../models/index.js'

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

	async getAll() {
		return await InventoryModel.findAll({
			include: [ProductModel, StoreModel],
		})
	},

	async getAllInventoryForStore(storeId) {
		return await InventoryModel.findAll({
			where: { storeId },
			include: [ProductModel],
			order: [['productId', 'ASC']],
		})
	},

	async getInventoryByStoreAndProduct(storeId, productId) {
		return await InventoryModel.findOne({
			where: { storeId, productId },
			include: [ProductModel],
		})
	},

	async transferStock(fromStoreId, toStoreId, productId, quantity) {
		// 1. Réduire le stock du centre logistique (storeId = 0)
		const fromInventory = await InventoryModel.findOne({
			where: { storeId: fromStoreId, productId },
		})

		if (!fromInventory || fromInventory.stock < quantity) {
			throw new Error('Stock insuffisant au centre logistique.')
		}

		fromInventory.stock -= quantity
		await fromInventory.save()

		// 2. Ajouter au stock du magasin de destination
		const [toInventory] = await InventoryModel.findOrCreate({
			where: { storeId: toStoreId, productId },
			defaults: { stock: 0 },
		})

		toInventory.stock += quantity
		await toInventory.save()
	},
}
