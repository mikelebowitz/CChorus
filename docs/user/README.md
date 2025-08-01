# CChorus User Guide

<!-- STATUS_TRACKER -->
<!-- Features: Resource Library [COMPLETED], Assignment Manager [COMPLETED], Project Manager [COMPLETED WITH STREAMING + CACHING + PREFERENCES + BUG FIXES], Hooks Manager [PENDING], Commands Manager [PENDING], Settings Manager [PENDING] -->
<!-- LAST_UPDATED: 2025-08-01 - Major bug fixes: duplicate detection, missing user agents, hook discovery issues, enhanced markdown editing -->

## 🚀 Quick Start

<!-- QUICK_START_SECTION -->
<!-- UPDATE_TRIGGER: After Phase 1 completion -->
<!-- LAST_UPDATED: 2025-07-31 - Phase 1 completed -->

CChorus is a comprehensive management platform for Claude Code resources that provides unified access to agents, commands, hooks, settings, and projects across your entire system.

### Installation & Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd CChorus
npm install

# Start both frontend and backend (required)
npm run dev:full

# OR start individually:
npm run dev       # Frontend only (port 5173)
npm run dev:server # Backend only (port 3001)
```

### First Time Access

1. **Navigate to CChorus**: Open `http://localhost:5173` in your browser
2. **Projects View**: CChorus now opens directly to the Projects tab by default
3. **Instant Loading**: Projects load instantly from cache with background refresh when needed
4. **Real-time Discovery**: Watch projects appear live as they're discovered across your system
5. **Live Progress**: See "Found X projects..." counter update in real-time during scanning
6. **Smart Caching**: Subsequent loads are instantaneous with automatic background updates
7. **Explore**: Browse all tabs to discover your complete Claude Code ecosystem

### Navigation Overview

CChorus features four main sections:
- **Projects**: Real-time project discovery with CLAUDE.md editing (default view)
- **Resource Library**: Discover and browse all Claude Code resources
- **Assignment Manager**: Deploy resources between user and project scopes
- **Agents (Legacy)**: Traditional agent editor interface

## 📚 Features Overview

### Resource Library
<!-- FEATURE_RESOURCE_LIBRARY -->
<!-- UPDATE_TRIGGER: When ResourceLibrary.tsx is modified -->
<!-- STATUS: COMPLETED - Full implementation with API integration -->

The Resource Library provides a unified view of all your Claude Code resources across your system with powerful discovery and management capabilities.

**Core Features:**
- **Universal Discovery**: System-wide scanning finds all agents, hooks, commands, settings, and projects
- **Enhanced Reliability**: Fixed duplicate detection and missing user-level resource issues  
- **Advanced Filtering**: Multi-dimensional filtering by resource type, scope, and search queries
- **Visual Organization**: Clean card-based interface with status indicators and project associations
- **Bulk Selection**: Multi-select resources with checkboxes for batch operations
- **Real-time Status**: Live indicators show which resources are active and deployed
- **Cross-Scope Visibility**: See resources across user-level (global) and project-level scopes

**Resource Types Supported:**
- **Agents**: Claude Code sub-agents with specialized prompts and tool configurations
- **Commands**: Slash commands for enhanced workflows and automation
- **Hooks**: Event-driven automation scripts (pre-compact, post-deploy, etc.)
- **Projects**: Claude Code projects identified by CLAUDE.md files
- **Settings**: Configuration files including user, project, and local settings

**Smart Filtering System:**
- **Type Filters**: Focus on specific resource types with count indicators
- **Scope Filters**: Filter by user (global), project-specific, builtin, or system resources
- **Text Search**: Search across names, descriptions, and project associations
- **Combined Filtering**: Stack multiple filters for precise resource discovery

**Key Benefits:**
- **Comprehensive Discovery**: Never lose track of resources across multiple projects
- **Efficient Organization**: Understand your complete Claude Code ecosystem at a glance
- **Quick Access**: Find the right resource for any task with powerful search and filtering
- **Batch Management**: Select and assign multiple related resources simultaneously

