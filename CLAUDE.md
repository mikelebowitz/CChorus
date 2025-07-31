# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development

#### **Installation**
```bash
# Install dependencies
npm install
```

#### **🚨 MANDATORY: Server Management with tmux-dev**
**ALL development server operations MUST use the `/tmux-dev` command. Direct npm server commands are PROHIBITED.**

```bash
# REQUIRED: Start development servers using tmux-dev
/tmux-dev start frontend server in session cchorus-frontend
/tmux-dev start backend server in session cchorus-backend  
/tmux-dev start both servers in separate sessions

# Monitor servers (non-blocking)
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend
/tmux-dev attach to cchorus-frontend for real-time monitoring

# Server management
/tmux-dev list all running sessions
/tmux-dev stop cchorus-frontend session
```

#### **🚫 PROHIBITED: Direct Server Commands**
```bash
# These commands are FORBIDDEN - use /tmux-dev instead
# npm run dev                 ❌ Use /tmux-dev
# npm run dev:server          ❌ Use /tmux-dev  
# npm run dev:full            ❌ Use /tmux-dev
```

#### **Production & Building**
```bash
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

> **Development Timeline**: 20+ comprehensive sessions documented in `/docs/sessions/`  
> **Architecture Evolution**: From basic agent management to comprehensive Claude Code resource management platform  
> **Key Transformation**: Complete resource management system with system-wide discovery and assignment capabilities

### 🚀 Resource Management System (COMPLETED July 31, 2025)
- **Resource Library**: System-wide discovery of all Claude Code resources (agents, commands, hooks, projects, settings)
- **Assignment Manager**: Complete resource deployment system with copy/move operations between user and project scopes
- **Project Integration**: Automatic project discovery and resource management across entire system
- **Backend Infrastructure**: Comprehensive API with specialized scanners for each resource type
- **Documentation System**: Complete user guides and developer documentation with workflow examples

### 🎨 Complete UI/UX Overhaul
- **Modern Component System**: Implemented comprehensive shadcn/ui + Radix UI component library with accessibility primitives
- **Advanced Theme Management**: Light/dark theme system with keyboard shortcuts (Ctrl/Cmd + T) and persistent storage
- **Muted Color Scheme**: Professional muted tag colors and consistent visual hierarchy across all themes
- **Enhanced Accessibility**: Radix UI primitives ensure WCAG compliance and keyboard navigation
- **Professional Polish**: Clean, modern interface with optimized layouts and responsive design

### 🔧 Technical Infrastructure Enhancements
- **Modern Build System**: Vite 7.0.4 with optimized development and production builds
- **Component Architecture**: shadcn/ui + Radix UI providing 10+ accessible UI primitives
- **Theme System**: CSS custom properties with class-based dark mode and smooth transitions
- **Type Safety**: Full TypeScript integration with strict mode and comprehensive type definitions
- **Development Tools**: Hot reload, path aliases (@/*), and modern ESLint configuration

### 🛠️ User Experience Improvements
- **Natural Content Flow**: Completely resolved textarea height constraints for unlimited content expansion
- **Enhanced File Management**: File browser now starts from user directory with proper dot file support
- **Professional Branding**: Improved logo handling with clean appearance across all themes
- **Responsive Design**: Enhanced mobile/desktop responsiveness with adaptive sidebar

### 📁 Enhanced Project Structure
```
CChorus/
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui component library (10+ components)
│   │   ├── theme-provider.tsx  # Theme management context
│   │   ├── theme-toggle.tsx    # Theme switching component
│   │   └── ...            # Application components
│   ├── lib/
│   │   └── utils.ts       # Utility functions (clsx, tailwind-merge)
│   ├── hooks/
│   │   └── use-toast.ts   # Toast notification system
│   ├── index.css          # CSS custom properties + Tailwind base
│   └── App.tsx            # Main app with theme provider integration
├── docs/sessions/         # 19+ comprehensive development sessions
├── components.json        # shadcn/ui configuration
└── README.md             # Professional project documentation
```

## Project Architecture

This is **CChorus** - a comprehensive React-based resource management platform for the complete Claude Code ecosystem, featuring system-wide resource discovery, assignment management, project integration, and a modern shadcn/ui interface with robust Node.js/Express backend API.

### High-Level Architecture

- **Frontend**: React 18 + TypeScript + Vite 7.0.4 + Tailwind CSS 3.4.17 + shadcn/ui
- **UI Components**: shadcn/ui + Radix UI primitives with accessibility features
- **Theme System**: CSS custom properties with light/dark modes and smooth transitions
- **Backend**: Node.js Express API server (port 3001) with enhanced file handling
- **Data**: File system-based agent storage in `.claude/agents/` directories
- **Agent Format**: Markdown files with YAML frontmatter containing agent configurations

### Key Components

#### Frontend (`src/`)
- `App.tsx` - Main application with tabbed navigation (Resource Library, Assignment Manager, Legacy Agents)
- `components/ResourceLibrary.tsx` - Unified resource discovery and browsing interface
- `components/AssignmentManager.tsx` - Resource deployment and scope management system
- `components/AgentEditor.tsx` - Legacy agent creation/editing interface
- `components/FileBrowser.tsx` - File system browser for importing resources
- `utils/resourceLibraryService.ts` - Comprehensive service layer for all resource operations
- `utils/apiFileSystem.ts` - API client for backend communication
- `types.ts` - TypeScript interfaces for all resource types and operations

#### Backend (`server.js`)
- Express API with CORS enabled for localhost development
- System-wide resource discovery endpoints for all resource types
- Complete assignment API for resource deployment operations
- Specialized scanners: agentScanner.js, projectScanner.js, hooksScanner.js, commandsScanner.js
- Settings management with SettingsManager.js for safe configuration operations
- Security restrictions with path validation and permission checking
- Support for user-level (~/.claude/) and project-level (./.claude/) resource management

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

1. **System-Wide Agent Discovery**: Frontend calls `/api/agents/system` to comprehensively scan all projects on the system
2. **Advanced Scanning**: Backend uses `agentScanner.js` with readdirp v4 streaming to recursively find all `.claude/agents/` directories
3. **Project Context Extraction**: Server automatically determines project name, path, and source type for each agent
4. **Agent Parsing**: Backend reads `.md` files and frontend parses YAML frontmatter using `js-yaml`
5. **Enhanced Metadata**: Each agent includes project information (`projectName`, `projectPath`, `sourceType`, `relativePath`)
6. **Agent Storage**: Agents saved to appropriate directory based on `level` (user/project)
7. **Tool Integration**: Supports all Claude Code tools plus MCP servers detected from `~/.claude/settings.json`
8. **Documentation Management**: All documentation updates are managed exclusively through the dedicated documentation management agent (`@documentation-manager`)

### Agent Scanner Architecture

The new **`agentScanner.js`** module provides robust, production-ready agent discovery:

- **Stream-Based Scanning**: `scanAgentFiles(roots)` - Memory-efficient async generator for large directory trees
- **Promise-Based API**: `scanAgentFilesArray(roots)` - Convenient array-based results for simple use cases  
- **Cancellation Support**: `createScanController()` - AbortSignal integration for user-triggered cancellation
- **Smart Filtering**: Automatically ignores `node_modules`, `.git`, and other system directories
- **Error Resilience**: Graceful handling of permissions issues, broken symlinks, and filesystem edge cases
- **Performance Optimized**: Configurable depth limits and efficient memory usage patterns

### File System Security

- Backend restricts file access to project directory and `~/.claude/` 
- Path traversal protection prevents access to system directories
- Only `.md` files are processed for agent operations

### Development Environment

- **Frontend**: Vite dev server on port 5173 with hot reload
- **Backend**: Express API server on port 3001
- **TypeScript**: Strict mode with comprehensive type checking
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **Theme Development**: CSS custom properties in `:root` and `.dark` classes
- **Component Development**: shadcn/ui CLI for adding new components
- **Server Management**: **MANDATORY** tmux-dev command for all development server operations

## 🖥️ **MANDATORY Development Server Management**

### **tmux-dev Command Requirement**

**ALL development server interactions MUST use the `/tmux-dev` command.** Direct npm server commands are **STRICTLY PROHIBITED** to ensure proper server management, non-blocking operations, and professional development workflows.

#### **Why tmux-dev is Mandatory**

**Professional Server Management**:
- Prevents terminal blocking during long-running development processes
- Enables proper server monitoring and debugging capabilities
- Provides structured workflows for server lifecycle management
- Ensures consistent server state tracking across development sessions

**Development Efficiency**:
- Non-blocking server operations allow continued development work
- Real-time log monitoring without interrupting server processes
- Multiple server management (frontend + backend) in separate, manageable sessions
- Quick status checks and debugging capabilities

#### **Required tmux-dev Workflows**

**Server Startup**:
```bash
# Start frontend development server
/tmux-dev start frontend server in session cchorus-frontend

