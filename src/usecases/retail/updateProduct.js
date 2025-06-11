export function makeUpdateProductUseCase({ productRepository }) {
  return {
    async updateProduct(productId, updates) {
      const product = await productRepository.findById(productId)
      if (!product) {
        throw new Error("NOT_FOUND")
      }

      return await productRepository.update(productId, updates)
    }
  }
}
