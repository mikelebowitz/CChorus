# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server only (frontend)
npm run dev

# Start backend API server only
npm run dev:server

# Start both frontend and backend concurrently
npm run dev:full

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

### Testing
No automated tests are currently configured. Manual testing is done through the browser interface.

## Recent Major Improvements (July 2025)

### 🎨 Complete UI/UX Overhaul
- **Professional Theme System**: Implemented comprehensive shadcn/ui + Radix UI component library with theme provider
- **Theme Switching**: Added keyboard shortcut (Ctrl/Cmd + T) with toast notifications and persistent theme selection
- **Muted Tag Colors**: Implemented consistent muted color scheme for user/project badges across all themes
- **Visual Feedback Enhancement**: Fixed color selection with proper theme-aware styling and accessibility
- **Layout Optimization**: Removed unnecessary borders, improved visual hierarchy with professional appearance

### 🔧 Technical Infrastructure Enhancements
- **Component Library**: Added comprehensive shadcn/ui + Radix UI component system with accessibility primitives
- **Build Tooling**: Upgraded to Vite 7.0.4, Tailwind CSS 3.4.17, and modern development dependencies
- **Theme Architecture**: Implemented robust theme provider with localStorage persistence and pre-render initialization
- **Server Improvements**: Enhanced file browser to default to user home directory with .claude folder visibility
- **MCP Integration**: Improved MCP server detection to show only actually available tools

### 🛠️ User Experience Improvements
- **Natural Content Flow**: Completely resolved textarea height constraints for unlimited content expansion
- **Enhanced File Management**: File browser now starts from user directory with proper dot file support
- **Professional Branding**: Improved logo handling with clean appearance across all themes
- **Responsive Design**: Enhanced mobile/desktop responsiveness with adaptive sidebar

### 📁 New Project Structure
```
CChorus/
├── src/
│   ├── index.css          # Enhanced with daisyUI + custom CSS framework
│   ├── App.tsx            # Major restructuring with theme management
│   └── components/        # Enhanced components with better UX
├── docs/sessions/         # Comprehensive development session documentation
├── .gitignore            # Complete development environment exclusions
└── README.md             # Professional GitHub-ready documentation
```

## Project Architecture

This is **CChorus** - a React-based web application for managing Claude Code sub-agents with a Node.js/Express backend API.

### High-Level Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + daisyUI (30+ themes)
- **Backend**: Node.js Express API server (port 3001) with enhanced file handling
- **Data**: File system-based agent storage in `.claude/agents/` directories
- **Agent Format**: Markdown files with YAML frontmatter containing agent configurations
- **Theme System**: daisyUI theme framework with localStorage persistence
- **UI Framework**: Custom CSS architecture with comprehensive override system

### Key Components

#### Frontend (`src/`)
- `App.tsx` - Main application with agent list, filtering, and CRUD operations
- `components/AgentCard.tsx` - Individual agent display cards
- `components/AgentEditor.tsx` - Agent creation/editing modal form
- `components/FileBrowser.tsx` - File system browser for importing agents
- `components/FileSearch.tsx` - Search functionality for finding agent files
- `utils/agentUtils.ts` - Agent parsing/serialization with YAML frontmatter
- `utils/apiFileSystem.ts` - API client for backend communication
- `types.ts` - TypeScript interfaces for agents and tools

#### Backend (`server.js`)
- Express API with CORS enabled for localhost development
- Endpoints for user-level and project-level agent management
- File system operations with security restrictions
- MCP server detection from Claude settings
- Support for both `~/.claude/agents/` (user) and `./.claude/agents/` (project)

### Agent File Structure

Sub-agents are stored as Markdown files with YAML frontmatter:

```markdown
---
name: agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
color: "#3B82F6"           # Optional - visual color theme
---

System prompt content goes here...
```

### Data Flow

1. **Agent Loading**: Frontend calls `/api/agents/user` and `/api/agents/project` to load agents from both directories
2. **Agent Parsing**: Backend reads `.md` files and frontend parses YAML frontmatter using `js-yaml`
3. **Agent Storage**: Agents saved to appropriate directory based on `level` (user/project)
4. **Tool Integration**: Supports all Claude Code tools plus MCP servers detected from `~/.claude/settings.json`

### File System Security

- Backend restricts file access to project directory and `~/.claude/` 
- Path traversal protection prevents access to system directories
- Only `.md` files are processed for agent operations

### Development Notes

- Frontend runs on port 5173 (Vite default)
- Backend API runs on port 3001
- Hot reloading enabled for development
- TypeScript strict mode enabled
- Path alias `@/*` maps to `src/*`

### GitOps Integration

CChorus includes GitOps configuration in `config/gitops-config.json` for automated Git workflow management with session tracking and documentation updates.

### Development Workflow Guidance

- **Documentation Workflow**:
  - Complete all documentation and updates before performing gitops
```