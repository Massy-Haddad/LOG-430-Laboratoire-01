import express from 'express';

// Controllers
import {
  checkStoreStockController,
  updateProductController
} from '../controllers/stockController.js';

// Metrics
import {
  metricsEndpoint,
} from '../middlewares/metricsMiddleware.js';

const router = express.Router();

// Metrics Prometheus
router.get('/metrics', metricsEndpoint);

// Récupérer le stock d’un magasin
router.get('/:storeId', checkStoreStockController);

// Récupérer les informations d’un produit
// router.get('/products/:productId', getProductController);

// Mettre à jour un produit
router.put('/products/:productId', updateProductController);

export default router;
