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

import { authenticateToken } from '../middlewares/authenticateToken.js'

// SHARED Usecase
import { makeAuthenticateUserUseCase } from '../../../usecases/shared/authenticateUser.js'
import { userRepository } from '../../../infrastructure/postgres/repositories/userRepository.js'

// SHARED Controller
import { makeLoginController } from '../controllers/authController.js'

// Instanciation
const authenticateUserUseCase = makeAuthenticateUserUseCase({ userRepository })
const loginController = makeLoginController({ authenticateUserUseCase })

const router = express.Router()

// Metrics
import {
	metricsEndpoint,
} from '../middlewares/metricsMiddleware.js'
router.get('/metrics', metricsEndpoint)

// Routes publiques
router.post('/auth/login', loginController) // 👈 route publique

router.use(authenticateToken) // 👈 appliquer ensuite aux routes privées

router.get('/dashboard', dashboardController) // ✅ maintenant protégée

router.get('/reports/sales', generateSalesReportController)

router.get('/stores/:storeId/stock', checkStoreStockController)
router.put('/products/:productId', updateProductController)

export default router
