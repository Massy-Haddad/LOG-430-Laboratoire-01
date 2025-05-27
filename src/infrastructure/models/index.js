import { sequelize } from '../database.js';
import { defineProductModel } from './product.model.js';
import { defineUserModel } from './user.model.js';
import { defineSaleModel } from './sale.model.js';

const ProductModel = defineProductModel(sequelize);
const UserModel = defineUserModel(sequelize);
const SaleModel = defineSaleModel(sequelize);

// Associations
UserModel.hasMany(SaleModel, { foreignKey: 'userId' });
ProductModel.hasMany(SaleModel, { foreignKey: 'productId' });
SaleModel.belongsTo(UserModel, { foreignKey: 'userId' });
SaleModel.belongsTo(ProductModel, { foreignKey: 'productId' });

export { ProductModel, UserModel, SaleModel };
