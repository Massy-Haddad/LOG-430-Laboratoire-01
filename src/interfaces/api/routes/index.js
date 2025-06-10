
import express from 'express'
import { generateSalesReportController } from '../controllers/generateSalesReportController.js'
import { checkStoreStockController } from '../controllers/checkStoreStockController.js'

const router = express.Router()

router.get('/reports/sales', generateSalesReportController)
router.get('/stores/:storeId/stock', checkStoreStockController)

export default router
