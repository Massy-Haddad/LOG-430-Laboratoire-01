import { DataTypes } from 'sequelize';

export function defineInventoryModel(sequelize) {
  return sequelize.define('Inventory', {
    storeId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false }
  });
}
