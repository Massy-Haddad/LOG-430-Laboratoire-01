#!/bin/bash

# E-commerce Service Quick Test Script
# This script tests the main endpoints of the e-commerce service

set -e

# Configuration
BASE_URL="http://localhost:3000"
GATEWAY_URL="http://localhost:3000"  # Through KrakenD gateway

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test headers (simulating KrakenD JWT validation)
TEST_HEADERS=(
    -H "Content-Type: application/json"
    -H "X-User-Id: 1"
    -H "X-User-Name: testuser"
    -H "X-User-Role: customer"
    -H "X-Store-Id: 1"
)

echo -e "${BLUE}🛍️  E-commerce Service Test Suite${NC}"
echo "=================================="
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" "${TEST_HEADERS[@]}" -d "$data" || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" "${TEST_HEADERS[@]}" || echo "000")
    fi
    
    # Extract HTTP status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all but last line)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "Response: $(echo "$body" | head -c 200)..."
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        if [ -n "$body" ]; then
            echo "Response: $body"
        fi
    fi
    echo ""
}

echo -e "${BLUE}1. Health Check Tests${NC}"
echo "---------------------"
test_endpoint "GET" "/health" "Service health check"

echo -e "${BLUE}2. Metrics Tests${NC}"
echo "----------------"
test_endpoint "GET" "/api/v1/ecommerce/metrics" "Prometheus metrics"

echo -e "${BLUE}3. Authentication Tests${NC}"
echo "-----------------------"
echo -e "${YELLOW}Testing: Unauthenticated request${NC}"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/v1/ecommerce/cart" -H "Content-Type: application/json" || echo "000")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $status_code) - Correctly rejected unauthenticated request"
else
    echo -e "${RED}❌ FAIL${NC} (Expected: 401, Got: $status_code)"
fi
echo ""

echo -e "${BLUE}4. Cart Operations Tests${NC}"
echo "------------------------"
test_endpoint "GET" "/api/v1/ecommerce/cart" "Get empty cart"

test_endpoint "POST" "/api/v1/ecommerce/cart" "Add item to cart" '{
    "productId": 1,
    "quantity": 2,
    "price": 5.99,
    "productName": "Test Product"
}' 201

test_endpoint "GET" "/api/v1/ecommerce/cart" "Get cart with items"

test_endpoint "GET" "/api/v1/ecommerce/cart/summary" "Get cart summary"

test_endpoint "PUT" "/api/v1/ecommerce/cart/1" "Update cart item" '{
    "quantity": 3
}'

test_endpoint "POST" "/api/v1/ecommerce/cart/validate" "Validate cart"

echo -e "${BLUE}5. Validation Tests${NC}"
echo "-------------------"
test_endpoint "POST" "/api/v1/ecommerce/cart" "Invalid item (missing fields)" '{
    "productId": 1
}' 400

test_endpoint "POST" "/api/v1/ecommerce/cart" "Invalid item (negative quantity)" '{
    "productId": 1,
    "quantity": -1,
    "price": 5.99
}' 400

echo -e "${BLUE}6. Checkout Tests${NC}"
echo "------------------"
test_endpoint "POST" "/api/v1/ecommerce/checkout" "Process checkout" '{
    "paymentMethod": "card",
    "shippingAddress": {
        "street": "123 Test St",
        "city": "Montreal",
        "postalCode": "H1A 1A1",
        "country": "Canada",
        "state": "QC"
    },
    "notes": "Test order"
}' 201

echo -e "${BLUE}7. Order Management Tests${NC}"
echo "-------------------------"
test_endpoint "GET" "/api/v1/ecommerce/orders" "Get user orders"

test_endpoint "GET" "/api/v1/ecommerce/orders?page=1&limit=5" "Get orders with pagination"

test_endpoint "GET" "/api/v1/ecommerce/orders/statistics" "Get order statistics"

echo -e "${BLUE}8. Error Handling Tests${NC}"
echo "----------------------"
test_endpoint "GET" "/api/v1/ecommerce/nonexistent" "404 for unknown endpoint" "" 404

test_endpoint "DELETE" "/api/v1/ecommerce/cart/999" "Remove non-existent item" "" 404

echo ""
echo -e "${GREEN}🎉 Test Suite Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Manual Testing Suggestions:${NC}"
echo "1. Check the API documentation at: $BASE_URL/api/docs"
echo "2. Monitor metrics at: $BASE_URL/api/v1/ecommerce/metrics"
echo "3. Test via KrakenD gateway at: $GATEWAY_URL/api/v1/ecommerce/*"
echo "4. Check service logs: docker-compose logs -f ecommerce"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "- Use tools like Postman or curl for detailed testing"
echo "- Check the Redis cache: docker-compose exec redis redis-cli"
echo "- Verify database data: docker-compose exec db psql -U postgres -d pos_db"
echo ""
