# LOG430 Multi-Store System - 4+1 Architectural Views (Laboratory 6: Saga Pattern)

This document presents the LOG430 Multi-Store System architecture using the 4+1 architectural view model, enhanced with **Saga Orchestrated Pattern** for distributed transaction management in Laboratory 6.

## Overview

The 4+1 architectural view model organizes the description of a software architecture using five concurrent views, now enhanced with **distributed transaction capabilities**:

1. **Logical View** - Shows the system's functionality including Saga entities (Class Diagram)
2. **Development View** - Shows the system's software management with Saga components (Component/Package Diagram)  
3. **Process View** - Shows the system's concurrency and Saga orchestration (Sequence Diagram)
4. **Physical View** - Shows the system's deployment topology with Saga infrastructure (Deployment Diagram)
5. **Scenarios View** - Shows the system's use cases including Saga workflows (Use Case Diagram)

## Laboratory 6 Enhancement: Saga Orchestrated Pattern

The system now implements a **Saga Orchestrated Pattern** for managing distributed transactions across microservices:

### Key Saga Features
- ✅ **Distributed Transaction Coordination** across e-commerce and store services
- ✅ **Automatic Compensation Actions** for failed transactions  
- ✅ **State Machine Management** with persistent saga instances
- ✅ **Stock Reservation System** with temporary holds and auto-expiration
- ✅ **Payment Processing** with refund capabilities
- ✅ **Cross-Service Communication** via HTTP with correlation tracking
- ✅ **Monitoring and Observability** for saga performance

### Saga Workflow: Checkout Process
1. **VALIDATE_STOCK** → Verify product availability
2. **RESERVE_STOCK** → Create temporary stock reservation  
3. **PROCESS_PAYMENT** → Handle payment with provider
4. **COMMIT_STOCK** → Finalize stock reservation
5. **FINALIZE_ORDER** → Complete order creation

With automatic **compensation actions** if any step fails.

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

**Key Elements** (Enhanced for Saga):

- **Docker Containers**: All services run in isolated containers with saga support
- **KrakenD Gateway**: Entry point handling routing, authentication, and rate limiting  
- **Microservices**: Auth, Store (with stock reservations), and E-commerce (with saga orchestration) services
- **Saga Infrastructure**: Distributed transaction coordination across services
- **Data Layer**: PostgreSQL database with saga state persistence and Redis cache
- **Monitoring**: Prometheus metrics collection (including saga metrics) and Grafana dashboards
- **Documentation**: Swagger UI for API documentation including saga endpoints

**Technology Stack** (Enhanced):

- Container Platform: Docker & Docker Compose
- API Gateway: KrakenD  
- Runtime: Node.js 20+
- Database: PostgreSQL 15 with saga and stock reservation tables
- Cache: Redis 7 with saga state caching
- Monitoring: Prometheus + Grafana with saga metrics
- Documentation: Swagger/OpenAPI with saga endpoint documentation
- Transaction Management: Saga Orchestrated Pattern

### 2. Logical View 🧠
**File**: `logical-view.puml`

**Purpose**: Represents the key abstractions in the system as objects or classes.

**Key Domain Models** (Enhanced for Saga):

#### Store Domain

- **User**: Authentication and authorization entity
- **Store**: Physical store representation  
- **Product**: Catalog items with pricing
- **Inventory**: Stock management per store
- **Sale**: Transaction records
- **SalesReport**: Analytics and reporting
- **StockReservation**: Temporary stock holds during saga execution

#### E-commerce Domain (Enhanced)

- **Cart**: Shopping cart with expiration
- **CartItem**: Individual cart entries
- **Order**: Purchase orders with saga coordination
- **SagaInstance**: Distributed transaction orchestration
- **PaymentTransaction**: Payment processing with compensation support

#### Saga Orchestration Domain

- **SagaOrchestrator**: Main coordinator for distributed transactions
- **SagaStateMachine**: Workflow definition and step management
- **SagaRepository**: Persistence layer for saga state
- **SagaInstance**: Individual transaction execution context

#### Authentication Domain

- **JWTToken**: Stateless authentication tokens
- **AuthSession**: User session management  
- **LoginLog**: Audit trail for authentication

**Design Patterns** (Enhanced):

- Domain-Driven Design (DDD)
- Repository Pattern
- **Saga Orchestrated Pattern** for distributed transactions
- **Compensation Pattern** for rollback actions
- Entity-Service separation
- Value Objects for complex data types
- **State Machine Pattern** for saga workflow management

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

