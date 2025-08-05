#!/bin/bash

# E-commerce Service Development Script
# Provides easy commands for development workflow

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default command
COMMAND=${1:-help}

case $COMMAND in
  "start")
    echo -e "${BLUE}🚀 Starting E-commerce Service...${NC}"
    npm run dev
    ;;
  
  "build")
    echo -e "${BLUE}🔨 Building E-commerce Service...${NC}"
    npm run build
    ;;
  
  "test")
    echo -e "${BLUE}🧪 Running tests...${NC}"
    npm test
    ;;
  
  "test:watch")
    echo -e "${BLUE}👀 Running tests in watch mode...${NC}"
    npm run test:watch
    ;;
  
  "coverage")
    echo -e "${BLUE}📊 Running test coverage...${NC}"
    npm run test:coverage
    ;;
  
  "lint")
    echo -e "${BLUE}🔍 Linting code...${NC}"
    npm run lint
    ;;
  
  "lint:fix")
    echo -e "${BLUE}🔧 Fixing lint issues...${NC}"
    npm run lint:fix
    ;;
  
  "seed")
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    npm run seed
    ;;
  
  "docker:build")
    echo -e "${BLUE}🐳 Building Docker image...${NC}"
    docker build -t log430-ecommerce .
    ;;
  
  "docker:run")
    echo -e "${BLUE}🐳 Running Docker container...${NC}"
    docker run -p 3002:3000 --env-file .env log430-ecommerce
    ;;
  
  "compose:up")
    echo -e "${BLUE}🐳 Starting with Docker Compose...${NC}"
    cd .. && docker-compose up ecommerce --build
    ;;
  
  "compose:logs")
    echo -e "${BLUE}📋 Showing Docker Compose logs...${NC}"
    cd .. && docker-compose logs -f ecommerce
    ;;
  
  "quick-test")
    echo -e "${BLUE}⚡ Running quick service test...${NC}"
    ./test-service.sh
    ;;
  
  "setup")
    echo -e "${BLUE}⚙️  Setting up development environment...${NC}"
    
    # Check if .env exists
    if [ ! -f .env ]; then
      echo -e "${YELLOW}📄 Creating .env file from template...${NC}"
      cp .env.example .env
      echo -e "${GREEN}✅ Created .env file. Please review and update it.${NC}"
    fi
    
    # Install dependencies
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    
    # Run database seed
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    npm run seed
    
    echo -e "${GREEN}✅ Setup complete! Run './dev.sh start' to begin.${NC}"
    ;;
  
  "clean")
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    rm -rf node_modules
    rm -f package-lock.json
    npm install
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    ;;
  
  "health")
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    curl -s http://localhost:3000/health | jq . || echo "Service not running or jq not installed"
    ;;
  
  "status")
    echo -e "${BLUE}📊 Service status:${NC}"
    echo ""
    echo -e "${YELLOW}Health Check:${NC}"
    curl -s http://localhost:3000/health 2>/dev/null && echo "" || echo "Service not accessible"
    echo ""
    echo -e "${YELLOW}Docker Containers:${NC}"
    cd .. && docker-compose ps ecommerce db redis
    ;;
  
  "logs")
    echo -e "${BLUE}📋 Showing service logs...${NC}"
    cd .. && docker-compose logs -f ecommerce
    ;;
  
  "shell")
    echo -e "${BLUE}🐚 Opening service shell...${NC}"
    cd .. && docker-compose exec ecommerce /bin/bash
    ;;
  
  "db")
    echo -e "${BLUE}💾 Opening database shell...${NC}"
    cd .. && docker-compose exec db psql -U postgres -d pos_db
    ;;
  
  "redis")
    echo -e "${BLUE}🔴 Opening Redis CLI...${NC}"
    cd .. && docker-compose exec redis redis-cli
    ;;
  
  "help"|*)
    echo -e "${BLUE}🛍️  E-commerce Service Development Script${NC}"
    echo "=============================================="
    echo ""
    echo -e "${YELLOW}Available commands:${NC}"
    echo ""
    echo -e "${GREEN}Development:${NC}"
    echo "  setup          - Set up development environment"
    echo "  start          - Start development server"
    echo "  build          - Build the application"
    echo "  seed           - Seed the database"
    echo "  clean          - Clean dependencies and reinstall"
    echo ""
    echo -e "${GREEN}Testing:${NC}"
    echo "  test           - Run test suite"
    echo "  test:watch     - Run tests in watch mode"
    echo "  coverage       - Run test coverage"
    echo "  quick-test     - Run quick service test"
    echo ""
    echo -e "${GREEN}Code Quality:${NC}"
    echo "  lint           - Lint code"
    echo "  lint:fix       - Fix lint issues"
    echo ""
    echo -e "${GREEN}Docker:${NC}"
    echo "  docker:build   - Build Docker image"
    echo "  docker:run     - Run Docker container"
    echo "  compose:up     - Start with Docker Compose"
    echo "  compose:logs   - Show Docker Compose logs"
    echo ""
    echo -e "${GREEN}Monitoring:${NC}"
    echo "  health         - Check service health"
    echo "  status         - Show service status"
    echo "  logs           - Show service logs"
    echo ""
    echo -e "${GREEN}Debugging:${NC}"
    echo "  shell          - Open service shell"
    echo "  db             - Open database shell"
    echo "  redis          - Open Redis CLI"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./dev.sh setup"
    echo "  ./dev.sh start"
    echo "  ./dev.sh test"
    echo "  ./dev.sh compose:up"
    echo ""
    ;;
esac
