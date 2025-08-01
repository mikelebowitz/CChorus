# CChorus Developer Documentation

<!-- ARCHITECTURE_STATUS -->
<!-- Components: Core [COMPLETED], Resource Managers [PARTIALLY COMPLETED - ProjectManager COMPLETED], Assignment Engine [COMPLETED], Integration [PENDING] -->

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
- `projectScanner.js` - CLAUDE.md file discovery and project metadata extraction with deduplication
- `hooksScanner.js` - Hook configuration parsing from settings files
- `commandsScanner.js` - Slash command discovery and management
- `settingsManager.js` - Safe settings file read/write operations

**Frontend Service Layer:**
- `resourceLibraryService.ts` - Unified resource operations and API integration
- `projectPreferencesService.ts` - Client-side project preferences with localStorage persistence
  - Archive/hide/favorite project functionality
  - Bulk operations for multiple projects
  - Usage statistics and analytics
  - Import/export capabilities for backup
  - Cleanup for non-existent projects
- `cacheService.ts` - Intelligent caching system with background refresh and staleness detection
- `apiFileSystem.ts` - Backend API communication layer

**Scanner Architecture:**
- Stream-based scanning using async generators for memory efficiency
- Real-time streaming using Server-Sent Events for immediate user feedback
- Configurable depth limits and directory filtering
- Error resilience with graceful handling of permissions issues
- AbortSignal support for user-triggered cancellation
- Automatic deduplication to prevent duplicate project entries
- Intelligent caching with cache-first loading and background refresh

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
<!-- STATUS: ProjectManager [COMPLETED], HooksManager [PENDING], CommandsManager [PENDING], SettingsManager [PENDING] -->

**ProjectManager.tsx [COMPLETED WITH STREAMING + PREFERENCES]** - Complete project management interface with:
- **Real-time Streaming**: Server-Sent Events streaming for live project discovery with immediate feedback
- **Intelligent Caching**: Cache-first loading with automatic background refresh and staleness detection
- **CLAUDE.md Editor**: Built-in editor with template generation, automatic backup, and change detection
- **Project Preferences**: Archive/hide/favorite system with localStorage persistence and bulk operations
- **Advanced Filtering**: Status-based filtering (active/archived/hidden/favorited) with real-time search
- **Project Health Assessment**: Visual indicators with filtering support for project completeness
- **Dual View Modes**: Grid and list views with responsive design and preference persistence
- **Split-Pane Layout**: Project list with integrated editor panel for seamless CLAUDE.md management
- **Performance Optimization**: Cache-first loading, background updates, cancellable operations
- **Complete API Integration**: Full integration with streaming and CLAUDE.md endpoints
- **Error Resilience**: Automatic fallback from streaming to batch loading, comprehensive error handling
**HooksManager.tsx [PENDING]** - Visual hook configuration interface  
**CommandsManager.tsx [PENDING]** - Slash command library and editor
**SettingsManager.tsx [PENDING]** - Settings file hierarchy management

## 🔧 Service Layer Architecture

### ProjectPreferencesService
<!-- SERVICE_PROJECT_PREFERENCES -->
<!-- UPDATE_TRIGGER: When ProjectPreferencesService is modified -->
<!-- STATUS: [COMPLETED] -->

**Purpose**: Client-side project organization with localStorage persistence

**Core Interface:**
```typescript
interface ProjectPreferences {
  archived: boolean;
  hidden: boolean;
  favorited: boolean;
  lastViewed?: Date;
  customName?: string;
  tags?: string[];
}
```

**Key Methods:**
```typescript
// Individual project operations
ProjectPreferencesService.getProjectPreferences(projectPath: string): ProjectPreferences
ProjectPreferencesService.updateProjectPreferences(projectPath: string, preferences: Partial<ProjectPreferences>): void
ProjectPreferencesService.archiveProject(projectPath: string): void
ProjectPreferencesService.toggleFavorite(projectPath: string): boolean
ProjectPreferencesService.markAsViewed(projectPath: string): void

// Bulk operations
ProjectPreferencesService.archiveMultipleProjects(projectPaths: string[]): void
ProjectPreferencesService.cleanupPreferences(existingProjectPaths: string[]): void

// Analytics and management
ProjectPreferencesService.getUsageStats(): UsageStats
ProjectPreferencesService.exportPreferences(): string
ProjectPreferencesService.importPreferences(jsonString: string): boolean
```

**Architecture Features:**
- **localStorage Persistence**: All preferences stored in browser localStorage with JSON serialization
- **Version Management**: Versioned preference format (v1.0) with import compatibility
- **Error Resilience**: Graceful handling of localStorage failures and corruption
- **Bulk Operations**: Efficient batch operations for multiple projects
- **Analytics**: Usage statistics for project organization insights
- **Data Management**: Import/export for backup and cleanup for non-existent projects