### Recent Improvements (August 2025)

**Enhanced Discovery Reliability:**
- **No More Duplicates**: Fixed issue where agents appeared multiple times in the resource list
- **Complete Coverage**: User-level agents in `~/.claude/agents` are now properly discovered
- **Robust Hook Detection**: Support for both old and new hook configuration formats

**Improved User Experience:**  
- **Better Error Handling**: Clearer error messages when resources can't be loaded
- **Faster Loading**: Enhanced deduplication improves resource loading performance
- **Consistent Results**: Reliable discovery across different project structures

### Assignment Manager  
<!-- FEATURE_ASSIGNMENT_MANAGER -->
<!-- UPDATE_TRIGGER: When AssignmentManager.tsx is modified -->
<!-- STATUS: COMPLETED - Full deployment and tracking system -->

The Assignment Manager provides comprehensive resource deployment and scope management with visual tracking and streamlined workflows.

**Core Capabilities:**
- **Scope-based Deployment**: Deploy resources to user level (global) or specific projects
- **Operation Types**: Copy resources (duplicate) or move resources (relocate)
- **Visual Deployment Tracking**: Real-time status indicators showing active deployments
- **Target Selection**: Choose from available user and project scopes with validation
- **Assignment History**: Track recent assignments with success/failure indicators
- **Bulk Operations**: Process multiple resources in a single deployment workflow

**Three Management Views:**

1. **User Level Tab**
   - Overview of all user-level (global) resources
   - Resource count breakdown by type (agents, commands, hooks, settings)
   - Direct management of global resource assignments
   - Deploy project resources to user level for system-wide availability

2. **Projects Tab**
   - Grid view of all discovered Claude Code projects
   - Per-project resource statistics and active deployment counts
   - Project-specific resource management and assignments
   - Visual project cards with metadata and resource summaries

3. **System Overview Tab**
   - Comprehensive statistics across all resource types
   - System-wide resource distribution charts
   - Global deployment status and health indicators
   - High-level insights into your Claude Code ecosystem

**Assignment Workflows:**
- **Direct Assignment**: From Resource Library, click copy icon to start assignment
- **Target Selection**: Choose specific project or user-level deployment
- **Operation Choice**: Select copy (safe duplication) or move (relocation)
- **Validation**: System validates target compatibility and permissions
- **Execution**: Real-time deployment with progress feedback
- **Verification**: Confirm successful deployment with visual indicators

**Deployment Operations:**
- **Copy Operations**: Create duplicates while preserving source resources
- **Move Operations**: Relocate resources between scopes (removes from source)
- **Conflict Detection**: Identify and resolve naming conflicts automatically
- **Permission Validation**: Ensure write access to target directories
- **Rollback Support**: Undo failed operations with error recovery

**Key Benefits:**
- **Safe Experimentation**: Copy resources to test configurations without affecting originals
- **Standardization**: Deploy proven resources across multiple projects
- **Organization**: Maintain clean separation between global and project-specific resources
- **Visibility**: Understand where resources are deployed and their status
- **Efficiency**: Batch operations streamline bulk resource management

### Project Manager
<!-- FEATURE_PROJECT_MANAGER -->
<!-- UPDATE_TRIGGER: When ProjectManager.tsx is created/modified -->
<!-- STATUS: COMPLETED WITH STREAMING + CACHING - Full project management with CLAUDE.md editing, real-time streaming, and intelligent caching -->

**Purpose**: Advanced visual interface for managing Claude Code projects with comprehensive discovery, real-time streaming, intelligent caching, project preferences, and CLAUDE.md editing capabilities.

