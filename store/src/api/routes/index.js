import express from 'express';

// Controllers
import {
  checkStoreStockController,
  updateProductController
} from '../controllers/stockController.js';
import {
  sellProductController
} from '../controllers/salesController.js';
import { generateSalesReportController } from '../controllers/reportsController.js'

// Metrics
import {
  metricsEndpoint,
} from '../middlewares/metricsMiddleware.js';

const router = express.Router();

// Metrics Prometheus
router.get('/metrics', metricsEndpoint);

// Récupérer le stock d’un magasin
router.get('/stock/:storeId', checkStoreStockController);

// Vendre un produit
router.post('/sales', sellProductController)

// Générer un rapport de ventes
router.get('/reports/sales', generateSalesReportController);

// Récupérer les informations d’un produit
// router.get('/products/:productId', getProductController);

// Mettre à jour un produit
router.put('/products/:productId', updateProductController);

export default router;
