import { DataTypes } from 'sequelize';

export function defineUserModel(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['admin', 'employee', 'logistics', 'analyst', 'customer']],
      },
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',
    schema: 'auth',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
}

export function defineLoginLogModel(sequelize) {
  return sequelize.define('LoginLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    login_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ip_address: { type: DataTypes.INET, allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    success: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'user_login_logs',
    schema: 'auth',
    timestamps: false
  });
}
