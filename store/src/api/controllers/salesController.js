import { sellProduct } from '../../services/salesService.js'

export const sellProductController = async (req, res) => {
  const storeId = parseInt(req.body.storeId, 10)
  const productId = parseInt(req.body.productId, 10)
  const quantity = parseInt(req.body.quantity, 10)
  const userId = req.body.userId ?? null // facultatif

  if (isNaN(storeId) || isNaN(productId) || isNaN(quantity)) {
    return res.status(400).json({ error: 'Invalid or missing parameters' })
  }

  try {
    const sale = await sellProduct(storeId, productId, quantity, userId)
    return res.status(201).json(sale)
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'Product not found' })
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ error: 'Not enough stock available' })
    }

    console.error('Sell Product Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
