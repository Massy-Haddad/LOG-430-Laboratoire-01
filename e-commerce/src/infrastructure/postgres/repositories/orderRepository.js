import { Op } from 'sequelize';
import OrderModel from '../models/orderModel.js';
import { Order } from '../../../domain/entities/Order.js';

export const orderRepository = {
  /**
   * Create a new order
   */
  async create(orderData) {
    const order = await OrderModel.create(orderData);
    return new Order(order.dataValues);
  },

  /**
   * Find order by ID
   */
  async findById(orderId) {
    const order = await OrderModel.findByPk(orderId);
    return order ? new Order(order.dataValues) : null;
  },

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber) {
    const order = await OrderModel.findOne({
      where: { orderNumber }
    });
    return order ? new Order(order.dataValues) : null;
  },

  /**
   * Get orders for a user with pagination
   */
  async getUserOrders(userId, { page = 1, limit = 10, status = null } = {}) {
    const offset = (page - 1) * limit;
    const where = { userId };

    if (status) {
      where.status = status;
    }

    const { rows: orders, count: total } = await OrderModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      orders: orders.map(order => new Order(order.dataValues)),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  /**
   * Update order status
   */
  async updateStatus(orderId, status) {
    const [updatedRowsCount] = await OrderModel.update(
      { 
        status,
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() })
      },
      { where: { id: orderId } }
    );

    if (updatedRowsCount === 0) {
      throw new Error('Order not found');
    }

    const updatedOrder = await OrderModel.findByPk(orderId);
    return new Order(updatedOrder.dataValues);
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    const [updatedRowsCount] = await OrderModel.update(
      { paymentStatus },
      { where: { id: orderId } }
    );

    if (updatedRowsCount === 0) {
      throw new Error('Order not found');
    }

    const updatedOrder = await OrderModel.findByPk(orderId);
    return new Order(updatedOrder.dataValues);
  },

  /**
   * Get order statistics for a user
   */
  async getUserStatistics(userId, { startDate, endDate } = {}) {
    const where = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const orders = await OrderModel.findAll({ where });

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      statusBreakdown: {},
      averageOrderValue: 0
    };

    // Calculate status breakdown
    orders.forEach(order => {
      stats.statusBreakdown[order.status] = (stats.statusBreakdown[order.status] || 0) + 1;
    });

    // Calculate average order value
    if (stats.totalOrders > 0) {
      stats.averageOrderValue = stats.totalSpent / stats.totalOrders;
    }

    return stats;
  }
};
