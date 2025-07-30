# CChorus

<div align="center">
  <img src="public/cchorus-logo.png" alt="CChorus Logo" width="200"/>
  
  **Helping Orchestrate Your Claude Code Subagents**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![daisyUI](https://img.shields.io/badge/daisyUI-4.0-FF7849.svg)](https://daisyui.com/)
</div>

## Features

### **Agent Management**
- **Visual Agent Editor** - Rich form-based editing with real-time validation
- **Color-Coded Organization** - Assign colors to agents for quick visual identification
- **Tool Selection Interface** - Easy checkbox interface for Claude Code tools
- **Search & Filter** - Quickly find agents by name, description, or properties
- **Dual-Level Storage** - Separate user (~/.claude/agents/) and project (.claude/agents/) agents

### **Experimental Features**

- **MCP Server Integration** - Automatic detection and management of MCP (Model Context Protocol) tools
- **File Import System** - Import existing Markdown files as agents with YAML frontmatter parsing

### **Developer Experience**
- **Hot Reload Development** - Instant updates during development
- **TypeScript Support** - Full type safety throughout the application
- **Modern Build System** - Powered by Vite for lightning-fast development
- **Extensible Architecture** - Clean, modular codebase for easy customization

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
- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **daisyUI** - Beautiful component library with theme system
- **Vite** - Fast build tool and development server
- **Lucide React** - Consistent, beautiful icons

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **File System API** - Direct file operations for agent storage
- **CORS Support** - Cross-origin resource sharing for development

### Project Structure

```
cchorus/
├── src/
│   ├── components/          # React components
│   │   ├── AgentCard.tsx   # Individual agent display
│   │   ├── AgentEditor.tsx # Agent creation/editing form
│   │   └── FileBrowser.tsx # File system browser
│   ├── utils/              # Utility functions
│   │   ├── agentUtils.ts   # Agent parsing and validation
│   │   └── apiFileSystem.ts # API communication
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── server.js              # Express.js backend server
├── tailwind.config.js     # Tailwind/daisyUI configuration
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

CChorus supports all daisyUI themes out of the box. To customize themes, edit `tailwind.config.js`:

```javascript
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      "light", "dark", "cupcake", "bumblebee", 
      // Add or remove themes as needed
    ],
  },
}
```

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

### Code Style

This project follows modern JavaScript/TypeScript conventions:

- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting (configured in your editor)
- **Conventional Commits** - Structured commit messages
- **TypeScript Strict Mode** - Enhanced type safety

### Adding New Features

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Implement your changes** with proper TypeScript types
3. **Test thoroughly** across different themes and screen sizes
4. **Follow commit conventions**: `feat(component): add new functionality`
5. **Submit a pull request** with detailed description

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

- **TypeScript**: Use proper types for all functions and components
- **Components**: Follow React functional component patterns
- **Styling**: Use Tailwind CSS classes, extend with custom CSS when needed
- **Testing**: Ensure changes work across all supported themes
- **Documentation**: Update README and code comments for significant changes

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
- Restart the development server: `npm run dev:full`
- Clear browser cache and reload
- Check browser console for errors

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
- **Vite** - Fast and modern build tool
- **Anthropic** - For creating Claude and the development tools ecosystem

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/cchorus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/cchorus/discussions)
- **Documentation**: This README and inline code comments

---

<div align="center">
  
**Built with ❤️ for the Claude Code community**

*CChorus - Helping Orchestrate your AI agents*

</div>
