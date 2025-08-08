#!/bin/sh

echo "🎯 Starting Artillery Load Test in Docker"
echo "=========================================="

# Wait for services to be ready
echo "Waiting for services to be ready..."
echo "Checking KrakenD..."
while ! nc -z krakend 3000; do
  echo "  Waiting for KrakenD..."
  sleep 2
done

echo "Checking Store service..."
while ! nc -z store 3000; do
  echo "  Waiting for Store service..."
  sleep 2
done

echo "Checking E-commerce service..."
while ! nc -z ecommerce 3000; do
  echo "  Waiting for E-commerce service..."
  sleep 2
done

echo "All services are ready! Starting load test..."
echo ""

# Get current timestamp for report names
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_JSON="/tmp/artillery-report-${TIMESTAMP}.json"
REPORT_HTML="/tmp/artillery-report-${TIMESTAMP}.html"

echo "📊 Starting Artillery load test..."
echo "   Duration: ~8 minutes (warm up + stress + cool down)"
echo "   Max concurrent users: 50"
echo "   Report will be saved to: ${REPORT_JSON}"
echo ""

# Run the artillery test
artillery run artillery.yml --output "${REPORT_JSON}"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Load test completed successfully!"
    
    # Generate HTML report
    echo "📈 Generating HTML report..."
    artillery report "${REPORT_JSON}" --output "${REPORT_HTML}"
    
    echo ""
    echo "📊 Test Results Summary:"
    echo "========================"
    
    # Extract some basic stats from the JSON report
    if [ -f "${REPORT_JSON}" ]; then
        echo "📋 Report files created:"
        echo "   JSON: ${REPORT_JSON}"
        echo "   HTML: ${REPORT_HTML}"
        echo ""
        echo "📈 You can view detailed metrics in Grafana:"
        echo "   http://localhost:3002/d/log430-golden-signals"
    fi
else
    echo "❌ Load test failed with exit code: $EXIT_CODE"
fi

echo ""
echo "🔄 Load test container will exit now."
echo "   Use 'docker compose logs artillery' to see this output again."

exit $EXIT_CODE
