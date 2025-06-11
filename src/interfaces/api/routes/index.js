
import express from 'express'
import { generateSalesReportController } from '../controllers/generateSalesReportController.js'
import { checkStoreStockController } from '../controllers/checkStoreStockController.js'
import { dashboardController } from '../controllers/dashboardController.js'
import { updateProductController } from '../controllers/updateProductController.js'

const router = express.Router()

router.get('/reports/sales', generateSalesReportController)
router.get('/stores/:storeId/stock', checkStoreStockController)
router.get('/dashboard', dashboardController)
router.put('/products/:productId', updateProductController)

export default router
