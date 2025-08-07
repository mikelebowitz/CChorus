# CChorus Next Session Brief

## 🔔 REAL-TIME: Documentation Update Needed

**Auto-detected by file watcher at 2025-08-07 13:55:16**

**Files Changed**: 2 files
**Priority**: MEDIUM

```bash
# IMMEDIATE ACTION REQUIRED:
@documentation-manager please update documentation for recent file changes
# After completion:
@gitops-workflow-manager please commit and push changes
```

**Changed Files**:
- ResourceEditor.tsx.tmp.46518.1754589316862
- server.js


**Trigger Files**: 
- `.claude/doc-update-needed.trigger`
- `.claude/pending-agent-invocations.json`

---









**Generated**: 2025-08-07 12:09
**Project**: CChorus - Claude Code Resource Management Platform

## 🚀 Quick Resume

**Branch**: feature/ux-spec-implementation
**Last Activity**: August 07, 2025

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
 M .claude/cchorus.db-shm
 M .claude/cchorus.db-wal
 M .claude/compact-tracking.json
 M .claude/doc-update-needed.trigger
 M .claude/pending-agent-invocations.json
 M .claude/token-usage.json
 M .claude/ui-test-needed.trigger
 M CHANGELOG.md
 M NEXT_SESSION.md
 M src/App.tsx
 M src/components/PropertiesPanel.tsx
 M src/components/ResourceEditor.tsx
 M src/components/ResourceListItem.tsx
 M src/components/ThreeColumnLayout.tsx
 M src/utils/resourceDataService.ts
?? docs/sessions/SESSION_2025-08-07_10-19.md
?? docs/sessions/SESSION_2025-08-07_10-19_CCHORUS.md
?? docs/sessions/SESSION_2025-08-07_12-09.md
?? docs/sessions/SESSION_2025-08-07_12-09_CCHORUS.md

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