# Start backend API server  
/tmux-dev start backend server in session cchorus-backend

# Start both servers simultaneously
/tmux-dev start both frontend and backend in separate sessions
```

**Server Monitoring**:
```bash
# Check server status and recent logs
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 100 lines from cchorus-backend

# Real-time monitoring (attach to session)
/tmux-dev attach to cchorus-frontend for real-time logs
# Detach with Ctrl+B then D
```

**Server Management**:
```bash
# List all running development sessions
/tmux-dev list all running sessions

# Stop specific server
/tmux-dev stop cchorus-frontend session
/tmux-dev stop cchorus-backend session
```

**Debugging Workflows**:
```bash
# Debug server errors
/tmux-dev show last 200 lines from cchorus-backend, I need to debug an error

# Monitor startup issues
/tmux-dev attach to cchorus-frontend to see startup process
```

#### **Integration with Development Process**

**Before Starting Development**:
1. **MUST** use `/tmux-dev` to start required servers
2. **MUST** verify servers are running with `/tmux-dev list sessions`
3. **SHOULD** check initial logs to ensure clean startup

**During Development**:
1. **SHOULD** monitor server health with periodic log checks
2. **MUST** use `/tmux-dev` for any server status investigations
3. **SHOULD** use non-blocking monitoring to maintain development flow

**After Development Sessions**:
1. **SHOULD** stop development servers with `/tmux-dev stop`
2. **MAY** leave servers running for continued development across sessions

#### **Prohibited Server Commands**

**These commands are STRICTLY FORBIDDEN**:
```bash
npm run dev                 # ❌ Blocks terminal, prevents monitoring
npm run dev:server          # ❌ No proper session management  
npm run dev:full            # ❌ Cannot manage frontend/backend separately
node server.js              # ❌ Direct server execution not manageable
```

**Consequences of Direct Server Commands**:
- **Terminal Blocking**: Prevents other development work
- **No Monitoring**: Cannot check logs without interrupting server
- **Poor Debugging**: Difficult to investigate issues during development
- **Inconsistent State**: No session tracking or lifecycle management

### GitOps Integration

CChorus includes GitOps configuration in `config/gitops-config.json` for automated Git workflow management with session tracking and documentation updates.

**IMPORTANT**: GitOps agent operations MUST follow the mandatory agent sequence - GitOps handles Git operations ONLY after documentation agent has completed all updates. This ensures efficiency and prevents duplicate commits or merge conflicts.

## Component Development Guide

### Adding shadcn/ui Components

```bash
# Add new UI components using shadcn/ui CLI
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### Theme System Usage