**Featured Scenario**: Saga Orchestrated Checkout Process (Laboratory 6)

**Flow Steps**:

1. **Saga Initiation Flow**
   - Customer initiates checkout with items, payment method, and shipping address
   - JWT token validation at gateway  
   - Saga orchestrator creates new saga instance
   - Saga state persisted to PostgreSQL

2. **Saga Execution Flow**
   - **Step 1: VALIDATE_STOCK** - Check inventory availability across stores
   - **Step 2: RESERVE_STOCK** - Create temporary stock reservations with expiration
   - **Step 3: PROCESS_PAYMENT** - Handle payment processing with external provider
   - **Step 4: COMMIT_STOCK** - Finalize stock reservations and update inventory
   - **Step 5: FINALIZE_ORDER** - Complete order creation and update saga state

3. **Compensation Flow** (On Failure)
   - Automatic rollback of completed steps in reverse order
   - **Payment Refund** - Refund processed payments
   - **Stock Release** - Release temporary stock reservations
   - **Saga State Update** - Mark saga as compensated

4. **Monitoring and Observability**
   - Real-time saga state tracking
   - Correlation ID tracking across services
   - Prometheus metrics for saga performance
   - Error handling and retry mechanisms

**Quality Attributes Demonstrated** (Enhanced for Saga):

- **Consistency**: ACID transactions within services, eventual consistency across services
- **Reliability**: Automatic compensation on failures, saga state persistence
- **Security**: JWT-based authentication for all saga operations
- **Performance**: Asynchronous saga execution, Redis caching for stock validation
- **Observability**: Comprehensive saga metrics and state monitoring
- **Scalability**: Stateless saga orchestration, independent service scaling

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

## Additional Diagrams

### 6. Saga Sequence Diagram 🔄
**File**: `saga-sequence-diagram.puml`

**Purpose**: Detailed sequence diagram showing the complete saga orchestration workflow for the checkout process.

**Key Flows Demonstrated**:

- **Successful Saga Flow**: Complete checkout with all steps succeeding
- **Compensation Flow**: Automatic rollback when payment fails
- **Timeout Handling**: Retry mechanisms and eventual compensation
- **Monitoring**: Status tracking and correlation ID propagation

**Saga States Illustrated**:
- PENDING → RUNNING → COMPLETED (Success path)
- PENDING → RUNNING → COMPENSATING → COMPENSATED (Failure path)
- Cross-service HTTP communication patterns
- Database persistence of saga state

This diagram provides implementation-level details for developers building the saga orchestration components.

## Laboratory 6 Implementation Status

### ✅ Completed Saga Components

1. **Core Saga Framework**
   - `SagaOrchestrator.js` - Main orchestration engine
   - `SagaInstance.js` - Individual saga execution context
   - `SagaStateMachine.js` - Workflow definition and state management
   - `SagaRepository.js` - PostgreSQL persistence layer

2. **Enhanced Services**  
   - `PaymentService.js` - Payment processing with compensation
   - `stockService.js` - Stock operations with reservation support
   - `stockReservationRepository.js` - Reservation persistence

3. **Database Schema**
   - `saga_instances` table with JSONB state storage
   - `stock_reservations` table with auto-expiration
   - `payment_transactions` table with refund tracking

4. **API Endpoints**
   - `/api/v1/ecommerce/checkout/saga` - Initiate checkout saga
   - `/api/v1/ecommerce/saga/{id}/status` - Monitor saga state
   - `/api/v1/store/stock/validate` - Stock validation for saga
   - `/api/v1/store/stock/reserve` - Create stock reservation
   - `/api/v1/store/stock/commit` - Finalize reservation
   - `/api/v1/store/stock/release` - Release reservation (compensation)

### 🎯 Saga Pattern Benefits Achieved

- **Data Consistency**: Eventual consistency across distributed services
- **Fault Tolerance**: Automatic compensation on any step failure
- **Observability**: Complete saga lifecycle tracking and monitoring  
- **Scalability**: Stateless orchestration with persistent state
- **Maintainability**: Clear separation of workflow definition and execution

## Conclusion

The 4+1 architectural view model provides a comprehensive understanding of the LOG430 Multi-Store System from multiple perspectives. Each view addresses different stakeholder concerns while maintaining consistency across the architecture. The system demonstrates modern microservices patterns with proper separation of concerns, observability, and scalability considerations.

The architecture supports the business requirements for multi-store retail management while providing a foundation for future enhancements and scaling as the business grows.
