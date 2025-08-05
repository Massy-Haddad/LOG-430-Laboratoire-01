import { createClient } from 'redis';
import chalk from 'chalk';

let redisClient = null;

/**
 * Redis connection configuration
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

/**
 * Connect to Redis
 */
export const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        connectTimeout: redisConfig.connectTimeout,
        commandTimeout: redisConfig.commandTimeout,
        keepAlive: redisConfig.keepAlive,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    redisClient.on('error', (err) => {
      console.error(chalk.red('❌ Redis connection error:'), err);
    });

    redisClient.on('connect', () => {
      console.log(chalk.blue('🔄 Connecting to Redis...'));
    });

    redisClient.on('ready', () => {
      console.log(chalk.green('✅ Redis connection established successfully'));
    });

    redisClient.on('end', () => {
      console.log(chalk.yellow('🔌 Redis connection closed'));
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    console.log(chalk.green('🏓 Redis ping successful'));
    
    return redisClient;
  } catch (error) {
    console.error(chalk.red('❌ Failed to connect to Redis:'), error.message);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

/**
 * Cache operations wrapper
 */
export class CacheService {
  static async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(chalk.red(`❌ Cache GET error for key ${key}:`), error);
      return null;
    }
  }

  static async set(key, value, ttlSeconds = 3600) {
    try {
      const client = getRedisClient();
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Cache SET error for key ${key}:`), error);
      return false;
    }
  }

  static async del(key) {
    try {
      const client = getRedisClient();
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error(chalk.red(`❌ Cache DEL error for key ${key}:`), error);
      return false;
    }
  }

  static async exists(key) {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(chalk.red(`❌ Cache EXISTS error for key ${key}:`), error);
      return false;
    }
  }

  static async flushAll() {
    try {
      const client = getRedisClient();
      await client.flushAll();
      console.log(chalk.yellow('🧹 Redis cache flushed'));
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Cache FLUSH error:'), error);
      return false;
    }
  }

  // Session-specific methods
  static async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  static async setSession(sessionId, sessionData, ttlSeconds = 3600) {
    return await this.set(`session:${sessionId}`, sessionData, ttlSeconds);
  }

  static async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Cart-specific methods
  static async getCart(userId) {
    return await this.get(`cart:${userId}`);
  }

  static async setCart(userId, cartData, ttlSeconds = 86400) { // 24 hours
    return await this.set(`cart:${userId}`, cartData, ttlSeconds);
  }

  static async deleteCart(userId) {
    return await this.del(`cart:${userId}`);
  }
}

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log(chalk.yellow('🔌 Redis connection closed'));
  }
};
