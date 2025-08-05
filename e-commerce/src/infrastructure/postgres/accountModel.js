import { DataTypes } from 'sequelize';
import sequelize from './db.js';

/**
 * Account Model
 * Represents user accounts in the e-commerce system
 */
const AccountModel = sequelize.define('accounts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },
  hashedPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['isActive'],
    },
  ],
  hooks: {
    beforeValidate: (account) => {
      if (account.email) {
        account.email = account.email.toLowerCase().trim();
      }
      if (account.firstName) {
        account.firstName = account.firstName.trim();
      }
      if (account.lastName) {
        account.lastName = account.lastName.trim();
      }
    },
  },
});

// Instance methods
AccountModel.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

AccountModel.prototype.toPublicObject = function() {
  const { hashedPassword, deletedAt, ...publicData } = this.toJSON();
  return {
    ...publicData,
    fullName: this.getFullName(),
  };
};

export default AccountModel;
