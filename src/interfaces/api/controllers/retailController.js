export function makeCheckStoreStockController({ checkStockUseCase }) {
	return async function checkStoreStockController(req, res) {
		const storeId = parseInt(req.params.storeId, 10)

		if (isNaN(storeId)) {
			return res.status(400).json({ error: 'Invalid storeId parameter' })
		}

		try {
			const inventory = await checkStockUseCase.getInventoryByStore(storeId)

			return res.status(200).json({
				storeId,
				items: inventory.map((item) => ({
					productId: item.Product.id,
					name: item.Product.name,
					stock: item.stock,
					threshold: item.threshold,
				})),
			})
		} catch (error) {
			console.error('Error fetching inventory:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}
}

export function makeUpdateProductController({ updateProductUseCase }) {
	return async function updateProductController(req, res) {
		const productId = parseInt(req.params.productId, 10)
		if (isNaN(productId)) {
			return res.status(400).json({ error: 'Invalid product ID' })
		}

		const updates = req.body
		if (!updates || typeof updates !== 'object') {
			return res.status(400).json({ error: 'Invalid or missing request body' })
		}

		try {
			const updatedProduct = await updateProductUseCase.updateProduct(
				productId,
				updates
			)

			if (!updatedProduct) {
				return res.status(404).json({ error: 'Product not found' })
			}

			return res.status(200).json(updatedProduct)
		} catch (error) {
			if (error.message === 'NOT_FOUND') {
				return res.status(404).json({ error: 'Product not found' })
			}
			console.error('Error updating product:', error)
			return res.status(500).json({ error: 'Internal Server Error' })
		}
	}
}
