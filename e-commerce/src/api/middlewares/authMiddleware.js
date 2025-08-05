import rateLimit from 'express-rate-limit';
import chalk from 'chalk';

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  console.log(chalk.cyan(`${method} ${url}`), chalk.gray(`from ${ip}`));
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const statusColor = statusCode >= 400 ? chalk.red : statusCode >= 300 ? chalk.yellow : chalk.green;
    
    console.log(
      chalk.cyan(`${method} ${url}`),
      statusColor(`${statusCode}`),
      chalk.gray(`${duration}ms`)
    );
  });
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Validate content type for POST/PUT requests
 */
export const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    }
  }
  
  next();
};

/**
 * General rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiting for sensitive operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests for this operation, please try again later.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * JWT token validation middleware
 */
export const validateJWT = (req, res, next) => {
  try {
    // Extract JWT token from headers set by KrakenD
    const userId = req.get('X-User-Id');
    const userName = req.get('X-User-Name');
    const userRole = req.get('X-User-Role');
    const storeId = req.get('X-Store-Id');
    
    if (!userId || !userName || !userRole) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'MISSING_AUTH_HEADERS'
      });
    }
    
    // Attach user info to request (both formats for compatibility)
    req.user = {
      id: parseInt(userId),
      username: userName,
      role: userRole,
      storeId: storeId ? parseInt(storeId) : null
    };
    
    // Also set userId directly for controller compatibility
    req.userId = parseInt(userId);
    
    next();
  } catch (error) {
    console.error(chalk.red('JWT validation error:'), error);
    return res.status(401).json({
      error: 'Invalid authentication',
      code: 'INVALID_AUTH'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Employee or admin middleware
 */
export const requireEmployee = requireRole(['admin', 'employee']);

/**
 * Request validation middleware factory
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        code: 'VALIDATION_ERROR'
      });
    }
    
    next();
  };
};
