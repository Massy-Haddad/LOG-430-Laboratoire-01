/**
 * Swagger configuration for E-commerce Service API
 * This file defines the OpenAPI 3.0 specification for the e-commerce microservice
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-commerce Service API',
    version: '1.0.0',
    description: 'Microservice for handling cart operations, checkout process, and order management in the LOG430 POS system',
    contact: {
      name: 'LOG430 Development Team',
      email: 'support@log430.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1/ecommerce',
      description: 'Development server (via Gateway)'
    },
    {
      url: 'http://localhost:3002/api/v1/ecommerce',
      description: 'Direct service access'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token provided by the authentication service'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Cart item ID'
          },
          productId: {
            type: 'integer',
            description: 'Product ID'
          },
          productName: {
            type: 'string',
            description: 'Product name'
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            description: 'Quantity of the product'
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Unit price of the product'
          },
          total: {
            type: 'number',
            minimum: 0,
            description: 'Total price (quantity * price)'
          },
          addedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the item was added to cart'
          }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          userId: {
            type: 'integer',
            description: 'User ID who owns the cart'
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' }
          },
          totalItems: {
            type: 'integer',
            description: 'Total number of items in cart'
          },
          totalAmount: {
            type: 'number',
            description: 'Total amount of all items'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update time'
          }
        }
      },
      AddCartItem: {
        type: 'object',
        required: ['productId', 'quantity', 'price'],
        properties: {
          productId: {
            type: 'integer',
            description: 'ID of the product to add'
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'Quantity to add'
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Unit price of the product'
          },
          productName: {
            type: 'string',
            description: 'Name of the product (optional)'
          }
        }
      },
      UpdateCartItem: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: 'New quantity for the item'
          }
        }
      },
      CheckoutRequest: {
        type: 'object',
        required: ['paymentMethod', 'shippingAddress'],
        properties: {
          paymentMethod: {
            type: 'string',
            enum: ['card', 'cash', 'paypal'],
            description: 'Payment method'
          },
          shippingAddress: {
            type: 'object',
            required: ['street', 'city', 'postalCode', 'country'],
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' },
              state: { type: 'string' }
            }
          },
          notes: {
            type: 'string',
            maxLength: 500,
            description: 'Special instructions or notes'
          }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Order ID'
          },
          orderNumber: {
            type: 'string',
            description: 'Unique order number'
          },
          userId: {
            type: 'integer',
            description: 'ID of the user who placed the order'
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            description: 'Order status'
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' }
          },
          totalAmount: {
            type: 'number',
            description: 'Total order amount'
          },
          paymentMethod: {
            type: 'string',
            description: 'Payment method used'
          },
          shippingAddress: {
            type: 'object',
            description: 'Shipping address'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy'
          },
          service: {
            type: 'string',
            example: 'e-commerce'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          uptime: {
            type: 'number',
            description: 'Service uptime in seconds'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the e-commerce service',
        security: [],
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' }
              }
            }
          }
        }
      }
    },
    '/metrics': {
      get: {
        tags: ['Monitoring'],
        summary: 'Prometheus metrics',
        description: 'Returns Prometheus-formatted metrics for monitoring',
        security: [],
        responses: {
          200: {
            description: 'Metrics data',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: '# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET"} 42'
                }
              }
            }
          }
        }
      }
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get user cart',
        description: 'Retrieves the current user cart with all items',
        responses: {
          200: {
            description: 'Cart retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Cart' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        description: 'Adds a new item to the user cart or updates quantity if item exists',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddCartItem' }
            }
          }
        },
        responses: {
          201: {
            description: 'Item added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Item added to cart' },
                    data: {
                      type: 'object',
                      properties: {
                        cartItem: { $ref: '#/components/schemas/CartItem' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart',
        description: 'Removes all items from the user cart',
        responses: {
          200: {
            description: 'Cart cleared successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cart cleared successfully' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/cart/{productId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item',
        description: 'Updates the quantity of a specific item in the cart',
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Product ID to update'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCartItem' }
            }
          }
        },
        responses: {
          200: {
            description: 'Item updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cart item updated' },
                    data: {
                      type: 'object',
                      properties: {
                        cartItem: { $ref: '#/components/schemas/CartItem' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          404: {
            description: 'Item not found in cart',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        description: 'Removes a specific item from the user cart',
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Product ID to remove'
          }
        ],
        responses: {
          200: {
            description: 'Item removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Item removed from cart' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Item not found in cart',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/cart/summary': {
      get: {
        tags: ['Cart'],
        summary: 'Get cart summary',
        description: 'Returns a summary of the cart including total items and amount',
        responses: {
          200: {
            description: 'Cart summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalItems: { type: 'integer' },
                        totalAmount: { type: 'number' },
                        itemCount: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/checkout': {
      post: {
        tags: ['Checkout'],
        summary: 'Process checkout',
        description: 'Processes the cart checkout and creates an order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckoutRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Checkout processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Order created successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        order: { $ref: '#/components/schemas/Order' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error or empty cart',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get user orders',
        description: 'Retrieves all orders for the authenticated user',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Number of orders per page'
          },
          {
            name: 'status',
            in: 'query',
            schema: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] 
            },
            description: 'Filter by order status'
          }
        ],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        orders: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Order' }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            pages: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/orders/{orderId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get specific order',
        description: 'Retrieves details of a specific order',
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Order ID'
          }
        ],
        responses: {
          200: {
            description: 'Order retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check and service status'
    },
    {
      name: 'Monitoring',
      description: 'Metrics and monitoring endpoints'
    },
    {
      name: 'Cart',
      description: 'Shopping cart operations'
    },
    {
      name: 'Checkout',
      description: 'Checkout and payment processing'
    },
    {
      name: 'Orders',
      description: 'Order management and tracking'
    }
  ]
};
