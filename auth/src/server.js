import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import dotenv from 'dotenv';

// Import Sequelize models
import { UserModel, LoginLogModel } from './infrastructure/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for rate limiting to work correctly behind KrakenD gateway
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'log430-api';
const JWT_ISSUER = process.env.JWT_ISSUER || 'log430-auth-service';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600'; // 1 hour

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

// Validation schemas
const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(100).required(),
});

// Helper function to generate JWT
function generateJWT(user) {
  const payload = {
    sub: user.id.toString(),
    username: user.username,
    role: user.role,
    storeId: user.store_id || null,
    aud: [JWT_AUDIENCE],
    iss: JWT_ISSUER,
    exp: Math.floor(Date.now() / 1000) + parseInt(JWT_EXPIRES_IN),
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'auth' 
  });
});

// Authentication endpoint
app.post('/auth/login', authLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.details[0].message 
      });
    }

    const { username, password } = value;

    // Get user from database
    const user = await UserModel.findOne({ 
      where: { username },
      raw: true
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = generateJWT(user);

    // Log successful login (optional)
    try {
      await LoginLogModel.create({
        user_id: user.id,
        login_time: new Date(),
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent') || 'Unknown',
        success: true
      });
    } catch (err) {
      console.warn('Login log failed:', err.message);
    }

    // Return successful response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        storeId: user.store_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// JWT verification endpoint (for testing)
app.post('/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET, { 
      algorithms: ['HS256'],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER
    });

    res.status(200).json({ 
      valid: true, 
      user: {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role,
        storeId: decoded.storeId
      }
    });

  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: error.message === 'jwt expired' ? 'Token expired' : 'Invalid token' 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
  console.log(`JWT Issuer: ${JWT_ISSUER}`);
  console.log(`JWT Audience: ${JWT_AUDIENCE}`);
  console.log(`JWT Expires In: ${JWT_EXPIRES_IN} seconds`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
