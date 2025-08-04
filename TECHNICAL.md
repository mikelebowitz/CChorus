# CChorus Technical Architecture & Context

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js Express API (port 3001)
- **Data Storage**: File system-based with `.claude/` directories
- **UI Framework**: shadcn/ui + Radix UI (MANDATORY - no other UI frameworks)
- **Development**: VS Code with auto-starting development servers

## Architecture Decisions

### UI Framework Mandate
**REQUIRED**: shadcn/ui + Radix UI patterns exclusively
```tsx
// ✅ CORRECT
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ❌ PROHIBITED
import { Button } from "@mui/material"
import styled from "styled-components"
```

### Component Architecture
- **ThreeColumnLayout**: Main interface with navigation, resource lists, Properties panel
- **PropertiesPanel**: Context-aware metadata display with intelligent type detection
- **ResourceAssignmentPanel**: Cross-project resource deployment with visual tracking
- **ResourceDataService**: Unified resource discovery with enhanced performance

### Data Architecture
```
File System Structure:
/Users/[username]/.claude/          # User-global scope
├── agents/, commands/, hooks/      # User resources
├── settings.json                   # User preferences

/project/.claude/                   # Project-specific scope  
├── agents/, commands/, hooks/      # Project resources
├── settings.local.json             # Project overrides
```

### API Architecture
**REST Endpoints** (server.js):
- `GET /api/resources` - Discover all resources across scopes
- `POST /api/assign` - Deploy resource to target scope
- `GET /api/status` - Resource assignment status
- `POST /api/metadata` - Extract resource metadata

## Development Constraints

### Mandatory Workflow
```bash
# REQUIRED sequence for all changes:
# 1. Code Changes (UI must use shadcn/ui only)
# 2. @documentation-manager update docs  
# 3. @gitops-workflow-manager commit and push
```

### Server Management
- **Auto-start**: VS Code tasks.json automatically starts servers on project open
- **Ports**: Frontend (5173), Backend (3001), Dashboard (3002)
- **No tmux**: Replaced with VS Code visible terminal management

### File Organization
```
/scripts/           # Organized utilities
├── scanners/       # Resource discovery scripts
├── servers/        # Development servers  
└── utils/          # Development utilities

/tools/             # Development environment
├── .cchorus_aliases       # Development aliases
├── .env.template          # Environment template
└── setup-dev-environment.sh  # Setup script
```

## Performance Requirements
- **Resource Discovery**: < 200ms for local file scanning
- **Assignment Operations**: < 500ms for scope deployment
- **UI Responsiveness**: 60fps animations, < 100ms interactions
- **Memory Usage**: < 50MB for resource metadata caching

## Security Constraints
- **No Secret Exposure**: Never log or commit secrets/tokens
- **Safe File Operations**: Validate all file paths and operations
- **Scope Isolation**: User and project resources properly isolated

## Integration Requirements
- **Claude Code Ecosystem**: Seamless integration with existing workflows
- **Git Integration**: Proper version control of project resources
- **Cross-Platform**: macOS, Windows, Linux compatibility

## Error Handling Standards
- **Graceful Degradation**: UI remains functional when services unavailable
- **User Feedback**: Clear error messages with actionable suggestions
- **Logging**: Structured logging for debugging without exposing sensitive data

## Testing Strategy
- **Component Testing**: Jest + React Testing Library
- **API Testing**: Supertest for endpoint validation
- **Integration Testing**: End-to-end workflow validation
- **Accessibility**: WCAG 2.1 AA compliance

---
*This document serves as architectural context for all technical decisions and implementations.*