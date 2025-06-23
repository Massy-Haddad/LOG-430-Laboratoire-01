import { ProductModel } from '../models/index.js'
import { Op } from 'sequelize'
import Product from '../../../domain/retail/entities/Product.js'

export const productRepository = {
	async findBy(keyword, type) {
		if (type === 'id') {
			const id = parseInt(keyword, 10)
			if (isNaN(id)) throw new Error('ID invalide.')
			return await this.findById(id) // Renvoie un tableau ou []
		}

		const clause =
			type === 'nom'
				? { name: { [Op.iLike]: `%${keyword}%` } }
				: { category: { [Op.iLike]: `%${keyword}%` } }

		const rows = await ProductModel.findAll({ where: clause })
		return rows.map((row) => new Product(row.dataValues))
	},

	async getAll() {
		const rows = await ProductModel.findAll({
			order: [['id', 'ASC']],
		})
		return rows.map((row) => new Product(row.dataValues))
	},

	async findById(id) {
		const row = await ProductModel.findByPk(id)
		return row ? new Product(row.dataValues) : null
	},

	async update(product) {
		await ProductModel.update(
			{
				name: product.name,
				category: product.category,
				price: product.price,
			},
			{ where: { id: product.id } }
		)
	},
}
