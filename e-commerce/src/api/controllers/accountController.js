import Joi from 'joi';
import { AccountService } from '../../services/accountService.js';
import { validate, accountSchemas, commonSchemas } from '../../domain/validators/schemas.js';
import { asyncHandler, ValidationError, ConflictError } from '../middlewares/errorHandler.js';

/**
 * Account Controller
 * Handles HTTP requests for account operations
 */
export class AccountController {
  constructor() {
    this.accountService = new AccountService();
  }

  /**
   * Create a new account
   * POST /api/v1/accounts
   */
  createAccount = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = accountSchemas.create.validate(req.body);
    if (error) {
      throw new ValidationError('Invalid account data', error.details);
    }

    try {
      const account = await this.accountService.createAccount(value);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { account }
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new ConflictError('Account with this email already exists');
      }
      throw error;
    }
  });

  /**
   * User login
   * POST /api/v1/accounts/login
   */
  login = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = accountSchemas.login.validate(req.body);
    if (error) {
      throw new ValidationError('Invalid login data', error.details);
    }

    const authResult = await this.accountService.login(value.email, value.password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: authResult
    });
  });

  /**
   * Get current account profile
   * GET /api/v1/accounts/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const account = await this.accountService.getAccount(req.accountId);
    
    res.json({
      success: true,
      data: { account }
    });
  });

  /**
   * Update account profile
   * PUT /api/v1/accounts/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = accountSchemas.update.validate(req.body);
    if (error) {
      throw new ValidationError('Invalid update data', error.details);
    }

    try {
      const updatedAccount = await this.accountService.updateAccount(req.accountId, value);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { account: updatedAccount }
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new ConflictError('Account with this email already exists');
      }
      throw error;
    }
  });

  /**
   * Change password
   * POST /api/v1/accounts/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).max(128).required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      throw new ValidationError('Invalid password data', error.details);
    }

    await this.accountService.changePassword(
      req.accountId,
      value.currentPassword,
      value.newPassword
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  /**
   * Deactivate account
   * POST /api/v1/accounts/deactivate
   */
  deactivateAccount = asyncHandler(async (req, res) => {
    await this.accountService.deactivateAccount(req.accountId);
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  });

  /**
   * Verify token (for other services)
   * POST /api/v1/accounts/verify-token
   */
  verifyToken = asyncHandler(async (req, res) => {
    const schema = Joi.object({
      token: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      throw new ValidationError('Token is required', error.details);
    }

    const tokenData = await this.accountService.verifyToken(value.token);
    
    res.json({
      success: true,
      data: tokenData
    });
  });

  /**
   * Get all accounts (admin endpoint)
   * GET /api/v1/accounts
   */
  getAllAccounts = asyncHandler(async (req, res) => {
    // Validate query parameters
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      sortBy: Joi.string().valid('createdAt', 'updatedAt', 'email', 'firstName', 'lastName').default('createdAt'),
      sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      throw new ValidationError('Invalid query parameters', error.details);
    }

    const result = await this.accountService.getAllAccounts(value);
    
    res.json({
      success: true,
      data: result
    });
  });
}
