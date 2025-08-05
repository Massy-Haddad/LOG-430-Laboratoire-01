# LOG430 Multi-Store System - 4+1 Architectural Views

This document presents the LOG430 Multi-Store System architecture using the 4+1 architectural view model, which provides a comprehensive description of the system from different stakeholder perspectives.

## Overview

The 4+1 architectural view model organizes the description of a software architecture using five concurrent views:

1. **Logical View** - Shows the system's functionality (Class Diagram)
2. **Development View** - Shows the system's software management (Component/Package Diagram)  
3. **Process View** - Shows the system's concurrency and communication (Sequence Diagram)
4. **Physical View** - Shows the system's deployment topology (Deployment Diagram)
5. **Scenarios View** - Shows the system's use cases and requirements (Use Case Diagram)

## System Architecture Summary

The LOG430 Multi-Store System is a microservices-based architecture that provides:

- **Multi-store retail management** with inventory, sales, and reporting
- **E-commerce capabilities** with shopping cart and checkout
- **Centralized authentication** with JWT tokens and role-based access
- **API Gateway** for unified access point and cross-cutting concerns
- **Observability** with metrics collection and monitoring dashboards
- **Containerized deployment** with Docker and Docker Compose

## Architectural Views

### 1. Physical/Deployment View 🏗️
**File**: `deployment-view.puml`

**Purpose**: Shows how the system components are deployed and distributed across the infrastructure.

**Key Elements**:
- **Docker Containers**: All services run in isolated containers
- **KrakenD Gateway**: Entry point handling routing, authentication, and rate limiting
- **Microservices**: Auth, Store, and E-commerce services
- **Data Layer**: PostgreSQL database and Redis cache
- **Monitoring**: Prometheus metrics collection and Grafana dashboards
- **Documentation**: Swagger UI for API documentation

**Technology Stack**:
- Container Platform: Docker & Docker Compose
- API Gateway: KrakenD
- Runtime: Node.js
- Database: PostgreSQL 15
- Cache: Redis 7
- Monitoring: Prometheus + Grafana
- Documentation: Swagger/OpenAPI

### 2. Logical View 🧠
**File**: `logical-view.puml`

**Purpose**: Represents the key abstractions in the system as objects or classes.

**Key Domain Models**:

#### Store Domain
- **User**: Authentication and authorization entity
- **Store**: Physical store representation
- **Product**: Catalog items with pricing
- **Inventory**: Stock management per store
- **Sale**: Transaction records
- **SalesReport**: Analytics and reporting

#### E-commerce Domain
- **Cart**: Shopping cart with expiration
- **CartItem**: Individual cart entries
- **Order**: Purchase orders with status tracking

#### Authentication Domain
- **JWTToken**: Stateless authentication tokens
- **AuthSession**: User session management
- **LoginLog**: Audit trail for authentication

**Design Patterns**:
- Domain-Driven Design (DDD)
- Repository Pattern
- Entity-Service separation
- Value Objects for complex data types

### 3. Development View 🔧
**File**: `development-view.puml`

**Purpose**: Shows the system organization from a programmer's perspective.

**Architecture Layers** (per microservice):

#### API Layer
- Controllers for request handling
- Express.js server setup
- Route definitions
- Middleware for cross-cutting concerns

#### Domain Layer
- Business entities
- Domain services
- Business logic implementation

#### Infrastructure Layer
- Repository implementations
- Database connections
- External service integrations
- Caching mechanisms

**Development Tools**:
- **Testing**: Jest for unit testing, Artillery for load testing
- **Code Quality**: ESLint for linting
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker with multi-stage builds
- **API Gateway**: KrakenD configuration

### 4. Process View ⚡
**File**: `process-view.puml`

**Purpose**: Shows the dynamic aspects and runtime behavior through a complex interaction.

**Featured Scenario**: Sales Transaction Processing

**Flow Steps**:
1. **Authentication Flow**
   - Employee login with credentials
   - JWT token generation and validation
   - Login attempt logging

2. **Sales Transaction Flow**
   - Token validation at gateway
   - Rate limiting enforcement
   - Stock validation with Redis caching
   - Database transaction with ACID properties
   - Inventory updates
   - Metrics collection

3. **Error Handling**
   - Transaction rollback on failures
   - Error metrics collection
   - Proper HTTP status codes

