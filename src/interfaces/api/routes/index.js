import express from 'express'

// HQ Usecases
import { makeDashboardUseCase } from '../../../usecases/hq/dashboard.js'
import { makeGenerateSalesReportUseCase } from '../../../usecases/hq/generateSalesReport.js'
import { saleRepository } from '../../../infrastructure/postgres/repositories/saleRepository.js'
import { inventoryRepository } from '../../../infrastructure/postgres/repositories/inventoryRepository.js'
import { salesAnalysisRepository } from '../../../infrastructure/postgres/repositories/salesAnalysisRepository.js'

// HQ Controllers
import {
	makeDashboardController,
	makeGenerateSalesReportController,
} from '../controllers/hqController.js'

// RETAIL Usecases
import { makeCheckStockUseCase } from '../../../usecases/retail/checkStock.js'
import { makeUpdateProductUseCase } from '../../../usecases/retail/updateProduct.js'
import { inventoryRepository as inventoryRepoRetail } from '../../../infrastructure/postgres/repositories/inventoryRepository.js'
import { productRepository } from '../../../infrastructure/postgres/repositories/productRepository.js'

// RETAIL Controllers
import {
	makeCheckStoreStockController,
	makeUpdateProductController,
} from '../controllers/retailController.js'

// Instantiate usecases
const dashboardUseCase = makeDashboardUseCase({
	saleRepository,
	inventoryRepository,
})
const generateSalesReportUseCase = makeGenerateSalesReportUseCase({
	salesAnalysisRepository,
})

const checkStockUseCase = makeCheckStockUseCase({
	inventoryRepository: inventoryRepoRetail,
})
const updateProductUseCase = makeUpdateProductUseCase({ productRepository })

// Instantiate controllers
const dashboardController = makeDashboardController({ dashboardUseCase })
const generateSalesReportController = makeGenerateSalesReportController({
	generateSalesReportUseCase,
})

const checkStoreStockController = makeCheckStoreStockController({
	checkStockUseCase,
})
const updateProductController = makeUpdateProductController({
	updateProductUseCase,
})

// Routes
const router = express.Router()

router.get('/dashboard', dashboardController)
router.get('/reports/sales', generateSalesReportController)

router.get('/stores/:storeId/stock', checkStoreStockController)
router.put('/products/:productId', updateProductController)

export default router
