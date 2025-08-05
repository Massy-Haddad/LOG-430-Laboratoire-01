import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

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
    field: 'order_number',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
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
    field: 'shipping_address',
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'billing_address',
  },
  paymentMethod: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'payment_method',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    field: 'payment_status',
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shipped_at',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['order_number'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['payment_status'],
    },
    {
      fields: ['created_at'],
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