```tsx
// Use theme context in components
import { useTheme } from "@/components/theme-provider"

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Toggle theme
    </button>
  )
}
```

### CSS Custom Properties

```css
/* Light theme (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
}

/* Dark theme */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
}
```

### Development Workflow

#### Theme Development
1. **Modify CSS variables** in `src/index.css` for color adjustments
2. **Test across themes** using Ctrl/Cmd + T keyboard shortcut
3. **Use muted colors** for secondary elements: `bg-muted text-muted-foreground`
4. **Leverage theme context** for dynamic theme switching

#### Component Development
1. **Use shadcn/ui primitives** for consistent styling and accessibility
2. **Import from @/components/ui** for pre-built components
3. **Follow Radix UI patterns** for compound components
4. **Test keyboard navigation** and screen reader compatibility

#### Git Workflow
1. **Feature branches** for all new development
2. **Conventional commits** following semantic format
3. **Documentation updates** alongside code changes
4. **Session documentation** in `docs/sessions/` for major changes

### **Agent Workflow Sequence**

**MANDATORY SEQUENCE**: All development workflows must follow this strict agent sequence for efficiency and consistency:

1. **Code Changes First**: Complete all code modifications and feature implementation
2. **Documentation Updates**: **MUST** invoke documentation manager agent (`@documentation-manager`) for ALL documentation updates
3. **Documentation Completion**: **MUST** verify documentation agent has completed all required updates, status markers, and cross-references
4. **GitOps Operations**: **ONLY THEN** allow GitOps agent to handle commits, pushes, and Git workflow management

