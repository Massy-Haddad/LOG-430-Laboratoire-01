#!/bin/bash

echo "🚀 Starting Artillery Load Test in Docker Environment"
echo "===================================================="

# Check if all services are running
echo "Checking if core services are running..."
if ! docker compose ps | grep -q "krakend.*Up"; then
    echo "❌ KrakenD is not running. Please start with: docker compose up -d"
    exit 1
fi

if ! docker compose ps | grep -q "store.*Up"; then
    echo "❌ Store service is not running. Please start with: docker compose up -d"
    exit 1
fi

if ! docker compose ps | grep -q "ecommerce.*Up"; then
    echo "❌ E-commerce service is not running. Please start with: docker compose up -d"
    exit 1
fi

echo "✅ All core services are running!"
echo ""

# Build and run the artillery container
echo "📦 Building Artillery container..."
docker compose build artillery

echo ""
echo "🎯 Starting load test..."
echo "   This will take approximately 8 minutes"
echo "   Watch metrics in real-time at: http://localhost:3002/d/log430-golden-signals"
echo ""

# Run artillery with the load-test profile
docker compose --profile load-test run --rm artillery

echo ""
echo "📊 Load test completed!"
echo ""
echo "📈 View the results:"
echo "   - Grafana Dashboard: http://localhost:3002/d/log430-golden-signals"
echo "   - Prometheus Metrics: http://localhost:9090"
echo "   - Artillery Reports: ./load-test/reports/"
echo ""
echo "🔄 To run the load test again: ./run-artillery-docker.sh"
