import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

// Import middlewares
import { requestLogger, securityHeaders, validateContentType, generalRateLimit } from './middlewares/authMiddleware.js';
import { metricsMiddleware } from './middlewares/metricsMiddleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Import database
import { testConnection, syncDatabase } from '../infrastructure/postgres/db.js';

// Import routes
import router from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middlewares
app.use(securityHeaders);
app.use(validateContentType);
app.use(requestLogger);
app.use(metricsMiddleware);
app.use(generalRateLimit);

// API routes
app.use('/api/v1/ecommerce', router);

// Catch-all for undefined routes (must be after API routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log(chalk.blue('🚀 Starting E-commerce Service...'));
    
    // Test database connection
    console.log(chalk.yellow('📊 Testing database connection...'));
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error(chalk.red('❌ Database connection failed. Exiting...'));
      process.exit(1);
    }

    // Sync database models
    console.log(chalk.yellow('🔄 Synchronizing database models...'));
    await syncDatabase(process.env.NODE_ENV === 'development');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(chalk.green(`✅ E-commerce service running on port ${PORT}`));
      console.log(chalk.blue(`🌐 Health check: http://localhost:${PORT}/api/v1/ecommerce/health`));
      console.log(chalk.blue(`📊 Metrics: http://localhost:${PORT}/api/v1/ecommerce/metrics`));
      console.log(chalk.cyan(`🛍️  Environment: ${process.env.NODE_ENV || 'development'}`));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(chalk.gray('\n📋 Available endpoints:'));
        console.log(chalk.gray('  GET    /api/v1/ecommerce/health'));
        console.log(chalk.gray('  GET    /api/v1/ecommerce/metrics'));
        console.log(chalk.gray('  GET    /api/v1/ecommerce/cart'));
        console.log(chalk.gray('  POST   /api/v1/ecommerce/cart'));
        console.log(chalk.gray('  POST   /api/v1/ecommerce/checkout'));
        console.log(chalk.gray('  GET    /api/v1/ecommerce/orders'));
      }
    });

  } catch (error) {
    console.error(chalk.red('❌ Failed to start server:'), error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  console.log(chalk.yellow('🛑 SIGTERM received. Shutting down gracefully...'));
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('🛑 SIGINT received. Shutting down gracefully...'));
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

// Start the server
startServer();
