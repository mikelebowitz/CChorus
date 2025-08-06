# CChorus

<div align="center">
  <img src="public/cchorus-logo.png" alt="CChorus Logo" width="200"/>
  
  **Helping Orchestrate Your Claude Code Subagents**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
  [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000.svg)](https://ui.shadcn.com/)
  [![Radix UI](https://img.shields.io/badge/Radix%20UI-1.3-161618.svg)](https://www.radix-ui.com/)
</div>

## Features

### **🎯 Professional 3-Column Interface (v2.0.0)**
- **Modern Layout Architecture** - Professional Linear-style 3-column design with hierarchical navigation, real resource data integration, and persistent properties panel
- **PropertiesPanel Component** - Persistent right column with context-aware metadata display, type-specific actions, and intelligent property detection
- **Integrated CLAUDE.md Editor** - Full react-md-editor integration with live preview, edit/save workflows, template generation, and project-specific editing
- **Smart Navigation System** - Left sidebar with resource categories (Users, Projects, Agents, Commands, Hooks, CLAUDE.md) and real-time dynamic counts
- **Context-Aware Middle Column** - Dynamic resource lists with real data loading, advanced filtering, search capabilities, and alternating row styling
- **Information-Rich Header** - Contextual breadcrumbs, action buttons, metadata display, and navigation state management
- **Enhanced Resource Management** - Seamless resource selection with persistent property display, bulk operations, and cross-project assignment capabilities
- **Resource Assignment System** - Cross-project resource deployment with visual assignment tracking, copy/move operations, and deployment status monitoring

### **🔧 Resource System Groupings & Management (NEW)**
- **System-Aware Resource Organization** - Intelligent grouping of resources by source system (CCPlugins, Claude Flow, Built-in)
- **Interactive System Toggle Controls** - Enable/disable entire resource systems with confirmation dialogs and impact warnings
- **Resource Modification Workflow** - Professional modification interface with change tracking and reason documentation
- **Change History & Rollback** - Complete audit trail with visual diff viewer and one-click rollback capabilities
- **Context Menu Actions** - Right-click context menus for modify, view history, copy, and delete operations
- **LocalStorage Persistence** - Client-side change tracking ready for seamless backend integration
- **Project-Specific Customization** - System modifications scoped to individual projects while preserving originals
- **Visual System Health Status** - System completion indicators (complete/partial/broken/customized) with resource counts

### **Enhanced Resource Management**
- **Modern Visual Interface** - Clean, accessible interface with shadcn/ui components and professional styling
- **Professional Theme System** - Light/dark theme switching with keyboard shortcuts (Ctrl/Cmd + T)
- **Unified Resource Library** - Comprehensive resource browser with filtering, search, and multi-selection capabilities
- **Enhanced Accessibility** - Full keyboard navigation and screen reader support via Radix UI
- **Smart Organization** - Color-coded resources with intuitive search, filtering, and bulk operations
- **System-Wide Resource Discovery** - Comprehensive scanning across all projects with intelligent deduplication
- **Project Context Awareness** - Each resource includes project metadata, assignment status, and scope information
- **Performance Optimized** - Memory-efficient streaming scanner with caching and real-time updates
- **Production-Grade Error Handling** - Comprehensive error boundaries, user-friendly error messages, and automatic retry mechanisms
- **Cross-Project Assignment** - Visual assignment tracking with copy/move/activate/deactivate operations
- **Stable Resource Loading** - Eliminated critical rendering errors with enhanced ID generation and proper date formatting

### **🚀 System-Wide Resource Discovery & Advanced Automation**

CChorus provides **comprehensive resource discovery** across your entire system with enhanced reliability, performance, and advanced automation systems:

#### **🤖 Intelligent Automation Systems**
- **📚 Auto-Documentation** - Real-time documentation updates triggered by code changes with file watchers and pre-compact hooks
- **🌿 Auto-Branch Creation** - Intelligent branch creation from BACKLOG.md metadata with GitOps integration  
- **🐙 GitHub Synchronization** - Bi-directional sync between BACKLOG.md and GitHub Issues/Projects with automatic labeling
- **✅ Task Validation** - Automated validation system prevents premature task completion with category-specific requirements
- **📋 Workflow Enforcement** - Mandatory agent sequences ensure documentation and Git operations follow proper workflows
- **🔄 Session Management** - Automatic file watcher startup on session launch and comprehensive automation lifecycle
- **📊 Project Board Integration** - GitHub Actions workflows and automated kanban board management

#### **🔍 Enhanced Resource Discovery**

- **📡 Intelligent Scanning** - Recursively scans from your home directory to find all Claude Code resources
- **🏗️ Project Context** - Automatically identifies and displays the project each resource belongs to
- **⚡ High Performance** - Uses streaming technology (readdirp v4) for memory-efficient scanning
- **🛡️ Enhanced Reliability** - Fixed duplicate detection and missing user-level resource issues
- **🎯 Smart Filtering** - Ignores system directories while finding all your resources
- **📊 Rich Metadata** - Each resource includes project name, path, and source classification
- **🔧 Robust Hook Discovery** - Handles both legacy and modern hook configuration formats
- **✅ Deduplication System** - Prevents duplicate resources from overlapping scan roots

### **Advanced Resource Management**

- **Integrated Project Manager** - Full CLAUDE.md editing within 3-column layout with react-md-editor, live preview, enhanced caching, and streaming project discovery
- **Real Resource Data Integration** - ResourceDataService and ResourceLibraryService provide unified access to all resources across user and project scopes
- **Cross-Project Assignment System** - ResourceAssignmentPanel enables comprehensive resource deployment with copy/move/activate/deactivate operations and visual tracking
- **Smart Content Organization** - Professional resource display with alternating row colors, metadata display, and improved list performance
- **Comprehensive Resource Types** - Unified management of agents, commands, hooks, projects, settings, and CLAUDE.md files
- **Enhanced API Integration** - Concurrent API calls with Server-Sent Events streaming for optimal performance and real-time updates
- **Advanced Deduplication** - Intelligent deduplication system with streaming cache management and conflict resolution
- **MCP Server Integration** - Automatic detection and management of MCP (Model Context Protocol) tools with permission validation
- **Resource Assignment Operations** - Sophisticated assignment system with operation validation, error handling, and status tracking
- **Project Preferences System** - User preference management with archiving, favoriting, and visibility controls

### **Developer Experience**
- **Modern Development Stack** - Vite 7.0.4 with lightning-fast hot reload
- **Full TypeScript Integration** - Strict mode with comprehensive type definitions
- **Professional UI Components** - shadcn/ui library with 10+ accessible components
- **Advanced Theme System** - CSS custom properties with smooth theme transitions
- **Clean Architecture** - Modular codebase with clear separation of concerns
- **Developer Tools** - Path aliases, ESLint integration, and modern tooling

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher  
- **VS Code** (recommended, for auto-start development servers)
- **Claude Desktop** (for MCP integration)
- **Git** (for version control and automation)
- **Python 3.7+** (for automation scripts)
- **watchdog** Python package (for file watching: `pip3 install --user --break-system-packages watchdog`)
- **GitHub Token** (optional, for GitHub integration)
- **tmux** (deprecated in v2.0.0, no longer required)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cchorus.git
   cd cchorus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers (VS Code Auto-Start)**
   ```bash
   # PREFERRED: Open in VS Code (auto-starts servers)
   code .
   # Servers automatically start in visible terminal tabs when project opens
   # Frontend (port 5173) and Backend (port 3001) via VS Code tasks
   
   # MANUAL FALLBACK: If auto-start doesn't work
   # Use VS Code Command Palette: Cmd+Shift+P → "Tasks: Run Task"
   # Select "Start Frontend" or "Start Backend" as needed
   
   # DIRECT COMMANDS: Still available if needed
   npm run dev       # Frontend only (port 5173)
   npm run dev:server # Backend only (port 3001)
   
   # DEPRECATED: tmux-dev commands no longer used in v2.0.0
   # /tmux-dev start both frontend and backend  ❌ (removed)
   ```

4. **Optional: Setup GitHub Integration**
   ```bash
   # Copy environment template
   cp .env.template .env
   
   # Edit .env with your GitHub credentials
   # GITHUB_TOKEN=your_token_here
   # GITHUB_OWNER=your_username
   # GITHUB_REPO=your_repo_name
   
   # Test GitHub integration
   .claude/start-github-sync.sh --test
   ```

5. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3001
   ```
   
   **Note**: CChorus now opens with the modern 3-column interface by default. Use the layout toggle button to switch between 3-column and classic tabbed interfaces. The file watcher starts automatically for real-time documentation updates.

### Real-time Development Dashboard

CChorus includes a comprehensive development dashboard with SQLite persistence:

```bash
# Access the dashboard
http://localhost:3002  # Auto-starts with VS Code project opening
```

**Recent Dashboard Enhancements:**
- **Session Tracking Fix**: Dashboard shows time since last Claude context compaction with proper session ID integration from compact-tracking.json
- **Activity Feed Improvement**: Unified activity styling with clean single-line entries showing agent name, description, and timestamp
- **Agent Discovery Enhancement**: Loads agents from both project-level (.claude/agents/) and user-level (~/.claude/agents/) directories
- **SQLite Persistence**: Historical activity data stored in `.claude/cchorus.db` with conversation extraction capabilities
- **Duplicate Processing Fix**: SQLite conversation extraction tracks processed files to prevent duplicate foreign key constraint errors
- **Resource Management Enhancement**: Complete integration with 3-column interface and real resource data loading
- **Performance Optimization**: Streaming resource discovery with intelligent caching and deduplication

### Development Server Management

```bash
# MANDATORY: Use tmux-dev for all server operations
/tmux-dev start frontend server in session cchorus-frontend
/tmux-dev start backend server in session cchorus-backend
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend

# PROHIBITED: Direct npm commands (use tmux-dev instead)
# npm run dev          ❌
# npm run dev:server   ❌ 
# npm run dev:full     ❌
```

## 📖 Usage Guide

### Creating Your First Agent

1. **Click "New Agent"** in the sidebar or main area
2. **Fill in the details:**
   - **Name**: Unique identifier (lowercase, hyphens allowed)
   - **Description**: When should this agent be invoked?
   - **System Prompt**: The agent's specialized instructions
   - **Color**: Visual identifier for quick recognition
   - **Level**: User (~/.claude/agents/) or Project (.claude/agents/)
3. **Select Tools** (optional): Choose specific Claude Code tools
4. **Click "Create Agent"** to save

### Managing Agents

- **Edit**: Click any agent card to open the editor
- **Delete**: Use the dropdown menu (⋮) on agent cards
- **Search**: Use the search bar to filter by name or description
- **Filter**: Switch between All, User, and Project agents

### File Import

1. **Click the file icon** (📄) next to "New Agent"
2. **Browse your filesystem** starting from your home directory
3. **Select a Markdown file** with YAML frontmatter
4. **Edit and save** as needed

## Architecture

### Frontend Stack
- **React 18** - Modern UI library with concurrent features and hooks
- **TypeScript 5.0** - Strict type safety with comprehensive definitions
- **Vite 7.0.4** - Ultra-fast build tool and development server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with custom properties
- **shadcn/ui** - Modern component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible components with keyboard navigation
- **Lucide React** - Beautiful, consistent icon library
- **@uiw/react-md-editor** - Rich markdown editor with live preview for CLAUDE.md editing

### Backend Stack
- **Node.js** - JavaScript runtime with ESM module support
- **Express.js** - Web application framework with CORS middleware
- **@octokit/rest** - GitHub API integration for Issues and Projects
- **dotenv** - Environment variable management for GitHub credentials
- **Enhanced Resource Scanners** - Improved discovery with deduplication and error handling
- **readdirp v4** - Streaming filesystem traversal for efficient resource discovery
- **Python Automation Scripts** - File watching, task validation, and GitHub synchronization

### Project Structure

```
cchorus/
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn/ui component library
│   │   │   ├── badge.tsx   # Badge component with muted colors
│   │   │   ├── button.tsx  # Accessible button component
│   │   │   ├── card.tsx    # Card layout components
│   │   │   ├── input.tsx   # Form input components
│   │   │   ├── toast.tsx   # Notification system
│   │   │   ├── context-menu.tsx # ✅ NEW: Context menu components for resource actions
│   │   │   └── ...         # Additional UI primitives
│   │   ├── theme-provider.tsx      # Theme context and management
│   │   ├── theme-toggle.tsx        # Theme switching component
│   │   ├── ThreeColumnLayout.tsx   # ✅ Professional 3-column interface with real resource data integration
│   │   ├── PropertiesPanel.tsx     # ✅ Context-aware metadata and actions panel with intelligent type detection
│   │   ├── ClaudeMdEditor.tsx      # ✅ Integrated CLAUDE.md editor with react-md-editor
│   │   ├── LayoutToggle.tsx        # ✅ Interface switching component
│   │   ├── ResourceAssignmentPanel.tsx # ✅ Cross-project resource assignment with copy/move operations
│   │   ├── ResourceLibrary.tsx     # ✅ Unified resource browser with filtering, search, and multi-selection
│   │   ├── AssignmentManager.tsx   # ✅ Resource deployment system
│   │   ├── ProjectManager.tsx      # ✅ Enhanced project discovery with streaming, caching, and preferences
│   │   ├── ResourceModificationDialog.tsx # ✅ NEW: Professional resource modification interface
│   │   ├── SystemToggleSwitch.tsx  # ✅ NEW: System enable/disable controls with confirmation
│   │   ├── ChangeHistoryDialog.tsx # ✅ NEW: Change history viewer with diff and rollback
│   │   ├── ResourceListItem.tsx    # ✅ ENHANCED: Resource display with context menu integration
│   │   ├── AgentCard.tsx           # Individual agent display
│   │   ├── AgentEditor.tsx         # Agent creation/editing form
│   │   ├── FileBrowser.tsx         # File system browser
│   │   └── FileSearch.tsx          # File search capabilities
│   ├── lib/
│   │   └── utils.ts        # Utility functions (clsx, tailwind-merge)
│   ├── hooks/
│   │   └── use-toast.ts    # Toast notification hook
│   ├── utils/              # Business logic utilities
│   │   ├── agentUtils.ts         # Agent parsing and validation
│   │   ├── apiFileSystem.ts      # API communication
│   │   ├── resourceDataService.ts # ✅ ENHANCED: Unified resource discovery with system groupings and change tracking
│   │   ├── resourceLibraryService.ts # ✅ Resource assignment operations with comprehensive deployment management
│   │   ├── projectPreferencesService.ts # ✅ Project preferences management (archiving, favoriting, visibility)
│   │   ├── systemDetectionService.ts # ✅ NEW: System detection and grouping service
│   │   └── cacheService.ts       # ✅ Enhanced caching system with intelligent invalidation
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application with theme provider
│   ├── main.tsx            # Application entry point
│   └── index.css           # CSS custom properties and Tailwind
├── docs/sessions/          # 20+ development session logs with comprehensive automation records
├── .claude/                # Automation infrastructure and configuration
│   ├── agents/             # Agent definitions and management
│   ├── hooks/              # Pre-compact and session hooks
│   ├── commands/           # Custom slash commands
│   ├── settings.json       # Claude Code configuration with SessionStart hooks
│   ├── *.py               # Python automation scripts (file-watcher, sync, validation)
│   ├── *.sh               # Shell script automation launchers
│   └── *.js               # GitHub integration and project setup
├── .github/workflows/      # GitHub Actions for project automation
├── public/                 # Static assets
├── server.js              # Express.js backend server with GitHub integration
├── components.json         # shadcn/ui configuration
├── tailwind.config.js     # Tailwind + shadcn/ui configuration
├── .env.template          # GitHub integration environment template
└── package.json           # Dependencies and scripts with automation tools
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_API_URL=http://localhost:3001
VITE_DEV_MODE=true

# Production
VITE_API_URL=https://your-api-domain.com
VITE_DEV_MODE=false
```

### Theme Customization

CChorus uses a modern CSS custom properties system with light and dark themes. To customize colors, edit the CSS variables in `src/index.css`:

```css
/* Light theme (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  /* ... additional variables */
}

/* Dark theme */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  /* ... additional variables */
}
```

**Theme switching:**
- Use keyboard shortcut: `Ctrl/Cmd + T`
- Click the theme toggle button in the interface
- Themes persist across browser sessions

### MCP Integration

CChorus attempts to automatically detect MCP servers from your Claude Desktop configuration:

1. **Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. **Permissions**: `~/.claude/settings.json`
3. **Auto-detection**: Available tools are shown in the agent editor

## 🗺️ Development Status

> **📋 For complete project roadmap, future work, and detailed planning, see [BACKLOG.md](./BACKLOG.md)**
> **📈 For development workflow and process enforcement, see [PROCESS.md](./PROCESS.md)**

### Current Status (August 2025) - Version 3.2.0
- ✅ **Backend Infrastructure** (100% complete) - Comprehensive API endpoints with streaming support, resource assignment, and enhanced GitHub integration
- ✅ **Professional 3-Column UI Architecture** (100% complete) - Linear-style interface with real resource data integration and persistent properties panel
- ✅ **Resource System Groupings** (90% complete) - System detection, modification workflows, change tracking, and rollback capabilities with LocalStorage persistence
- ✅ **Resource Assignment System** (100% complete) - Cross-project deployment with ResourceAssignmentPanel, copy/move operations, and visual tracking
- ✅ **Core Resource Management** (100% complete) - Resource Library with filtering/search, Assignment Manager, Project Manager with streaming discovery and caching
- ✅ **Advanced Resource Discovery** (100% complete) - System-wide scanning with intelligent deduplication, performance optimization, and real-time updates
- ✅ **Enhanced Project Management** (100% complete) - Project preferences, archiving/favoriting, streaming discovery, and integrated CLAUDE.md editing
- ✅ **Advanced Automation Systems** (100% complete) - Auto-documentation, branch creation, GitHub sync, task validation, and workflow enforcement
- ✅ **Developer Workflow System** (100% complete) - Session hooks, file watching, task validation, quality gates, and real-time dashboard

### What's Next
- **Backend Integration** - Connect resource system groupings to backend API (currently using LocalStorage)
- **Advanced Diff Viewer** - Enhanced visual diff interface for change comparison
- **System Templates** - Resource templates and scaffolding for new systems
- **Community Features** - Resource sharing platform research and implementation

---

## Development

### Available Scripts

```bash
# Server Management (MANDATORY - use tmux-dev)
/tmux-dev start both frontend and backend in separate sessions
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend
/tmux-dev list all running sessions

# Development (Fallback only)
npm run dev          # Start frontend dev server (use tmux-dev instead)
npm run server       # Start backend server (use tmux-dev instead)
npm run dev:full     # Start both concurrently (use tmux-dev instead)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically

# Automation Commands
.claude/sync                           # Force documentation synchronization
.claude/start-file-watcher.sh         # Start real-time documentation monitoring (auto-starts on session launch)
.claude/stop-file-watcher.sh          # Stop file watcher process
.claude/start-auto-branch-creator.sh  # Monitor BACKLOG.md for branch creation
.claude/start-github-sync.sh          # GitHub Issues/Projects synchronization  
.claude/start-task-validator.sh       # Validate task completion requirements
.claude/project-setup.js              # One-time GitHub project board setup
```

### Code Style & Architecture

This project follows modern React and TypeScript best practices with **mandatory workflow enforcement**:

- **Component Architecture** - shadcn/ui + Radix UI for accessible, composable components (MANDATORY)
- **Theme System** - CSS custom properties with `useTheme` hook for dynamic theming
- **TypeScript Strict Mode** - Full type safety with comprehensive type definitions
- **ESLint Configuration** - Modern React and TypeScript linting rules with automatic fixing
- **CSS Architecture** - Tailwind utilities with semantic CSS custom properties
- **Conventional Commits** - Structured commit messages for clear history
- **Agent Workflow Sequence** - MANDATORY: Code Changes → @documentation-manager → @gitops-workflow-manager
- **Process Automation** - Pre-compact hooks, file watchers, and validation systems enforce quality

### Adding New Features (MANDATORY PROCESS)

**Follow the mandatory workflow sequence for ALL changes:**

1. **Create a feature branch**: Use auto-branch creation from BACKLOG.md with `[new-branch: feature/name]` metadata
2. **Server management**: ALWAYS use `/tmux-dev` for development servers (direct npm commands PROHIBITED)
3. **UI development**: MANDATORY use of shadcn/ui + Radix UI patterns only (Material-UI, Ant Design PROHIBITED)
4. **Code changes**: Implement with TypeScript strict mode and full type safety
5. **Documentation**: Use `@documentation-manager update docs for [changes]` (manual docs updates PROHIBITED)
6. **Git operations**: Use `@gitops-workflow-manager commit and push [description]` (direct Git operations PROHIBITED)
7. **Testing**: Verify themes (Ctrl/Cmd + T), accessibility, and responsive design
8. **Validation**: Use `.claude/start-task-validator.sh` to verify completion requirements
9. **Quality gates**: Ensure agent workflow sequence completed and no prohibited patterns used

**Automated systems will:**
- Monitor file changes and trigger documentation updates
- Validate task completion requirements before marking work done
- Sync changes with GitHub Issues and Projects
- Enforce workflow compliance through pre-commit hooks

## Contributing

I welcome ideas and contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Test your changes** thoroughly
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Guidelines (MANDATORY)

- **Component Development**: MANDATORY use of shadcn/ui components and Radix UI primitives only
- **TypeScript**: Strict mode with comprehensive type definitions for all functions
- **Theme System**: Use CSS custom properties and `useTheme` hook for theme-aware components
- **Styling**: Tailwind utilities with semantic classes (`bg-muted`, `text-muted-foreground`)
- **Accessibility**: Ensure keyboard navigation and ARIA compliance via Radix UI
- **Testing**: Verify functionality across light/dark themes and responsive breakpoints
- **Agent Workflow**: MANDATORY sequence: Code → @documentation-manager → @gitops-workflow-manager
- **Server Operations**: MANDATORY use of `/tmux-dev` for all development server operations
- **Documentation**: Use @documentation-manager agent only (manual updates PROHIBITED)
- **Git Operations**: Use @gitops-workflow-manager agent only (direct Git commands PROHIBITED)
- **Quality Validation**: Use task completion validator before marking work done

### Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** if any

## 📋 Agent File Format

CChorus uses Markdown files with YAML frontmatter:

> **ℹ️ For complete development process and workflow requirements, see [PROCESS.md](./PROCESS.md)**

```markdown
---
name: code-reviewer
description: Use this agent when you need code review assistance
tools: Read, Edit, Grep, Bash
color: "#3B82F6"
level: user
---

You are an expert code reviewer with deep knowledge of software engineering best practices.

## Core Responsibilities:
- Review code for bugs, security issues, and performance problems
- Suggest improvements for readability and maintainability
- Ensure adherence to coding standards and conventions

## Review Process:
1. Analyze the code structure and logic
2. Check for potential security vulnerabilities
3. Evaluate performance implications
4. Suggest specific improvements with examples
```

### Supported Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique identifier (lowercase, hyphens) |
| `description` | string | ✅ | When should this agent be invoked? |
| `tools` | array/string | ❌ | Specific Claude Code tools (optional) |
| `color` | string | ❌ | Hex color for visual identification |
| `level` | string | ❌ | 'user' or 'project' (defaults to 'project') |

## 🔄 Development Process & Automation

### Workflow Enforcement

CChorus implements **mandatory workflow sequences** to ensure code quality and documentation consistency:

```bash
# MANDATORY sequence for ALL changes:
# 1. Code Changes (using shadcn/ui only)
# 2. @documentation-manager update docs for [changes]
# 3. @gitops-workflow-manager commit and push [description]
```

### Automation Systems

**Auto-Documentation System:**
```bash
# Real-time file monitoring
.claude/start-file-watcher.sh

# Force complete documentation sync
.claude/sync

# Manual trigger (if auto-system fails)
@documentation-manager update docs for pending changes
```

**Auto-Branch Creation:**
```bash
# Monitor BACKLOG.md for [new-branch] metadata
.claude/start-auto-branch-creator.sh --watch

# BACKLOG.md syntax:
# - **Feature name** `[new-branch: feature/branch-name]`
```

**GitHub Integration:**
```bash
# Bi-directional sync with GitHub Issues/Projects
.claude/start-github-sync.sh --sync

# Setup GitHub integration
.claude/start-github-sync.sh --setup
```

**Task Completion Validation:**
```bash
# Validate task before marking complete
.claude/start-task-validator.sh --validate-task "task description"

# Validate all current todos
.claude/start-task-validator.sh --validate-todos
```

### Quality Gates

**Frontend Tasks require:**
- ✅ Playwright testing + user approval + shadcn/ui compliance + theme testing + accessibility validation

**Backend Tasks require:**
- ✅ API testing + error handling validation + security review

**All Tasks require:**
- ✅ Agent workflow sequence completion
- ✅ Documentation updates via @documentation-manager
- ✅ Git operations via @gitops-workflow-manager
- ✅ No breaking changes detected

## 🛠️ Troubleshooting

### Common Issues

**Themes not switching**
- Try keyboard shortcut: `Ctrl/Cmd + T`
- Check browser console for JavaScript errors
- Verify theme provider is wrapping the app in `App.tsx`
- Clear localStorage: `localStorage.removeItem('cchorus-theme')`

**Resources not loading**
- Verify YAML frontmatter syntax for agents
- Check file permissions on resource directories
- Ensure backend server is running on port 3001 with streaming endpoints
- Check console for resource discovery errors and API connectivity
- Verify ResourceDataService and ResourceLibraryService API calls

**Resource assignment issues**
- Check project preferences service for proper configuration
- Verify target project paths exist and are accessible
- Review assignment operation logs for copy/move/activate errors
- Ensure ResourceAssignmentPanel has proper project data

**Duplicate resources appearing**
- Enhanced deduplication system handles this automatically
- Restart backend server if deduplication isn't working
- Clear browser cache and resource service cache if duplicates persist

**Hooks not discovered**
- Verify settings.json file format is correct
- Both legacy (with matcher) and modern (without matcher) formats are now supported
- Check console for hook parsing errors

**MCP tools not appearing**
- Verify Claude Desktop configuration exists
- Check `~/.claude/settings.json` for permissions
- Restart the backend server after configuration changes

**File browser not showing .claude folder**
- Ensure you're starting from user home directory
- Check folder permissions
- Verify server is running with proper user context

**Workflow violations (manual Git/docs operations)**
- Solution: Always use agent workflow sequence
- Prevention: Pre-commit hooks validate workflow compliance
- Recovery: Use @documentation-manager then @gitops-workflow-manager

**Server management issues**
- Use `/tmux-dev` commands only (npm commands PROHIBITED)
- Check tmux session status: `/tmux-dev list all running sessions`
- Recovery: `/tmux-dev stop` then restart with proper commands

**Automation system failures**
- File watcher not starting: Install watchdog with `pip3 install --user --break-system-packages watchdog`
- File watcher not triggering: Check `ps aux | grep file-watcher` and restart `.claude/start-file-watcher.sh`
- Documentation out of sync: Run `.claude/sync` for force update or check `.claude/pending-agent-invocations.json`
- GitHub sync issues: Check `.claude/start-github-sync.sh --test` and verify `.env` file setup
- Task validation errors: Use `.claude/start-task-validator.sh --validate-todos`
- SessionStart hook issues: Check `.claude/settings.json` and verify hook configuration
- Project board sync problems: Run `.claude/project-setup.js` for one-time setup
- ✅ FIXED: SQLite conversation extraction duplicate processing - added processed_files table and file modification tracking
- ✅ FIXED: Agent count display issues - Dashboard shows all agents from both project-level (.claude/agents/) and user-level (~/.claude/agents/) directories
- ✅ FIXED: Resource discovery performance - Streaming discovery with intelligent caching and deduplication
- ✅ FIXED: Project management issues - Enhanced project preferences with archiving, favoriting, and visibility controls
- ✅ FIXED: Resource assignment workflow - Comprehensive assignment system with copy/move/activate/deactivate operations

### Performance Optimization

For large numbers of agents:
- Use search and filter features to narrow results
- Consider organizing agents into project-specific directories
- Monitor memory usage in browser developer tools

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Claude Code** - Built with and for CC
- **daisyUI** - Beautiful component library providing the theme system
- **Tailwind CSS** - Utility-first CSS framework
- **React** - The UI library powering the interface
- **Vite 7.0.4** - Ultra-fast build tool with optimized development experience
- **shadcn/ui** - Modern component library built on Radix UI primitives
- **Radix UI** - Accessible, unstyled components with keyboard navigation
- **Anthropic** - For creating Claude and the development tools ecosystem

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/cchorus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/cchorus/discussions)
- **Documentation**: This README and inline code comments

---

<div align="center">
  
**Built with ❤️ for the Claude Code community**

*CChorus - Professional Agent Management for Claude Code*

**Powered by modern web technologies:**  
shadcn/ui • Radix UI • React 18 • TypeScript • Vite 7 • Tailwind CSS

</div>
