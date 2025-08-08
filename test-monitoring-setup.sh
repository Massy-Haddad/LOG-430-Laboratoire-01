#!/bin/bash

echo "Starting Grafana monitoring setup test..."

# Start the services
echo "Starting Docker Compose services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check if Prometheus is scraping targets
echo "Checking Prometheus targets..."
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}'

# Check if Grafana is running
echo "Checking Grafana..."
curl -s http://localhost:3002/api/health

# Check if metrics endpoints are available
echo "Checking store metrics..."
curl -s http://localhost:3000/api/v1/store/metrics | head -5

echo "Checking ecommerce metrics..."
curl -s http://localhost:3000/api/v1/ecommerce/metrics | head -5

echo "Checking KrakenD metrics..."
curl -s http://localhost:8090/__stats | head -5

echo "Setup complete! You can now:"
echo "1. Access Grafana at http://localhost:3002 (admin/admin)"
echo "2. Access Prometheus at http://localhost:9090"
echo "3. Run load tests with: cd load-test && npx artillery run artillery.yml"
