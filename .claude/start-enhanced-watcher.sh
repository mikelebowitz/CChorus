#!/bin/bash

#
# CChorus Enhanced File Watcher Starter
# Launches the enhanced file watcher with smart change detection and micro-agent routing
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WATCHER_SCRIPT="$PROJECT_ROOT/.claude/file-watcher-enhanced.py"
LEGACY_WATCHER="$PROJECT_ROOT/.claude/file-watcher.py"

echo "🧠 Starting CChorus Enhanced File Watcher..."
echo "📁 Project: $PROJECT_ROOT"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if watchdog is installed
if ! python3 -c "import watchdog" 2>/dev/null; then
    echo "📦 Installing watchdog dependency..."
    pip3 install --user --break-system-packages watchdog
fi

# Stop any existing watchers
echo "🔄 Stopping existing watchers..."
pkill -f "file-watcher" || true
sleep 2

# Create log directory
mkdir -p "$PROJECT_ROOT/.claude/logs"

# Start enhanced watcher
echo "🚀 Starting enhanced file watcher with smart routing..."
echo "📋 Features: Smart change detection, micro-agent routing, batch processing"
echo "⏱️  Debounce: 15s | Batch size: 5 changes"

cd "$PROJECT_ROOT"

# Check if --legacy flag is passed
if [[ "$1" == "--legacy" ]]; then
    echo "🔄 Using legacy file watcher..."
    python3 "$LEGACY_WATCHER"
else
    echo "🧠 Using enhanced file watcher..."
    python3 "$WATCHER_SCRIPT" 2>&1 | tee ".claude/logs/watcher-$(date +%Y%m%d_%H%M%S).log"
fi