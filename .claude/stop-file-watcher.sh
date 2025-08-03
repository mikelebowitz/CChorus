#!/bin/bash
#
# CChorus File Watcher Stop Script
# Gracefully stops the real-time documentation trigger system
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/file-watcher.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping CChorus File Watcher...${NC}"

if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  No PID file found - file watcher may not be running${NC}"
    exit 0
fi

pid=$(cat "$PID_FILE")

if ps -p "$pid" > /dev/null 2>&1; then
    echo -e "${BLUE}📋 Stopping file watcher (PID: $pid)${NC}"
    kill "$pid"
    
    # Wait for process to stop
    sleep 2
    
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Process still running, force killing...${NC}"
        kill -9 "$pid"
    fi
    
    rm -f "$PID_FILE"
    echo -e "${GREEN}✅ File watcher stopped successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Process not running, cleaning up PID file${NC}"
    rm -f "$PID_FILE"
fi