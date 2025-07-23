| Domaine couvert : | produits, stock, ventes, reporting |
| ----------------- | ---------------------------------- |

store-service/
├── Dockerfile
├── package.json
├── .env
└── src/
    ├── api/
    │   ├── controllers/
    │   │   ├── productController.js       # CRUD produits
    │   │   ├── stockController.js         # GET stock par magasin
    │   │   ├── salesController.js         # POST vente
    │   │   └── reportController.js        # GET rapport ventes
    │   ├── routes/
    │   │   └── index.js                   # routes REST (v1/products, /stock, /sales, /reports)
    │   ├── middlewares/
    │   │   ├── metricsMiddleware.js
    │   │   └── errorHandler.js
    │   └── server.js
    │
    ├── services/
    │   ├── productService.js
    │   ├── stockService.js
    │   ├── salesService.js
    │   └── reportService.js
    │
    ├── entities/
    │   ├── Product.js
    │   ├── Stock.js
    │   └── Sale.js
    │
    └── infrastructure/
        ├── postgres/
        │   ├── db.js
        │   ├── productModel.js
        │   ├── stockModel.js
        │   └── saleModel.js
        └── redis/
            └── redisClient.js

| Domaine couvert : | création de comptes, panier, commande |
| ----------------- | ------------------------------------- |

ecommerce-service/
├── Dockerfile
├── package.json
├── .env
└── src/
    ├── api/
    │   ├── controllers/
    │   │   ├── accountController.js       # POST /signup, GET /clients/:id
    │   │   ├── cartController.js          # POST /cart, DELETE /cart/:id
    │   │   └── checkoutController.js      # POST /checkout
    │   ├── routes/
    │   │   └── index.js                   # routes REST (v1/accounts, /cart, /checkout)
    │   ├── middlewares/
    │   │   ├── metricsMiddleware.js
    │   │   └── errorHandler.js
    │   └── server.js
    │
    ├── services/
    │   ├── accountService.js
    │   ├── cartService.js
    │   └── checkoutService.js
    │
    ├── entities/
    │   ├── Account.js
    │   ├── CartItem.js
    │   └── Order.js
    │
    └── infrastructure/
        └── postgres/
            ├── db.js
            ├── accountModel.js
            ├── cartModel.js
            └── orderModel.js
