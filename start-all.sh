#!/bin/bash

# ConfigManager - Start Both Services
echo "🚀 Starting ConfigManager Application..."

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes on ports 8080 and 3000
echo "🧹 Cleaning up existing processes..."
if check_port 8080; then
    echo "  Stopping process on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
fi

if check_port 3000; then
    echo "  Stopping process on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Wait a moment for ports to be freed
sleep 2

echo ""
echo "Starting backend and frontend services..."
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo "================================================="

# Start backend in background
echo "🔧 Starting backend..."
./start-backend.sh &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

# Start frontend in background
echo "🎨 Starting frontend..."
./start-frontend.sh &
FRONTEND_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Kill any remaining processes on our ports
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
