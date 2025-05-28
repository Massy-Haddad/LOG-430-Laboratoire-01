export function makeCheckStockUseCase({ productRepository }) {
	return {
		async getAllProducts() {
			return await productRepository.getAll()
		},
	}
}
