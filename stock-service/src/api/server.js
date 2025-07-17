import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { metricsMiddleware } from './middlewares/metricsMiddleware.js';
import { connectRedis } from '../infrastructure/redis/redisClient.js';

import router from './routes/index.js';

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middlewares
app.use(express.json());
app.use(metricsMiddleware);
app.use(loggerMiddleware);

// Routes REST
app.use('/api/v1/stock', router);

// Redis (si utilisé)
await connectRedis();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Stock service running at http://localhost:${PORT}`);
});
