export function makeSellProductUseCase({ productRepository, saleRepository }) {
	return {
		async sellProduct(userId, selectedProducts) {
			for (const item of selectedProducts) {
				const product = item.product
				const quantity = item.quantity

				// Logique métier déléguée à l'entité
				product.reduceStock(quantity)

				const total = product.price * quantity

				await saleRepository.createSale({
					userId,
					productId: product.id,
					quantity,
					total,
					date: new Date(),
				})

				await productRepository.update(product)
			}
		},

		async getAllProducts() {
			return await productRepository.getAll()
		},
	}
}
