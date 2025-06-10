
import { makeCheckStockUseCase } from '../../../usecases/retail/checkStock.js'
import { inventoryRepository } from '../../../infrastructure/postgres/repositories/inventoryRepository.js'

const checkStockUseCase = makeCheckStockUseCase({
  inventoryRepository
})

export const checkStoreStockController = async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10)

  if (isNaN(storeId)) {
    return res.status(400).json({ error: 'Invalid storeId parameter' })
  }

  try {
    const stock = await checkStockUseCase.getInventoryByStore(storeId)
    return res.status(200).json(stock)
  } catch (error) {
    console.error('Error fetching stock:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
