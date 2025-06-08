export function makeReturnSaleUseCase({ saleRepository, productRepository }) {
	return {
		async getSalesByUser(userId) {
			return await saleRepository.findByUser(userId)
		},

		async cancelSale(saleId) {
			const sale = await saleRepository.findById(saleId)
			if (!sale) throw new Error('Vente introuvable.')

			const product = sale.product
			const newStock = product.stock + sale.quantity

			await productRepository.updateStock(product.id, newStock)
			await saleRepository.deleteById(saleId)
		},
	}
}
