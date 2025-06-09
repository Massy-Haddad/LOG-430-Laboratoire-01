import { Op } from 'sequelize';
import { SaleModel, ProductModel, StoreModel } from '../models/index.js';
import SalesReport from '../../../domain/hq/entities/SalesReport.js';

export const salesAnalysisRepository = {
  async generateSalesReport(startDate, endDate) {
    const stores = await StoreModel.findAll();
    const summaryByStore = [];

    for (const store of stores) {
      const sales = await SaleModel.findAll({
        where: {
          storeId: store.id,
          date: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        include: [ProductModel]
      });

      const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
      const productStats = new Map();

      for (const sale of sales) {
        const product = sale.Product;
        if (!productStats.has(product.id)) {
          productStats.set(product.id, {
            name: product.name,
            quantity: 0,
            price: product.price
          });
        }

        const entry = productStats.get(product.id);
        entry.quantity += sale.quantity;
      }

      const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // top 5

      summaryByStore.push({
        storeName: store.name,
        totalSales,
        topProducts
      });
    }

    return new SalesReport({ startDate, endDate, summaryByStore });
  }
};
