# CChorus Developer Documentation

<!-- ARCHITECTURE_STATUS -->
<!-- Components: Core [COMPLETED], Resource Managers [PENDING], Assignment Engine [PENDING], Integration [PENDING] -->

## 🏗️ Architecture Overview

<!-- ARCHITECTURE_OVERVIEW -->
<!-- UPDATE_TRIGGER: When major architectural changes are made -->
<!-- CONTENT: System diagram, data flow, component relationships -->

CChorus is built as a React frontend with an Express.js backend API, designed to manage all aspects of the Claude Code ecosystem.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express API    │    │  File System    │
│   (Port 5173)   │◄──►│  (Port 3001)    │◄──►│  ~/.claude/     │
└─────────────────┘    └─────────────────┘    │  ./claude/      │
                                               └─────────────────┘
```

### Data Flow
1. **Resource Discovery**: Backend scanners traverse filesystem to find Claude Code resources
2. **API Layer**: RESTful endpoints provide unified access to all resource types
3. **Frontend Services**: Service layer abstracts API calls and provides unified data models
4. **Component Tree**: React components consume services and manage UI state
5. **Assignment Engine**: Handles resource deployment operations between scopes

### Technology Stack
<!-- TECH_STACK -->
<!-- CONTENT: React 18, TypeScript, shadcn/ui, Express.js, Node.js -->

**Frontend:**
- React 18.3.1 with TypeScript
- Vite 7.0.4 for build tooling
- shadcn/ui + Radix UI for component library
- Tailwind CSS 3.4.17 for styling
- Lucide React for icons

**Backend:**
- Node.js with Express.js framework
- readdirp v4 for efficient filesystem scanning
- js-yaml for YAML frontmatter parsing
- CORS enabled for development

**Development Tools:**
- TypeScript strict mode
- ESLint for code quality
- Path aliases (@/* → src/*)
- Hot reload development servers

### Backend Services
<!-- BACKEND_SERVICES -->
<!-- UPDATE_TRIGGER: When new scanners or services are added -->
<!-- CONTENT: agentScanner.js, projectScanner.js, hooksScanner.js, etc. -->

**Core Scanner Modules:**
- `agentScanner.js` - System-wide agent discovery with project context
- `projectScanner.js` - CLAUDE.md file discovery and project metadata extraction
- `hooksScanner.js` - Hook configuration parsing from settings files
- `commandsScanner.js` - Slash command discovery and management
- `settingsManager.js` - Safe settings file read/write operations

**Scanner Architecture:**
- Stream-based scanning using async generators for memory efficiency
- Configurable depth limits and directory filtering
- Error resilience with graceful handling of permissions issues
- AbortSignal support for user-triggered cancellation

## 📦 Component Documentation

### Core Components

#### ResourceLibrary.tsx
<!-- COMPONENT_RESOURCE_LIBRARY -->
<!-- UPDATE_TRIGGER: When ResourceLibrary.tsx is modified -->
<!-- CONTENT: Props interface, usage examples, integration points -->

**Purpose**: Unified interface for browsing all Claude Code resources

**Props Interface:**
```typescript
interface ResourceLibraryProps {
  onResourceSelect?: (resource: ResourceItem) => void;
  onResourceAssign?: (resource: ResourceItem) => void;
}
```

**Key Features:**
- Unified resource browsing with search and filtering
- Resource type tabs (All, Agent, Command, Hook, Project, Settings)
- Scope filtering (User, Project, Builtin, System)
- Multi-select with bulk operations
- Resource preview cards with status indicators

**Integration Points:**
- Uses `ResourceLibraryService` for data operations
- Integrates with `AssignmentManager` for resource assignment
- Supports cross-navigation to specialized managers

**State Management:**
- Local state for UI (filters, search, selection)
- Service layer handles data fetching and caching
- Real-time resource status updates

#### AssignmentManager.tsx
<!-- COMPONENT_ASSIGNMENT_MANAGER -->
<!-- UPDATE_TRIGGER: When AssignmentManager.tsx is modified -->
<!-- CONTENT: Component architecture, state management, API integration -->

**Purpose**: Deploy and manage resource assignments across scopes

**Props Interface:**
```typescript
interface AssignmentManagerProps {
  selectedResource?: ResourceItem;
  onClose?: () => void;
}
```

**Key Features:**
- Scope-based resource management (User Level, Projects, Overview)
- Visual deployment status tracking
- Copy/move operations between scopes
- Assignment workflow with target selection
- Deployment history and status indicators

**Architecture:**
- Tabbed interface for different management views
- Resource assignment cards with action buttons
- Target selection with scope validation
- Integration with assignment API endpoints

**API Integration:**
- `ResourceLibraryService.assignResource()` for deployment operations
- `ResourceLibraryService.getDeploymentStatus()` for status tracking
- `ResourceLibraryService.getAvailableTargets()` for target discovery

### Specialized Manager Components
<!-- COMPONENT_MANAGERS -->
<!-- UPDATE_TRIGGER: After feature/resource-managers branch -->
<!-- PLACEHOLDER: ProjectManager, HooksManager, CommandsManager, SettingsManager -->

*[To be documented when manager components are implemented]*

**ProjectManager.tsx** - Project discovery and CLAUDE.md editing
**HooksManager.tsx** - Visual hook configuration interface  
**CommandsManager.tsx** - Slash command library and editor
**SettingsManager.tsx** - Settings file hierarchy management

## 🔌 API Reference

<!-- API_REFERENCE -->
<!-- UPDATE_TRIGGER: When new API endpoints are added -->
<!-- CONTENT: Complete endpoint documentation with examples -->

### Projects API
<!-- API_PROJECTS -->
<!-- ENDPOINTS: GET /api/projects/system, GET /api/projects/:path/info -->

**GET /api/projects/system**
- Discovers all Claude Code projects (CLAUDE.md files) system-wide
- Returns: Array of `ClaudeProject` objects with metadata

**GET /api/projects/:projectPath/info**
- Gets detailed information about a specific project
- Returns: Project metadata including resource counts

**GET /api/projects/:projectPath/claude-md**
- Retrieves CLAUDE.md content for editing
- Returns: File content as text

**PUT /api/projects/:projectPath/claude-md**
- Updates CLAUDE.md file content
- Body: `{ content: string }`

### Agents API

**GET /api/agents/system**
- System-wide agent discovery with project context
- Returns: Array of agents with project metadata

**POST /api/agents/save**
- Save agent to appropriate scope (user/project)
- Body: `SubAgent` object

**DELETE /api/agents/:name**
- Delete agent by name and level
- Query: `level` (user/project)

### Commands API

**GET /api/commands/system**
- Discover all slash commands system-wide
- Returns: Array of `SlashCommand` objects

**POST /api/commands/save**
- Save slash command to specified scope
- Body: Command data with scope information

**DELETE /api/commands/:commandId**
- Delete command by ID

### Hooks API

**GET /api/hooks/system**
- Discover all hooks from settings files
- Returns: Array of hook configurations

**POST /api/hooks/create**
- Create new hook in specified settings file
- Body: Hook configuration object

**PUT /api/hooks/settings**
- Update hooks in settings file
- Body: Complete hooks configuration

### Settings API

**GET /api/settings/effective**
- Get effective settings (merged user/project/local)
- Query: `projectPath` (optional)
- Returns: Merged settings with source information

**GET /api/settings/file**
- Read specific settings file
- Query: `filePath`

**PUT /api/settings/file**
- Update settings file content
- Body: `{ content: object, filePath: string }`

### Resource Management APIs
<!-- API_RESOURCE_MANAGEMENT -->
<!-- UPDATE_TRIGGER: After feature/assignment-engine branch -->
<!-- PLACEHOLDER: Assignment operations, deployment status, resource operations -->

*[To be implemented in feature/assignment-engine branch]*

**POST /api/resources/assign**
- Assign resource to target scope
- Body: `ResourceAssignment` object

**GET /api/resources/deployment-status**
- Get deployment status for all resources
- Returns: Resource deployment tracking data

## 🚀 Development Workflow

<!-- DEVELOPMENT_WORKFLOW -->
<!-- CONTENT: Setup instructions, branch strategy, testing approach -->

### Setting Up Development Environment
<!-- DEV_SETUP -->
<!-- STEPS: npm install, environment variables, running dev servers -->

```bash
# Clone repository
git clone <repository-url>
cd CChorus

