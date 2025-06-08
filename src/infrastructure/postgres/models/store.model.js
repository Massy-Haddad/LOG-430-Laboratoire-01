export function defineStoreModel(sequelize) {
  return sequelize.define('Store', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: sequelize.Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: sequelize.Sequelize.STRING,
      allowNull: false
    }
  });
}