**Agent Separation of Concerns**:
- **Documentation Agent** (`@documentation-manager`): Handles content updates, status tracking, template management
- **GitOps Agent**: Handles Git operations (commits, pushes, branch management) after documentation is complete

**Efficiency Requirement**: GitOps must always wait for documentation completion to avoid duplicate commits, merge conflicts, and inconsistent state.

## 📚 **MANDATORY Documentation Management**

### **Documentation Agent Requirement**

**ALL DOCUMENTATION WORK MUST be performed through the dedicated documentation management agent** (`documentation-manager.md`). Manual documentation updates are **STRICTLY PROHIBITED** to ensure consistency, completeness, and proper maintenance.

#### **When Documentation Agent MUST Be Used**

**Component Changes:**
- Any modification to files in `src/components/` 
- New component creation or major refactoring
- Props interface changes or feature additions
- Integration point modifications

**API Changes:**
- Any endpoint additions, modifications, or removals in `server.js`
- Service layer changes in `src/utils/resourceLibraryService.ts`
- Request/response format modifications
- Error handling or status code changes

**Feature Completion:**
- Before marking any feature branch as complete
- When user workflows are modified or added
- After UI/UX changes that affect user experience
- Upon completion of architectural changes

**Ongoing Maintenance:**
- Status tracking marker updates
- Cross-reference validation between documents
- Screenshot updates after UI changes
- Template synchronization with active documentation

#### **How to Use the Documentation Agent**

**1. Invoke the Agent:**
```
@documentation-manager please update documentation for [specific change/feature]
```

**2. Provide Context:**
- Specify which components/files were modified
- Describe the scope of changes made
- Identify affected user workflows
- Note any API endpoint changes

**3. Required Information:**
- Branch name and completion status
- List of modified files with brief change description
- User-facing feature changes
- Technical implementation details that need documentation

**4. Validation Requirements:**
- Agent must confirm all placeholder sections are updated
- Status markers must be moved from [PENDING] to [COMPLETED]
- Cross-references must be validated and updated
- Code examples must be tested for accuracy

#### **Consequences of Manual Documentation Updates**

Manual documentation updates are prohibited because they lead to:
- **Inconsistent formatting and structure**
- **Missed cross-references and broken links**
- **Outdated status tracking markers**
- **Incomplete template synchronization**
- **Documentation that doesn't match actual implementation**

### **Developer Responsibilities**

**Development Setup:**
1. **MUST** use `/tmux-dev` for all development server operations
2. **MUST** verify servers are running before beginning development work
3. **MUST** use non-blocking server monitoring workflows
4. **PROHIBITED** from using direct npm server commands

**Agent Workflow Sequence:**
1. **MUST** follow the mandatory agent sequence: Code → Documentation → GitOps
2. **MUST** complete documentation updates before any Git operations
3. **MUST** verify agent workflow completion before feature sign-off

**Before Feature Completion:**
1. **MUST** invoke documentation agent for all code changes
2. **MUST** provide comprehensive change context to the agent
3. **MUST** verify agent has updated all relevant documentation sections
4. **MUST** confirm status markers reflect actual implementation state
5. **MUST** ensure GitOps operations happen only after documentation completion

**During Development:**
1. **MUST** use `/tmux-dev` for all server status checks and debugging
2. **SHOULD** invoke documentation agent for significant interim changes
3. **MUST** coordinate with agent for API endpoint modifications
4. **SHOULD** request documentation review for complex features
5. **SHOULD** monitor server health using tmux-dev workflows

