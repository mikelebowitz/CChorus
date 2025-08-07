#!/bin/bash
# CChorus UI Testing Setup Script
# Sets up automated UI testing hooks for development

echo "🧪 Setting up CChorus automated UI testing..."

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Set up Git hooks directory
echo "🔗 Configuring Git hooks..."
git config core.hooksPath .githooks

# Verify hook files exist and are executable
if [ -f ".githooks/pre-commit" ] && [ -x ".githooks/pre-commit" ]; then
    echo "✅ Pre-commit hook configured"
else
    echo "❌ Error: Pre-commit hook not found or not executable"
    exit 1
fi

if [ -f ".claude/hooks/pre-ui-change.py" ] && [ -x ".claude/hooks/pre-ui-change.py" ]; then
    echo "✅ UI change detection hook configured"
else
    echo "❌ Error: UI change detection hook not found or not executable"
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p .claude
touch .claude/pending-agent-invocations.json
echo "[]" > .claude/pending-agent-invocations.json

echo ""
echo "🎉 CChorus automated UI testing is now configured!"
echo ""
echo "📋 What happens next:"
echo "   • When you modify UI files (components, CSS, etc.), the pre-commit hook will:"
echo "     1. Detect UI-related file changes"
echo "     2. Queue a frontend-tester agent invocation"
echo "     3. Generate comprehensive testing prompts"
echo "     4. Set appropriate priority based on component criticality"
echo ""
echo "🔍 To test the setup:"
echo "   1. Modify a UI component (e.g., src/components/*.tsx)"
echo "   2. Run: git add ."
echo "   3. Run: git commit -m 'test ui hook'"
echo "   4. Check: .claude/pending-agent-invocations.json"
echo ""
echo "⚙️  Configuration files:"
echo "   • Git hook: .githooks/pre-commit"
echo "   • UI detector: .claude/hooks/pre-ui-change.py" 
echo "   • Pending queue: .claude/pending-agent-invocations.json"
echo ""
echo "🚀 Ready for automated UI testing!"