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

### **Agent Management**
- **Modern Visual Editor** - Clean, accessible form interface with shadcn/ui components
- **Professional Theme System** - Light/dark theme switching with keyboard shortcuts (Ctrl/Cmd + T)
- **Muted Visual Hierarchy** - Subtle, professional color scheme that adapts to themes
- **Enhanced Accessibility** - Full keyboard navigation and screen reader support via Radix UI
- **Smart Organization** - Color-coded agents with intuitive search and filtering
- **Dual-Level Storage** - Separate user (~/.claude/agents/) and project (.claude/agents/) agents

### **Experimental Features**

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

3. **Start the development servers**
   ```bash
   npm run dev:full
   ```

4. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:3001
   ```

### Alternative Start Methods

```bash
# Frontend only
npm run dev

# Backend only  
npm run server

# Both with concurrency
npm run dev:full
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

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **File System API** - Direct file operations for agent storage
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
│   │   ├── theme-provider.tsx  # Theme context and management
│   │   ├── theme-toggle.tsx    # Theme switching component
│   │   ├── AgentCard.tsx      # Individual agent display
│   │   ├── AgentEditor.tsx    # Agent creation/editing form
│   │   └── FileBrowser.tsx    # File system browser
│   ├── lib/
│   │   └── utils.ts        # Utility functions (clsx, tailwind-merge)
│   ├── hooks/
│   │   └── use-toast.ts    # Toast notification hook
│   ├── utils/              # Business logic utilities
│   │   ├── agentUtils.ts   # Agent parsing and validation
│   │   └── apiFileSystem.ts # API communication
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

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start frontend dev server
npm run server       # Start backend server  
npm run dev:full     # Start both concurrently

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Style & Architecture

This project follows modern React and TypeScript best practices:

- **Component Architecture** - shadcn/ui + Radix UI for accessible, composable components
- **Theme System** - CSS custom properties with `useTheme` hook for dynamic theming
- **TypeScript Strict Mode** - Full type safety with comprehensive type definitions
- **ESLint Configuration** - Modern React and TypeScript linting rules
- **CSS Architecture** - Tailwind utilities with semantic CSS custom properties
- **Conventional Commits** - Structured commit messages for clear history

### Adding New Features

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Add UI components**: Use `npx shadcn@latest add [component]` for new components
3. **Implement with TypeScript**: Ensure full type safety and proper interfaces
4. **Test themes**: Verify functionality in both light and dark themes (Ctrl/Cmd + T)
5. **Test accessibility**: Ensure keyboard navigation and screen reader compatibility
6. **Follow conventions**: Use conventional commits like `feat(ui): add new component`
7. **Document changes**: Update README and add session documentation if significant
8. **Submit pull request** with detailed description and testing notes

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

### Code Guidelines

- **Component Development**: Use shadcn/ui components and Radix UI primitives for consistency
- **TypeScript**: Strict mode with comprehensive type definitions for all functions
- **Theme System**: Use CSS custom properties and `useTheme` hook for theme-aware components
- **Styling**: Tailwind utilities with semantic classes (`bg-muted`, `text-muted-foreground`)
- **Accessibility**: Ensure keyboard navigation and ARIA compliance via Radix UI
- **Testing**: Verify functionality across light/dark themes and responsive breakpoints
- **Documentation**: Update README, CLAUDE.md, and session docs for significant changes

### Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** if any

## 📋 Agent File Format

CChorus uses Markdown files with YAML frontmatter:

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

## 🛠️ Troubleshooting

### Common Issues

**Themes not switching**
- Try keyboard shortcut: `Ctrl/Cmd + T`
- Check browser console for JavaScript errors
- Verify theme provider is wrapping the app in `App.tsx`
- Clear localStorage: `localStorage.removeItem('cchorus-theme')`

**Agents not loading**
- Verify YAML frontmatter syntax
- Check file permissions on agent directories
- Ensure backend server is running on port 3001

**MCP tools not appearing**
- Verify Claude Desktop configuration exists
- Check `~/.claude/settings.json` for permissions
- Restart the backend server after configuration changes

**File browser not showing .claude folder**
- Ensure you're starting from user home directory
- Check folder permissions
- Verify server is running with proper user context

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
