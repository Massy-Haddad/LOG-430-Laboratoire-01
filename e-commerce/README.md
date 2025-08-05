# E-commerce Service

A comprehensive microservice for handling shopping cart operations, checkout processes, and order management in the LOG430 Point of Sale (POS) system.

## 🚀 Features

### Core Functionality
- **Shopping Cart Management**: Add, update, remove items, and clear cart
- **Checkout Process**: Complete order processing with payment method selection
- **Order Management**: View order history, track orders, and manage order status
- **User Account Integration**: Seamless integration with authentication service

### Technical Features
- **JWT Authentication**: Secure API access via KrakenD gateway
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Prometheus Metrics**: Comprehensive monitoring and observability
- **Redis Caching**: High-performance session and cart storage
- **PostgreSQL Database**: Reliable persistent data storage
- **Swagger Documentation**: Interactive API documentation
- **Docker Support**: Containerized deployment
- **Health Checks**: Service health monitoring
- **Error Handling**: Comprehensive error management
- **Input Validation**: Request validation with Joi schemas

## 🏗️ Architecture

### Service Layer Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   KrakenD       │────│  E-commerce      │────│   PostgreSQL    │
│   Gateway       │    │   Service        │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │     Redis       │
                       │     Cache       │
                       └─────────────────┘
```

### Internal Architecture
```
src/
├── api/                    # HTTP API layer
│   ├── controllers/        # Request handlers
│   ├── routes/            # Route definitions
│   ├── middlewares/       # Custom middleware
│   └── server.js          # Express server setup
├── domain/                # Business logic
│   ├── entities/          # Domain entities
│   ├── repositories/      # Data access interfaces
│   └── validators/        # Input validation schemas
├── infrastructure/        # External services
│   ├── postgres/          # Database models and connections
│   └── redis/            # Redis client and cache operations
├── services/              # Business services
└── docs/                 # API documentation
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker & Docker Compose (optional)

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
NODE_ENV=development
PORT=3000

# Database
DB_NAME=pos_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (must match auth service)
JWT_SECRET=your-super-secret-key-change-in-production-min-256-bits-long
JWT_AUDIENCE=log430-api
JWT_ISSUER=log430-auth-service
```

### Local Development
```bash
# Install dependencies
npm install

# Run database migrations/seed
npm run seed

# Start development server
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Start specific service
docker-compose up ecommerce

# View logs
docker-compose logs -f ecommerce
```

## 📚 API Documentation

### Endpoints Overview

#### Health & Monitoring
- `GET /health` - Service health check
- `GET /api/v1/ecommerce/metrics` - Prometheus metrics

#### Shopping Cart
- `GET /api/v1/ecommerce/cart` - Get user's cart
- `POST /api/v1/ecommerce/cart` - Add item to cart
- `PUT /api/v1/ecommerce/cart/:productId` - Update cart item
- `DELETE /api/v1/ecommerce/cart/:productId` - Remove cart item
- `DELETE /api/v1/ecommerce/cart` - Clear entire cart
- `GET /api/v1/ecommerce/cart/summary` - Get cart summary

#### Checkout & Orders
- `POST /api/v1/ecommerce/checkout` - Process checkout
- `GET /api/v1/ecommerce/orders` - Get user orders (paginated)
- `GET /api/v1/ecommerce/orders/:orderId` - Get specific order
- `POST /api/v1/ecommerce/orders/:orderId/cancel` - Cancel order

### Authentication
All protected endpoints require JWT authentication via the KrakenD gateway, which adds these headers:
- `X-User-Id`: User ID
- `X-User-Name`: Username
- `X-User-Role`: User role (admin, employee, customer)
- `X-Store-Id`: Store ID (if applicable)

### Example Requests

#### Add Item to Cart
```bash
curl -X POST http://localhost:3000/api/v1/ecommerce/cart \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -H "X-User-Name: john_doe" \
  -H "X-User-Role: customer" \
  -d '{
    "productId": 4,
    "quantity": 2,
    "price": 1.5,
    "productName": "Lait"
  }'
```

#### Process Checkout
```bash
curl -X POST http://localhost:3000/api/v1/ecommerce/checkout \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -H "X-User-Name: john_doe" \
  -H "X-User-Role: customer" \
  -d '{
    "paymentMethod": "card",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Montreal",
      "postalCode": "H1A 1A1",
      "country": "Canada",
      "state": "QC"
    },
    "notes": "Leave at front door"
  }'
```

## 🔧 Configuration

### Rate Limiting
- General API: 1000 requests/15 minutes per IP
- Cart operations: 50 requests/15 minutes per IP
- Checkout: 20 requests/15 minutes per IP

### Caching Strategy
- **Cart Data**: Redis TTL 24 hours
- **Session Data**: Redis TTL 1 hour
- **Database Queries**: No caching (real-time consistency required)

### Security Features
- Helmet.js security headers
- CORS protection
- Request validation
- Rate limiting
- JWT token validation
- Input sanitization

## 📊 Monitoring & Observability

### Prometheus Metrics
- HTTP request duration and count
- Cart operation counters
- Checkout process duration
- Active connections
- Error rates
- Custom business metrics

### Health Checks
- Database connectivity
- Redis connectivity  
- Service uptime
- Memory usage

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics
- Security events

## 🧪 Testing

### Test Coverage
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database integration tests
- Authentication middleware tests
- Error handling tests

### Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- cart.test.js
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up db
```

#### Redis Connection Issues
```bash
# Check Redis status
docker-compose logs redis

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

#### Authentication Issues
- Verify JWT secret matches auth service
- Check KrakenD gateway configuration
- Ensure headers are properly forwarded

### Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error messages
- Debug route (`/debug-headers`)
- Enhanced logging
- Database query logging

## 🚀 Production Deployment

### Performance Optimization
- Enable Redis clustering for high availability
- Configure database connection pooling
- Use PM2 for process management
- Implement proper logging aggregation
- Set up monitoring alerts

### Security Checklist
- [ ] Update JWT secrets
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up log monitoring

### Scaling Considerations
- Horizontal scaling: Multiple service instances
- Database scaling: Read replicas, connection pooling
- Cache scaling: Redis cluster mode
- Load balancing: Multiple gateway instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is part of the LOG430 coursework and follows the course licensing terms.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Check service logs: `docker-compose logs ecommerce`
- Contact the development team

---

**🛍️ Happy shopping with our E-commerce Service!**
