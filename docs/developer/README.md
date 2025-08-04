# CChorus Developer Documentation

<!-- ARCHITECTURE_STATUS -->
<!-- Components: Core [COMPLETED], Resource Managers [COMPLETED], Assignment Engine [COMPLETED], Integration [COMPLETED], Streaming [COMPLETED], Caching [COMPLETED], Automation Systems [COMPLETED] -->
<!-- VERSION: 2.0.0 Released - Complete platform with advanced automation infrastructure and workflow enforcement -->
<!-- LAST_UPDATED: 2025-08-03 - All components completed, automation systems operational, mandatory workflow enforcement active -->

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
1. **Client-side Caching**: Intelligent caching layer provides instant loading with background refresh capabilities
2. **Real-time Project Discovery**: Backend streams project discovery via Server-Sent Events for immediate user feedback
3. **Resource Discovery**: Backend scanners traverse filesystem to find Claude Code resources
4. **API Layer**: RESTful endpoints provide unified access to all resource types with streaming capabilities
5. **Frontend Services**: Service layer abstracts API calls and provides unified data models with EventSource integration
6. **Component Tree**: React components consume services and manage UI state with real-time updates
7. **Assignment Engine**: Handles resource deployment operations between scopes
8. **Streaming Updates**: Progressive UI updates as data becomes available through SSE connections
9. **Cache Management**: Intelligent cache invalidation and background refresh for optimal performance

### Technology Stack
<!-- TECH_STACK -->
<!-- CONTENT: React 18, TypeScript, shadcn/ui, Express.js, Node.js -->

**Frontend:**
- React 18.3.1 with TypeScript
- Vite 7.0.4 for build tooling
- shadcn/ui + Radix UI for component library
- Tailwind CSS 3.4.17 for styling
- Lucide React for icons
- @uiw/react-md-editor for integrated CLAUDE.md editing within 3-column layout
- Modern 3-column interface as default user experience

**Backend:**
- Node.js with Express.js framework
- readdirp v4 for efficient filesystem scanning with deduplication
- js-yaml for YAML frontmatter parsing
- Enhanced error handling and filesystem resilience
- CORS enabled for development