**Quality Attributes Demonstrated**:
- **Security**: JWT-based authentication
- **Performance**: Redis caching for stock checks
- **Reliability**: Database transactions and rollback
- **Observability**: Prometheus metrics collection
- **Scalability**: Stateless services with load balancing

### 5. Scenarios View (Use Cases) 📋
**File**: `scenarios-view.puml`

**Purpose**: Describes the architecture through use cases and scenarios.

**Primary Actors**:
- **Store Employee**: Daily operations (sales, returns, stock checks)
- **Store Manager**: Management operations (inventory, reports, analytics)
- **System Administrator**: System operations (monitoring, configuration)
- **Data Analyst**: Reporting and analytics
- **Customer**: E-commerce operations
- **System**: Automated processes

**Use Case Packages**:
1. **Authentication & Authorization**: Login, token validation, user management
2. **Store Operations**: Sales, inventory, returns, product management
3. **Reporting & Analytics**: Sales reports, performance monitoring
4. **E-commerce Operations**: Cart management, checkout process
5. **System Administration**: Health monitoring, configuration, alerts
6. **System Integration**: Gateway routing, load balancing, caching

**Key Scenarios**:
- Employee daily workflow (login → check stock → sell products → view dashboard)
- Manager reporting workflow (login → generate reports → analyze performance)
- Customer shopping workflow (browse → add to cart → checkout)
- System monitoring workflow (collect metrics → alert on issues → investigate)

## Quality Attributes

### Security
- JWT-based stateless authentication
- Role-based access control (RBAC)
- Rate limiting protection
- Input validation and sanitization
- Audit logging for authentication attempts

### Performance
- Redis caching for frequently accessed data
- Database query optimization
- API Gateway load balancing
- Asynchronous processing where applicable
- Connection pooling

### Scalability
- Microservices architecture
- Stateless service design
- Horizontal scaling capability
- Load balancing across instances
- Independent service deployment

### Reliability
- Database ACID transactions
- Error handling and recovery
- Health checks for all services
- Circuit breaker patterns (via KrakenD)
- Data backup and recovery procedures

### Observability
- Prometheus metrics collection
- Grafana monitoring dashboards
- Structured logging
- Distributed tracing capability
- Real-time health monitoring

### Maintainability
- Clear separation of concerns
- Domain-driven design principles
- Comprehensive API documentation
- Automated testing (unit and integration)
- Containerized deployment

## Technology Decisions

### Microservices Architecture
- **Benefits**: Independent scaling, technology diversity, fault isolation
- **Trade-offs**: Increased complexity, network overhead, data consistency challenges

### API Gateway (KrakenD)
- **Benefits**: Centralized routing, authentication, rate limiting, load balancing
- **Trade-offs**: Single point of failure, additional latency

### JWT Authentication
- **Benefits**: Stateless, scalable, cross-domain support
- **Trade-offs**: Token size, revocation complexity

### PostgreSQL + Redis
- **Benefits**: ACID compliance + high-performance caching
- **Trade-offs**: Data synchronization complexity

### Docker Containerization
- **Benefits**: Consistent environments, easy deployment, resource isolation
- **Trade-offs**: Container overhead, complexity in orchestration

## Deployment Instructions

1. **Prerequisites**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit environment variables as needed
   ```

3. **Start Services**:
   ```bash
   docker-compose up -d
   ```

4. **Access Points**:
   - API Gateway: http://localhost:3000
   - Swagger Documentation: http://localhost:8080
   - Grafana Monitoring: http://localhost:3002
   - Prometheus Metrics: http://localhost:9090

## Future Enhancements

1. **Service Mesh**: Implement Istio for advanced traffic management
2. **Event Sourcing**: Add event-driven architecture for audit trails
3. **CQRS**: Separate read/write models for complex queries
4. **API Versioning**: Implement versioning strategy for API evolution
5. **Advanced Monitoring**: Add distributed tracing with Jaeger
6. **Security**: Implement OAuth2/OIDC for external authentication
7. **Testing**: Add contract testing and chaos engineering

## Conclusion

The 4+1 architectural view model provides a comprehensive understanding of the LOG430 Multi-Store System from multiple perspectives. Each view addresses different stakeholder concerns while maintaining consistency across the architecture. The system demonstrates modern microservices patterns with proper separation of concerns, observability, and scalability considerations.

The architecture supports the business requirements for multi-store retail management while providing a foundation for future enhancements and scaling as the business grows.