**Core Features:**
- **Intelligent Caching System**: Instant project loading with smart background refresh and cache status indicators
- **Real-time Streaming Discovery**: Server-Sent Events provide live project discovery with immediate UI updates and progress tracking
- **Background Refresh**: Automatic background updates when cache becomes stale (5+ minutes old) with visual indicators
- **Project Preferences System**: Archive, hide, and favorite projects with client-side persistence and filtering support
- **Advanced Status Filtering**: Filter projects by active/archived/hidden/favorited status with visual status badges
- **System-wide Project Discovery**: Automatically scans entire system to find all projects with CLAUDE.md files
- **Advanced Project Search**: Search and filter projects by name, path, or description with real-time filtering
- **Dual View Modes**: Toggle between grid and list views for optimal project browsing experience
- **Project Health Indicators**: Visual indicators showing project status based on Git repo status, agents, commands, and documentation quality
- **Visual CLAUDE.md Editor**: Built-in editor with save/cancel functionality and automatic backup system
- **Template Generation**: Automatically creates CLAUDE.md templates for projects without existing files
- **Responsive Design**: Split-pane layout adapts to screen size with project list and editor panel
- **Real-time Content Management**: Live editing with unsaved changes indicators and validation
- **Performance Optimization**: Cached projects load instantly while fresh data streams in background
- **Project Organization**: Archive completed projects, hide experimental ones, favorite frequently used projects

**Project Health Assessment:**
- **Healthy**: Projects with comprehensive setup (Git repo, agents, commands, detailed documentation)
- **Good**: Projects with solid foundation and most essential components
- **Fair**: Basic projects with some components but room for improvement
- **Needs Attention**: Projects requiring setup or additional resources

**CLAUDE.md Editor Features:**
- **Template Generation**: Creates structured templates for new CLAUDE.md files
- **Live Editing**: Real-time content editing with immediate feedback
- **Change Detection**: Visual indicators for unsaved changes
- **Automatic Backup**: Safe file operations with backup creation before saves
- **Content Validation**: Ensures proper file format and content structure
- **Preview Mode**: Read-only preview with formatted display

### Resource Managers
<!-- FEATURE_RESOURCE_MANAGERS -->
<!-- UPDATE_TRIGGER: When specialized manager components are implemented -->
<!-- STATUS: PARTIALLY COMPLETED - Project Manager implemented, others pending -->

**Project Manager** [COMPLETED WITH STREAMING + PREFERENCES + ENHANCED EDITING]:
- **Real-time Streaming Discovery**: Server-Sent Events provide live project discovery with immediate UI updates
- **Intelligent Caching System**: Instant loading from cache with automatic background refresh
- **Visual Project Interface**: Complete project discovery and management with preferences support
- **Enhanced Markdown Editor**: Professional react-md-editor with live preview, toolbar, and rich formatting
- **Visual CLAUDE.md Editing**: Full WYSIWYG editing experience with split-view preview and markdown shortcuts
- **Project Preferences**: Archive, hide, and favorite projects with localStorage persistence
- **Advanced Filtering**: Filter by status (active/archived/hidden/favorited) with search capabilities
- **Project Health Assessment**: Visual indicators with filtering support for project completeness
- **Dual View Modes**: Grid and list views with responsive design
- **Template Generation**: Automatic CLAUDE.md template creation for projects without existing files
- **System-wide Discovery**: Comprehensive project scanning with real-time progress feedback

*[Remaining managers to be implemented in future development phases]*

Specialized interfaces for managing each resource type:

- **Hooks Manager**: Visual interface for configuring Claude Code hooks
- **Commands Manager**: Create and edit slash commands with YAML frontmatter
- **Settings Manager**: Manage settings file hierarchy and JSON configuration

## 🔄 Common Workflows

### Discovering Resources
<!-- WORKFLOW_DISCOVERY -->
<!-- SCREENSHOT: resource-library-overview.png -->
<!-- STATUS: COMPLETED - Full workflow implemented -->

1. **Open Resource Library**: Click the "Resource Library" tab in the main navigation
2. **Initial System Scan**: Allow the comprehensive system scan to complete (scans all projects)
3. **Browse Resource Grid**: View all discovered resources in the main grid area
4. **Apply Filters**: Use the left sidebar to filter by:
   - **Resource Type**: All, Agent, Command, Hook, Project, Settings (with counts)
   - **Scope**: All, User, Project, Builtin, System (showing deployment levels)
