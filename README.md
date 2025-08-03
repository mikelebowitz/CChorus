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

### **🎯 Professional 3-Column Interface**
- **Modern Layout Architecture** - Professional 3-column design with hierarchical navigation, real resource data integration, and enhanced editors
- **Integrated CLAUDE.md Editor** - Full react-md-editor integration with live preview, edit/save workflows, and template generation
- **Smart Navigation System** - Left sidebar with resource categories (Users, Projects, Agents, Commands, Hooks, CLAUDE.md) and dynamic counts
- **Context-Aware Middle Column** - Dynamic resource lists with real data loading, filtering, and search capabilities
- **Enhanced Right Column Editor** - Full-width content editing with resource assignment panels and theme-aware markdown rendering
- **Information-Rich Header** - Contextual breadcrumbs, action buttons, and metadata display
- **Layout Flexibility** - Toggle between modern 3-column and classic tabbed interfaces
- **Resource Assignment System** - Cross-project resource deployment with visual assignment tracking

### **Agent Management**
- **Modern Visual Editor** - Clean, accessible form interface with shadcn/ui components
- **Professional Theme System** - Light/dark theme switching with keyboard shortcuts (Ctrl/Cmd + T)
- **Muted Visual Hierarchy** - Subtle, professional color scheme that adapts to themes
- **Enhanced Accessibility** - Full keyboard navigation and screen reader support via Radix UI
- **Smart Organization** - Color-coded agents with intuitive search and filtering
- **System-Wide Agent Discovery** - Comprehensive scanning across all projects on your system
- **Project Context Awareness** - Each agent includes project metadata (name, path, source type)
- **Performance Optimized** - Memory-efficient streaming scanner handles large directory structures
- **Robust Error Handling** - Gracefully handles filesystem issues and permissions

### **🚀 System-Wide Resource Discovery & Advanced Automation**

CChorus provides **comprehensive resource discovery** across your entire system with enhanced reliability, performance, and advanced automation systems:

#### **🤖 Intelligent Automation Systems**
- **📚 Auto-Documentation** - Real-time documentation updates triggered by code changes with file watchers and pre-compact hooks
- **🌿 Auto-Branch Creation** - Intelligent branch creation from BACKLOG.md metadata with GitOps integration
- **🐙 GitHub Synchronization** - Bi-directional sync between BACKLOG.md and GitHub Issues/Projects with automatic labeling
- **✅ Task Validation** - Automated validation system prevents premature task completion with category-specific requirements
- **📋 Workflow Enforcement** - Mandatory agent sequences ensure documentation and Git operations follow proper workflows

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

- **Integrated Project Manager** - Full CLAUDE.md editing within 3-column layout with react-md-editor, live preview, and enhanced caching system
- **Real Resource Data Integration** - ResourceDataService provides unified access to agents, commands, hooks, and CLAUDE.md files across user and project scopes
- **Cross-Project Assignment System** - ResourceAssignmentPanel enables copy/activate/deactivate resources between projects with visual tracking
- **Smart Content Organization** - Clean project display showing descriptions instead of file paths with improved list performance
- **Hook Configuration Support** - Handles both legacy (with matcher field) and modern (without matcher) hook formats with real-time discovery
- **Enhanced API Integration** - Concurrent API calls for optimal performance with complete resource discovery across system
- **Duplicate Prevention** - Advanced deduplication with streaming cache management for consistent project state
- **MCP Server Integration** - Automatic detection and management of MCP (Model Context Protocol) tools
- **File Import System** - Import existing Markdown files as agents with YAML frontmatter parsing

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
- **Claude Desktop** (for MCP integration)
- **tmux** (for development server management)
- **Git** (for version control and automation)

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

3. **Start the development servers (MANDATORY)**
   ```bash
   # REQUIRED: Use tmux-dev for all server operations
   /tmux-dev start both frontend and backend in separate sessions
   
   # Alternative (if tmux-dev not available)
   npm run dev:full
   ```

4. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3001
   ```
   
   **Note**: CChorus now opens with the modern 3-column interface by default. Use the layout toggle button to switch between 3-column and classic tabbed interfaces.

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
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Enhanced Resource Scanners** - Improved discovery with deduplication and error handling
- **readdirp v4** - Streaming filesystem traversal for efficient resource discovery
- **CORS Support** - Cross-origin resource sharing for development

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
│   │   │   └── ...         # Additional UI primitives
│   │   ├── theme-provider.tsx      # Theme context and management
│   │   ├── theme-toggle.tsx        # Theme switching component
│   │   ├── ThreeColumnLayout.tsx   # ✅ Professional 3-column interface with real data
│   │   ├── ClaudeMdEditor.tsx      # ✅ Integrated CLAUDE.md editor with react-md-editor
│   │   ├── LayoutToggle.tsx        # ✅ Interface switching component
│   │   ├── ResourceAssignmentPanel.tsx # ✅ Cross-project resource assignment
│   │   ├── ResourceLibrary.tsx     # ✅ Unified resource browser
│   │   ├── AssignmentManager.tsx   # ✅ Resource deployment system
│   │   ├── ProjectManager.tsx      # ✅ Enhanced project discovery with caching
│   │   ├── AgentCard.tsx           # Individual agent display
│   │   ├── AgentEditor.tsx         # Agent creation/editing form
│   │   └── FileBrowser.tsx         # File system browser
│   ├── lib/
│   │   └── utils.ts        # Utility functions (clsx, tailwind-merge)
│   ├── hooks/
│   │   └── use-toast.ts    # Toast notification hook
│   ├── utils/              # Business logic utilities
│   │   ├── agentUtils.ts         # Agent parsing and validation
│   │   ├── apiFileSystem.ts      # API communication
│   │   ├── resourceDataService.ts # ✅ Unified resource discovery service
│   │   └── resourceLibraryService.ts # Resource assignment operations
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application with theme provider
│   ├── main.tsx            # Application entry point
│   └── index.css           # CSS custom properties and Tailwind
├── docs/sessions/          # 19+ development session logs
├── public/                 # Static assets
├── server.js              # Express.js backend server
├── components.json         # shadcn/ui configuration
├── tailwind.config.js     # Tailwind + shadcn/ui configuration
└── package.json           # Dependencies and scripts
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

### Current Status (August 2025) - Version 2.0.0
- ✅ **Backend Infrastructure** (100% complete) - All API endpoints and scanners
- ✅ **3-Column UI Architecture** (100% complete) - Professional interface with real resource data integration
- ✅ **Resource Assignment System** (100% complete) - Cross-project deployment with ResourceAssignmentPanel
- ✅ **Core Resource Management** (100% complete) - Resource Library, Assignment Manager, Project Manager with enhanced caching
- ✅ **Advanced Automation Systems** (100% complete) - Auto-documentation, branch creation, GitHub sync, task validation
- ✅ **Process Automation** (100% complete) - Workflow enforcement, agent sequences, documentation triggers

### What's Next
- Enhanced resource editing capabilities within 3-column layout
- Performance optimization and scalability improvements
- Community features and resource sharing platform research

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
.claude/start-file-watcher.sh         # Start real-time documentation monitoring
.claude/start-auto-branch-creator.sh  # Monitor BACKLOG.md for branch creation
.claude/start-github-sync.sh           # GitHub Issues/Projects synchronization
.claude/start-task-validator.sh        # Validate task completion requirements
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
- Ensure backend server is running on port 3001
- Restart server if home directory scanning is not working

**Duplicate agents appearing**
- This issue has been fixed with enhanced deduplication
- Restart the backend server to apply the fix
- Clear browser cache if duplicates persist

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
- File watcher not triggering: Restart `.claude/start-file-watcher.sh`
- Documentation out of sync: Run `.claude/sync` for force update
- GitHub sync issues: Check `.claude/start-github-sync.sh --test`
- Task validation errors: Use `.claude/start-task-validator.sh --validate-todos`

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
