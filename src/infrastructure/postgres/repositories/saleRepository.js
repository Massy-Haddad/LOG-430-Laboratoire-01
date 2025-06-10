import { Sequelize } from 'sequelize'

import { SaleModel, ProductModel, StoreModel } from '../models/index.js'
import Sale from '../../../domain/retail/entities/Sale.js'
import Product from '../../../domain/retail/entities/Product.js'

export const saleRepository = {
	async createSale(saleData) {
		return await SaleModel.create(saleData)
	},

	async findByUser(userId) {
		const rows = await SaleModel.findAll({
			where: { userId },
			include: [ProductModel],
		})

		return rows.map((row) => {
			const sale = new Sale(row.dataValues)
			sale.product = new Product(row.Product?.dataValues)
			return sale
		})
	},

	async findById(saleId) {
		const row = await SaleModel.findOne({
			where: { id: saleId },
			include: [ProductModel],
		})

		if (!row) return null

		const sale = new Sale(row.dataValues)
		sale.product = new Product(row.Product?.dataValues)
		return sale
	},

	async deleteById(saleId) {
		return await SaleModel.destroy({ where: { id: saleId } })
	},

	async getRevenueGroupedByStore() {
		const results = await SaleModel.findAll({
			attributes: [
				'storeId',
				[Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
			],
			include: [{ model: StoreModel, as: 'store', attributes: ['name'] }],
			group: ['storeId', 'store.id'],
		})

		return results.map((r) => ({
			storeId: r.storeId,
			storeName: r.store.name,
			total: parseFloat(r.get('total')),
		}))
	},

	async getDailySalesForWeek() {
		const start = new Date()
		start.setDate(start.getDate() - 6) // les 7 derniers jours

		const results = await SaleModel.findAll({
			attributes: [
				[Sequelize.fn('DATE', Sequelize.col('date')), 'date'],
				[Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
			],
			where: {
				date: {
					[Sequelize.Op.gte]: start,
				},
			},
			group: [Sequelize.fn('DATE', Sequelize.col('date'))],
			order: [[Sequelize.fn('DATE', Sequelize.col('date')), 'ASC']],
		})

		return results.map((r) => ({
			date: r.get('date'),
			total: parseFloat(r.get('total')),
		}))
	},
}
