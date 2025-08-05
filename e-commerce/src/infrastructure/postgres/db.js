import { Sequelize } from 'sequelize';
import chalk from 'chalk';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Enable soft deletes
    },
  }
);

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(chalk.green('✅ Database connection established successfully.'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Unable to connect to the database:'), error.message);
    return false;
  }
};

/**
 * Sync all models with the database
 * @param {boolean} force - Force sync (drops existing tables)
 */
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(chalk.green(`✅ Database synchronized successfully${force ? ' (forced)' : ''}.`));
  } catch (error) {
    console.error(chalk.red('❌ Error synchronizing database:'), error.message);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log(chalk.yellow('🔌 Database connection closed.'));
  } catch (error) {
    console.error(chalk.red('❌ Error closing database connection:'), error.message);
  }
};

export default sequelize;
