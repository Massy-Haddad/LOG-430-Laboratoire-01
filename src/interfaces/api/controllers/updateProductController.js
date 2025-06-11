import { makeUpdateProductUseCase } from '../../../usecases/retail/updateProduct.js'
import { productRepository } from '../../../infrastructure/postgres/repositories/productRepository.js'

const updateProductUseCase = makeUpdateProductUseCase({ productRepository })

export const updateProductController = async (req, res) => {
  const productId = parseInt(req.params.productId, 10)
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const updates = req.body
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing request body' })
  }

  try {
    const updatedProduct = await updateProductUseCase.updateProduct(productId, updates)

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
