# Contributing to CChorus

## Development Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher
- Claude Desktop (for MCP integration)

### Installation
```bash
git clone <repository>
cd cchorus
npm install
```

## Development Server Management

### tmux-dev Command Requirements

**ALL development server interactions MUST use `/tmux-dev`.** Direct npm server commands are **STRICTLY PROHIBITED**.

#### Why tmux-dev is Mandatory

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

#### Required tmux-dev Workflows

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

#### Integration with Development Process

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

#### Prohibited Server Commands

**These commands are STRICTLY FORBIDDEN**:
```bash
npm run dev                 # ❌ Blocks terminal, prevents monitoring
npm run dev:server          # ❌ No proper session management  
npm run dev:full            # ❌ Cannot manage frontend/backend separately
node server.js              # ❌ Direct server execution not manageable
```

## Component Development

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

## Quality Assurance

### Testing Strategy
- **Manual Testing**: Comprehensive across all themes and screen sizes
- **Accessibility Testing**: Keyboard navigation and screen reader validation
- **Cross-Browser**: Verified in Chrome, Firefox, Safari, and Edge
- **Responsive Design**: Tested on mobile, tablet, and desktop viewports

### Code Quality
- **TypeScript Strict Mode**: Comprehensive type safety throughout application
- **ESLint Configuration**: Modern React and TypeScript linting rules
- **Component Patterns**: Consistent React patterns and best practices
- **Error Handling**: Comprehensive error boundaries and validation

### Performance Optimization
- **Bundle Analysis**: Optimized imports and tree shaking
- **CSS Optimization**: Minimal custom CSS with utility-first approach
- **Build Optimization**: Vite's optimized production builds
- **Runtime Performance**: Efficient React rendering with proper hooks usage

## Agent File Format

Sub-agents are stored as Markdown files with YAML frontmatter:

```markdown
---
name: agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
color: "#3B82F6"            # Optional - visual color theme
---

System prompt content goes here...
```

### Supported Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique identifier (lowercase, hyphens) |
| `description` | string | ✅ | When should this agent be invoked? |
| `tools` | array/string | ❌ | Specific Claude Code tools (optional) |
| `color` | string | ❌ | Hex color for visual identification |
| `level` | string | ❌ | 'user' or 'project' (defaults to 'project') |

## Troubleshooting

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