# CChorus Next Session Brief

**Generated**: 2025-08-03 15:55
**Project**: CChorus - Claude Code Resource Management Platform

## 🚀 Quick Resume

**Branch**: feature/hybrid-infrastructure-v3
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
 M CHANGELOG.md
 M NEXT_SESSION.md
 M package-lock.json
 M package.json
MM tools/dashboard-server.js
MM tools/dev-dashboard.html
?? .claude/token-usage.json
?? docs/sessions/SESSION_2025-08-03_15-55.md
?? docs/sessions/SESSION_2025-08-03_15-55_CCHORUS.md

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