**Development Tools:**
- TypeScript strict mode
- ESLint for code quality with automatic fixing
- Path aliases (@/* → src/*)
- VS Code Tasks for automated server management (auto-start on folder open)
- **BREAKING**: tmux-dev workflow replaced with VS Code visible terminal integration

**Automation Infrastructure (NEW in v2.0.0):**
- Auto-documentation system with file watchers
- Auto-branch creation from BACKLOG.md metadata
- GitHub Issues/Projects bi-directional synchronization
- Task completion validation with category-specific requirements
- Pre-compact hooks for workflow enforcement
- Agent workflow sequence validation

### Backend Services
<!-- BACKEND_SERVICES -->
<!-- UPDATE_TRIGGER: When new scanners or services are added -->
<!-- CONTENT: agentScanner.js, projectScanner.js, hooksScanner.js, etc. -->

**Core Scanner Modules:**
- `agentScanner.js` - System-wide agent discovery with enhanced deduplication and home directory inclusion
- `projectScanner.js` - CLAUDE.md file discovery and project metadata extraction
- `hooksScanner.js` - Hook configuration parsing supporting both legacy and modern formats
- `commandsScanner.js` - Slash command discovery and management
- `settingsManager.js` - Safe settings file read/write operations

**Frontend Services:**
- `cacheService.ts` - Client-side caching with TTL and version management
- `resourceLibraryService.ts` - Resource discovery API integration with deduplication

**GitOps Integration:**
- `.claude/hooks/pre-compact.py` - Enhanced with automated /docgit workflow invocation
  - **Automated Documentation**: Detects pending documentation changes and auto-invokes `/docgit`
  - **Workflow Integration**: Seamlessly integrates documentation and GitOps workflows
  - **Claude CLI Integration**: Uses Claude CLI to execute `/docgit` command automatically
  - **Error Handling**: Graceful fallback to manual workflow if automation fails
  - **Timeout Management**: 5-minute timeout for automated workflow execution
  - **Status Reporting**: Enhanced session documentation with automation status

**Scanner Architecture:**
- Stream-based scanning using async generators for memory efficiency
- Real-time Server-Sent Events streaming for immediate user feedback
- Configurable depth limits and directory filtering for performance optimization
- Error resilience with graceful handling of permissions issues
- AbortSignal support for user-triggered cancellation
- EventSource client integration with automatic fallback systems
- Progressive UI updates with live progress counters

**Caching Architecture:**
- Client-side localStorage caching with 24-hour TTL
- Version-aware cache invalidation with automatic cleanup
- Background refresh for stale data (5+ minutes old)
- Cache statistics and monitoring capabilities
- Memory-efficient cache management with size tracking

### Recent Bug Fixes and Improvements (August 2025)

<!-- BUG_FIXES_AUGUST_2025 -->
<!-- UPDATE_TRIGGER: When critical bug fixes are implemented -->
<!-- STATUS: COMPLETED - All fixes implemented and tested -->

**Fixed Agent Discovery Duplicate Detection:**
- **Issue**: Agents were appearing multiple times in API responses due to overlapping scan roots
- **Solution**: Implemented `deduplicateAgentFiles()` function in `agentScanner.js`
- **Technical Details**: Uses Set-based deduplication by file path to prevent duplicates
- **Impact**: Clean, unique agent lists without redundant entries

**Fixed Missing User-Level Agents:**
- **Issue**: User-level agents in `~/.claude/agents` were not being discovered
- **Solution**: Added home directory to scan roots in `server.js`
- **Technical Details**: Includes `os.homedir()` in the `potentialRoots` array for system-wide scanning
- **Impact**: Complete resource discovery across both user and project scopes

**Fixed Hook Discovery Issues:**
- **Issue**: Hooks array was empty despite settings files having `hasHooks: true`
- **Solution**: Enhanced `hooksScanner.js` to handle both legacy and modern hook formats
- **Technical Details**: 
  - Legacy format: `{ matcher: "pattern", hooks: [...] }`
  - Modern format: `{ hooks: [...] }` (without matcher field)
  - Fallback pattern generation: `hook-${index}` for configurations without matcher
- **Impact**: Robust hook discovery supporting all configuration variants

**Integrated react-md-editor:**
- **Enhancement**: Replaced basic textarea with full markdown editor in ProjectManager
- **Features**: Live preview, toolbar, proper markdown rendering
- **Technical Details**: Added `@uiw/react-md-editor` package with TypeScript support
- **Impact**: Professional CLAUDE.md editing experience with visual feedback

**Enhanced Documentation Manager Configuration:**
- **Enhancement**: Updated documentation-manager agent to maintain main README.md
- **Scope**: Includes feature sections, installation steps, architecture updates, troubleshooting
- **Technical Details**: Comprehensive instructions for README.md maintenance as part of documentation workflow

### Real-time Development Dashboard (August 2025)

<!-- DASHBOARD_ARCHITECTURE -->
<!-- UPDATE_TRIGGER: When dashboard features are enhanced or modified -->
<!-- STATUS: ACTIVE - SQLite persistence with conversation extraction -->

**Dashboard Architecture:**
- **Port**: 3002 (WebSocket + HTTP server)
- **Storage**: SQLite database at `.claude/cchorus.db`
- **Frontend**: `tools/dev-dashboard.html` with WebSocket client
- **Backend**: `tools/dashboard-server.js` with real-time updates

**Core Components:**
- **`tools/database-service.js`**: SQLite service layer for activities, sessions, conversations, and metrics
- **`tools/conversation-extractor.js`**: Claude conversation JSONL file processing and indexing
- **`tools/dashboard-server.js`**: WebSocket server with persistence and real-time broadcasting
- **`.claude/cchorus.db`**: SQLite database with comprehensive schema

**Recent Dashboard Enhancements (August 2025):**

**Session Tracking Fix:**
- **Issue**: Dashboard showed server uptime instead of actual Claude session time
- **Solution**: Integrated with `.claude/compact-tracking.json` to use actual Claude session IDs
- **Technical Details**: `getCurrentSessionId()` now extracts session ID from compaction events
- **Impact**: Accurate "time since last compaction" display instead of meaningless server uptime

**Activity Feed UI Enhancement:**
- **Issue**: Complex nested card layout caused visual inconsistency
- **Solution**: Unified activity item styling to match grouped summary format
- **Technical Details**: Simplified to clean single-line entries with agent name, description, and timestamp
- **Impact**: Consistent, professional activity feed display

**Agent Loading Enhancement:**
- **Issue**: Dashboard only showed 6 agents instead of all available agents
- **Solution**: Enhanced agent discovery to load from both project-level and user-level directories
- **Technical Details**: 
  - Project-level: `.claude/agents/` (8 agents)
  - User-level: `~/.claude/agents/` (2 agents)
  - Total: 10 agents correctly displayed
- **Impact**: Complete agent visibility for comprehensive monitoring

**SQLite Conversation Extraction - Duplicate Processing Fix `[COMPLETED ✅]`:**
- **Feature**: Integration with Claude conversation JSONL files with duplicate processing prevention
- **Database Schema**: Conversations, messages, search indexing, and processed_files tracking table
- **Fixed Issue**: Added processed_files table to track JSONL files that have been processed
- **Technical Implementation**: 
  - Modified `processAllConversations()` in conversation-extractor.js to check if files were already processed
  - Fixed `upsertConversation()` in database-service.js to update existing conversations instead of replacing them
  - Changed message insertion to use INSERT OR IGNORE to prevent foreign key constraint errors
- **Status**: Clean startup with no foreign key constraint errors (18 conversations, 4,805 messages, 186 activities)
- **Performance**: Optimized conversation loading by only processing new/modified conversation files

**Database Schema:**
```sql
-- Core tables
sessions: session_id, start_time, end_time, project_path, branch_context, status
activities: session_id, agent, description, files, timestamp
conversations: uuid, name, summary, created_at, updated_at, project_path
messages: conversation_id, content, sender, timestamp, tokens
metrics: session_id, metric_name, metric_value, metric_unit, agent, timestamp
```

**Troubleshooting Dashboard Issues:**
- **Foreign key constraint errors**: `[RESOLVED ✅]` - Fixed with processed_files table and duplicate processing prevention
- **Agent count mismatch**: Ensure both `.claude/agents/` and `~/.claude/agents/` directories are accessible
- **Session time incorrect**: Verify `.claude/compact-tracking.json` exists and is updated
- **WebSocket connection issues**: Check port 3002 availability and firewall settings
- **Database corruption**: Delete `.claude/cchorus.db` to rebuild (will lose historical data)
- **Impact**: Consistent, up-to-date project documentation across all files

### API Endpoint Improvements

**Enhanced `/api/agents/system` Endpoint:**
- Fixed duplicate agent responses through backend deduplication
- Added home directory scanning for complete user-level agent discovery
- Improved error handling for filesystem access issues
- Enhanced project context extraction for better resource organization

**Improved Hook Discovery Endpoints:**
- Updated hook parsing to handle configuration format variations
- Added validation for both legacy and modern hook structures
- Enhanced error reporting for malformed hook configurations
- Improved compatibility with existing settings files

### Streaming Implementation Architecture
<!-- STREAMING_ARCHITECTURE -->
<!-- UPDATE_TRIGGER: When streaming capabilities are enhanced -->
<!-- CONTENT: Server-Sent Events, EventSource, real-time discovery -->

**Real-time Project Discovery System:**

The CChorus streaming implementation transforms the user experience from batch-loading delays to immediate, progressive results using Server-Sent Events (SSE) technology.

**Technical Architecture:**
```typescript
// Backend: Express SSE endpoint
app.get('/api/projects/stream', async (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Stream projects as discovered
  for await (const projectData of scanClaudeProjects(scanRoots)) {
    res.write(`data: ${JSON.stringify({
      type: 'project_found',
      project: projectData,
      count: ++projectCount
    })}\n\n`);
  }
  
  res.write(`data: ${JSON.stringify({
    type: 'scan_complete',
    total: projectCount
  })}\n\n`);
});

// Frontend: EventSource client
const eventSource = new EventSource('/api/projects/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'project_found':
      setProjects(prev => [...prev, data.project]);
      setScanningMessage(`Found ${data.count} projects...`);
      break;
  }
};
```

**User Experience Benefits:**
- **Immediate Feedback**: Projects appear as soon as they're discovered, not after full scan completion
- **Live Progress**: Real-time counters show discovery progress ("Found X projects...")
- **Perceived Performance**: Same backend discovery speed, dramatically improved user experience
- **Cancellation Support**: Users can stop operations in progress via EventSource.close()
- **Resilient Fallback**: Automatic fallback to batch loading if streaming fails

**Technical Benefits:**
- **Memory Efficiency**: Streaming prevents large result set accumulation in memory
- **Network Optimization**: Progressive data transfer instead of single large response
- **User Control**: Client-side cancellation capability via EventSource management
- **Error Isolation**: Individual project errors don't halt entire discovery process
- **Connection Management**: Proper EventSource lifecycle with cleanup on component unmount

**Performance Optimizations:**
- **Scanner Enhancements**: Improved depth limits and directory filtering in `agentScanner.js` and `projectScanner.js`
- **Debug Logging Removal**: Eliminated verbose console output for production performance
- **Stream Processing**: Async generator patterns prevent blocking operations
- **Connection Reuse**: EventSource maintains persistent connection for entire discovery session

## 📦 Component Documentation

### Core Components

#### ResourceLibrary.tsx
<!-- COMPONENT_RESOURCE_LIBRARY -->
<!-- UPDATE_TRIGGER: When ResourceLibrary.tsx is modified -->
<!-- STATUS: COMPLETED - Full implementation with comprehensive features -->

**Purpose**: Unified interface for browsing all Claude Code resources with advanced filtering and selection capabilities

**Props Interface:**
```typescript
interface ResourceLibraryProps {
  onResourceSelect?: (resource: ResourceItem) => void;
  onResourceAssign?: (resource: ResourceItem) => void;
}
```

**Component Architecture:**
```typescript
// Core state management
const [resources, setResources] = useState<ResourceItem[]>([]);
const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
const [selectedType, setSelectedType] = useState<string>('all');
const [selectedScope, setSelectedScope] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState('');

// Resource type and scope configuration
const RESOURCE_TYPE_ICONS = {
  agent: Bot,
  command: Terminal, 
  hook: Webhook,
  project: FolderOpen,
  settings: Settings
};

const SCOPE_COLORS = {
  user: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  project: 'bg-green-500/10 text-green-700 dark:text-green-300',
  builtin: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  system: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
};
```

**Key Features:**
- **System-wide Resource Discovery**: Loads all resources using `ResourceLibraryService.loadAllResources()`
- **Advanced Filtering System**: Multi-dimensional filtering by type, scope, and search queries
- **Visual Resource Cards**: Rich cards with type icons, scope badges, status indicators, and project associations
- **Multi-select Interface**: Checkbox-based selection with bulk operations support
- **Real-time Status Indicators**: Active/inactive status with play/pause icons
- **Responsive Layout**: Two-column layout with sidebar filters and main grid
- **Loading and Error States**: Comprehensive error handling with retry capabilities

**Layout Structure:**
- **Header Section**: Title, description, bulk action buttons, search bar
- **Sidebar Filters**: Resource type counts, scope distribution, interactive filter buttons
- **Main Grid**: Responsive resource card grid with hover effects and selection states
- **Empty States**: Contextual messages for no results with suggested actions

**Integration Points:**
- **ResourceLibraryService**: Primary data source for all resource operations
- **AssignmentManager Integration**: Seamless navigation with resource pre-selection
- **Toast Notifications**: User feedback for operations using `useToast` hook
- **Theme System**: Full support for light/dark themes with CSS custom properties

**State Management:**
- **Local UI State**: Filters, search, selection, loading states managed locally 
- **Service Layer**: Data fetching, filtering, and caching handled by service layer
- **Effect-based Filtering**: Automatic filter application when criteria change
- **Selection Persistence**: Multi-select state maintained across filter changes

**Performance Optimizations:**
- **Resource Deduplication**: Prevents duplicate resources from appearing in UI
- **Lazy Loading**: Resources loaded on component mount with caching
- **Efficient Filtering**: Client-side filtering with optimized algorithms
- **Responsive Design**: Grid layout adapts to screen size with CSS Grid
- **Memoized Calculations**: Resource counts and filter results cached
- **Safe Icon Rendering**: Fallback icons prevent crashes when resource types are unknown

#### AssignmentManager.tsx
<!-- COMPONENT_ASSIGNMENT_MANAGER -->
<!-- UPDATE_TRIGGER: When AssignmentManager.tsx is modified -->
<!-- STATUS: COMPLETED - Full deployment system with API integration -->

**Purpose**: Comprehensive resource deployment and scope management with visual tracking and streamlined workflows

**Props Interface:**
```typescript
interface AssignmentManagerProps {
  selectedResource?: ResourceItem;
  onClose?: () => void;
}
```

**Component Architecture:**
```typescript
// Core state management
const [resources, setResources] = useState<ResourceItem[]>([]);
const [availableTargets, setAvailableTargets] = useState<Array<{scope: string; name: string; path?: string}>>([]);
const [deploymentStatus, setDeploymentStatus] = useState<{[resourceId: string]: any}>({});
const [activeAssignments, setActiveAssignments] = useState<AssignmentResult[]>([]);
const [selectedScope, setSelectedScope] = useState<string>('user');

// Assignment operation handler
const handleAssignResource = async (resource: ResourceItem, targetScope: string, targetPath?: string, operation: string = 'copy') => {
  const assignment: ResourceAssignment = {
    resourceId: resource.id,
    resourceType: resource.type as any,
    targetScope: targetScope as 'user' | 'project',
    targetProjectPath: targetPath,
    operation: operation as any
  };
  
  const result = await resourceService.assignResource(assignment);
  // Handle success/error with toast notifications
};
```

**Three Management Views:**

1. **User Level Tab (`TabsContent value="user"`):**
   - Overview card with user-level resource statistics
   - Resource breakdown by type (agents, commands, hooks, settings)
   - Direct assignment actions for deploying resources to user scope
   - Global resource management interface

2. **Projects Tab (`TabsContent value="projects"`):**
   - Grid of project overview cards with resource statistics
   - Per-project resource counts and deployment status
   - Project-specific resource management
   - Visual project cards with metadata display

3. **System Overview Tab (`TabsContent value="overview"`):**
   - Comprehensive system statistics across all resource types
   - Global resource distribution metrics
   - System-wide deployment health indicators

**Key Features:**
- **Dual Interface Modes**: 
  - Single resource assignment (when `selectedResource` provided)
  - Full assignment manager (when accessed directly)
- **Visual Status Tracking**: Real-time deployment indicators with success/failure states
- **Assignment Operations**: Complete copy/move workflows with validation
- **Target Management**: Dynamic target discovery and selection
- **History Tracking**: Recent assignment display with result indicators
- **Bulk Processing**: Support for multiple resource assignments

**Assignment Workflow Components:**
- **ResourceAssignmentCard**: Individual resource management interface
- **ScopeOverview**: Statistics and resource breakdown by scope
- **Target Selection**: Available deployment targets with metadata
- **Operation Buttons**: Copy/move actions with confirmation

**API Integration:**
```typescript
// Core service methods
ResourceLibraryService.assignResource(assignment: ResourceAssignment): Promise<AssignmentResult>
ResourceLibraryService.getDeploymentStatus(): Promise<{[resourceId: string]: DeploymentInfo[]}>
ResourceLibraryService.getAvailableTargets(): Promise<TargetInfo[]>
ResourceLibraryService.loadAllResources(): Promise<ResourceItem[]>
```

**Error Handling:**
- Comprehensive try-catch blocks for all API operations
- Toast notifications for success and failure states
- Detailed error messages with actionable information
- Graceful degradation for network or permission issues

**State Management:**
- **Local State**: UI interactions, tab selection, temporary assignment data
- **Service Integration**: Data fetching and resource operations through service layer
- **Real-time Updates**: Deployment status refreshed after operations
- **Assignment Tracking**: Recent assignments maintained for user feedback

#### CacheService.ts [NEW SERVICE]
<!-- COMPONENT_CACHE_SERVICE -->
<!-- UPDATE_TRIGGER: When CacheService.ts is modified -->
<!-- STATUS: COMPLETED - Full client-side caching implementation -->

**Purpose**: Client-side caching service providing instant loading with background refresh capabilities

**Cache Interface:**
```typescript
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export class CacheService {
  static set<T>(key: string, data: T, options?: Partial<CacheOptions>): void;
  static get<T>(key: string, options?: Partial<CacheOptions>): T | null;
  static isStale(key: string, refreshThresholdMs?: number): boolean;
  static remove(key: string): void;
  static clearAll(): void;
  static getStats(): CacheStats;
}
```

**Key Features:**
- **TTL Management**: 24-hour default TTL with customizable expiration
- **Version Control**: Version-aware cache invalidation for API changes
- **Stale Detection**: Automatic detection of stale data (5+ minutes old)
- **Background Refresh**: Smart background updates without blocking UI
- **Storage Management**: localStorage-based persistence with cleanup
- **Statistics**: Cache performance monitoring and size tracking
- **Error Resilience**: Graceful fallback when localStorage is unavailable

**Integration Points:**
- **ProjectManager**: Primary consumer for project data caching
- **ResourceLibrary**: Potential future integration for resource caching
- **Component State**: Seamless integration with React component lifecycle
- **Toast Notifications**: User feedback for cache operations

### Specialized Manager Components
<!-- COMPONENT_MANAGERS -->
<!-- UPDATE_TRIGGER: After feature/resource-managers branch -->
<!-- STATUS: PROJECT_MANAGER_COMPLETED_WITH_STREAMING - ProjectManager.tsx with SSE streaming -->

#### ProjectManager.tsx [COMPLETED WITH STREAMING]
<!-- COMPONENT_PROJECT_MANAGER -->
<!-- UPDATE_TRIGGER: When ProjectManager.tsx is modified -->
<!-- STATUS: COMPLETED WITH STREAMING - Full implementation with CLAUDE.md editing and real-time discovery -->

**Purpose**: Visual interface for managing Claude Code projects with comprehensive project discovery and CLAUDE.md editing capabilities

**Props Interface:**
```typescript
interface ProjectManagerProps {
  onProjectSelect?: (project: ClaudeProject) => void;
  onProjectEdit?: (project: ClaudeProject, content: string) => void;
}
```

**Component Architecture:**
```typescript
// Core state management
const [projects, setProjects] = useState<ClaudeProject[]>([]);
const [filteredProjects, setFilteredProjects] = useState<ClaudeProject[]>([]);
const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [editorContent, setEditorContent] = useState('');
const [originalContent, setOriginalContent] = useState('');
const [isEditing, setIsEditing] = useState(false);
const [isDirty, setIsDirty] = useState(false);

// Enhanced with caching state
const [loadedFromCache, setLoadedFromCache] = useState(false);
const [refreshing, setRefreshing] = useState(false);

// Project health assessment
const getProjectHealth = (project: ClaudeProject) => {
  let score = 0;
  if (project.hasAgents) score += 25;
  if (project.hasCommands) score += 25;
  if (project.isGitRepo) score += 25;
  if (project.description && project.description.length > 50) score += 25;
  // Returns health status and color coding
};
```

**Key Features:**
- **Intelligent Caching**: Client-side caching with instant loading and background refresh
- **Cache Management**: Visual cache status indicators and manual refresh controls
- **Real-time Project Discovery**: Uses `/api/projects/stream` Server-Sent Events for streaming project discovery
- **Live Progress Indicators**: "Found X projects..." counters update in real-time during scanning
- **Background Refresh**: Automatic background updates for stale cached data
- **Cancellable Operations**: Users can stop project discovery scans in progress
- **Fallback System**: Automatic fallback to batch loading if streaming fails
- **Dual View Modes**: Toggle between grid and list views with responsive layouts
- **Advanced Search and Filtering**: Real-time search across project names, paths, and descriptions
- **Project Health Assessment**: Visual health indicators based on multiple criteria
- **Built-in CLAUDE.md Editor**: Complete editor with save/cancel functionality
- **Template Generation**: Automatic template creation for projects without CLAUDE.md files
- **Change Detection**: Real-time tracking of unsaved changes with visual indicators
- **Responsive Design**: Split-pane layout adapting to different screen sizes

**CLAUDE.md Editor Features:**
- **Content Loading**: Loads existing CLAUDE.md content or generates templates
- **Live Editing**: Real-time content modification with immediate feedback
- **Save Operations**: Atomic save operations with automatic backup creation
- **Content Validation**: Ensures proper content structure and format
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Undo Functionality**: Cancel changes to revert to original content

**API Integration:**
```typescript
// Core API endpoints used
GET /api/projects/stream             // Real-time streaming project discovery
GET /api/projects/system             // Batch project discovery (fallback)
GET /api/projects/:path/claudemd     // Load CLAUDE.md content
PUT /api/projects/:path/claudemd     // Save CLAUDE.md content

// EventSource streaming implementation
const eventSource = new EventSource('http://localhost:3001/api/projects/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'project_found':
      // Add project to state in real-time
      setProjects(prev => [...prev, data.project]);
      setScanningMessage(`Found ${data.count} projects...`);
      break;
    case 'scan_complete':
      setLoading(false);
      break;
  }
};

// Project health data from ClaudeProject interface
interface ClaudeProject {
  name: string;           // Project name
  path: string;           // Full project path
  claudeMdPath: string;   // CLAUDE.md file path
  description: string;    // Project description
  lastModified: Date;     // Last modification time
  isGitRepo: boolean;     // Git repository status
  hasAgents: boolean;     // Agent presence
  hasCommands: boolean;   // Command presence
  agentCount: number;     // Number of agents
  commandCount: number;   // Number of commands
}
```

**Layout Structure:**
- **Projects List Panel**: Left panel with search, view mode toggle, cache controls, and project cards
- **Cache Status Section**: Visual indicators for cache status ("Cached", "Updating...") and manual refresh button
- **Editor Panel**: Right panel with CLAUDE.md editor and controls (shown when project selected)
- **Project Cards**: Rich cards displaying project metadata, health indicators, and resource counts
- **Editor Controls**: Save/cancel buttons, change indicators, and status feedback

**Error Handling:**
- **Loading Errors**: Graceful handling of project discovery failures
- **Content Errors**: CLAUDE.md loading/saving error management
- **Network Errors**: Backend connectivity error handling with retry options
- **File System Errors**: Permission and file access error handling

**Integration Points:**
- **Resource Library**: Project information used for resource filtering and association
- **Assignment Manager**: Project discovery shared with assignment target selection
- **Toast Notifications**: User feedback for all operations using `useToast` hook
- **Theme System**: Full support for light/dark themes with consistent styling

**Performance Optimizations:**
- **Intelligent Caching**: Client-side caching eliminates redundant API calls
- **Background Refresh**: Non-blocking updates when cache becomes stale
- **Efficient Filtering**: Client-side filtering with optimized search algorithms
- **Lazy Loading**: Content loaded only when projects are selected
- **Responsive Updates**: Smart state management to minimize unnecessary re-renders
- **Memory Management**: Proper cleanup of editor content, project data, and cache
- **EventSource Management**: Proper connection lifecycle with cleanup on unmount

*[Other managers to be implemented in future development phases]*

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
<!-- STATUS: COMPLETED - Full project discovery and management -->

**GET /api/projects/system**
- **Purpose**: System-wide discovery of all Claude Code projects (batch loading)
- **Implementation**: Uses `scanClaudeProjectsArray()` for comprehensive filesystem scanning
- **Returns**: Array of `ClaudeProject` objects with complete metadata
- **Response Format**:
```typescript
ClaudeProject {
  name: string;           // Project name extracted from directory
  path: string;           // Full project directory path
  claudeMdPath: string;   // Path to CLAUDE.md file
  description: string;    // Description from CLAUDE.md parsing
  lastModified: Date;     // File modification timestamp
  origin: string;         // Scan root where project was found
  relativePath: string;   // Relative path from scan origin
}
```

**GET /api/projects/stream** [NEW STREAMING ENDPOINT]
- **Purpose**: Real-time streaming discovery of Claude Code projects using Server-Sent Events
- **Technology**: EventSource/Server-Sent Events for real-time project discovery
- **Implementation**: Uses `scanClaudeProjects()` async generator for streaming results
- **Response Format**: Server-Sent Events stream with multiple event types:
```typescript
// Connection confirmation
{ type: 'connected', message: 'Stream started' }

// Scan initiation
{ type: 'scan_started', roots: string[], message: 'Scanning for projects...' }

// Individual project discovery
{ type: 'project_found', project: ClaudeProject, count: number }

// Project processing errors
{ type: 'project_error', path: string, error: string }

// Scan completion
{ type: 'scan_complete', total: number, message: 'Scan completed' }
```
- **User Experience**: Projects appear in real-time as discovered, with live progress counters
- **Performance**: Same backend discovery speed, dramatically improved perceived performance
- **Cancellation**: Supports client-side cancellation via EventSource.close()
- **Fallback**: Automatic fallback to batch loading if streaming fails

**GET /api/projects/:projectPath/info**
- **Purpose**: Detailed information about specific project
- **Security**: Path validation to prevent directory traversal
- **Implementation**: Uses `extractProjectInfo()` for metadata extraction
- **Returns**: Enhanced project metadata with resource analysis

**GET /api/projects/:projectPath/claude-md** [LEGACY ENDPOINT]
- **Purpose**: Retrieve CLAUDE.md content for editing (legacy hyphenated version)
- **Security**: Validates project path and file existence
- **Returns**: Raw file content as text
- **Error Handling**: 404 if CLAUDE.md not found, 403 for access violations

**PUT /api/projects/:projectPath/claude-md** [LEGACY ENDPOINT]
- **Purpose**: Update CLAUDE.md file content (legacy hyphenated version)
- **Body**: `{ content: string }`
- **Security**: Full path validation and write permission checks
- **Implementation**: Atomic file writes with backup on failure

**GET /api/projects/:projectPath/claudemd** [ACTIVE ENDPOINT]
- **Purpose**: Retrieve CLAUDE.md content for ProjectManager component (current implementation)
- **Security**: Path validation with decodeURIComponent for URL encoding
- **Implementation**: File existence checking with 404 handling for missing files
- **Returns**: `{ content: string }` for existing files, 404 status for missing files
- **Error Handling**: 404 if CLAUDE.md not found, 403 for access violations, 500 for read errors
- **Template Support**: ProjectManager handles missing files by generating default templates

**PUT /api/projects/:projectPath/claudemd** [ACTIVE ENDPOINT]
- **Purpose**: Update CLAUDE.md file content from ProjectManager editor
- **Body**: `{ content: string }` - Complete CLAUDE.md content
- **Security**: Full path validation with decodeURIComponent and write permission checks
- **Implementation**: Atomic file writes with proper directory creation and backup handling
- **Safety Features**: Creates parent directories if needed, handles file permissions
- **Integration**: Used by ProjectManager save functionality with comprehensive error handling

### Agents API
<!-- STATUS: COMPLETED - Full agent management with assignment support -->

**GET /api/agents/system**
- **Purpose**: System-wide agent discovery with comprehensive project context
- **Implementation**: Uses `scanSystemAgents()` with `scanAgentFilesArray()` scanner
- **Scope**: Scans entire home directory for maximum agent discovery
- **Returns**: Array of agents with enhanced metadata
- **Response Format**:
```typescript
SubAgent {
  name: string;           // Agent name from filename
  filePath: string;       // Full path to agent .md file
  content: string;        // Raw agent file content
  projectName: string;    // Associated project name
  projectPath: string;    // Project directory path
  sourceType: string;     // 'user' or 'project' scope
  relativePath: string;   // Relative path from scan origin
  // Plus parsed YAML frontmatter fields
}
```

**GET /api/agents/user**
- **Purpose**: User-level agents only (legacy endpoint)
- **Scope**: Limited to ~/.claude/agents directory
- **Returns**: Array of user-scope agents

**POST /api/agents/save**
- **Purpose**: Save agent to appropriate scope
- **Body**: Complete `SubAgent` object with scope information
- **Implementation**: Uses existing agent save logic with path resolution

**POST /api/agents/assign** (NEW)
- **Purpose**: Assign agent to target scope (copy/move operations)
- **Body**: Assignment configuration object
- **Parameters**:
```typescript
{
  name: string;              // Agent name
  description: string;       // Agent description
  tools: string[];          // Tool list
  color: string;            // Visual color
  prompt: string;           // Agent prompt content
  level: 'user' | 'project'; // Target scope
  operation: 'copy' | 'move'; // Assignment operation
  sourcePath?: string;       // Source file path (for move operations)
  targetProjectPath?: string; // Target project (for project-level assignments)
}
```
- **Operations**: 
  - **Copy**: Duplicates agent to target scope
  - **Move**: Relocates agent from source to target (deletes original)
- **Target Resolution**: Automatic target directory resolution based on scope
- **Error Handling**: Comprehensive validation and error reporting

**DELETE /api/agents/:name**
- **Purpose**: Delete agent by name and scope level
- **Query Parameters**: `level` (user/project)
- **Implementation**: Uses existing deletion logic with scope validation

### Commands API
<!-- STATUS: COMPLETED - Full command management with assignment support -->

**GET /api/commands/system**
- **Purpose**: System-wide slash command discovery
- **Implementation**: Uses `scanSlashCommands()` for comprehensive command scanning
- **Scope**: Discovers commands from user-level and all project settings files
- **Returns**: Array of `SlashCommand` objects with metadata
- **Response Format**:
```typescript
SlashCommand {
  id: string;             // Unique command identifier
  name: string;           // Command name (without slash)
  description: string;    // Command description
  command: string;        // Command execution string
  scope: string;          // 'user', 'project', or 'builtin'
  projectPath?: string;   // Project path (for project-scoped commands)
  projectName?: string;   // Project name
  path: string;          // Source file path
  lastModified: Date;    // File modification time
}
```

**GET /api/commands/builtin**
- **Purpose**: Discover built-in Claude Code commands
- **Implementation**: Uses `getBuiltInCommands()` for system command discovery
- **Returns**: Array of built-in command definitions

**POST /api/commands/save**
- **Purpose**: Save slash command to specified scope
- **Body**: Command data with scope and target information
- **Implementation**: Uses `saveSlashCommand()` with scope resolution

**POST /api/commands/assign** (NEW)
- **Purpose**: Assign command to target scope (copy/move operations)
- **Body**: Assignment configuration object
- **Parameters**:
```typescript
{
  id: string;                // Command ID
  name: string;              // Command name
  description?: string;      // Command description
  command: string;           // Command execution string
  scope: 'user' | 'project'; // Target scope
  operation: 'copy' | 'move'; // Assignment operation
  sourcePath?: string;       // Source file path (for move operations)
  targetProjectPath?: string; // Target project path
}
```
- **Operations**:
  - **Copy**: Duplicates command configuration to target scope
  - **Move**: Relocates command from source to target settings file
- **Settings Integration**: Updates appropriate settings.json files
- **Validation**: Uses `validateSlashCommand()` for input validation

**DELETE /api/commands/:commandId**
- **Purpose**: Delete command by ID
- **Query Parameters**: `commandPath` (required for security)
- **Security**: Path validation to prevent unauthorized deletions
- **Implementation**: Uses `deleteSlashCommand()` with safety checks

**GET /api/commands/file**
- **Purpose**: Read specific command file content
- **Query Parameters**: `path` (command file path)
- **Security**: Path validation for access control
- **Returns**: Raw file content for editing

**POST /api/commands/validate**
- **Purpose**: Validate command configuration
- **Body**: Command object to validate
- **Implementation**: Uses `validateSlashCommand()` for comprehensive validation
- **Returns**: Validation result with error details

### Hooks API
<!-- STATUS: COMPLETED - Full hook management with assignment support -->

**GET /api/hooks/system**
- **Purpose**: System-wide hook discovery from all settings files
- **Implementation**: Uses `scanHookConfigurations()` for comprehensive hook scanning
- **Scope**: Scans all user and project settings files for hook configurations
- **Returns**: Array of hook configurations with metadata
- **Response Format**:
```typescript
HookConfiguration {
  id: string;               // Unique hook identifier
  eventType: string;        // Hook event type (pre-compact, post-deploy, etc.)
  matcher: string;          // Pattern matcher for hook activation
  command: string;          // Command to execute
  enabled: boolean;         // Hook enabled/disabled state
  sourceType: string;       // 'user' or 'project' scope
  sourceFile: string;       // Source settings file path
  projectPath?: string;     // Project path (for project hooks)
  projectName?: string;     // Project name
  lastModified: Date;       // File modification time
}
```

**GET /api/hooks/templates**
- **Purpose**: Get available hook templates for common scenarios
- **Implementation**: Uses `createHookTemplate()` for template generation
- **Returns**: Array of pre-configured hook templates

**POST /api/hooks/create**
- **Purpose**: Create new hook in specified settings file
- **Body**: Hook configuration object with target scope
- **Implementation**: Uses `updateSettingsHooks()` for safe settings modification
- **Validation**: Uses `validateHookConfiguration()` for input validation

**POST /api/hooks/assign** (NEW)
- **Purpose**: Assign hook to target scope (copy/move operations)
- **Body**: Assignment configuration object
- **Parameters**:
```typescript
{
  eventType: string;         // Hook event type
  matcher: string;           // Pattern matcher
  command: string;           // Command to execute
  enabled: boolean;          // Hook enabled state
  targetScope: 'user' | 'project'; // Target scope
  operation: 'copy' | 'move'; // Assignment operation
  targetProjectPath?: string; // Target project path
}
```
- **Operations**:
  - **Copy**: Duplicates hook configuration to target settings file
  - **Move**: Relocates hook from source to target settings (removes from source)
- **Settings Management**: Safe modification of settings.json files with backup
- **Validation**: Comprehensive hook configuration validation

**PUT /api/hooks/settings**
- **Purpose**: Update complete hooks configuration in settings file
- **Body**: Complete hooks configuration object
- **Implementation**: Uses `updateSettingsHooks()` with atomic file operations
- **Security**: Settings file validation and backup creation

**GET /api/hooks/settings**
- **Purpose**: Read hooks configuration from specific settings file
- **Query Parameters**: `filePath` (settings file path)
- **Implementation**: Uses `readSettingsFile()` with error handling
- **Returns**: Hooks section from settings file

**POST /api/hooks/validate**
- **Purpose**: Validate hook configuration
- **Body**: Hook configuration object
- **Implementation**: Uses `validateHookConfiguration()` for validation
- **Returns**: Validation result with detailed error information

### Settings API
<!-- STATUS: COMPLETED - Full settings management with assignment support -->

**GET /api/settings/effective**
- **Purpose**: Get effective settings with complete source hierarchy
- **Query Parameters**: `projectPath` (optional - for project-specific settings)
- **Implementation**: Uses `SettingsManager` for safe settings resolution
- **Returns**: Merged settings with source information
- **Response Format**:
```typescript
EffectiveSettings {
  merged: object;           // Final merged settings
  sources: {
    user?: {
      path: string;         // User settings file path
      exists: boolean;      // File existence flag
      settings: object;     // User settings content
      lastModified: Date;   // File modification time
    };
    project?: {            // Same structure for project settings
      path: string;
      exists: boolean;
      settings: object;
      lastModified: Date;
    };
    local?: {              // Same structure for local settings
      path: string;
      exists: boolean;
      settings: object;
      lastModified: Date;
    };
  };
}
```

**GET /api/settings/file**
- **Purpose**: Read specific settings file content
- **Query Parameters**: `filePath` (settings file path)
- **Security**: Path validation to prevent unauthorized file access
- **Implementation**: Uses `readSettingsFile()` with error handling
- **Returns**: Raw settings file content as JSON object

**POST /api/settings/assign** (NEW)
- **Purpose**: Assign settings to target scope (copy/move operations)
- **Body**: Assignment configuration object
- **Parameters**:
```typescript
{
  sourceType: 'user' | 'project' | 'local'; // Source settings type
  sourceProjectPath?: string;  // Source project path (if applicable)
  targetScope: 'user' | 'project'; // Target scope
  targetProjectPath?: string;  // Target project path
  operation: 'copy' | 'move';  // Assignment operation
  settings: object;            // Settings content to assign
}
```
- **Operations**:
  - **Copy**: Duplicates settings to target scope
  - **Move**: Relocates settings from source to target (removes from source)
- **Implementation**: Uses `SettingsManager` for safe settings operations
- **Validation**: Settings format validation and conflict resolution

**PUT /api/settings/file**
- **Purpose**: Update settings file content
- **Body**: Settings update object
- **Parameters**:
```typescript
{
  content: object;          // Settings content
  filePath: string;         // Target settings file path
}
```
- **Security**: Path validation and write permission checks
- **Implementation**: Uses `SettingsManager.updateSettings()` for atomic operations
- **Safety**: Automatic backup creation before modifications

**GET /api/settings/schema**
- **Purpose**: Get settings schema for validation
- **Returns**: JSON schema for settings file validation
- **Use Case**: Frontend validation and form generation

**POST /api/settings/validate**
- **Purpose**: Validate settings configuration
- **Body**: Settings object to validate
- **Returns**: Validation result with error details
- **Implementation**: Schema-based validation with detailed error reporting

### Resource Management APIs
<!-- API_RESOURCE_MANAGEMENT -->
<!-- UPDATE_TRIGGER: After feature/assignment-engine branch -->
<!-- STATUS: COMPLETED - Full assignment engine implemented -->

**Assignment Operations**
Resource assignment operations are handled through type-specific endpoints:

**POST /api/agents/assign**
- **Purpose**: Assign agent to target scope
- **Implementation**: Complete agent deployment with YAML frontmatter handling
- **Operations**: Copy/move agents between user and project scopes
- **Validation**: Agent format validation and target scope verification

**POST /api/commands/assign**
- **Purpose**: Assign slash command to target scope
- **Implementation**: Command deployment to settings files
- **Operations**: Copy/move commands with settings file integration
- **Validation**: Command syntax validation and conflict detection

**POST /api/hooks/assign**
- **Purpose**: Assign hook configuration to target scope
- **Implementation**: Hook deployment to settings files
- **Operations**: Copy/move hooks with settings file modification
- **Validation**: Hook configuration validation and event type verification

**POST /api/settings/assign**
- **Purpose**: Assign settings configuration to target scope
- **Implementation**: Settings file deployment and merging
- **Operations**: Copy/move settings with conflict resolution
- **Validation**: Settings schema validation and compatibility checks

**Deployment Status and Tracking**

**Resource Discovery Integration**
- **System Scanning**: All assignment endpoints integrate with discovery scanners
- **Real-time Status**: Assignment operations update deployment status immediately
- **Cross-scope Visibility**: Assignments visible across user and project scopes

**Assignment Result Format**
```typescript
AssignmentResult {
  success: boolean;         // Assignment operation success
  resourceId: string;       // Resource identifier
  operation: string;        // 'copy' or 'move'
  targetScope: string;      // Target deployment scope
  targetPath?: string;      // Target file path (if applicable)
  error?: string;          // Error message (if failed)
}
```

**Error Handling and Recovery**
- **Validation Errors**: Pre-operation validation with detailed error messages
- **Permission Errors**: File system permission handling with recovery suggestions
- **Conflict Resolution**: Automatic handling of naming conflicts and overwrites
- **Rollback Support**: Failed operations cleaned up automatically
- **Atomic Operations**: All assignments complete fully or rollback completely

## 🚀 Development Workflow

<!-- DEVELOPMENT_WORKFLOW -->
<!-- CONTENT: Setup instructions, branch strategy, testing approach -->

### Setting Up Development Environment
<!-- DEV_SETUP -->
<!-- STEPS: npm install, VS Code auto-start, manual fallbacks -->

```bash
# Clone repository
git clone <repository-url>
cd CChorus

# Install dependencies
npm install

# PREFERRED: Open in VS Code (auto-starts servers)
code .
# Servers automatically start in visible terminal tabs when folder opens
# Frontend (port 5173) and Backend (port 3001) via .vscode/tasks.json

# MANUAL FALLBACK: If VS Code auto-start doesn't work
# Use Cmd+Shift+P → "Tasks: Run Task" → "Start Frontend" or "Start Backend"
# OR run directly:
npm run dev       # Frontend only (port 5173)
npm run dev:server # Backend only (port 3001)

# DEPRECATED: tmux-dev commands no longer used
# /tmux-dev start both frontend and backend  ❌ (removed)
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
<!-- COMPLETION_DATE: 2025-07-31 -->

**Completed Components:**
- ✅ ResourceLibrary.tsx - Complete unified resource browsing interface
- ✅ AssignmentManager.tsx - Full deployment and scope management system
- ✅ ResourceLibraryService.ts - Comprehensive API integration service layer
- ✅ Main App.tsx navigation - Tabbed interface with seamless cross-navigation
- ✅ Backend scanner infrastructure - System-wide resource discovery
- ✅ Complete API endpoints - All resource types with assignment support

**Completed Backend Services:**
- ✅ agentScanner.js - System-wide agent discovery with project context
- ✅ projectScanner.js - CLAUDE.md project discovery and metadata extraction with streaming support
- ✅ hooksScanner.js - Hook configuration parsing from settings files
- ✅ commandsScanner.js - Slash command discovery and management
- ✅ settingsManager.js - Safe settings file operations with backup

**Completed Frontend Services:**
- ✅ cacheService.ts - Client-side caching with TTL and version management
- ✅ resourceLibraryService.ts - Enhanced with resource deduplication and error handling

**Completed Automation:**
- ✅ .claude/hooks/pre-compact.py - Enhanced with automated /docgit workflow invocation

**Completed API Endpoints:**
- ✅ GET /api/agents/system - System-wide agent discovery
- ✅ POST /api/agents/assign - Agent assignment operations
- ✅ GET /api/commands/system - Command discovery with built-in support
- ✅ POST /api/commands/assign - Command assignment operations
- ✅ GET /api/hooks/system - Hook discovery from settings files
- ✅ POST /api/hooks/assign - Hook assignment operations
- ✅ GET /api/settings/effective - Merged settings with source tracking
- ✅ POST /api/settings/assign - Settings assignment operations
- ✅ GET /api/projects/system - Project discovery with metadata

**Integration Features:**
- ✅ Cross-component navigation (Resource Library ↔ Assignment Manager)
- ✅ Resource pre-selection for streamlined assignment workflows
- ✅ Toast notifications for all operations with detailed feedback
- ✅ Theme system integration with light/dark mode support
- ✅ Responsive design for desktop, tablet, and mobile devices
- ✅ Comprehensive error handling with user-friendly messages

**Status:** Production-ready with comprehensive testing completed

### Phase 2: Resource Managers [PARTIALLY COMPLETED]
<!-- PHASE_2_STATUS -->
<!-- UPDATE_TRIGGER: During feature/resource-managers branch -->
<!-- COMPLETION_DATE: 2025-08-01 - Project Manager completed; others integrated through Assignment Manager -->

**Project Manager - Enhanced with Streaming & Caching [COMPLETED]:**
- ✅ **ProjectManager.tsx**: Complete standalone project management interface with intelligent caching
- ✅ **Intelligent Caching**: Client-side caching with instant loading and background refresh
- ✅ **Server-Sent Events**: Real-time streaming project discovery with live progress updates
- ✅ **Cache Management**: Visual cache status indicators and manual refresh controls
- ✅ **System-wide Project Discovery**: Comprehensive scanning across entire home directory
- ✅ **CLAUDE.md Editor**: Built-in editor with template generation and content management
- ✅ **Project Health Assessment**: Visual indicators based on Git status, agents, commands, and documentation
- ✅ **Search and Filtering**: Real-time project search with advanced filtering capabilities
- ✅ **Responsive Design**: Grid/list view modes with split-pane editor layout
- ✅ **API Integration**: Complete backend integration with `/api/projects/*` endpoints
- ✅ **Performance Optimization**: Background refresh and cache-first loading for optimal UX

**Other Resource Managers - Assignment Manager Integration:**
- ✅ Hook Management - Hook assignment, deployment, and settings file integration
- ✅ Command Management - Slash command assignment and configuration management
- ✅ Settings Management - Settings file assignment and scope management

**Implementation Approach:**
Phase 2 was implemented using a hybrid approach:
- **Standalone Project Manager**: Dedicated component for comprehensive project management
- **Unified Assignment Interface**: Single interface handles resource deployment and management
- **Type-Specific Logic**: Backend APIs provide specialized handling per resource type
- **Scope-based Management**: Tabbed interface separates user-level and project-level management
- **Resource-Specific Actions**: Assignment cards adapt to resource type capabilities

**Specialized Features by Resource Type:**

**Project Management [ENHANCED WITH DEDICATED COMPONENT]:**
- **Complete Standalone Interface**: Dedicated ProjectManager component with full project lifecycle management
- **Advanced Project Discovery**: System-wide scanning with comprehensive metadata extraction
- **Built-in CLAUDE.md Editor**: Visual editor with template generation, save/cancel functionality, and change tracking
- **Project Health Assessment**: Visual health indicators based on multiple criteria (Git, agents, commands, documentation)
- **Dual View Modes**: Grid and list views with responsive design and search capabilities
- **Resource Integration**: Seamless integration with Assignment Manager for resource deployment to projects
- **API Backend**: Complete REST API for project operations (`/api/projects/*` endpoints)

**Hook Management:**
- Hook discovery from all settings files (user and project)
- Visual hook configuration with event type and matcher display
- Hook assignment between settings files
- Hook validation and template support

**Command Management:**
- System-wide command discovery including built-ins
- Slash command assignment between settings files
- Command validation and conflict detection
- Built-in command integration and discovery

**Settings Management:**
- Settings hierarchy visualization (user → project → local)
- Effective settings calculation with source tracking
- Settings assignment and merging capabilities
- Safe settings file modification with backup

**Status:** Fully integrated and production-ready with advanced caching and streaming capabilities

### Phase 3: Assignment Engine [COMPLETED]
<!-- PHASE_3_STATUS -->
<!-- UPDATE_TRIGGER: During feature/assignment-engine branch -->
<!-- COMPLETION_DATE: 2025-07-31 - Full assignment system implemented -->

**Completed Assignment Operations:**
- ✅ Complete resource assignment logic for all resource types
- ✅ Copy operations - Safe resource duplication between scopes
- ✅ Move operations - Resource relocation with source cleanup
- ✅ Target validation - Scope compatibility and permission checking
- ✅ Conflict detection - Automatic handling of naming conflicts
- ✅ Atomic operations - Full completion or complete rollback

**Completed Status Tracking:**
- ✅ Real-time deployment status indicators
- ✅ Visual assignment feedback with success/failure states
- ✅ Assignment history tracking with recent operations display
- ✅ Cross-scope deployment visibility
- ✅ Resource status indicators (active/inactive) with visual cues

**Completed Batch Operations:**
- ✅ Multi-resource selection with checkbox interface
- ✅ Bulk assignment operations for selected resources
- ✅ Batch status tracking with individual result reporting
- ✅ Selective batch processing with individual success/failure handling

**Assignment Engine Architecture:**

**ResourceLibraryService Assignment Methods:**
```typescript
// Core assignment interface
async assignResource(assignment: ResourceAssignment): Promise<AssignmentResult>

// Type-specific assignment handlers
private async assignAgent(resourceId, targetScope, targetPath, operation)
private async assignCommand(resourceId, targetScope, targetPath, operation)
private async assignHook(resourceId, targetScope, targetPath, operation)
private async assignSettings(resourceId, targetScope, targetPath, operation)
```

**Backend API Assignment Endpoints:**
- POST /api/agents/assign - Agent-specific assignment logic
- POST /api/commands/assign - Command assignment to settings files
- POST /api/hooks/assign - Hook assignment with settings integration
- POST /api/settings/assign - Settings file assignment and merging

**Error Handling and Recovery:**
- Comprehensive validation before operations
- Detailed error messages with actionable information
- Automatic cleanup of failed operations
- Permission and filesystem error handling
- Network error recovery with retry capabilities

**Conflict Resolution:**
- Automatic detection of naming conflicts
- Smart conflict resolution strategies per resource type
- User notification of conflicts with resolution options
- Safe overwrite handling with backup creation

**Status:** Production-ready with comprehensive error handling

### Phase 4: Integration & Polish [COMPLETED]
<!-- PHASE_4_STATUS -->
<!-- UPDATE_TRIGGER: During feature/integration-polish branch -->
<!-- COMPLETION_DATE: 2025-07-31 - Full integration and polish completed -->

**Completed Cross-Navigation:**
- ✅ Seamless navigation between Resource Library and Assignment Manager
- ✅ Resource pre-selection for streamlined assignment workflows
- ✅ Context preservation across navigation (selected resources, filters)
- ✅ Breadcrumb navigation with clear user flow indicators
- ✅ URL state management for bookmarkable views

**Completed Enhanced UX:**
- ✅ Comprehensive loading states with progress indicators
- ✅ Detailed error handling with user-friendly messages
- ✅ Toast notifications for all operations with contextual information
- ✅ Empty states with helpful guidance and suggested actions
- ✅ Progressive disclosure of complex features

**Completed Responsive Design:**
- ✅ Mobile-first responsive design with adaptive layouts
- ✅ Touch-friendly interface elements for mobile devices
- ✅ Responsive grid layouts that adapt to screen size
- ✅ Optimized navigation for small screens
- ✅ Tablet-specific layouts with enhanced usability

**Completed Accessibility:**
- ✅ Full keyboard navigation support
- ✅ ARIA labels and semantic HTML structure
- ✅ Screen reader compatibility with Radix UI primitives
- ✅ High contrast theme support with CSS custom properties
- ✅ Focus management and visual focus indicators

**Completed Performance Optimizations:**
- ✅ Efficient resource filtering with client-side caching
- ✅ Lazy loading of resource data with progressive enhancement
- ✅ Optimized re-renders with React hooks and state management
- ✅ Responsive image handling and icon optimization
- ✅ Bundle optimization with Vite build system

**Completed Integration Features:**
- ✅ Theme system integration with persistent storage
- ✅ Keyboard shortcuts (Ctrl/Cmd + T for theme toggle)
- ✅ Component reusability with shadcn/ui library
- ✅ Consistent design system across all interfaces
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

**Polish and Quality Improvements:**
- ✅ Consistent error messaging with actionable solutions
- ✅ Visual feedback for all user interactions
- ✅ Loading state management with skeleton screens
- ✅ Smooth transitions and animations
- ✅ Professional color scheme with muted tag colors
- ✅ Icon consistency using Lucide React icon library

**Status:** Production-ready with professional polish and comprehensive testing

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