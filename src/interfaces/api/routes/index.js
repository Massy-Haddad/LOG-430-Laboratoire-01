
import express from 'express'

import {
	dashboardController,
	generateSalesReportController,
} from '../controllers/hqController.js'

import {
	checkStoreStockController,
	updateProductController,
} from '../controllers/retailController.js'

const router = express.Router()

router.get('/reports/sales', generateSalesReportController)
router.get('/stores/:storeId/stock', checkStoreStockController)
router.get('/dashboard', dashboardController)
router.put('/products/:productId', updateProductController)

export default router
