import { Op } from 'sequelize';
import CartItemModel from '../models/cartModel.js';
import { CartItem } from '../../../domain/entities/CartItem.js';

export const cartRepository = {
  /**
   * Add item to cart or update quantity if exists
   */
  async addItem(userId, productId, productName, productPrice, quantity = 1) {
    // Check if item already exists in cart
    const existingItem = await CartItemModel.findOne({
      where: { userId, productId }
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      await existingItem.update({ quantity: newQuantity });
      return new CartItem(existingItem.dataValues);
    } else {
      // Create new cart item
      const cartItem = await CartItemModel.create({
        userId,
        productId,
        productName,
        productPrice,
        quantity
      });
      return new CartItem(cartItem.dataValues);
    }
  },

  /**
   * Get all cart items for a user
   */
  async getCartItems(userId) {
    const items = await CartItemModel.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']]
    });

    return items.map(item => new CartItem(item.dataValues));
  },

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(userId, productId, quantity) {
    const [updatedRowsCount] = await CartItemModel.update(
      { quantity },
      { where: { userId, productId } }
    );

    if (updatedRowsCount === 0) {
      throw new Error('Cart item not found');
    }

    const updatedItem = await CartItemModel.findOne({
      where: { userId, productId }
    });

    return new CartItem(updatedItem.dataValues);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId, productId) {
    const deletedCount = await CartItemModel.destroy({
      where: { userId, productId }
    });

    return deletedCount > 0;
  },

  /**
   * Clear entire cart for user
   */
  async clearCart(userId) {
    const deletedCount = await CartItemModel.destroy({
      where: { userId }
    });

    return deletedCount;
  },

  /**
   * Get cart summary (total items and amount)
   */
  async getCartSummary(userId) {
    const items = await this.getCartItems(userId);
    
    const totalItems = items.reduce((count, item) => count + item.quantity, 0);
    const totalAmount = items.reduce((total, item) => total + item.getTotalPrice(), 0);

    return {
      itemCount: items.length,
      totalItems,
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }
};
