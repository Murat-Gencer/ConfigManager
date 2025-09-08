#!/bin/bash

# ConfigManager Frontend Startup Script
echo "🚀 Starting ConfigManager Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//' | awk -F '.' '{print $1}')
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 16 or higher is required. Current version: v$(node -v | sed 's/v//')"
    exit 1
fi

echo "✅ Node.js version check passed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "🌐 Starting React development server..."
echo "🔗 Frontend will be available at: http://localhost:3000"
echo "🔄 Make sure backend is running at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the frontend server"
echo "----------------------------------------"

# Start the React development server
npm start
