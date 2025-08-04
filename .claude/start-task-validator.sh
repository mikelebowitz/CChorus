#!/bin/bash
#
# CChorus Task Completion Validator Startup Script
# Validates that tasks meet completion requirements before marking as complete
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VALIDATOR_SCRIPT="$SCRIPT_DIR/task-completion-validator.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 CChorus Task Completion Validator${NC}"

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

# Make the validator script executable
chmod +x "$VALIDATOR_SCRIPT"

echo -e "${BLUE}📁 Project: $PROJECT_ROOT${NC}"
echo ""

# Parse command line arguments
if [ "$1" = "--validate-task" ]; then
    if [ -z "$2" ]; then
        echo -e "${RED}❌ Error: Task description required${NC}"
        echo "Usage: $0 --validate-task 'task description' [priority]"
        exit 1
    fi
    
    TASK="$2"
    PRIORITY="${3:-medium}"
    
    echo -e "${BLUE}🔍 Validating task: ${TASK}${NC}"
    echo -e "${BLUE}📊 Priority: ${PRIORITY}${NC}"
    echo ""
    
    cd "$PROJECT_ROOT"
    python3 "$VALIDATOR_SCRIPT" --validate-task "$TASK" "$PRIORITY"
    
elif [ "$1" = "--validate-todos" ]; then
    echo -e "${BLUE}📋 Validating all current todos${NC}"
    echo ""
    
    cd "$PROJECT_ROOT"
    python3 "$VALIDATOR_SCRIPT" --validate-todos
    
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo -e "${YELLOW}📋 CChorus Task Completion Validator Help${NC}"
    echo ""
    echo "This tool validates that tasks meet completion requirements before they can be marked as completed."
    echo ""
    echo -e "${GREEN}Usage:${NC}"
    echo "  $0 --validate-task 'description' [priority]   Validate a specific task"
    echo "  $0 --validate-todos                           Validate all current todos"
    echo "  $0 --help                                     Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  $0 --validate-task 'Implement dark theme toggle' high"
    echo "  $0 --validate-task 'Fix button styling'"
    echo "  $0 --validate-todos"
    echo ""
    echo -e "${GREEN}Task Categories and Requirements:${NC}"
    echo ""
    echo -e "${BLUE}Frontend Tasks:${NC}"
    echo "  • Playwright testing completed"
    echo "  • User approval obtained"
    echo "  • shadcn/ui compliance verified"
    echo "  • Theme testing (light/dark)"
    echo "  • Accessibility validation"
    echo ""
    echo -e "${BLUE}Backend Tasks:${NC}"
    echo "  • API testing completed"
    echo "  • Error handling validation"
    echo "  • Security review"
    echo ""
    echo -e "${BLUE}Documentation Tasks:${NC}"
    echo "  • Documentation-manager agent used"
    echo "  • Accuracy validation"
    echo "  • Cross-reference checking"
    echo ""
    echo -e "${BLUE}Git Workflow Tasks:${NC}"
    echo "  • GitOps workflow followed"
    echo "  • Commit message quality"
    echo "  • Branch naming compliance"
    echo ""
    echo -e "${BLUE}General Tasks:${NC}"
    echo "  • Testing completed"
    echo "  • Documentation updated"
    echo "  • No breaking changes"
    echo ""
    
else
    echo -e "${YELLOW}📋 Quick validation examples:${NC}"
    echo ""
    echo "Validate a specific task:"
    echo "  $0 --validate-task 'Add user authentication'"
    echo ""
    echo "Validate all current todos:"
    echo "  $0 --validate-todos"
    echo ""
    echo "Get detailed help:"
    echo "  $0 --help"
    echo ""
fi