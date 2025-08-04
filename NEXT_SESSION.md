# CChorus Next Session Brief

## 🔔 REAL-TIME: Documentation Update Needed

**Auto-detected by file watcher at 2025-08-03 22:34:25**

**Files Changed**: 7 files
**Priority**: HIGH

```bash
# IMMEDIATE ACTION REQUIRED:
@documentation-manager please update documentation for recent file changes
# After completion:
@gitops-workflow-manager please commit and push changes
```

**Changed Files**:
- documentation-manager.md.tmp.75774.1754268728875
- changelog-updater.md
- backlog-manager.md
- CLAUDE.md
- documentation-manager.md
... and 2 more

**Trigger Files**: 
- `.claude/doc-update-needed.trigger`
- `.claude/pending-agent-invocations.json`

---



**Generated**: 2025-08-03 21:20
**Project**: CChorus - Claude Code Resource Management Platform

## 🚀 Quick Resume

**Branch**: feature/sqlite-dashboard-persistence
**Last Activity**: August 03, 2025

## 🖥️ MANDATORY: Development Server Commands

```bash
# Navigate to CChorus project
cd /Users/mikelebowitz/Documents/Code/CChorus

# Development servers auto-start in VS Code (no manual commands needed)
# Frontend and backend start automatically when project opens in VS Code
# Servers run in visible terminal tabs for easy monitoring

# Manual control (if needed):
# Cmd+Shift+P → "Tasks: Run Task" → "Start Frontend" or "Start Backend"
# Or run directly: npm run dev (frontend), npm run dev:server (backend)
```

## 🚫 PROHIBITED Commands

```bash
# These are not needed - VS Code handles automatically:
# /tmux-dev commands are deprecated
# Servers auto-start via VS Code tasks.json
```

## 📚 Agent Workflow Reminder

**MANDATORY SEQUENCE**: Code Changes → Documentation Agent → GitOps Agent

```bash
# When making changes, follow this workflow:
# 1. Complete your code changes
# 2. Invoke: @documentation-manager please update documentation for [changes]
# 3. Verify documentation agent completion
# 4. Let GitOps agent handle commits and pushes
```

## 🎯 Active Development Context

Check `docs/sessions/` for the latest session summary with detailed context.

## 📂 Git Status Summary

```
 M .claude/agents/api-documenter.md
 M .claude/agents/backlog-manager.md
 M .claude/agents/changelog-updater.md
 M .claude/agents/component-documenter.md
 M .claude/agents/documentation-manager.md
 M .claude/agents/file-change-analyzer.md
 M .claude/agents/readme-updater.md
 M .claude/auto-branch-creator.py
 M .claude/doc-update-needed.trigger
 M .claude/hooks/pre-compact.py
 M .claude/pending-agent-invocations.json
 M .claude/start-auto-branch-creator.sh
 M .claude/token-usage.json
 M .vscode/tasks.json
 M BACKLOG.md
 M CHANGELOG.md
 M CLAUDE.md
MM NEXT_SESSION.md
A  docs/sessions/SESSION_2025-08-03_19-51.md
A  docs/sessions/SESSION_2025-08-03_19-51_CCHORUS.md
A  docs/sessions/SESSION_2025-08-03_20-40.md
A  docs/sessions/SESSION_2025-08-03_20-40_CCHORUS.md
 M package-lock.json
 M package.json
 M tools/dashboard-server.js
 M tools/dev-dashboard.html
?? .claude/agents/frontend-tester.md
?? .claude/cchorus.db-shm
?? .claude/cchorus.db-wal
?? .claude/compact-tracking.json
?? docs/OBSERVABILITY_DATA_TYPES.md
?? docs/sessions/SESSION_2025-08-03_21-20.md
?? docs/sessions/SESSION_2025-08-03_21-20_CCHORUS.md
?? tools/conversation-extractor.js
?? tools/database-service.js

```

## 🔧 CChorus Development Reminders

- **Resource Library**: Unified browser for all Claude Code resources
- **Assignment Manager**: Deploy and manage resource assignments  
- **Agent Architecture**: Documentation manager handles docs, GitOps handles Git
- **Server Management**: VS Code auto-starts servers in visible terminal tabs
- **Component System**: shadcn/ui + Radix UI with accessibility features
- **Automated Workflow**: Pre-compact hook now auto-invokes `/docgit` when changes detected

---

*This brief helps you resume CChorus development following all mandatory workflows.*
