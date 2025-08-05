import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PostgreSQLAccountRepository } from '../infrastructure/postgres/accountRepository.js';

/**
 * Account Service
 * Handles business logic for account operations
 */
export class AccountService {
  constructor() {
    this.accountRepository = new PostgreSQLAccountRepository();
    this.saltRounds = 12;
  }

  /**
   * Create a new account
   * @param {Object} accountData - Account data
   * @returns {Promise<Object>} Created account
   */
  async createAccount(accountData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(accountData.password, this.saltRounds);

      // Create account
      const account = await this.accountRepository.create({
        ...accountData,
        hashedPassword,
        email: accountData.email.toLowerCase().trim()
      });

      return account.toPublicObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with token
   */
  async login(email, password) {
    try {
      // Find account by email
      const account = await this.accountRepository.findByEmail(email);
      
      if (!account) {
        throw new Error('Invalid email or password');
      }

      if (!account.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, account.hashedPassword);
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.accountRepository.updateLastLogin(account.id);

      // Generate JWT token
      const token = jwt.sign(
        {
          accountId: account.id,
          email: account.email,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        token,
        account: account.toPublicObject(),
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get account by ID
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Account data
   */
  async getAccount(accountId) {
    try {
      const account = await this.accountRepository.findById(accountId);
      
      if (!account) {
        throw new Error('Account not found');
      }

      return account.toPublicObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update account information
   * @param {string} accountId - Account ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated account
   */
  async updateAccount(accountId, updateData) {
    try {
      // Check if account exists
      const existingAccount = await this.accountRepository.findById(accountId);
      
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      // Prepare update data
      const cleanUpdateData = { ...updateData };
      
      if (cleanUpdateData.email) {
        cleanUpdateData.email = cleanUpdateData.email.toLowerCase().trim();
      }

      // Update account
      const updatedAccount = await this.accountRepository.update(accountId, cleanUpdateData);

      return updatedAccount.toPublicObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change account password
   * @param {string} accountId - Account ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  async changePassword(accountId, currentPassword, newPassword) {
    try {
      // Get account
      const account = await this.accountRepository.findById(accountId);
      
      if (!account) {
        throw new Error('Account not found');
      }

      // Verify current password
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, account.hashedPassword);
      
      if (!isValidCurrentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await this.accountRepository.update(accountId, {
        hashedPassword: hashedNewPassword
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate account
   * @param {string} accountId - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async deactivateAccount(accountId) {
    try {
      const updatedAccount = await this.accountRepository.update(accountId, {
        isActive: false
      });

      return !updatedAccount.isActive;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token data
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify account still exists and is active
      const account = await this.accountRepository.findById(decoded.accountId);
      
      if (!account || !account.isActive) {
        throw new Error('Invalid or expired token');
      }

      return {
        accountId: decoded.accountId,
        email: decoded.email,
        account: account.toPublicObject()
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Get all accounts (admin function)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated accounts
   */
  async getAllAccounts(options = {}) {
    try {
      const result = await this.accountRepository.findAll(options);
      
      return {
        ...result,
        accounts: result.accounts.map(account => account.toPublicObject())
      };
    } catch (error) {
      throw error;
    }
  }
}
