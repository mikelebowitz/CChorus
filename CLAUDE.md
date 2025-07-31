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

> **Development Timeline**: 19+ comprehensive sessions documented in `/docs/sessions/`  
> **Architecture Evolution**: From basic functionality to professional-grade agent management system  
> **Key Transformation**: daisyUI → shadcn/ui + Radix UI with complete accessibility overhaul

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

This is **CChorus** - a professional React-based web application for managing Claude Code sub-agents, featuring a modern shadcn/ui interface, comprehensive theme system, and robust Node.js/Express backend API.

### High-Level Architecture

- **Frontend**: React 18 + TypeScript + Vite 7.0.4 + Tailwind CSS 3.4.17 + shadcn/ui
- **UI Components**: shadcn/ui + Radix UI primitives with accessibility features
- **Theme System**: CSS custom properties with light/dark modes and smooth transitions
- **Backend**: Node.js Express API server (port 3001) with enhanced file handling
- **Data**: File system-based agent storage in `.claude/agents/` directories
- **Agent Format**: Markdown files with YAML frontmatter containing agent configurations

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

1. **System-Wide Agent Discovery**: Frontend calls `/api/agents/system` to comprehensively scan all projects on the system
2. **Advanced Scanning**: Backend uses `agentScanner.js` with readdirp v4 streaming to recursively find all `.claude/agents/` directories
3. **Project Context Extraction**: Server automatically determines project name, path, and source type for each agent
4. **Agent Parsing**: Backend reads `.md` files and frontend parses YAML frontmatter using `js-yaml`
5. **Enhanced Metadata**: Each agent includes project information (`projectName`, `projectPath`, `sourceType`, `relativePath`)
6. **Agent Storage**: Agents saved to appropriate directory based on `level` (user/project)
7. **Tool Integration**: Supports all Claude Code tools plus MCP servers detected from `~/.claude/settings.json`

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

### GitOps Integration

CChorus includes GitOps configuration in `config/gitops-config.json` for automated Git workflow management with session tracking and documentation updates.

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
```