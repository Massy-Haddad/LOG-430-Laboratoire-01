#!/bin/bash

echo "🚀 Testing Monitoring Setup in Docker Environment"
echo "=================================================="

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    echo "Testing $description..."
    docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
        -s -o /dev/null -w "HTTP %{http_code} - Response time: %{time_total}s\n" \
        "$url" || echo "❌ Failed to reach $url"
}

# Function to test endpoint with auth
test_auth_endpoint() {
    local url=$1
    local description=$2
    local token=$3
    echo "Testing $description (authenticated)..."
    docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
        -s -o /dev/null -w "HTTP %{http_code} - Response time: %{time_total}s\n" \
        -H "Authorization: Bearer $token" \
        "$url" || echo "❌ Failed to reach $url"
}

echo "1. Testing Monitoring Infrastructure"
echo "------------------------------------"

# Test Prometheus
test_endpoint "http://prometheus:9090/-/healthy" "Prometheus Health"

# Test Grafana
test_endpoint "http://grafana:3000/api/health" "Grafana Health"

echo ""
echo "2. Testing Authentication"
echo "------------------------"

# Get auth token
echo "Getting authentication token..."
AUTH_RESPONSE=$(docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
    -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password"}' \
    http://krakend:3000/auth/login)

# Extract token using shell parameter expansion
TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Authentication successful"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "❌ Authentication failed"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

echo ""
echo "3. Testing Store Service Endpoints"
echo "----------------------------------"

test_auth_endpoint "http://krakend:3000/api/v1/store/stock/1" "Store Stock Check" "$TOKEN"
test_auth_endpoint "http://krakend:3000/api/v1/store/stock/2" "Store Stock Check" "$TOKEN"
test_auth_endpoint "http://krakend:3000/api/v1/store/stock/3" "Store Stock Check" "$TOKEN"

echo ""
echo "4. Testing E-commerce Service Endpoints"
echo "---------------------------------------"

test_auth_endpoint "http://krakend:3000/api/v1/ecommerce/cart" "E-commerce Cart" "$TOKEN"

echo ""
echo "5. Testing Reports"
echo "------------------"

test_auth_endpoint "http://krakend:3000/api/v1/store/reports/sales?startDate=2025-06-01&endDate=2025-06-30" "Sales Report" "$TOKEN"

echo ""
echo "6. Generating Load for Metrics"
echo "------------------------------"

echo "Generating 50 requests to create metric data..."
for i in {1..50}; do
    docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
        -s -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "http://krakend:3000/api/v1/store/stock/1" &
    
    docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
        -s -o /dev/null \
        -H "Authorization: Bearer $TOKEN" \
        "http://krakend:3000/api/v1/ecommerce/cart" &
    
    if [ $((i % 10)) -eq 0 ]; then
        echo "Sent $i requests..."
        wait # Wait for background processes to complete
    fi
done

wait # Wait for all background processes to complete

echo ""
echo "7. Testing Metrics Endpoints"
echo "----------------------------"

test_endpoint "http://store:3000/api/v1/store/metrics" "Store Metrics"
test_endpoint "http://ecommerce:3000/api/v1/ecommerce/metrics" "E-commerce Metrics"

echo ""
echo "8. Checking Prometheus Targets"
echo "------------------------------"

echo "Prometheus targets status:"
TARGETS_RESPONSE=$(docker run --rm --network log-430-laboratoire-01_pos-net curlimages/curl:latest \
    -s "http://prometheus:9090/api/v1/targets")

echo "$TARGETS_RESPONSE" | grep -o '"job":"[^"]*".*"health":"[^"]*"' | \
    sed 's/"job":"\([^"]*\)".*"health":"\([^"]*\)"/\1: \2/g' || echo "Could not parse targets"

echo ""
echo "9. Access Information"
echo "--------------------"
echo "✅ Grafana Dashboard: http://localhost:3002 (admin/admin)"
echo "✅ Prometheus: http://localhost:9090"
echo "✅ API Documentation: http://localhost:8080"
echo ""
echo "📊 The dashboard should now show metrics data!"
echo "   Navigate to: http://localhost:3002/d/log430-golden-signals"
