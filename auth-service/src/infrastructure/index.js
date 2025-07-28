import { authSequelize } from './database.js';
import { defineUserModel, defineLoginLogModel } from './models/user.model.js';

// Initialize models
export const UserModel = defineUserModel(authSequelize);
export const LoginLogModel = defineLoginLogModel(authSequelize);

// Define associations
UserModel.hasMany(LoginLogModel, { foreignKey: 'user_id' });
LoginLogModel.belongsTo(UserModel, { foreignKey: 'user_id' });

export { authSequelize };
