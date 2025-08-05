import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/api/server.js';

describe('E-commerce Service Integration Tests', () => {
  let server;
  let authToken;
  const testUser = {
    id: 1,
    username: 'testuser',
    role: 'customer'
  };

  beforeAll(async () => {
    // Start server
    server = app.listen(0);
    
    // Mock JWT headers for testing
    const mockJWTHeaders = {
      'X-User-Id': testUser.id.toString(),
      'X-User-Name': testUser.username,
      'X-User-Role': testUser.role,
      'X-Store-Id': '1'
    };
    
    global.mockHeaders = mockJWTHeaders;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health and Monitoring', () => {
    test('GET /health should return service status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'e-commerce'
      });
    });

    test('GET /api/v1/ecommerce/metrics should return prometheus metrics', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/metrics')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/plain/);
      expect(response.text).toContain('# HELP');
    });
  });

  describe('Cart Operations', () => {
    test('GET /api/v1/ecommerce/cart should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          userId: testUser.id,
          items: [],
          totalItems: 0,
          totalAmount: 0
        })
      });
    });

    test('POST /api/v1/ecommerce/cart should add item to cart', async () => {
      const newItem = {
        productId: 1,
        quantity: 2,
        price: 5.99,
        productName: 'Test Product'
      };

      const response = await request(app)
        .post('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .send(newItem)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Item added to cart',
        data: expect.objectContaining({
          cartItem: expect.objectContaining({
            productId: newItem.productId,
            quantity: newItem.quantity,
            price: newItem.price
          })
        })
      });
    });

    test('POST /api/v1/ecommerce/cart should validate required fields', async () => {
      const invalidItem = {
        productId: 1
        // missing quantity and price
      };

      const response = await request(app)
        .post('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .send(invalidItem)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringContaining('quantity')
          })
        ])
      });
    });

    test('GET /api/v1/ecommerce/cart/summary should return cart summary', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/cart/summary')
        .set(global.mockHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          totalItems: expect.any(Number),
          totalAmount: expect.any(Number),
          itemCount: expect.any(Number)
        })
      });
    });
  });

  describe('Authentication', () => {
    test('Should reject requests without authentication headers', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/cart')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Authentication required',
        code: 'MISSING_AUTH_HEADERS'
      });
    });

    test('Should accept requests with valid authentication headers', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v1/ecommerce/nonexistent')
        .set(global.mockHeaders)
        .expect(404);

      expect(response.body).toMatchObject({
        error: expect.any(String),
        code: 'NOT_FOUND'
      });
    });

    test('Should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json"}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    test('Should apply rate limiting to cart operations', async () => {
      // This test would need to be adjusted based on rate limit settings
      // For now, just verify that the endpoint responds normally
      const response = await request(app)
        .get('/api/v1/ecommerce/cart')
        .set(global.mockHeaders)
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
    });
  });
});
