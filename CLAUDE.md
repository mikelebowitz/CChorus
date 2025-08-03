# CLAUDE.md

Essential guidance for Claude Code when working with CChorus.

## Quick Start

```bash
npm install
# Open project in VS Code - development servers start automatically
```

**Automatic Development Server Startup:**
- Frontend and backend servers auto-start when opening the project in VS Code
- Servers run in visible VS Code Terminal tabs (grouped as "cchorus")
- File watcher starts automatically via SessionStart hook

**Manual Control (if needed):**
- Use `Cmd+Shift+P` → "Tasks: Run Task" to start/stop servers manually
- Or run directly: `npm run dev` (frontend) and `npm run dev:server` (backend)

## Project Overview

**CChorus** is a React-based Claude Code resource management platform with professional 3-column interface.

### Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js Express API (port 3001)
- **Data**: File system-based storage in `.claude/` directories

### Core Components
- **ThreeColumnLayout**: Main interface with navigation, resource lists, and editors
- **ResourceAssignmentPanel**: Cross-project resource deployment
- **ResourceDataService**: Unified resource discovery service

### Agent Format
```markdown
---
name: agent-name
description: When to invoke this agent
tools: tool1, tool2, tool3
---
System prompt content...
```

## MANDATORY Process

### Server Management
**Servers auto-start in VS Code Terminal tabs when project opens. Manual control via VS Code Tasks or direct npm commands.**

### UI Development (MANDATORY)
**ALWAYS use shadcn/ui + Radix UI patterns:**
```tsx
// REQUIRED imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// REQUIRED className pattern
<Button className={cn("bg-muted text-muted-foreground", customClasses)}>
```

**NEVER use these prohibited patterns:**
```tsx
// ❌ PROHIBITED - Material-UI
import { Button } from "@mui/material"

// ❌ PROHIBITED - Inline styles  
<div style={{ color: 'red' }}>

// ❌ PROHIBITED - styled-components
const StyledDiv = styled.div`color: red;`
```

### Agent Workflow (REQUIRED)
```bash
# MANDATORY sequence for all changes:
# 1. Code Changes (UI must use shadcn/ui only)
# 2. @documentation-manager update docs
# 3. @gitops-workflow-manager commit and push
```

### Auto-Trigger Documentation System
**Real-time documentation monitoring with multiple trigger methods:**

```bash
# Start real-time file watcher (optional but recommended)
.claude/start-file-watcher.sh

# Force complete documentation synchronization
.claude/sync

# Manual trigger if auto-system fails
@documentation-manager update docs for pending changes
```

**Auto-trigger mechanisms:**
- **Pre-compact hook**: Detects changes during session end, auto-invokes `/docgit`
- **File watcher**: Real-time monitoring with immediate documentation triggers (start with `.claude/start-file-watcher.sh`)
- **Trigger files**: `.claude/doc-update-needed.trigger` and `.claude/pending-agent-invocations.json`
- **Session notices**: Automatic updates to `NEXT_SESSION.md` with required actions

**Troubleshooting automation:**
- File watcher not working? Install with: `pip3 install --user --break-system-packages watchdog`
- Check if running: `ps aux | grep file-watcher`
- Manual control: `.claude/start-file-watcher.sh` or `.claude/stop-file-watcher.sh`
- Manual trigger: `.claude/sync` or `/docgit`
- Stop on session end: Set `CCHORUS_STOP_WATCHER_ON_EXIT=true` environment variable

### Auto-Branch Creation System
**Intelligent branch creation from BACKLOG.md metadata:**

```bash
# Monitor BACKLOG.md for [new-branch] metadata and auto-create branches
.claude/start-auto-branch-creator.sh --once        # Single scan
.claude/start-auto-branch-creator.sh --watch       # Continuous monitoring

# BACKLOG.md syntax for auto-branch creation:
# - **Feature name** `[new-branch: feature/branch-name]`
```

**Auto-branch mechanisms:**
- **BACKLOG.md scanning**: Detects `[new-branch: branch-name]` metadata
- **GitOps integration**: Auto-creates GitOps agent invocations for branch management
- **GitHub integration**: Auto-creates GitHub Issues when branches are created
- **Pre-compact analysis**: Recommends branch creation based on work scope analysis
- **Branch intelligence**: Priority-based naming and creation timing

### GitHub Integration System
**Bi-directional synchronization between BACKLOG.md and GitHub Issues/Projects:**

```bash
# Set up GitHub integration (first time)
.claude/start-github-sync.sh --setup

# Test GitHub connection
.claude/start-github-sync.sh --test

# Full bi-directional synchronization
.claude/start-github-sync.sh --sync

# One-way sync options
.claude/start-github-sync.sh --sync-to-github      # BACKLOG → GitHub
.claude/start-github-sync.sh --sync-from-github    # GitHub → BACKLOG
```

**GitHub sync features:**
- **Auto-creates GitHub Issues** from BACKLOG.md items with proper labels and priorities
- **Updates Issue status** when BACKLOG items are completed or branches are created
- **Imports GitHub Issues** back to BACKLOG.md with appropriate categorization
- **Links branches to Issues** automatically via commit message patterns
- **Rate limiting and error handling** for reliable synchronization

### GitHub Project Board Integration
**Automated kanban board management with visual progress tracking:**

```bash
# One-time setup: Add all issues to project board and enable automation
.claude/project-setup.js

# View project board status
.claude/start-github-sync.sh --status
```

**Project automation features:**
- **Auto-adds new Issues** to Project board via GitHub Actions workflow
- **Status label management** with automatic `status: pending/in_progress/completed` labels
- **Column automation** moves Issues based on status changes and completion
- **Visual progress tracking** with kanban board view of all BACKLOG.md items

### Task Completion Requirements
**Automated validation system prevents premature task completion:**

```bash
# Validate specific task before marking complete
.claude/start-task-validator.sh --validate-task "task description" [priority]

# Validate all current todos
.claude/start-task-validator.sh --validate-todos
```

**Category-specific requirements:**
- **Frontend**: Playwright testing + user approval + shadcn/ui compliance + theme testing + accessibility validation
- **Backend**: API testing + error handling validation + security review  
- **Documentation**: Documentation-manager usage + accuracy validation + cross-reference checking
- **Git Workflow**: GitOps workflow + commit message quality + branch naming compliance
- **All work**: Testing completed + documentation updated + no breaking changes detected

### Prohibited Actions
- ❌ Direct server commands
- ❌ Manual documentation updates
- ❌ Direct Git operations
- ❌ Marking tasks complete without testing

## Current Status

**Branch**: `feature/3-column-layout` (COMPLETED ✅)
**Automation**: Comprehensive development workflow system active (✅ File watcher, ✅ GitHub sync, ✅ Task validation)
**Roadmap**: See [BACKLOG.md](./BACKLOG.md) for upcoming work
**History**: See [CHANGELOG.md](./CHANGELOG.md) for completed work

---
**Documentation Strategy**: CLAUDE.md (strategic), BACKLOG.md (future), CHANGELOG.md (past), PROCESS.md (workflow)

## File Watcher Status

**Real-time monitoring**: ✅ Active (PID: Check with `ps aux | grep file-watcher`)
**Auto-documentation**: ✅ Triggers documentation-manager on code changes
**Session triggers**: ✅ Updates NEXT_SESSION.md with real-time notices