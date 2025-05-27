import { SaleModel, ProductModel } from '../models/index.js';
import Sale from '../../domain/Sale.js';
import Product from '../../domain/Product.js';

export const saleRepository = {  
  async createSale(saleData) {
    return await SaleModel.create(saleData);
  },

  async findByUser(userId) {
    const rows = await SaleModel.findAll({
      where: { userId },
      include: [ProductModel]
    });

    return rows.map(row => {
      const sale = new Sale(row.dataValues);
      sale.product = new Product(row.Product?.dataValues);
      return sale;
    });
  },

  async findById(saleId) {
    const row = await SaleModel.findOne({
      where: { id: saleId },
      include: [ProductModel]
    });

    if (!row) return null;

    const sale = new Sale(row.dataValues);
    sale.product = new Product(row.Product?.dataValues);
    return sale;
  },

  async deleteById(saleId) {
    return await SaleModel.destroy({ where: { id: saleId } });
  }
};