**Integration Patterns:**
- **React Integration**: Used in ProjectManager component with state synchronization
- **Real-time Updates**: Preferences applied immediately to UI state
- **Cache Coordination**: Works with CacheService to maintain preference state across cache refreshes
- **Filter Integration**: Powers project filtering by status (active/archived/hidden/favorited)

## 🔌 API Reference

<!-- API_REFERENCE -->
<!-- UPDATE_TRIGGER: When new API endpoints are added -->
<!-- CONTENT: Complete endpoint documentation with examples -->

### Projects API
<!-- API_PROJECTS -->
<!-- ENDPOINTS: GET /api/projects/system, GET /api/projects/stream, GET /api/projects/:path/claudemd -->

**GET /api/projects/system**
- Discovers all Claude Code projects (CLAUDE.md files) system-wide
- Returns: Array of `ClaudeProject` objects with metadata
- Used for batch loading fallback when streaming fails

**GET /api/projects/stream**
- Real-time streaming project discovery using Server-Sent Events
- Streams project results as they're discovered across filesystem
- Event types: 'connected', 'scan_started', 'project_found', 'project_error', 'scan_complete', 'error'
- Automatic deduplication to prevent duplicate project entries
- Returns: Stream of JSON events with project data and discovery progress
- Performance: Dramatically improved user experience with immediate feedback
- Headers: Proper SSE headers with CORS support for localhost development
- Error Handling: Automatic fallback to batch endpoint if streaming fails
- Cancellation: Client-side EventSource cleanup and connection management
- Progress Tracking: Live counter updates ("Found X projects...") during discovery

**Streaming Architecture:**
```javascript
// Frontend EventSource integration
const eventSource = new EventSource('/api/projects/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'project_found':
      // Add project to UI immediately
      break;
    case 'scan_complete':
      // Update UI completion state
      break;
  }
};
```

**GET /api/projects/:projectPath/claudemd**
- Retrieves CLAUDE.md content for ProjectManager editor
- URL parameter: encoded project path
- Returns: `{ content: string, path: string }` or 404 if file doesn't exist
- Security: Path validation prevents access to system directories

**PUT /api/projects/:projectPath/claudemd**
- Updates CLAUDE.md file content with automatic backup
- URL parameter: encoded project path
- Body: `{ content: string }`
- Creates backup file before modification for safety
- Returns: Success confirmation or error details
- Security: Path validation and backup system for safe file operations

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
<!-- STATUS: COMPLETED - Full assignment and deployment system -->

**POST /api/resources/assign**
- Assign resource to target scope (user/project)
- Body: `ResourceAssignment` object with source, target, and operation type
- Supports copy (duplicate) and move (relocate) operations
- Returns: Assignment result with success/failure status
- Handles conflict detection and resolution

**GET /api/resources/deployment-status**
- Get deployment status for all resources across scopes
- Returns: Resource deployment tracking data with active deployments
- Includes resource counts by type and scope
- Used by Assignment Manager for status visualization

**GET /api/resources/targets**
- Get available deployment targets (projects and user scope)
- Returns: Array of valid target scopes with metadata
- Used for target selection in Assignment Manager

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

# Start development servers (MANDATORY: Use tmux-dev)
/tmux-dev start both frontend and backend in separate sessions
# OR individually:
/tmux-dev start frontend server in session cchorus-frontend
/tmux-dev start backend server in session cchorus-backend

# Monitor development servers
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend
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

### Phase 2: Resource Managers [PARTIALLY COMPLETED]
<!-- PHASE_2_STATUS -->
<!-- UPDATE_TRIGGER: During feature/resource-managers branch -->
<!-- CONTENT: Specialized management interfaces for each resource type -->

**Completed:**
- ✅ ProjectManager component [COMPLETED WITH STREAMING + PREFERENCES] - Full project management with:
  - **Real-time Streaming**: Server-Sent Events for live project discovery with progress tracking
  - **Intelligent Caching**: Cache-first loading with 5-minute staleness detection and background refresh
  - **Project Preferences**: Complete archive/hide/favorite system with localStorage persistence
  - **Advanced Filtering**: Status-based filtering with real-time search and project health indicators
  - **CLAUDE.md Editor**: Built-in editor with template generation, backup system, and change detection
  - **Dual View Modes**: Grid and list views with responsive design and preference persistence
  - **Split-Pane Layout**: Integrated project list and editor for seamless workflow
  - **Performance Architecture**: Cache-first, streaming, cancellable operations, error resilience
  - **Complete API Integration**: Full integration with `/api/projects/stream` and `/api/projects/:path/claudemd`
  - **Project Organization**: Bulk operations, usage analytics, import/export capabilities

**Remaining:**
- HooksManager component for visual hook configuration
- CommandsManager component for slash command management
- SettingsManager component for settings file hierarchy

**Estimated Time for Remaining:** 2-3 hours

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