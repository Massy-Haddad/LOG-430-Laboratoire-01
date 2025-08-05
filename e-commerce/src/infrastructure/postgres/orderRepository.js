import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { Order } from '../../domain/entities/Order.js';
import OrderModel from './orderModel.js';
import AccountModel from './accountModel.js';
import { Op } from 'sequelize';

/**
 * PostgreSQL Order Repository Implementation
 */
export class PostgreSQLOrderRepository extends IOrderRepository {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  async create(orderData) {
    try {
      const orderRecord = await OrderModel.create(orderData);
      return this._mapToEntity(orderRecord);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Order number already exists');
      }
      throw error;
    }
  }

  /**
   * Find order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Order|null>} Order or null
   */
  async findById(id) {
    try {
      const orderRecord = await OrderModel.findByPk(id, {
        include: [{
          model: AccountModel,
          as: 'account',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }]
      });

      return orderRecord ? this._mapToEntity(orderRecord) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise<Order|null>} Order or null
   */
  async findByOrderNumber(orderNumber) {
    try {
      const orderRecord = await OrderModel.findOne({
        where: { orderNumber },
        include: [{
          model: AccountModel,
          as: 'account',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }]
      });

      return orderRecord ? this._mapToEntity(orderRecord) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find orders by account ID
   * @param {string} accountId - Account ID
   * @param {Object} options - Query options
   * @returns {Promise<{orders: Order[], total: number}>} Paginated orders
   */
  async findByAccountId(accountId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        paymentStatus = null,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const where = { accountId };

      // Add status filter
      if (status) {
        where.status = status;
      }

      // Add payment status filter
      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      const { rows: orderRecords, count: total } = await OrderModel.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [{
          model: AccountModel,
          as: 'account',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }]
      });

      const orders = orderRecords.map(record => this._mapToEntity(record));

      return {
        orders,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order
   * @param {string} id - Order ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Order>} Updated order
   */
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await OrderModel.update(updateData, {
        where: { id },
        returning: true
      });

      if (updatedRowsCount === 0) {
        throw new Error('Order not found');
      }

      const updatedOrder = await OrderModel.findByPk(id, {
        include: [{
          model: AccountModel,
          as: 'account',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }]
      });

      return this._mapToEntity(updatedOrder);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Order>} Updated order
   */
  async updateStatus(id, status) {
    try {
      const orderRecord = await OrderModel.findByPk(id);
      
      if (!orderRecord) {
        throw new Error('Order not found');
      }

      await orderRecord.updateStatus(status);
      
      return this._mapToEntity(orderRecord);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update payment status
   * @param {string} id - Order ID
   * @param {string} paymentStatus - New payment status
   * @returns {Promise<Order>} Updated order
   */
  async updatePaymentStatus(id, paymentStatus) {
    try {
      const orderRecord = await OrderModel.findByPk(id);
      
      if (!orderRecord) {
        throw new Error('Order not found');
      }

      await orderRecord.updatePaymentStatus(paymentStatus);
      
      return this._mapToEntity(orderRecord);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all orders with filters
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options
   * @returns {Promise<{orders: Order[], total: number}>} Paginated orders
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const {
        status,
        paymentStatus,
        accountId,
        startDate,
        endDate,
        search
      } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      // Add filters
      if (status) where.status = status;
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (accountId) where.accountId = accountId;

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // Search filter (order number)
      if (search) {
        where.orderNumber = { [Op.iLike]: `%${search}%` };
      }

      const { rows: orderRecords, count: total } = await OrderModel.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [{
          model: AccountModel,
          as: 'account',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }]
      });

      const orders = orderRecords.map(record => this._mapToEntity(record));

      return {
        orders,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics
   * @param {Object} filters - Date/status filters
   * @returns {Promise<Object>} Order statistics
   */
  async getStatistics(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        accountId
      } = filters;

      const where = {};

      // Add filters
      if (accountId) where.accountId = accountId;

      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const orders = await OrderModel.findAll({ where });

      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
        statusBreakdown: {},
        paymentStatusBreakdown: {},
        averageOrderValue: 0
      };

      // Calculate status breakdown
      orders.forEach(order => {
        stats.statusBreakdown[order.status] = (stats.statusBreakdown[order.status] || 0) + 1;
        stats.paymentStatusBreakdown[order.paymentStatus] = (stats.paymentStatusBreakdown[order.paymentStatus] || 0) + 1;
      });

      // Calculate average order value
      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
      }

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database record to domain entity
   * @private
   * @param {Object} record - Database record
   * @returns {Order} Order entity
   */
  _mapToEntity(record) {
    return new Order({
      id: record.id,
      accountId: record.accountId,
      orderNumber: record.orderNumber,
      status: record.status,
      totalAmount: record.totalAmount,
      items: record.items,
      shippingAddress: record.shippingAddress,
      billingAddress: record.billingAddress,
      paymentMethod: record.paymentMethod,
      paymentStatus: record.paymentStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }
}
