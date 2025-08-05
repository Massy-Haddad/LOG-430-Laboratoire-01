import { ICartRepository } from '../../domain/repositories/ICartRepository.js';
import { CartItem } from '../../domain/entities/CartItem.js';
import CartItemModel from './cartModel.js';
import { Op } from 'sequelize';

/**
 * PostgreSQL Cart Repository Implementation
 */
export class PostgreSQLCartRepository extends ICartRepository {
  /**
   * Add item to cart
   * @param {Object} cartItemData - Cart item data
   * @returns {Promise<CartItem>} Created cart item
   */
  async addItem(cartItemData) {
    try {
      // Check if item already exists in cart
      const existingItem = await CartItemModel.findOne({
        where: {
          accountId: cartItemData.accountId,
          productId: cartItemData.productId
        }
      });

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + (cartItemData.quantity || 1);
        existingItem.quantity = newQuantity;
        await existingItem.save();
        return this._mapToEntity(existingItem);
      } else {
        // Create new cart item
        const cartItemRecord = await CartItemModel.create(cartItemData);
        return this._mapToEntity(cartItemRecord);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all cart items for an account
   * @param {string} accountId - Account ID
   * @returns {Promise<CartItem[]>} Cart items
   */
  async getCartItems(accountId) {
    try {
      const cartItemRecords = await CartItemModel.findAll({
        where: { accountId },
        order: [['createdAt', 'ASC']]
      });

      return cartItemRecords.map(record => this._mapToEntity(record));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find cart item by account and product
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @returns {Promise<CartItem|null>} Cart item or null
   */
  async findItem(accountId, productId) {
    try {
      const cartItemRecord = await CartItemModel.findOne({
        where: {
          accountId,
          productId
        }
      });

      return cartItemRecord ? this._mapToEntity(cartItemRecord) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<CartItem>} Updated cart item
   */
  async updateItemQuantity(accountId, productId, quantity) {
    try {
      const cartItemRecord = await CartItemModel.findOne({
        where: {
          accountId,
          productId
        }
      });

      if (!cartItemRecord) {
        throw new Error('Cart item not found');
      }

      cartItemRecord.quantity = quantity;
      await cartItemRecord.save();

      return this._mapToEntity(cartItemRecord);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} accountId - Account ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async removeItem(accountId, productId) {
    try {
      const deletedCount = await CartItemModel.destroy({
        where: {
          accountId,
          productId
        }
      });

      return deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all items from cart
   * @param {string} accountId - Account ID
   * @returns {Promise<boolean>} Success status
   */
  async clearCart(accountId) {
    try {
      const deletedCount = await CartItemModel.destroy({
        where: { accountId }
      });

      return deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart total
   * @param {string} accountId - Account ID
   * @returns {Promise<number>} Cart total amount
   */
  async getCartTotal(accountId) {
    try {
      const cartItems = await this.getCartItems(accountId);
      
      return cartItems.reduce((total, item) => {
        return total + item.getTotalPrice();
      }, 0);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart summary (total items and amount)
   * @param {string} accountId - Account ID
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary(accountId) {
    try {
      const cartItems = await this.getCartItems(accountId);
      
      const totalItems = cartItems.reduce((count, item) => count + item.quantity, 0);
      const totalAmount = cartItems.reduce((total, item) => total + item.getTotalPrice(), 0);

      return {
        itemCount: cartItems.length,
        totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item product details (for when product info changes)
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<number>} Number of updated items
   */
  async updateProductDetails(productId, productData) {
    try {
      const [updatedRowsCount] = await CartItemModel.update(
        {
          productName: productData.name,
          productPrice: productData.price
        },
        {
          where: { productId }
        }
      );

      return updatedRowsCount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database record to domain entity
   * @private
   * @param {Object} record - Database record
   * @returns {CartItem} CartItem entity
   */
  _mapToEntity(record) {
    return new CartItem({
      id: record.id,
      accountId: record.accountId,
      productId: record.productId,
      productName: record.productName,
      productPrice: record.productPrice,
      quantity: record.quantity,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }
}
