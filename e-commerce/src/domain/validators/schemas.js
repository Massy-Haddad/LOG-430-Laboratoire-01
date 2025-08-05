import Joi from 'joi';

/**
 * Validation schemas for the e-commerce service
 */

// Account validation schemas
export const accountSchemas = {
  create: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(8).max(128).required()
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email()
  }).min(1),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Cart validation schemas
export const cartSchemas = {
  addItem: Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).max(100).default(1),
    price: Joi.number().positive().precision(2).required(),
    productName: Joi.string().min(1).max(255).optional()
  }),

  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).max(100).required()
  }),

  removeItem: Joi.object({
    productId: Joi.number().integer().positive().required()
  }),

  validateCart: Joi.object({
    storeId: Joi.number().integer().positive().optional()
  })
};

// Checkout validation schemas
export const checkoutSchemas = {
  process: Joi.object({
    paymentMethod: Joi.string().valid('card', 'cash', 'paypal', 'apple_pay', 'google_pay').required(),
    shippingAddress: Joi.object({
      street: Joi.string().min(5).max(255).required(),
      city: Joi.string().min(2).max(100).required(),
      postalCode: Joi.string().min(3).max(20).required(),
      country: Joi.string().min(2).max(100).required(),
      state: Joi.string().min(2).max(100).optional()
    }).required(),
    billingAddress: Joi.object({
      street: Joi.string().min(5).max(255).required(),
      city: Joi.string().min(2).max(100).required(),
      postalCode: Joi.string().min(3).max(20).required(),
      country: Joi.string().min(2).max(100).required(),
      state: Joi.string().min(2).max(100).optional()
    }).optional(),
    notes: Joi.string().max(500).optional()
  })
};

// Order validation schemas
export const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().precision(2).required(),
        productName: Joi.string().min(1).max(255).required()
      })
    ).min(1).required(),
    
    shippingAddress: Joi.object({
      street: Joi.string().min(5).max(255).required(),
      city: Joi.string().min(2).max(100).required(),
      postalCode: Joi.string().min(3).max(20).required(),
      country: Joi.string().min(2).max(100).required(),
      state: Joi.string().min(2).max(100).optional()
    }).required(),
    
    paymentMethod: Joi.string().valid('card', 'cash', 'paypal', 'apple_pay', 'google_pay').required(),
    
    notes: Joi.string().max(500).optional(),
    
    totalAmount: Joi.number().positive().precision(2).required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required()
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  })
};

// Common validation schemas
export const commonSchemas = {
  id: Joi.number().integer().positive().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace the original property with the validated and sanitized value
    req[property] = value;
    next();
  };
};
