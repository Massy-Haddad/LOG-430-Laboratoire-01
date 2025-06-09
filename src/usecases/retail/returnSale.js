export function makeReturnSaleUseCase({ saleRepository, inventoryRepository }) {
	return {
		async getSalesByUser(userId) {
			return await saleRepository.findByUser(userId)
		},

		async cancelSale(saleId, storeId) {
			const sale = await saleRepository.findById(saleId)
			if (!sale) throw new Error('Vente introuvable.')

			await inventoryRepository.incrementStock(
				storeId,
				sale.productId,
				sale.quantity
			)
			await saleRepository.deleteById(saleId)
		},
	}
}
