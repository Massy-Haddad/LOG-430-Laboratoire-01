# KrakenD JWT Authentication Examples

## Overview
This document provides examples of how to use the JWT authentication system with KrakenD API Gateway.

## Prerequisites
- JWT_SECRET environment variable must be set (minimum 256 bits)
- Auth service must be running and configured to sign JWTs with the same secret
- KrakenD must be started with the JWT-enabled configuration

## Authentication Flow

### 1. Login to get JWT Token

```bash
# Login with valid credentials (admin user)
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Login as store employee
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "caissier1",
    "password": "password"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInN0b3JlSWQiOm51bGwsImF1ZCI6WyJsb2c0MzAtYXBpIl0sImlzcyI6ImxvZzQzMC1hdXRoLXNlcnZpY2UiLCJleHAiOjE3MjIxOTQ0MDAsImlhdCI6MTcyMjE5MDgwMH0.signature",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "storeId": null
  }
}
```

### 2. Use JWT Token for Protected Endpoints

#### Get Store Stock (Customer or Admin access)
```bash
# Extract token from login response and use it
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:3000/api/v1/store/stock/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Record a Sale (Customer or Admin access)
```bash
curl -X POST "http://localhost:3000/api/v1/store/sales" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": 1,
    "products": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 1.5
      }
    ],
    "total": 3.0
  }'
```

#### Generate Sales Report (Admin or Analyst only)
```bash
curl -X GET "http://localhost:3000/api/v1/store/reports/sales?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Update Product (Admin only)
```bash
curl -X PUT "http://localhost:3000/api/v1/store/products/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pomme Golden",
    "price": 1.6,
    "category": "Fruits"
  }'
```

## Error Responses

### Missing Authorization Header
```bash
curl -X GET "http://localhost:3000/api/v1/store/stock/1"
```
Response (401):
```json
{
  "error": "Unauthorized"
}
```

### Invalid Token
```bash
curl -X GET "http://localhost:3000/api/v1/store/stock/1" \
  -H "Authorization: Bearer invalid-token"
```
Response (401):
```json
{
  "error": "Unauthorized"
}
```

### Insufficient Privileges
```bash
# Employee trying to access admin-only endpoint
curl -X GET "http://localhost:3000/api/v1/store/reports/sales?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN"
```
Response (403):
```json
{
  "error": "Forbidden: Admin or analyst role required"
}
```

## JWT Claims Forwarded to Microservices

When a valid JWT is provided, KrakenD extracts and forwards the following claims as HTTP headers to the backend services:

- `X-User-Id`: User ID from the "sub" claim
- `X-User-Name`: Username from the "username" claim  
- `X-User-Role`: User role from the "role" claim
- `X-Store-Id`: Store ID from the "storeId" claim (null for admin/logistics/analyst users)

Backend services can use these headers for additional authorization logic.

## Available User Accounts

The auth service comes with the following pre-seeded accounts (all use password: `password`):

| Username  | Role      | Store ID | Description                    |
|-----------|-----------|----------|--------------------------------|
| admin     | admin     | null     | System administrator           |
| caissier1 | employee  | 1        | Store 1 cashier                |
| caissier2 | employee  | 2        | Store 2 cashier                |
| logistics | logistics | null     | Logistics coordinator          |
| analyst   | analyst   | null     | Business analyst               |
| john.doe  | customer  | null     | Test customer account          |
| jane.smith| customer  | null     | Test customer account          |
| manager   | admin     | null     | Additional admin account       |

## Environment Variables

Set these environment variables when running KrakenD:

```bash
export JWT_SECRET="your-super-secret-key-change-in-production-min-256-bits-long"
export JWT_AUDIENCE="log430-api"
export JWT_ISSUER="log430-auth-service"
```

## Running KrakenD with JWT Configuration

```bash
# Using the JWT-enabled configuration
krakend run -c krakend-jwt.json

# Or with environment variables
JWT_SECRET="your-secret-key" krakend run -c krakend-jwt.json
```

## Security Notes

1. Always use HTTPS in production
2. Use a strong JWT secret (minimum 256 bits/32 characters)
3. Set appropriate JWT expiration times
4. Consider using JWT refresh tokens for long-lived sessions
5. Validate JWT audience and issuer claims
6. Monitor for suspicious authentication patterns
