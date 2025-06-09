export function makeSellProductUseCase({
	productRepository,
	saleRepository,
	inventoryRepository,
}) {
	return {
		async sellProduct(user, selectedProducts) {
			for (const product of selectedProducts) {

				// Logique métier déléguée à l'entité
				await inventoryRepository.decrementStock(
					user.storeId,
					product.id,
					product.quantity
				)

				const total = product.price * product.quantity

				await saleRepository.createSale({
					userId: user.id,
					storeId: user.storeId,
					productId: product.id,
					quantity: product.quantity,
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
