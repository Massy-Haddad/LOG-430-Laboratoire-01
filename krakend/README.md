# KrakenD API Documentation Setup

This setup provides API documentation for the LOG430 Gateway system using Swagger UI.

## Important Note About KrakenD Versions

- **KrakenD Community Edition (CE)**: Does NOT support built-in OpenAPI export/documentation features
- **KrakenD Enterprise**: Supports `krakend openapi export` command and built-in documentation metadata

This project uses **KrakenD CE**, so we use a separate Swagger UI container to display documentation.

## Available Documentation

### Swagger UI Interface
- **URL**: http://localhost:8080
- **Description**: Interactive Swagger UI interface displaying the API documentation
- **Features**: Try-it-out functionality, comprehensive API explorer

## Setup

The documentation consists of:

1. **OpenAPI Specification** (`krakend/openapi.json`): 
   - Complete OpenAPI 3.0 specification manually created
   - Documents all KrakenD gateway endpoints
   - Includes request/response examples and schemas

2. **Swagger UI Container**:
   - Serves the interactive documentation interface
   - Reads the OpenAPI specification from the mounted file

## Starting the Documentation

1. **Start the Swagger UI service**:
   ```bash
   docker compose up -d swagger-ui
   ```

2. **Access the documentation**:
   - Swagger UI: http://localhost:8080

## Configuration

### Docker Compose Configuration
```yaml
swagger-ui:
  image: swaggerapi/swagger-ui
  container_name: swagger-ui
  ports:
    - "8080:8080"
  environment:
    SWAGGER_JSON: /openapi.json
  volumes:
    - ./krakend/openapi.json:/openapi.json:ro
  networks:
    - pos-net
```

### KrakenD Configuration
The KrakenD configuration (`krakend/krakend.json`) is kept clean without OpenAPI metadata since it's not supported in the Community Edition.

## API Endpoints Documented

- `GET /api/v1/store/stock/{storeId}` - Get store inventory
- `POST /api/v1/store/sales` - Record a sale
- `GET /api/v1/store/reports/sales` - Generate sales reports  
- `PUT /api/v1/store/products/{productId}` - Update product information
- `GET /api/v1/store/metrics` - Get Prometheus metrics

## Updating Documentation

To update the API documentation:

1. **Edit the OpenAPI spec**: Modify `krakend/openapi.json`
2. **Restart Swagger UI**: `docker compose restart swagger-ui`
3. **Refresh browser**: The changes will be reflected immediately

## Enterprise Upgrade Path

If you upgrade to KrakenD Enterprise in the future, you can:

1. Add OpenAPI metadata to `krakend.json` endpoints
2. Use `krakend openapi export -c krakend.json -o exported-docs.json`
3. Serve documentation directly from KrakenD

## Features Included

- **Complete API Coverage**: All gateway endpoints documented
- **Interactive Testing**: Try endpoints directly from the UI
- **Authentication Info**: JWT Bearer token authentication documented
- **Rate Limiting Details**: Rate limits and capacities specified
- **Error Responses**: Comprehensive error documentation with examples
- **Realistic Examples**: Meaningful sample data for all endpoints
