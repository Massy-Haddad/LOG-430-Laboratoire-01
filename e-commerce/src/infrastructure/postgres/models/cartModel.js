import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

/**
 * CartItem Model
 * Represents items in user shopping carts
 */
const CartItemModel = sequelize.define('cart_items', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_name',
  },
  productPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'product_price',
    validate: {
      min: 0,
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100,
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'product_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['product_id'],
    },
  ],
});

export default CartItemModel;
