#!/bin/bash

#
# CChorus Development Dashboard Starter
# Launches the real-time development dashboard with WebSocket support
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DASHBOARD_PORT=${DASHBOARD_PORT:-3002}

# Check for background mode
BACKGROUND_MODE=false
if [[ "$1" == "--background" ]]; then
    BACKGROUND_MODE=true
    echo "🌟 Starting CChorus Development Dashboard in background..."
else
    echo "🚀 Starting CChorus Development Dashboard..."
fi

echo "📁 Project: $PROJECT_ROOT"
echo "🌐 Dashboard: http://localhost:$DASHBOARD_PORT"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    echo "💡 Install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if we have the required dependencies
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
fi

# Check if ws (WebSocket) is available
if ! node -e "require('ws')" 2>/dev/null; then
    echo "📦 Installing WebSocket dependency..."
    cd "$PROJECT_ROOT"
    npm install ws
fi

# Start the dashboard server
echo "🎯 Starting dashboard server on port $DASHBOARD_PORT..."
cd "$PROJECT_ROOT"

# Set environment variables
export DASHBOARD_PORT="$DASHBOARD_PORT"
export NODE_ENV="development"

# Start server with auto-restart on changes
if [ "$BACKGROUND_MODE" = true ]; then
    echo "🌟 Starting dashboard server in background (PID will be shown)"
    if command -v nodemon &> /dev/null; then
        nohup nodemon tools/dashboard-server.js > /dev/null 2>&1 &
    else
        nohup node tools/dashboard-server.js > /dev/null 2>&1 &
    fi
    DASHBOARD_PID=$!
    echo "✅ Dashboard server started in background (PID: $DASHBOARD_PID)"
    echo "🌐 Dashboard available at: http://localhost:$DASHBOARD_PORT"
else
    if command -v nodemon &> /dev/null; then
        echo "🔄 Using nodemon for auto-restart"
        nodemon tools/dashboard-server.js
    else
        echo "🚀 Starting dashboard server"
        node tools/dashboard-server.js
    fi
fi