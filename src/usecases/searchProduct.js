export function makeSearchProductUseCase({ productRepository }) {
	return {
		async searchProduct(keyword, type) {
			return await productRepository.findBy(keyword, type)
		},
	}
}
