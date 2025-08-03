# CChorus Project Structure & Organization

## Directory Organization

### Root Level
```
CChorus/
├── PRODUCT.md              # Product vision and user workflows
├── TECHNICAL.md            # Architecture and constraints  
├── STRUCTURE.md           # This file - project organization
├── CLAUDE.md              # Strategic development guide (minimal)
├── BACKLOG.md             # Future work tracking
├── CHANGELOG.md           # Historical completion record
├── README.md              # Main project documentation
├── package.json           # Dependencies and scripts
└── src/                   # React application source
```

### Source Code Structure
```
src/
├── components/            # React components
│   ├── ui/               # shadcn/ui components (generated)
│   ├── ThreeColumnLayout.tsx     # Main interface
│   ├── PropertiesPanel.tsx       # Metadata display
│   ├── ResourceLibrary.tsx       # Resource browser
│   └── AssignmentManager.tsx     # Deployment interface
├── utils/                # Utility functions
│   ├── resourceDataService.ts    # Resource discovery
│   └── resourceLibraryService.ts # Resource operations
├── hooks/                # React hooks
├── lib/                  # Core utilities (utils.ts)
└── types.ts              # TypeScript definitions
```

### Infrastructure Organization
```
.claude/                  # Infrastructure directory
├── agents/               # Agent definitions
├── commands/             # Slash command definitions
├── hooks/                # Git hooks (pre-compact, etc.)
├── file-watcher.py       # Change detection
├── github-sync.py        # GitHub integration
├── settings.json         # Configuration
└── [status/trigger files] # Runtime files
```

### Organized Utilities
```
scripts/                  # Development scripts
├── scanners/             # Resource discovery
│   ├── agentScanner.js
│   ├── commandsScanner.js
│   └── projectScanner.js
├── servers/              # Development servers
│   ├── server.js         # Main backend
│   └── simple-server.js  # Minimal server
└── utils/                # Development utilities
    └── settingsManager.js

tools/                    # Development environment
├── .cchorus_aliases      # Shell aliases for CChorus
├── .env.template         # Environment template
└── setup-dev-environment.sh  # Environment setup
```

### Documentation Structure
```
docs/
├── user/                 # User-facing documentation
│   ├── README.md         # User guide
│   └── workflows/        # Step-by-step procedures
├── developer/            # Technical documentation
│   ├── README.md         # Architecture guide
│   ├── components/       # Component documentation
│   └── services/         # Service documentation
├── infrastructure/       # Infrastructure documentation
│   └── BASELINE.md       # Current state documentation
├── sessions/             # Current session files
└── archived-sessions/    # Historical sessions
    ├── 2025-07/
    └── 2025-08/
```

## Naming Conventions

### Files and Directories
- **React Components**: PascalCase (`ThreeColumnLayout.tsx`)
- **Utilities/Services**: camelCase (`resourceDataService.ts`)
- **Infrastructure Scripts**: kebab-case (`file-watcher.py`)
- **Documentation**: UPPERCASE (`README.md`, `TECHNICAL.md`)

### Code Conventions
- **TypeScript Interfaces**: PascalCase with `Interface` suffix
- **React Props**: PascalCase (`ComponentProps`)
- **Functions**: camelCase (`extractResourceMetadata`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)

### Agent and Command Naming
- **Agents**: kebab-case (`documentation-manager.md`)
- **Commands**: lowercase (`/docgit`, `/sync`)
- **Status Files**: kebab-case with extension (`doc-update-needed.trigger`)

## File Relationships

### Resource Discovery Chain
```
agentScanner.js → resourceDataService.ts → ResourceLibrary.tsx → PropertiesPanel.tsx
```

### Documentation Workflow Chain
```
file-watcher.py → doc-update-needed.trigger → documentation-manager → BACKLOG.md
```

### Development Server Chain
```
VS Code tasks.json → npm scripts → scripts/servers/server.js
```

## Import Patterns

### UI Components (MANDATORY)
```tsx
// Required pattern
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Internal components
import { ThreeColumnLayout } from "@/components/ThreeColumnLayout"
```

### Services and Utilities
```tsx
// Services
import { ResourceDataService } from "@/utils/resourceDataService"

// React hooks
import { useToast } from "@/hooks/use-toast"

// Types
import type { Resource, AssignmentStatus } from "@/types"
```

## Configuration Files

### Build Configuration (Root Level)
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration  
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

### Environment Configuration
- `.env` - Environment variables (not committed)
- `tools/.env.template` - Environment template
- `.claude/settings.json` - Infrastructure settings

## Development Workflow Files

### Automation Infrastructure
- `.claude/file-watcher.py` - Change detection
- `.claude/hooks/pre-compact.py` - Session analysis
- `.vscode/tasks.json` - Auto-start servers

### Status and Trigger Files (Runtime)
- `.claude/doc-update-needed.trigger` - Documentation triggers
- `.claude/pending-agent-invocations.json` - Agent queue
- `.claude/github-sync-log.json` - Sync history

---
*This structure ensures consistent organization and clear relationships between all project components.*