**Quality Assurance:**
1. **MUST** verify documentation agent has completed all required updates
2. **MUST** confirm all code examples in documentation are functional
3. **MUST** validate that user workflows match actual UI behavior
4. **MUST** ensure cross-references between documents are accurate
5. **MUST** verify proper server management using tmux-dev throughout development

## Development History & Key Milestones

### Phase 1: Foundation (Early July 2025)
- Initial React application with basic agent CRUD operations
- Simple file-based storage system
- Basic theme switching functionality
- Essential component structure established

### Phase 2: UI Framework Integration (Mid July 2025)
- **daisyUI Integration**: Added comprehensive theme system (30+ themes)
- **Visual Improvements**: Enhanced color selection and visual feedback
- **Layout Optimization**: Fixed textarea constraints and layout issues
- **File Management**: Improved file browser with proper directory defaults

### Phase 3: Professional UI Overhaul (Late July 2025)
- **Architecture Migration**: Transitioned from daisyUI to shadcn/ui + Radix UI
- **Accessibility First**: Implemented keyboard navigation and screen reader support
- **Theme System Enhancement**: CSS custom properties with smooth transitions
- **Component Library**: Added 10+ professional UI components with consistent styling

### Phase 4: Polish & Refinement (July 31, 2025)
- **Muted Color Scheme**: Implemented professional, theme-aware tag colors
- **Build System Upgrade**: Updated to Vite 7.0.4 and latest dependencies
- **Documentation Overhaul**: Comprehensive project documentation and session logs
- **Developer Experience**: Enhanced tooling and development workflow

### Phase 5: Complete Resource Management System (July 31, 2025)
- **Resource Library Integration**: Full implementation of unified Claude Code resource browser
- **Assignment Manager**: Complete resource deployment and management system
- **Universal Assignment Logic**: Copy/move operations for agents, commands, hooks, and settings
- **Backend API Endpoints**: Full REST API for all resource assignment operations
- **Error Handling**: Comprehensive error states and user feedback throughout the application
- **Production Ready**: Complete end-to-end resource management workflow

### Phase 6: Individual Resource Managers (August 2025) - IN PROGRESS
**Branch**: `feature/individual-resource-managers`
**Status**: ACTIVE DEVELOPMENT

**Scope**: Building specialized component interfaces for individual resource type management:

1. **Project Manager Component** 
   - CLAUDE.md editing interface for discovered projects
   - Project-specific configuration management
   - Integration with project discovery system

2. **Hooks Manager Component**
   - Visual hook configuration interface
   - Event type management and validation
   - Hook testing and debugging capabilities

3. **Commands Manager Component** 
   - Slash command library browser
   - YAML editor with syntax validation
   - Command testing and execution interface

4. **Settings Manager Component**
   - JSON editor with schema validation
   - Settings hierarchy visualization
   - Safe configuration backup and restore

**Development Strategy**:
- **Incremental Development**: Each manager component built and tested independently
- **Consistent UI Patterns**: Following established shadcn/ui + Radix UI architecture
- **API Integration**: Leveraging existing backend scanner infrastructure
- **Testing Strategy**: Manual testing with comprehensive user workflow validation

### Key Technical Decisions

#### Component Architecture
- **Chosen**: shadcn/ui + Radix UI for accessibility and consistency
- **Rationale**: Better accessibility, TypeScript support, and maintainability
- **Impact**: Professional UI with keyboard navigation and screen reader support

#### Theme System
- **Chosen**: CSS custom properties with class-based theming
- **Rationale**: Better performance than runtime theme switching
- **Impact**: Smooth theme transitions with no flash of unstyled content

#### Build Tooling
- **Chosen**: Vite 7.0.4 with modern plugin ecosystem
- **Rationale**: Superior development experience and build performance
- **Impact**: Sub-second hot reload and optimized production builds

#### State Management
- **Chosen**: React Context + hooks for theme and toast management
- **Rationale**: Appropriate for application size and complexity
- **Impact**: Simple, maintainable state management without external dependencies

### Development Metrics (July 2025)

- **Total Sessions**: 19+ documented development sessions
- **Lines of Code**: ~5,000+ (including components, utilities, and documentation)
- **Components**: 15+ React components (10+ UI components, 5+ business logic)
- **Dependencies**: Modern, well-maintained packages with active communities
- **Git Commits**: 40+ commits with conventional commit format
- **Documentation**: Comprehensive README, CLAUDE.md, and session logs

