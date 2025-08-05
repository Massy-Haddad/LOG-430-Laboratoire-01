import { IAccountRepository } from '../../domain/repositories/IAccountRepository.js';
import { Account } from '../../domain/entities/Account.js';
import AccountModel from './accountModel.js';
import { Op } from 'sequelize';

/**
 * PostgreSQL Account Repository Implementation
 */
export class PostgreSQLAccountRepository extends IAccountRepository {
  /**
   * Create a new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Account>} Created account
   */
  async create(accountData) {
    try {
      const accountRecord = await AccountModel.create(accountData);
      return this._mapToEntity(accountRecord);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Account with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Find account by ID
   * @param {string} id - Account ID
   * @returns {Promise<Account|null>} Account or null
   */
  async findById(id) {
    try {
      const accountRecord = await AccountModel.findByPk(id);
      return accountRecord ? this._mapToEntity(accountRecord) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find account by email
   * @param {string} email - Account email
   * @returns {Promise<Account|null>} Account or null
   */
  async findByEmail(email) {
    try {
      const accountRecord = await AccountModel.findOne({
        where: { email: email.toLowerCase().trim() }
      });
      return accountRecord ? this._mapToEntity(accountRecord) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Account>} Updated account
   */
  async update(id, updateData) {
    try {
      const [updatedRowsCount] = await AccountModel.update(updateData, {
        where: { id },
        returning: true
      });

      if (updatedRowsCount === 0) {
        throw new Error('Account not found');
      }

      const updatedAccount = await AccountModel.findByPk(id);
      return this._mapToEntity(updatedAccount);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Account with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Delete account (soft delete)
   * @param {string} id - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const deletedCount = await AccountModel.destroy({
        where: { id }
      });
      return deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all accounts with pagination
   * @param {Object} options - Query options
   * @returns {Promise<{accounts: Account[], total: number}>} Paginated results
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        isActive = null,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const where = {};

      // Add search filter
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Add active filter
      if (isActive !== null) {
        where.isActive = isActive;
      }

      const { rows: accountRecords, count: total } = await AccountModel.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
      });

      const accounts = accountRecords.map(record => this._mapToEntity(record));

      return {
        accounts,
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
   * Update last login timestamp
   * @param {string} id - Account ID
   * @returns {Promise<void>}
   */
  async updateLastLogin(id) {
    try {
      await AccountModel.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database record to domain entity
   * @private
   * @param {Object} record - Database record
   * @returns {Account} Account entity
   */
  _mapToEntity(record) {
    return new Account({
      id: record.id,
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      hashedPassword: record.hashedPassword,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }
}
