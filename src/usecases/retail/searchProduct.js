export function makeSearchProductUseCase({ inventoryRepository }) {
	return {
		async searchInStore(storeId, keyword, type) {
			const inventory = await inventoryRepository.getAllInventoryForStore(
				storeId
			)

			return inventory.filter((item) => {
				const product = item.Product
				if (type === 'id') {
					return product.id.toString() === keyword
				}

				const value = type === 'name' ? product.name : product.category
				return value.toLowerCase().includes(keyword.toLowerCase())
			})
		},
	}
}
