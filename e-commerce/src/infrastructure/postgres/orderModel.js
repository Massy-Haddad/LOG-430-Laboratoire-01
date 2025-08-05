import { DataTypes } from 'sequelize';
import sequelize from './db.js';

/**
 * Order Model
 * Represents completed orders in the e-commerce system
 */
const OrderModel = sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['orderNumber'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentStatus'],
    },
    {
      fields: ['createdAt'],
    },
  ],
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        order.orderNumber = `ORD-${timestamp}-${random}`;
      }
    },
  },
});

export default OrderModel;
