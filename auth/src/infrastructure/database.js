import { Sequelize } from 'sequelize';

export const authSequelize = new Sequelize(
  process.env.DB_NAME || 'pos_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'postgres',
    dialect: 'postgres',
    logging: false,
    define: {
      schema: 'auth'  // Use a separate schema for auth tables
    }
  }
);
