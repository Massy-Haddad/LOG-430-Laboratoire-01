import bcrypt from 'bcrypt';
import chalk from 'chalk';
import { authSequelize, UserModel, LoginLogModel } from './infrastructure/index.js';

async function waitForPostgres(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await authSequelize.authenticate();
      console.log('✅ PostgreSQL is ready.');
      return;
    } catch (err) {
      console.log(`⏳ Waiting for PostgreSQL (${i + 1}/${retries})...`);
      console.log(chalk.red(err.message));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('PostgreSQL is inaccessible after multiple attempts.');
}

async function createSchema() {
  try {
    // Create auth schema if it doesn't exist
    await authSequelize.query('CREATE SCHEMA IF NOT EXISTS auth');
    console.log(chalk.green('✅ Auth schema created.'));
  } catch (error) {
    console.error(chalk.red('❌ Error creating schema:', error.message));
    throw error;
  }
}

async function seedUsers() {
  try {
    // Hash password for all users (same as your current seed - 'password')
    const hash = await bcrypt.hash('password', 10);

    // Users from your existing seed.js
    const users = [
      { username: 'admin', password_hash: hash, role: 'admin', email: 'admin@log430.com' },
      { username: 'caissier1', password_hash: hash, role: 'employee', store_id: 1, email: 'caissier1@log430.com' },
      { username: 'caissier2', password_hash: hash, role: 'employee', store_id: 2, email: 'caissier2@log430.com' },
      { username: 'logistics', password_hash: hash, role: 'logistics', email: 'logistics@log430.com' },
      { username: 'analyst', password_hash: hash, role: 'analyst', email: 'analyst@log430.com' },
      // Additional users for testing JWT
      { username: 'john.doe', password_hash: hash, role: 'customer', email: 'john.doe@log430.com' },
      { username: 'jane.smith', password_hash: hash, role: 'customer', email: 'jane.smith@log430.com' },
      { username: 'manager', password_hash: hash, role: 'admin', email: 'manager@log430.com' }
    ];

    for (const userData of users) {
      await UserModel.findOrCreate({
        where: { username: userData.username },
        defaults: userData,
      });
      console.log(chalk.green(`✅ Created user: ${userData.username} (${userData.role})`));
    }

    console.log(chalk.green('✅ Users seeded successfully.'));
  } catch (error) {
    console.error(chalk.red('❌ Error seeding users:', error.message));
    throw error;
  }
}

async function seedDatabase() {
  try {
    await waitForPostgres();
    console.log(chalk.green('✅ PostgreSQL is ready.'));

    await createSchema();
    await authSequelize.sync({ force: false });
    console.log(chalk.green('✅ Auth models synchronized with PostgreSQL'));

    await seedUsers();

    console.log(chalk.green('🎉 Auth database seeded successfully!'));
    
    // Display login credentials for testing
    console.log(chalk.cyan('\n📋 Available test credentials:'));
    console.log(chalk.cyan('Username: admin, Password: password (Admin role)'));
    console.log(chalk.cyan('Username: caissier1, Password: password (Employee, Store 1)'));
    console.log(chalk.cyan('Username: caissier2, Password: password (Employee, Store 2)'));
    console.log(chalk.cyan('Username: logistics, Password: password (Logistics role)'));
    console.log(chalk.cyan('Username: analyst, Password: password (Analyst role)'));
    console.log(chalk.cyan('Username: john.doe, Password: password (Customer role)'));
    console.log(chalk.cyan('Username: jane.smith, Password: password (Customer role)'));
    console.log(chalk.cyan('Username: manager, Password: password (Admin role)'));

    process.exit(0);
  } catch (error) {
    console.error(chalk.red(`❌ Error during seeding: ${error.message}`));
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await seedDatabase();
}

export { seedDatabase };