5. **Search Resources**: Use the top search bar to find resources by name, description, or project
6. **Multi-Select**: Use checkboxes to select individual or multiple resources
7. **Preview Details**: Click any resource card to see:
   - Resource type and status indicators
   - Scope badges (user/project/builtin/system)
   - Project associations and file paths
   - Active/inactive status with visual indicators
8. **Bulk Actions**: When multiple resources selected, use "Assign Selected Resources" button

**Advanced Discovery Techniques:**
- **Scope Exploration**: Switch between scopes to understand resource distribution
- **Type-Specific Browsing**: Filter by specific types to focus on agents, commands, etc.
- **Project Association**: Use project name badges to find project-specific resources
- **Status Filtering**: Look for active vs inactive resources using status indicators

### Assigning Resources
<!-- WORKFLOW_ASSIGNMENT -->
<!-- SCREENSHOT: assignment-manager-deploy.png -->
<!-- STATUS: COMPLETED - Full assignment workflow with API integration -->

**Method 1: Direct Assignment from Resource Library**
1. **Select Resource**: From the Resource Library, click the copy icon (📋) on any resource card
2. **Automatic Navigation**: System automatically switches to Assignment Manager with resource pre-selected
3. **Choose Target Scope**: Select from available targets:
   - **User Level (Global)**: Deploy for system-wide availability
   - **Specific Projects**: Deploy to individual project .claude directories
4. **Select Operation**:
   - **Copy**: Create duplicate while keeping original (safe for experimentation)
   - **Move**: Relocate resource from source to target (removes from original location)
5. **Execute Assignment**: Click appropriate action button to start deployment
6. **Verify Results**: Check for success notification and updated deployment status

**Method 2: Bulk Assignment**
1. **Multi-Select**: In Resource Library, check multiple resource cards
2. **Bulk Action**: Click "Assign Selected Resources" button in header
3. **Target Selection**: Choose single target scope for all selected resources
4. **Batch Processing**: All resources deployed with same operation type
5. **Status Tracking**: Monitor individual assignment results with success/failure indicators

**Method 3: Assignment Manager Direct Access**
1. **Navigate to Assignment Manager**: Click "Assignments" tab in main navigation
2. **Browse Scope Tabs**: Switch between User Level, Projects, and Overview tabs
3. **Resource Cards**: Each resource shows current deployment status and available actions
4. **Direct Actions**: Use Copy/Move buttons directly on resource cards
5. **Target Projects**: For project assignments, select target from project list

**Assignment Verification:**
- **Visual Indicators**: Green checkmarks show successful deployments
- **Error Handling**: Red X indicators with detailed error messages for failures
- **Recent Assignments**: View last 3 assignments in Assignment Manager header
- **Deployment Status**: Check "Current Deployments" section on resource cards
- **File System Verification**: Resources appear in target .claude directories

### Managing Projects
<!-- WORKFLOW_PROJECT_MANAGEMENT -->
<!-- UPDATE_TRIGGER: After feature/resource-managers branch -->
<!-- STATUS: COMPLETED WITH PREFERENCES - Full project management workflow with organization features -->

**Access Project Manager**: Navigate to the "Projects" tab in CChorus main interface (default view on startup)

**Intelligent Loading System:**
1. **Instant Cache Loading**: Previously discovered projects load immediately from client-side cache
2. **Smart Background Refresh**: Automatic background updates when cache is stale (5+ minutes)
3. **Cache Status Indicators**: Visual badges show "Cached" status and "Updating..." during background refresh
4. **Manual Refresh Control**: Force refresh button bypasses cache for immediate fresh data
5. **Toast Notifications**: User-friendly feedback for cache operations and refresh status

