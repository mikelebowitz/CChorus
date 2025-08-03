#!/bin/bash
#
# CChorus File Watcher Startup Script
# Starts the real-time documentation trigger system
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WATCHER_SCRIPT="$SCRIPT_DIR/file-watcher.py"
PID_FILE="$SCRIPT_DIR/file-watcher.pid"

# Parse command line arguments
AUTO_START=false
if [ "$1" = "--auto-start" ]; then
    AUTO_START=true
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if file watcher is already running
check_existing_watcher() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Running
        else
            rm -f "$PID_FILE"  # Remove stale PID file
            return 1  # Not running
        fi
    fi
    return 1  # Not running
}

if [ "$AUTO_START" = true ]; then
    echo -e "${BLUE}🔄 Auto-starting CChorus File Watcher...${NC}"
else
    echo -e "${BLUE}🚀 Starting CChorus File Watcher...${NC}"
fi

# Check if already running
if check_existing_watcher; then
    existing_pid=$(cat "$PID_FILE")
    echo -e "${GREEN}✅ File watcher already running (PID: $existing_pid)${NC}"
    if [ "$AUTO_START" = true ]; then
        echo -e "${BLUE}📋 Real-time documentation monitoring is active${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  To stop the existing watcher: kill $existing_pid${NC}"
        echo -e "${BLUE}📋 Current status: Monitoring for changes${NC}"
        exit 0
    fi
fi

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ] || [ ! -d "$PROJECT_ROOT/.claude" ]; then
    echo -e "${RED}❌ Error: Not in CChorus project directory${NC}"
    echo "Expected to find CLAUDE.md and .claude/ directory"
    echo "Current project root: $PROJECT_ROOT"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is required but not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Python 3${NC}"

# Check for watchdog package
echo -e "${BLUE}📦 Checking watchdog package...${NC}"
if ! python3 -c "import watchdog" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  watchdog package not found. Installing...${NC}"
    
    # Try to install watchdog
    if command -v pip3 &> /dev/null; then
        pip3 install watchdog
    elif command -v pip &> /dev/null; then
        pip install watchdog
    else
        echo -e "${RED}❌ Error: pip not found. Please install watchdog manually:${NC}"
        echo "pip install watchdog"
        exit 1
    fi
    
    # Verify installation
    if python3 -c "import watchdog" 2>/dev/null; then
        echo -e "${GREEN}✅ watchdog installed successfully${NC}"
    else
        echo -e "${RED}❌ Error: Failed to install watchdog${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ watchdog package found${NC}"
fi

# Make the watcher script executable
chmod +x "$WATCHER_SCRIPT"

echo -e "${BLUE}📁 Project: $PROJECT_ROOT${NC}"
echo -e "${BLUE}🔍 Monitoring: src/, server.js, CLAUDE.md, .claude/agents/, .claude/commands/${NC}"
echo -e "${BLUE}⚡ Auto-triggers: @documentation-manager when changes detected${NC}"
echo ""
echo -e "${YELLOW}📋 The file watcher will:${NC}"
echo "  1. Monitor source files for changes"
echo "  2. Automatically trigger documentation updates"
echo "  3. Create trigger files for next session if needed"
echo "  4. Update NEXT_SESSION.md with real-time notices"
echo ""
echo -e "${GREEN}🚀 Starting file watcher...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Start the file watcher
cd "$PROJECT_ROOT"

if [ "$AUTO_START" = true ]; then
    # Start in background for auto-start
    python3 "$WATCHER_SCRIPT" > /dev/null 2>&1 &
    watcher_pid=$!
    echo "$watcher_pid" > "$PID_FILE"
    echo -e "${GREEN}✅ File watcher started in background (PID: $watcher_pid)${NC}"
    echo -e "${BLUE}📋 Real-time documentation monitoring is now active${NC}"
else
    # Start in foreground for manual start
    python3 "$WATCHER_SCRIPT" &
    watcher_pid=$!
    echo "$watcher_pid" > "$PID_FILE"
    
    # Clean up PID file on exit
    trap "rm -f '$PID_FILE'" EXIT
    
    # Wait for the process
    wait $watcher_pid
fi