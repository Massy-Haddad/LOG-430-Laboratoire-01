# Monitoring Setup - LOG430 Microservices

This setup provides automated Grafana dashboards and Prometheus monitoring for your microservices architecture.

## Features

- **Automated Grafana Provisioning**: Dashboards and datasources are automatically configured
- **Golden Signals Monitoring**: Latency, Traffic, Errors, and Saturation metrics
- **Multi-Service Monitoring**: Store, E-commerce, and KrakenD Gateway metrics
- **Load Testing Integration**: Artillery.js configuration for stress testing

## Quick Start

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Access monitoring tools**:
   - Grafana: http://localhost:3002 (admin/admin)
   - Prometheus: http://localhost:9090
   - Swagger API Docs: http://localhost:8080

3. **Run load tests**:
   ```bash
   cd load-test
   npx artillery run artillery.yml
   ```

## Metrics Endpoints

- Store Service: http://localhost:3000/api/v1/store/metrics
- E-commerce Service: http://localhost:3000/api/v1/ecommerce/metrics
- KrakenD Gateway: http://localhost:8090/__stats

## Dashboard Features

The pre-configured dashboard shows:
- **Response Time Latency**: 95th and 50th percentile response times
- **Request Rate**: Total requests per second across all services
- **Error Rate**: Percentage of 4xx/5xx responses
- **HTTP Status Codes**: Breakdown of response codes over time
- **Requests by Service**: Traffic distribution across microservices

## Configuration Files

- `monitoring/grafana/provisioning/datasources/prometheus.yml`: Prometheus datasource configuration
- `monitoring/grafana/provisioning/dashboards/dashboard.yml`: Dashboard provider configuration
- `monitoring/grafana/dashboards/log430-golden-signals.json`: Main monitoring dashboard
- `monitoring/prometheus.yml`: Prometheus scraping configuration

## Load Testing

The Artillery configuration tests:
- Authentication flow
- Store inventory operations
- Sales reporting
- Product management
- E-commerce cart operations

## Troubleshooting

1. **No metrics showing**: Check if services are exposing metrics endpoints
2. **Grafana not loading dashboards**: Verify volume mounts in docker-compose.yml
3. **Prometheus not scraping**: Check targets at http://localhost:9090/targets

## Customization

To add new metrics or modify dashboards:
1. Edit the dashboard JSON file in `monitoring/grafana/dashboards/`
2. Restart Grafana or wait for auto-refresh (10 seconds)
3. Add new scrape targets to `monitoring/prometheus.yml`
