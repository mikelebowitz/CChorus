#!/bin/bash
#
# CChorus Development Environment Setup
# Sets up shell aliases and development environment for CChorus
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALIASES_FILE="$PROJECT_ROOT/.cchorus_aliases"

echo "🚀 Setting up CChorus development environment..."

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/CLAUDE.md" ] || [ ! -d "$PROJECT_ROOT/.claude" ]; then
    echo "❌ Error: Not in CChorus project directory"
    echo "Run this script from the CChorus project root"
    exit 1
fi

# Detect shell
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
    "bash")
        SHELL_CONFIG="$HOME/.bashrc"
        [ ! -f "$SHELL_CONFIG" ] && SHELL_CONFIG="$HOME/.bash_profile"
        ;;
    "zsh")
        SHELL_CONFIG="$HOME/.zshrc"
        ;;
    "fish")
        echo "❌ Fish shell not supported yet. Please use bash or zsh."
        exit 1
        ;;
    *)
        echo "⚠️  Unknown shell: $SHELL_NAME"
        echo "Defaulting to ~/.bashrc"
        SHELL_CONFIG="$HOME/.bashrc"
        ;;
esac

echo "📝 Detected shell: $SHELL_NAME"
echo "📝 Shell config: $SHELL_CONFIG"

# Check if aliases are already sourced
ALIAS_SOURCE_LINE="source \"$ALIASES_FILE\""
if grep -Fxq "$ALIAS_SOURCE_LINE" "$SHELL_CONFIG" 2>/dev/null; then
    echo "✅ CChorus aliases already configured in $SHELL_CONFIG"
else
    echo "📋 Adding CChorus aliases to $SHELL_CONFIG"
    echo "" >> "$SHELL_CONFIG"
    echo "# CChorus Development Aliases" >> "$SHELL_CONFIG"
    echo "$ALIAS_SOURCE_LINE" >> "$SHELL_CONFIG"
    echo "✅ Added aliases to $SHELL_CONFIG"
fi

# Source the aliases for current session
source "$ALIASES_FILE"

echo ""
echo "🎉 CChorus development environment setup complete!"
echo ""
echo "📋 Quick Commands:"
echo "  cchorus-servers  - Start both frontend and backend servers"
echo "  cchorus-status   - Check running tmux sessions"
echo "  cchorus-logs     - View server logs"
echo ""
echo "⚠️  Restart your terminal or run: source $SHELL_CONFIG"
echo ""
echo "🚫 Prohibited commands (now blocked):"
echo "  npm run dev      - Use: /tmux-dev start frontend"
echo "  npm run dev:server - Use: /tmux-dev start backend"
echo "  npm start        - Use: /tmux-dev start backend"