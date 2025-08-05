import { DataTypes } from 'sequelize';
import sequelize from './db.js';

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
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
      fields: ['userId', 'productId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['productId'],
    },
  ],
});

export default CartItemModel;
