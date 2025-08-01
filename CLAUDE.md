# CLAUDE.md

This file provides essential guidance for Claude Code when working with CChorus.

## Quick Start Commands

### Installation
```bash
npm install
```

### 🚨 MANDATORY: Server Management
**ALL development server operations MUST use `/tmux-dev`. Direct npm commands are PROHIBITED.**

```bash
# Start servers
/tmux-dev start both frontend and backend in separate sessions

# Monitor servers  
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend

# Server management
/tmux-dev list all running sessions
/tmux-dev stop cchorus-frontend session
```

### Production & Building
```bash
npm run build
npm run preview
npm start
```

## Project Architecture

**CChorus** is a React-based Claude Code resource management platform with 3-column professional interface.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite 7.0.4 + Tailwind CSS + shadcn/ui
- **Backend**: Node.js Express API (port 3001) 
- **Data**: File system-based storage in `.claude/` directories
- **Theme**: CSS custom properties with light/dark modes

### Key Components
- **ThreeColumnLayout**: NEW - Professional 3-column interface with navigation sidebar, context lists, and content editor
- **ClaudeMdEditor**: NEW - Integrated CLAUDE.md editor with react-md-editor, save/cancel workflows, and template generation
- **LayoutToggle**: NEW - Toggle between 3-column and tabbed interfaces
- **ProjectManager**: Enhanced with layoutMode prop for 3-column integration
- **ResourceLibrary**: System-wide resource discovery and browsing
- **AssignmentManager**: Resource deployment between user/project scopes
- **Agent Management**: Full CRUD for Claude Code agents

### Agent File Format
```markdown
---
name: agent-name
description: When should this agent be invoked
tools: tool1, tool2, tool3  # Optional
color: "#3B82F6"           # Optional
---

System prompt content...
```

## Development Essentials

### Theme System
```tsx
import { useTheme } from "@/components/theme-provider"

const { theme, setTheme } = useTheme()
// Keyboard shortcut: Ctrl/Cmd + T
```

### Component Development
- Use **shadcn/ui + Radix UI** for consistent, accessible components
- Follow **muted color scheme**: `bg-muted text-muted-foreground`
- Import from `@/components/ui` for pre-built components
- Test keyboard navigation and screen reader compatibility

### Agent Workflow Sequence
**MANDATORY**: Code Changes → Documentation Agent (`@documentation-manager`) → GitOps Agent (`@gitops-workflow-manager`)

```bash
# REQUIRED workflow for all changes
@documentation-manager please update documentation for [changes]
# Wait for completion, then:
@gitops-workflow-manager please commit and push changes
```

## Critical Requirements

### Task Completion Standards
**NEVER mark tasks "completed" unless ALL requirements satisfied:**

**Frontend Work**: 
- ✅ Playwright testing with MCP tools
- ✅ User demonstration via screenshots  
- ✅ Explicit user approval

**All Work**:
- ✅ Documentation agent used for doc updates
- ✅ GitOps agent used for Git operations  
- ✅ Agent sequence followed: Code → Documentation → GitOps

### Prohibited Actions
- ❌ Direct server commands (`npm run dev`, `npm run dev:server`)
- ❌ Manual documentation updates (use `@documentation-manager`)
- ❌ Direct Git operations (use `@gitops-workflow-manager`)
- ❌ Marking tasks complete without testing/approval

## Current Development

**Branch**: `feature/3-column-layout`
**Status**: 3-Column UI Architecture COMPLETED ✅ (August 1, 2025)
**Vision**: See [Project Vision.md](./Project%20Vision.md) for complete roadmap

### Completed Features
- ✅ Professional 3-column layout with sidebar navigation
- ✅ CLAUDE.md editor integration with react-md-editor
- ✅ Default layout experience (useNewLayout = true)
- ✅ Clean project display showing descriptions vs file paths
- ✅ Component architecture: ThreeColumnLayout, ClaudeMdEditor, LayoutToggle

### Next Priority
- Individual resource managers (HooksManager, CommandsManager, SettingsManager) within 3-column layout

### Testing Strategy
- Manual testing with comprehensive user workflows
- Playwright testing for all frontend changes
- Theme testing (light/dark) across all components
- Responsive design validation

---

**Process Compliance**: Always follow agent workflow sequence, use tmux-dev for servers, get user approval before completion.