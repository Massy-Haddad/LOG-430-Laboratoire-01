import { sequelize } from '../../database.js';
import { defineProductModel } from './product.model.js';
import { defineInventoryModel } from './inventory.model.js'
import { defineUserModel } from './user.model.js'
import { defineSaleModel } from './sale.model.js'
import { defineStoreModel } from './store.model.js'

// Définition des modèles
const ProductModel = defineProductModel(sequelize)
const UserModel = defineUserModel(sequelize)
const SaleModel = defineSaleModel(sequelize)
const StoreModel = defineStoreModel(sequelize)
const InventoryModel = defineInventoryModel(sequelize)

// Associations existantes
UserModel.hasMany(SaleModel, { foreignKey: 'userId' })
ProductModel.hasMany(SaleModel, { foreignKey: 'productId' })
SaleModel.belongsTo(UserModel, { foreignKey: 'userId' })
SaleModel.belongsTo(ProductModel, { foreignKey: 'productId' })

// Nouvelles associations pour le Store
StoreModel.hasMany(UserModel, { foreignKey: 'storeId' })
UserModel.belongsTo(StoreModel, { foreignKey: 'storeId' })

StoreModel.hasMany(ProductModel, { foreignKey: 'storeId' })
ProductModel.belongsTo(StoreModel, { foreignKey: 'storeId' })

StoreModel.hasMany(SaleModel, { foreignKey: 'storeId' })
SaleModel.belongsTo(StoreModel, { foreignKey: 'storeId' })

ProductModel.belongsToMany(StoreModel, {
	through: InventoryModel,
	foreignKey: 'productId',
})
StoreModel.belongsToMany(ProductModel, {
	through: InventoryModel,
	foreignKey: 'storeId',
})

InventoryModel.belongsTo(ProductModel, { foreignKey: 'productId' })
InventoryModel.belongsTo(StoreModel, { foreignKey: 'storeId' })

export { ProductModel, UserModel, SaleModel, StoreModel, InventoryModel }



