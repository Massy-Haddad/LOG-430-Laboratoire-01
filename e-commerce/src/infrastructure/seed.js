import { testConnection, syncDatabase } from './postgres/db.js';
import chalk from 'chalk';

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  try {
    console.log(chalk.blue('🌱 Starting database seeding...'));
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error(chalk.red('❌ Database connection failed. Cannot seed.'));
      process.exit(1);
    }
    
    // Sync database (create tables if they don't exist)
    await syncDatabase(false); // Don't force drop existing tables
    
    console.log(chalk.green('✅ Database seeding completed successfully!'));
    console.log(chalk.gray('📊 Database is ready for e-commerce operations'));
    
  } catch (error) {
    console.error(chalk.red('❌ Database seeding failed:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