**Real-time Project Discovery:**
1. **Streaming Discovery**: Projects appear immediately as they're discovered using Server-Sent Events
2. **Live Progress Tracking**: "Found X projects..." counter updates in real-time during scanning
3. **Cancellable Operations**: Stop project discovery at any time using the Cancel button
4. **Automatic Fallback**: If streaming fails, automatically switches to batch loading
5. **Project Grid/List View**: Browse projects in your preferred view mode (grid for overview, list for details)
6. **Project Health Assessment**: Each project shows visual health indicators based on:
   - Git repository status (version control setup)
   - Agent presence and count
   - Command configurations
   - Documentation quality (CLAUDE.md completeness)
7. **Advanced Search**: Real-time search across project names, paths, and descriptions

**CLAUDE.md Management:**
1. **Select Project**: Click any project card to load its CLAUDE.md content
2. **Edit Mode**: Click "Edit" button to modify CLAUDE.md content
3. **Template Generation**: For projects without CLAUDE.md, automatic template is provided
4. **Content Editing**: Use built-in editor with syntax highlighting and formatting
5. **Save Changes**: Click "Save" to write changes (automatic backup created)
6. **Cancel Changes**: Click "Cancel" to revert unsaved modifications

**Project Analysis:**
- **Resource Statistics**: View counts of agents, commands, and other resources per project
- **Project Metadata**: Access creation dates, modification times, and project paths
- **Health Monitoring**: Track project setup completeness and identify improvement opportunities

**Project Organization and Management:**
- **Status-Based Organization**: Archive completed projects, hide experimental ones, favorite frequently used projects
- **Advanced Filtering**: Use status filter tabs (Active/Favorites/Archived/Hidden/All) to organize project views
- **Persistent Preferences**: Project organization preferences saved in browser localStorage
- **Bulk Operations**: Apply status changes to multiple projects efficiently
- **Project Lifecycle**: Manage projects through their complete lifecycle with appropriate status changes

**Integration with Resource Management:**
- **Resource Assignment**: Use Assignment Manager to deploy resources to discovered projects
- **Cross-Project Visibility**: See which projects have which resources deployed
- **Project-Specific Resources**: Identify and manage project-specific agent and command configurations
- **Health-Based Decisions**: Use project health indicators to guide resource deployment choices

## 🔧 Troubleshooting

<!-- TROUBLESHOOTING_SECTION -->
<!-- UPDATE_TRIGGER: When common issues are identified during testing -->
<!-- CONTENT: Error messages, solutions, FAQ items -->

### Common Issues

**Q: Resource Library shows "Loading resources..." indefinitely**
A: 
- Verify backend server is running: `npm run dev:server` (port 3001)
- Check browser console for network errors or API failures
- Ensure you have read permissions to ~/.claude/ and project directories
- Try refreshing with the refresh button in the header

**Q: Resources appear duplicated in the library**
A: This is normal when resources exist at multiple scopes (user and project levels). Use scope filters to distinguish:
- **User scope**: Global resources in ~/.claude/
- **Project scope**: Project-specific resources in ./project/.claude/
- Check project name badges to identify source projects

**Q: Assignment operations fail**
A: Common causes and solutions:
- **Permissions**: Ensure write access to target .claude directories
- **Directory Structure**: Target projects must have .claude directory structure
- **Disk Space**: Verify sufficient disk space for resource files
- **File Conflicts**: Check for existing resources with same names
- **Path Issues**: Ensure project paths are valid and accessible

**Q: System scan finds no resources**
A:
- Verify Claude Code projects exist with CLAUDE.md files
- Check that .claude directories contain agent .md files
- Ensure proper file permissions for reading resource files
- Try manually refreshing the Resource Library
- Clear cache using browser dev tools if data appears stale

**Q: Projects show "Cached" but data seems outdated**
A:
- Use the manual "Refresh" button to force fresh data retrieval
- Cache automatically refreshes after 5 minutes, but manual refresh is immediate
- Check browser console for any caching or network errors

**Q: Assignment Manager shows empty project list**
A:
- Ensure projects have CLAUDE.md files (required for project detection)
- Check that project paths are within accessible directories
- Verify projects have .claude directory structure for resource storage
- Try refreshing Projects tab to trigger fresh project discovery

