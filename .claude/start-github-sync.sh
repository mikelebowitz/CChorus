#!/bin/bash
#
# CChorus GitHub Synchronization Startup Script
# Bi-directional sync between BACKLOG.md and GitHub Issues/Projects
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SYNC_SCRIPT="$SCRIPT_DIR/github-sync.py"
PID_FILE="$SCRIPT_DIR/github-sync.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if GitHub sync is already running
check_existing_sync() {
    # Check for running python processes with github-sync
    if pgrep -f "python.*github-sync.py.*--sync" > /dev/null 2>&1; then
        return 0  # Running
    fi
    return 1  # Not running
}

# Handle auto-start mode
if [ "$1" = "--auto-start" ]; then
    echo -e "${BLUE}🔄 Auto-starting CChorus GitHub Sync...${NC}"
    
    # Check if already running
    if check_existing_sync; then
        existing_pid=$(pgrep -f "python.*github-sync.py.*--sync" | head -1)
        echo -e "${GREEN}✅ GitHub sync already running (PID: $existing_pid)${NC}"
        echo -e "${BLUE}📋 Skipping duplicate sync operation${NC}"
        exit 0
    fi
    
    # Check for .env file
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${YELLOW}⚠️  GitHub sync not configured (.env file missing)${NC}"
        echo -e "${BLUE}📋 Run '.claude/start-github-sync.sh --setup' to configure${NC}"
        exit 0
    fi
    
    # Run a sync operation
    cd "$PROJECT_ROOT"
    echo -e "${BLUE}📋 Running GitHub synchronization...${NC}"
    python3 "$SYNC_SCRIPT" --sync > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ GitHub sync completed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  GitHub sync completed with warnings${NC}"
    fi
    exit 0
fi

echo -e "${BLUE}🐙 CChorus GitHub Integration${NC}"

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

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is required but not found${NC}"
    echo "Please install Node.js to use GitHub integration"
    exit 1
fi

echo -e "${GREEN}✅ Found Python 3 and Node.js${NC}"

# Make the sync script executable
chmod +x "$SYNC_SCRIPT"

echo -e "${BLUE}📁 Project: $PROJECT_ROOT${NC}"
echo ""

# Parse command line arguments
if [ "$1" = "--setup" ]; then
    echo -e "${BLUE}🔧 Setting up GitHub integration...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --setup
    
elif [ "$1" = "--status" ]; then
    echo -e "${BLUE}📊 Checking GitHub integration status...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --status
    
elif [ "$1" = "--test" ]; then
    echo -e "${BLUE}🧪 Testing GitHub connection...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --test
    
elif [ "$1" = "--sync-to-github" ]; then
    echo -e "${BLUE}🔄 Syncing BACKLOG.md → GitHub Issues...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --sync-to-github
    
elif [ "$1" = "--sync-from-github" ]; then
    echo -e "${BLUE}🔄 Syncing GitHub Issues → BACKLOG.md...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --sync-from-github
    
elif [ "$1" = "--sync" ]; then
    echo -e "${BLUE}🔄 Bi-directional synchronization...${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    python3 "$SYNC_SCRIPT" --sync
    
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${YELLOW}📋 CChorus GitHub Integration Help${NC}"
    echo ""
    echo "This tool provides bi-directional synchronization between BACKLOG.md and GitHub Issues/Projects."
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo "  $0 --setup              Set up GitHub integration (first time)"
    echo "  $0 --status             Show current integration status"
    echo "  $0 --test               Test GitHub connection and authentication"
    echo "  $0 --sync-to-github     Sync BACKLOG.md → GitHub Issues (outbound)"
    echo "  $0 --sync-from-github   Sync GitHub Issues → BACKLOG.md (inbound)"
    echo "  $0 --sync               Full bi-directional synchronization"
    echo "  $0 --help               Show this help message"
    echo ""
    echo -e "${GREEN}Setup Process:${NC}"
    echo "1. Run: $0 --setup"
    echo "2. Copy .env.template to .env"
    echo "3. Add your GitHub token and repository info to .env"
    echo "4. Test: $0 --test"
    echo "5. Sync: $0 --sync"
    echo ""
    echo -e "${GREEN}Environment Variables Required:${NC}"
    echo "  GITHUB_TOKEN     - Personal Access Token with repo and issues permissions"
    echo "  GITHUB_OWNER     - GitHub username or organization name"
    echo "  GITHUB_REPO      - Repository name"
    echo ""
    echo -e "${GREEN}What Gets Synchronized:${NC}"
    echo ""
    echo -e "${BLUE}BACKLOG.md → GitHub:${NC}"
    echo "  • Creates GitHub Issues from BACKLOG items"
    echo "  • Sets appropriate labels (priority, category, status)"
    echo "  • Links branches when [new-branch] metadata exists"
    echo "  • Updates issue status based on BACKLOG item status"
    echo ""
    echo -e "${BLUE}GitHub → BACKLOG.md:${NC}"
    echo "  • Imports new issues as BACKLOG items"
    echo "  • Updates BACKLOG status when issues are closed"
    echo "  • Syncs labels back to BACKLOG categories"
    echo "  • Maintains bi-directional consistency"
    echo ""
    echo -e "${GREEN}Integration Features:${NC}"
    echo "  • Rate limiting and error handling"
    echo "  • Duplicate detection and prevention"
    echo "  • Automatic issue creation from auto-branch-creator"
    echo "  • Webhook support for real-time sync (optional)"
    echo "  • Comprehensive logging and status tracking"
    echo ""
    
else
    echo -e "${YELLOW}📋 Quick start:${NC}"
    echo ""
    echo "First time setup:"
    echo "  $0 --setup"
    echo ""
    echo "Test connection:"
    echo "  $0 --test"
    echo ""
    echo "Full synchronization:"
    echo "  $0 --sync"
    echo ""
    echo "Get detailed help:"
    echo "  $0 --help"
    echo ""
fi