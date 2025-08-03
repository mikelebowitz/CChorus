#!/bin/bash
#
# CChorus File Watcher Startup Script
# Starts the real-time documentation trigger system
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WATCHER_SCRIPT="$SCRIPT_DIR/file-watcher.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting CChorus File Watcher...${NC}"

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
python3 "$WATCHER_SCRIPT"