**Q: Project organization (archive/hide/favorite) not working**
A:
- Verify browser localStorage is enabled and has sufficient space
- Check that you're not in incognito/private browsing mode
- Try clearing localStorage 'project_preferences' key if corrupted
- Note that preferences are browser-specific and don't sync across browsers
- Ensure JavaScript is enabled for localStorage operations

### Error Messages

**"Failed to load resources"**
- **Cause**: Backend API unavailable or scanning failures
- **Solutions**: 
  - Start backend server: `npm run dev:server`
  - Check console for specific API errors
  - Verify filesystem permissions for resource directories
  - Try the refresh button to retry resource loading

**"Assignment failed"**
- **Cause**: Resource deployment errors during copy/move operations
- **Solutions**:
  - Check write permissions in target directories
  - Ensure target project has .claude directory structure
  - Verify sufficient disk space for resource files
  - Review browser console for detailed error messages
  - Check for file naming conflicts in target location

**"HTTP 500" or "Internal Server Error"**
- **Cause**: Backend processing errors during API calls
- **Solutions**:
  - Check server console for detailed error logs
  - Verify resource file formats are valid (proper YAML frontmatter)
  - Ensure project paths are accessible and valid
  - Try restarting both frontend and backend servers

**"Resource not found" or "HTTP 404"**
- **Cause**: Resource files moved or deleted between discovery and access
- **Solutions**:
  - Refresh the Resource Library to update resource list
  - Check if resource files still exist at original locations
  - Verify file permissions haven't changed

**"Access denied" or "HTTP 403"**
- **Cause**: Insufficient permissions for file operations
- **Solutions**:
  - Check read/write permissions on .claude directories
  - Ensure project directories are accessible
  - Verify user has permissions for target deployment locations
  - Check CLAUDE.md file permissions for editor operations

**"Project preferences not persisting"**
- **Cause**: Browser localStorage issues or restrictions
- **Solutions**:
  - Enable localStorage in browser settings
  - Check available browser storage space
  - Exit incognito/private mode for persistent preferences
  - Clear corrupted localStorage data and restart
  - Verify JavaScript execution is allowed

## 📖 Advanced Topics

<!-- ADVANCED_TOPICS -->
<!-- UPDATE_TRIGGER: After feature/integration-polish branch -->
<!-- CONTENT: Keyboard shortcuts, bulk operations, advanced configurations -->

*[To be documented in feature/integration-polish branch]*

### Keyboard Shortcuts
- `Ctrl/Cmd + T`: Toggle theme (light/dark mode) with toast notification
- `Ctrl/Cmd + R`: Refresh current view (works in Resource Library and Assignment Manager)
- `Escape`: Clear search filters and return to full resource view
- `Tab`: Navigate between interface elements with keyboard accessibility

### Bulk Operations
- **Multi-Selection**: Use checkboxes to select multiple resources in Resource Library
- **Batch Assignment**: "Assign Selected Resources" button processes all selected resources
- **Bulk Filtering**: Apply filters to reduce selection scope before bulk operations
- **Status Tracking**: Monitor batch operation results with individual success/failure indicators
- **Selective Processing**: Remove individual items from selection before bulk operations

### Advanced Features
- **Deep Linking**: URLs reflect current view and filters for bookmarking
- **Responsive Design**: Full functionality on desktop, tablet, and mobile devices
- **Theme Persistence**: Light/dark theme preference saved between sessions
- **Real-time Updates**: Resource status updates reflect filesystem changes
- **Cross-Navigation**: Seamless flow between Resource Library and Assignment Manager
- **Toast Notifications**: User-friendly feedback for all operations with detailed messages

## 📊 System Requirements

- Node.js 16+ and npm
- Write access to ~/.claude/ directory
- Projects with .claude/ directories for project-level resources

## 🆘 Getting Help

- Check the troubleshooting section above
- Review console logs for detailed error messages
- Consult the developer documentation for technical details
- Report issues on the project GitHub repository