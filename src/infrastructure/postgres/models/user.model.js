import { DataTypes } from 'sequelize';

export function defineUserModel(sequelize) {
  return sequelize.define('User', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		username: { type: DataTypes.STRING, unique: true, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		role: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				isIn: [['admin', 'employee', 'logistics', 'analyst']],
			},
		},
		storeId: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
	})
}
