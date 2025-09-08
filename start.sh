#!/bin/bash

# ConfigManager Startup Script
# This script helps you get the ConfigManager application running quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}ConfigManager Startup Script${NC}"
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists java; then
    echo -e "${RED}Error: Java is not installed. Please install Java 17 or higher.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites are installed${NC}"

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}Warning: Java version should be 17 or higher. Current version: $JAVA_VERSION${NC}"
fi

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//' | awk -F '.' '{print $1}')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Warning: Node.js version should be 18 or higher. Current version: $NODE_VERSION${NC}"
fi

# Check if ports are available
echo -e "\n${YELLOW}Checking ports...${NC}"

if port_in_use 8080; then
    echo -e "${RED}Error: Port 8080 is already in use. Please stop the service using this port.${NC}"
    exit 1
fi

if port_in_use 3000; then
    echo -e "${RED}Error: Port 3000 is already in use. Please stop the service using this port.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Ports 8080 and 3000 are available${NC}"

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi
cd ..

# Function to start backend
start_backend() {
    echo -e "\n${YELLOW}Starting backend...${NC}"
    cd backend
    
    # Make mvnw executable if not already
    chmod +x mvnw
    
    # Start the backend in background
    ./mvnw spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait for backend to start
    echo -e "${YELLOW}Waiting for backend to start...${NC}"
    for i in {1..60}; do
        if curl -s http://localhost:8080/api/config/environments >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend started successfully on port 8080${NC}"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    echo -e "\n${RED}Error: Backend failed to start within 120 seconds${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "\n${YELLOW}Starting frontend...${NC}"
    cd frontend
    
    # Start the frontend in background
    npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    
    # Wait for frontend to start
    echo -e "${YELLOW}Waiting for frontend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend started successfully on port 3000${NC}"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    echo -e "\n${RED}Error: Frontend failed to start within 60 seconds${NC}"
    return 1
}

# Function to stop services
stop_services() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    
    if [ -f backend.pid ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo -e "${GREEN}✓ Backend stopped${NC}"
        fi
        rm -f backend.pid
    fi
    
    if [ -f frontend.pid ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo -e "${GREEN}✓ Frontend stopped${NC}"
        fi
        rm -f frontend.pid
    fi
}

# Handle script termination
trap stop_services EXIT

# Start services
if start_backend && start_frontend; then
    echo -e "\n${GREEN}🚀 ConfigManager is now running!${NC}"
    echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}Backend API: http://localhost:8080${NC}"
    echo -e "${BLUE}H2 Console: http://localhost:8080/h2-console${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Keep the script running
    while true; do
        sleep 1
    done
else
    echo -e "\n${RED}Failed to start ConfigManager${NC}"
    stop_services
    exit 1
fi