### Quality Assurance

#### Testing Strategy
- **Manual Testing**: Comprehensive across all themes and screen sizes
- **Accessibility Testing**: Keyboard navigation and screen reader validation
- **Cross-Browser**: Verified in Chrome, Firefox, Safari, and Edge
- **Responsive Design**: Tested on mobile, tablet, and desktop viewports

#### Code Quality
- **TypeScript Strict Mode**: Comprehensive type safety throughout application
- **ESLint Configuration**: Modern React and TypeScript linting rules
- **Component Patterns**: Consistent React patterns and best practices
- **Error Handling**: Comprehensive error boundaries and validation

#### Performance Optimization
- **Bundle Analysis**: Optimized imports and tree shaking
- **CSS Optimization**: Minimal custom CSS with utility-first approach
- **Build Optimization**: Vite's optimized production builds
- **Runtime Performance**: Efficient React rendering with proper hooks usage

## Documentation Structure

CChorus maintains comprehensive documentation that evolves with the codebase:

### Documentation Organization
```
docs/
├── user/                           # End-user documentation
│   ├── README.md                   # Complete user guide
│   ├── workflows/                  # Step-by-step user workflows
│   │   ├── resource-discovery.md   # Finding and browsing resources
│   │   ├── resource-assignment.md  # Deploying resources
│   │   └── project-management.md   # Managing projects
│   ├── troubleshooting.md          # Common issues and solutions
│   └── screenshots/                # UI screenshots for documentation
├── developer/                      # Technical documentation
│   ├── README.md                   # Architecture and development guide
│   ├── components/                 # Component-specific documentation
│   ├── api-reference.md            # Complete API documentation
│   └── testing.md                  # Testing strategies and examples
├── templates/                      # Documentation templates for subagent management
│   ├── user-documentation-template.md
│   ├── developer-documentation-template.md
│   └── subagent-instructions.md    # Instructions for automated documentation updates
└── sessions/                       # Development session documentation
```

### Documentation Management Strategy

**Mandatory Agent-Based System**: ALL documentation work MUST be performed through the dedicated documentation management agent. Manual updates are strictly prohibited.

**Incremental Updates**: Documentation is updated as features are implemented, not as an afterthought, using the documentation agent for all changes.

**Template-Based System**: Templates with placeholder markers enable automated documentation management through the agent system.

**Comprehensive Agent Integration**: The documentation management subagent is the ONLY authorized method for maintaining documentation throughout development.

**Enforced Cross-Reference Maintenance**: User and developer documentation consistency is enforced through the agent's validation system.

### Documentation Update Triggers
- Component modifications trigger immediate documentation updates
- API endpoint changes require immediate reference updates  
- Branch completions trigger comprehensive section updates
- New features require both user workflow and technical documentation

### Quality Assurance
- All code examples are tested before inclusion
- Screenshots are updated with UI changes
- Cross-references are validated regularly
- Documentation completeness is tracked with status markers

---

## 🚨 **CRITICAL REMINDERS: Development Standards**

### **📚 Documentation Management**
**MANDATORY REQUIREMENT**: ALL documentation work MUST be performed through the dedicated documentation management agent (`@documentation-manager`). 

**STRICTLY PROHIBITED**: Manual documentation updates of any kind.

### **🖥️ Server Management**
**MANDATORY REQUIREMENT**: ALL development server operations MUST use the `/tmux-dev` command.

**STRICTLY PROHIBITED**: Direct npm server commands (`npm run dev`, `npm run dev:server`, `npm run dev:full`).

### **⚡ Agent Workflow Sequence**
**MANDATORY SEQUENCE**: Code Changes → Documentation Agent → GitOps Agent

**REQUIRED WORKFLOW**: 
1. Complete your code changes
2. Invoke `@documentation-manager` with comprehensive change details
3. Verify the documentation agent has completed ALL updates
4. ONLY THEN allow GitOps agent to handle Git operations
5. Use `/tmux-dev` for all server management throughout the process

**These requirements ensure professional development standards, consistency, completeness, and efficient workflows.**