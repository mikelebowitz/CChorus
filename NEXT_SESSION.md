# CChorus Next Session Brief

**Generated**: 2025-08-03 00:33
**Project**: CChorus - Claude Code Resource Management Platform

## 🚀 Quick Resume

**Branch**: feature/3-column-layout
**Last Activity**: August 03, 2025

## 🖥️ MANDATORY: Development Server Commands

```bash
# Navigate to CChorus project
cd /Users/mikelebowitz/Documents/Code/CChorus

# REQUIRED: Start development servers using tmux-dev
/tmux-dev start frontend server in session cchorus-frontend
/tmux-dev start backend server in session cchorus-backend

# Monitor servers (non-blocking)
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend

# List running sessions
/tmux-dev list all running sessions
```

## 🚫 PROHIBITED Commands

```bash
# These are FORBIDDEN - use /tmux-dev instead:
# npm run dev                 ❌
# npm run dev:server          ❌
# npm run dev:full            ❌
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
 M .claude/agents/documentation-manager.md
 M .claude/hooks/pre-compact.py
 M CHANGELOG.md
 M CLAUDE.md
MM NEXT_SESSION.md
A  docs/sessions/SESSION_2025-08-02_15-47.md
A  docs/sessions/SESSION_2025-08-02_15-47_CCHORUS.md
 M package.json
?? .cchorus_aliases
?? .claude/auto-branch-creator.py
?? .claude/commands/
?? .claude/doc-update-needed.trigger
?? .claude/file-watcher.py
?? .claude/github-service.js
?? .claude/github-sync.py
?? .claude/pending-agent-invocations.json
?? .claude/start-auto-branch-creator.sh
?? .claude/start-file-watcher.sh
?? .claude/start-github-sync.sh
?? .claude/start-task-validator.sh
?? .claude/sync
?? .claude/sync-command.py
?? .claude/task-completion-validator.py
?? .eslintrc.cjs
?? BACKLOG.md
?? PROCESS.md
?? docs/sessions/SESSION_2025-08-03_00-33.md
?? docs/sessions/SESSION_2025-08-03_00-33_CCHORUS.md
?? setup-dev-environment.sh

```

## 🔧 CChorus Development Reminders

- **Resource Library**: Unified browser for all Claude Code resources ✅ COMPLETED
- **Assignment Manager**: Deploy and manage resource assignments ✅ COMPLETED
- **3-Column Layout**: Professional interface with real resource data integration ✅ COMPLETED
- **Automation Systems**: Auto-documentation, branch creation, GitHub sync, task validation ✅ COMPLETED
- **Agent Architecture**: Documentation manager handles docs, GitOps handles Git
- **Server Management**: Always use `/tmux-dev` for development servers (npm commands PROHIBITED)
- **Component System**: shadcn/ui + Radix UI with accessibility features (MANDATORY)
- **Workflow Enforcement**: Pre-compact hook auto-invokes `/docgit`, file watchers trigger doc updates
- **Quality Gates**: Task completion validation prevents premature completion
- **GitHub Integration**: Bi-directional sync between BACKLOG.md and GitHub Issues/Projects

## 📋 Documentation Updates Status

**README.md**: ✅ Updated with automation systems and mandatory workflows  
**CLAUDE.md**: ✅ Strategic guidance with automation infrastructure  
**CHANGELOG.md**: ✅ Version 2.0.0 release documentation  
**BACKLOG.md**: ✅ Future work tracking with auto-branch metadata  
**PROCESS.md**: ✅ Workflow enforcement and quality gates

---

*This brief helps you resume CChorus development following all mandatory workflows.*