# Install dependencies
npm install

# Start development servers
npm run dev:full  # Both frontend and backend
# OR individually:
npm run dev       # Frontend only (port 5173)
npm run dev:server # Backend only (port 3001)
```

### Environment Setup
- Node.js 16+ required
- Write access to ~/.claude/ directory
- Optional: Claude Code projects in filesystem for testing

### Branch Strategy
- `main` - Production-ready code
- `feature/resource-managers` - Specialized manager components
- `feature/assignment-engine` - Resource deployment functionality
- `feature/integration-polish` - UX enhancements and polish
- `feature/documentation-update` - Documentation and examples

### Testing Strategy
<!-- TESTING_STRATEGY -->
<!-- UPDATE_TRIGGER: When testing framework is implemented -->
<!-- PLACEHOLDER: Unit tests, integration tests, manual testing procedures -->

**Manual Testing:**
- Test with real Claude Code projects and resources
- Verify cross-browser compatibility (Chrome, Firefox, Safari)
- Test responsive design on mobile/tablet/desktop
- Validate accessibility with keyboard navigation

**Integration Testing:**
- Backend API endpoints with real filesystem data
- Frontend-backend integration with development servers
- Resource operations (create, read, update, delete)

## 🎯 Implementation Phases

### Phase 1: Core Infrastructure [COMPLETED]
<!-- PHASE_1_STATUS -->
<!-- CONTENT: Resource Library, Assignment Manager, basic navigation -->

**Completed:**
- ✅ Resource Library component with unified browsing
- ✅ Assignment Manager component with deployment interface
- ✅ Main App.tsx navigation with tabbed interface
- ✅ ResourceLibraryService API integration layer
- ✅ Backend scanner infrastructure for all resource types
- ✅ Complete API endpoints for resource discovery

**Status:** Ready for testing and user feedback

### Phase 2: Resource Managers [PENDING]
<!-- PHASE_2_STATUS -->
<!-- UPDATE_TRIGGER: During feature/resource-managers branch -->
<!-- CONTENT: Specialized management interfaces for each resource type -->

**Planned:**
- ProjectManager component for project discovery and CLAUDE.md editing
- HooksManager component for visual hook configuration
- CommandsManager component for slash command management
- SettingsManager component for settings file hierarchy

**Estimated Time:** 3-4 hours

### Phase 3: Assignment Engine [PENDING]
<!-- PHASE_3_STATUS -->
<!-- UPDATE_TRIGGER: During feature/assignment-engine branch -->
<!-- CONTENT: Complete deployment functionality and status tracking -->

**Planned:**
- Complete resource assignment logic (copy/move operations)
- Deployment status tracking with visual indicators
- Conflict detection and resolution
- Batch operations for multiple resources

**Estimated Time:** 2-3 hours

### Phase 4: Integration & Polish [PENDING]
<!-- PHASE_4_STATUS -->
<!-- UPDATE_TRIGGER: During feature/integration-polish branch -->
<!-- CONTENT: Enhanced UX, cross-navigation, performance optimizations -->

**Planned:**
- Cross-navigation features and deep linking
- Enhanced loading states and error handling
- Responsive design optimization
- Accessibility improvements
- Performance optimizations

**Estimated Time:** 2-3 hours

## 🔍 Code Patterns and Conventions

### Component Structure
```typescript
// Standard component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State hooks
  const [state, setState] = useState<Type>(initialValue);
  
  // Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = async (data: Type) => {
    // Handle event
  };
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
}
```

### Service Layer Pattern
```typescript
// Service classes for API integration
export class ServiceName {
  async methodName(params: Type): Promise<ReturnType> {
    try {
      const response = await fetch(`${API_BASE}/endpoint`);
      return await response.json();
    } catch (error) {
      console.error('Error message:', error);
      return fallbackValue;
    }
  }
}
```

### Error Handling
- Use try-catch blocks for async operations
- Log errors to console with context
- Provide user-friendly error messages
- Use toast notifications for user feedback

## 📋 Contribution Guidelines

### Code Quality
- Follow TypeScript strict mode requirements
- Use ESLint configuration for code consistency
- Follow existing component and service patterns
- Include proper error handling and loading states

### Documentation
- Update component documentation when making changes
- Add inline comments for complex logic
- Update API documentation for new endpoints
- Include usage examples for new features

### Testing
- Test manually with real Claude Code projects
- Verify responsive design across screen sizes
- Check accessibility with keyboard navigation
- Test error conditions and edge cases