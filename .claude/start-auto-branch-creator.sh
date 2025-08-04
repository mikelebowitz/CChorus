#!/bin/bash
#
# CChorus Auto-Branch Creator Startup Script
# Monitors BACKLOG.md and automatically creates branches from [new-branch] metadata
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CREATOR_SCRIPT="$SCRIPT_DIR/auto-branch-creator.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌟 Starting CChorus Auto-Branch Creator...${NC}"

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

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Error: Git is required but not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Git${NC}"

# Verify Git repository
cd "$PROJECT_ROOT"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not a Git repository${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git repository confirmed${NC}"

# Make the creator script executable
chmod +x "$CREATOR_SCRIPT"

echo -e "${BLUE}📁 Project: $PROJECT_ROOT${NC}"
echo -e "${BLUE}📋 Monitoring: BACKLOG.md for [ready-for-branch] metadata${NC}"
echo -e "${BLUE}🌿 Auto-creates: Git branches when explicitly marked as ready${NC}"
echo ""
echo -e "${YELLOW}📋 The auto-branch creator will:${NC}"
echo "  1. Scan BACKLOG.md for [ready-for-branch: branch-name] metadata"
echo "  2. Create branches only when work is ready to begin"
echo "  3. Push branches to remote repository"
echo "  4. Update BACKLOG.md to mark branches as created"
echo "  5. Create GitOps agent invocations for branch management"
echo ""
echo -e "${YELLOW}📋 Branch metadata workflow:${NC}"
echo "  • [planned-branch: name] - Branch planned but not ready"
echo "  • [ready-for-branch: name] - Ready to create branch"
echo "  • [BRANCH-CREATED ✅: name] - Branch has been created"
echo ""

# Parse command line arguments
MODE="once"
INTERVAL=60

if [ "$1" = "--watch" ]; then
    MODE="watch"
    if [ -n "$2" ]; then
        INTERVAL="$2"
    fi
    echo -e "${GREEN}🔄 Running in watch mode (checking every ${INTERVAL} seconds)${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
elif [ "$1" = "--once" ]; then
    MODE="once"
    echo -e "${GREEN}⚡ Running single scan${NC}"
elif [ -n "$1" ]; then
    echo -e "${YELLOW}Usage: $0 [--once|--watch [interval]]${NC}"
    echo ""
    echo "  --once    Run a single scan and exit (default)"
    echo "  --watch   Run continuously, checking every [interval] seconds (default: 60)"
    echo ""
    exit 1
else
    echo -e "${GREEN}⚡ Running single scan (use --watch for continuous monitoring)${NC}"
fi

echo ""

# Start the auto-branch creator
cd "$PROJECT_ROOT"

if [ "$MODE" = "watch" ]; then
    python3 "$CREATOR_SCRIPT" --watch "$INTERVAL"
else
    python3 "$CREATOR_SCRIPT" --once
fi