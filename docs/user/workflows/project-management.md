# Project Management Workflow

<!-- WORKFLOW_PROJECT_MANAGEMENT -->
<!-- UPDATE_TRIGGER: When project management features are accessed -->
<!-- SCREENSHOT: project-manager-interface.png -->
<!-- STATUS: COMPLETED WITH STREAMING + CACHING + PREFERENCES - Dedicated ProjectManager component with CLAUDE.md editing, intelligent caching, streaming discovery, and project preferences -->

## Overview

The Project Management workflow provides comprehensive tools for discovering, understanding, and managing Claude Code projects through CChorus's modern 3-column interface. The integrated project management system offers seamless project browsing, built-in CLAUDE.md editing with live preview, project preferences, real-time streaming discovery, intelligent caching, and professional resource management - all within a cohesive 3-column layout.

## Understanding Claude Code Projects

### Project Detection
Claude Code projects are automatically detected by the presence of:
- **CLAUDE.md file**: Primary project configuration file
- **.claude directory**: Contains project-specific resources (agents, commands, hooks)
- **Project structure**: Organized directory structure with resources

### Project Metadata
Each detected project includes:
- **Project Name**: Extracted from directory name or CLAUDE.md content
- **Project Path**: Full filesystem path to project directory
- **Description**: Project description from CLAUDE.md parsing
- **Resource Counts**: Statistics on agents, commands, hooks, and settings
- **Last Modified**: Timestamp of most recent project changes

## Accessing Project Management

### Primary Method: 3-Column Interface (Default)
1. **Open CChorus** - Application defaults to modern 3-column layout
2. **Left Sidebar Navigation** - Click **Projects** (🔔 FolderOpen icon)
3. **Middle Column** - Browse project list with descriptions and metadata
4. **Right Column** - Edit CLAUDE.md files with integrated react-md-editor

### Alternative Method: Tabbed Interface
1. **Layout Toggle** - Use the toggle in the header to switch to tabbed interface
2. **Projects Tab** - Click the dedicated Projects tab in the main navigation
3. **Embedded Interface** - Projects component integrated within tab layout

### Key Interface Benefits
- **Streamlined Workflow**: Select project → Edit CLAUDE.md in one flow
- **Context Awareness**: Project information always visible while editing
- **Professional Layout**: Clean, organized interface following modern UX patterns
- **Responsive Design**: Adapts to different screen sizes and preferences
1. **Open CChorus**: Navigate to `http://localhost:5173`
2. **Projects Tab**: Projects is now the default view - opens automatically on launch
3. **Instant Loading**: Previously discovered projects load immediately from intelligent cache
4. **Cache Indicators**: Visual "Cached" badge shows when data was loaded from cache
5. **Background Refresh**: Automatic background updates when cached data becomes stale (5+ minutes)
6. **Real-time Discovery**: Watch projects appear live as they're discovered across your system
7. **Progress Tracking**: See "Found X projects..." counter update in real-time during scanning
8. **View Selection**: Choose between Grid or List view modes for optimal browsing
9. **Project Filtering**: Use status filter tabs (Active/Favorites/Archived/Hidden/All) to organize projects
10. **Project Organization**: Right-click projects to archive, hide, or favorite for better organization

**Expected Result:** Instant loading from cache followed by real-time project discovery with immediate results, live progress updates, and comprehensive project organization with preferences filtering

## Project Discovery Workflow

### 1. Intelligent Cache-First Loading
**Smart Loading Process:**
- Previously discovered projects load instantly from client-side cache
- Cache timestamp shows "Cached" badge indicating instant loading
- Background refresh automatically triggered when cache is stale (5+ minutes old)
- Manual "Refresh" button forces fresh discovery bypassing cache
- Toast notifications provide feedback on cache operations and refresh status

**Cache Management Features:**
- **Instant Loading**: Cached projects appear immediately with no waiting
- **Background Updates**: Fresh data loads in background without blocking UI
- **Visual Indicators**: "Cached" and "Updating..." badges show current data status
- **Smart Refresh**: Cache automatically refreshes when data becomes stale
- **Manual Control**: Force refresh button for immediate fresh data

### 2. Real-Time Project Discovery
**Streaming Discovery Process:**
- CChorus uses Server-Sent Events to stream project discovery results in real-time
- Fresh projects appear immediately as they're found during system scanning
- Live progress counter shows "Found X projects..." during discovery
- Users can cancel scanning operations if needed using the "Cancel" button
- Automatic fallback to batch loading if streaming encounters issues

**Discovery Experience:**
- **Immediate Feedback**: Projects appear as soon as they're discovered
- **Live Progress**: Real-time counters show discovery progress
- **Cancellable**: Stop scanning operations at any time using the Cancel button
- **Resilient**: Automatic fallback ensures discovery always works
- **Performance**: Same backend speed, dramatically improved user experience

**Streaming User Interface:**
1. **Connection Indicator**: "Stream started" confirmation when discovery begins
2. **Progress Messages**: Real-time "Found X projects..." updates during scanning
3. **Project Appearance**: Projects appear immediately in grid/list as discovered
4. **Cancel Button**: Active cancel button allows stopping discovery at any time
5. **Completion Status**: "Scan completed" message when discovery finishes
6. **Error Handling**: Toast notifications for connection issues with automatic fallback

**Manual Refresh:**
- Use the "Refresh" button to bypass cache and trigger fresh project discovery
- Streaming discovery provides immediate feedback on newly created projects
- Live progress updates throughout the refresh process
- Manual refresh overrides intelligent caching for immediate fresh data
- "Updating..." badge shows when background refresh is in progress

### 2. Project Grid/List Overview

**Grid View Features:**
Each project card displays:
- **Project Icon**: Folder with Git icon indicating project type
- **Project Name**: Primary project identifier
- **Project Description**: Extracted from CLAUDE.md or "No description available"
- **Health Indicator**: Color-coded status (green=healthy, blue=good, yellow=fair, red=needs attention)
- **Status Badges**: Visual indicators for:
  - Git repository status (GitBranch icon)
  - Agent presence and count (Bot icon)
  - Command presence and count (Terminal icon)
- **Project Path**: Full filesystem location with truncation for display
- **Last Modified**: Timestamp of most recent project changes

**List View Features:**
- **Compact Layout**: Optimized for viewing many projects quickly
- **Essential Information**: Project name, path, and key status indicators
- **Quick Access**: Click any project for immediate selection and CLAUDE.md loading
- **Status Icons**: Git, agents, and commands indicators for rapid assessment

### 3. Project Search and Filtering

**Advanced Search Capabilities:**
- **Real-time Search**: Search bar provides instant filtering as you type
- **Multi-field Search**: Searches across project names, paths, and descriptions simultaneously
- **Case-insensitive**: Search works regardless of capitalization
- **Partial Matching**: Find projects with partial name or path matches

**View Mode Selection:**
- **Grid View Toggle**: Comprehensive project cards with full metadata display
- **List View Toggle**: Compact listing for rapid browsing of many projects
- **Responsive Design**: Both views adapt to screen size for optimal viewing
- **Quick Switching**: Toggle between views without losing search or selection state

**Integration with Resource Management:**
- **Resource Library Integration**: Projects appear in resource filtering and association
- **Assignment Manager Integration**: Projects available as deployment targets
- **Cross-Navigation**: Seamless flow between project management and resource operations

## CLAUDE.md Management

### Understanding CLAUDE.md Files

**CLAUDE.md Purpose:**
- **Project Configuration**: Primary configuration file for Claude Code projects
- **Development Guidance**: Instructions and context for AI assistants working on the project
- **Project Documentation**: Overview, setup instructions, and important notes
- **AI Context**: Helps Claude Code understand project structure and requirements

**CLAUDE.md Structure:**
- **Project Overview**: Description of the project's purpose and goals
- **Development Guidelines**: Coding standards, architecture decisions, and patterns
- **Key Files and Directories**: Important project structure information
- **Getting Started**: Setup and development instructions
- **Important Notes**: Project-specific considerations and requirements

### CLAUDE.md Editor Interface

**Editor Features:**
- **Split-Pane Layout**: Project list on left, editor on right when project selected
- **Live Content Loading**: Automatic loading of existing CLAUDE.md content
- **Template Generation**: Automatic template creation for projects without CLAUDE.md
- **Change Detection**: Real-time tracking of modifications with "Unsaved changes" indicator
- **Edit Mode Toggle**: Switch between read-only preview and edit modes
- **Save/Cancel Operations**: Atomic save operations with cancel functionality

**Template Auto-Generation:**
For projects without existing CLAUDE.md files, the editor automatically generates a structured template including:
- Project name and description placeholders
- Standard development guidelines section
- Key files and directories section
- Getting started instructions with common commands
- Important notes section for project-specific information

### CLAUDE.md Editing Workflows

#### Creating/Editing CLAUDE.md Files
1. **Select Project:**
   - Browse projects in grid or list view
   - Use search to find specific project quickly
   - Click project card to select and load CLAUDE.md content

2. **Edit Mode:**
   - Click "Edit" button in editor panel header
   - Modify content in built-in text editor
   - Real-time change detection shows "Unsaved changes" badge
   - Full-height editor with proper text formatting

3. **Save Changes:**
   - Click "Save" button to write changes to filesystem
   - Automatic backup creation before save operations
   - Success notification with toast message
   - Changes immediately reflected in project metadata

4. **Cancel Changes:**
   - Click "Cancel" button to revert unsaved modifications
   - Content automatically restored to last saved state
   - No confirmation required for cancel operation

#### Working with Project Templates
1. **Template Generation:**
   - Select project without existing CLAUDE.md file
   - Editor automatically generates structured template
   - Template includes project-specific information where available
   - Placeholder sections for customization

2. **Template Customization:**
   - Edit generated template sections with project-specific information
   - Add development guidelines specific to the project
   - Document key files and directory structure
   - Include project-specific setup and deployment instructions

3. **Template Standardization:**
   - Use successful project CLAUDE.md files as templates for new projects
   - Copy content structure and adapt for new project context
   - Maintain consistency across team projects with standard sections

#### Integration with Resource Management
1. **Resource Discovery Integration:**
   - Projects discovered in Project Manager appear in Assignment Manager
   - Project health indicators help identify projects needing resources
   - CLAUDE.md content provides context for resource deployment decisions

2. **Project-Specific Resource Deployment:**
   - Use Assignment Manager to deploy resources to projects discovered in Project Manager
   - Project health assessments help prioritize resource deployment
   - Well-documented projects (healthy CLAUDE.md) make better deployment targets

3. **Documentation-Driven Development:**
   - Update CLAUDE.md when deploying new resources to projects
   - Document resource usage and configuration in project files
   - Maintain consistency between project documentation and actual resource deployment

## Project Health Assessment

### Understanding Project Health Indicators

**Health Scoring System:**
Projects are automatically assessed based on multiple criteria:
- **Git Repository Status** (25 points): Project is under version control
- **Agent Presence** (25 points): Project has specialized Claude Code agents
- **Command Configuration** (25 points): Project has custom slash commands
- **Documentation Quality** (25 points): CLAUDE.md exists and has substantial content (50+ characters)

**Health Status Categories:**
- **Healthy (75+ points)**: Green indicator - Well-configured project with comprehensive setup
- **Good (50-74 points)**: Blue indicator - Solid project with most essential components
- **Fair (25-49 points)**: Yellow indicator - Basic project setup with room for improvement
- **Needs Attention (0-24 points)**: Red indicator - Minimal setup requiring attention

### Project Health Analysis Workflow

**Visual Health Assessment:**
1. **Grid View Overview**: Quickly scan project cards for health indicator colors
2. **Identify Patterns**: Look for projects with similar health statuses
3. **Prioritize Improvements**: Focus on red and yellow projects for enhancement
4. **Resource Planning**: Use health indicators to guide resource deployment decisions

**Improvement Actions:**
- **Red Projects**: Create or improve CLAUDE.md files, set up Git repositories, deploy basic resources
- **Yellow Projects**: Add specialized agents or commands, enhance documentation
- **Blue Projects**: Fine-tune configurations and add advanced resources
- **Green Projects**: Use as templates for other projects, maintain current quality

### Project Documentation Analysis

**Documentation Quality Assessment:**

**CLAUDE.md Content Analysis:**
1. **Content Completeness**: Review projects with substantial CLAUDE.md content vs those with minimal documentation
2. **Template Consistency**: Identify projects using similar documentation structures
3. **Best Practices**: Find well-documented projects to use as templates
4. **Improvement Opportunities**: Identify projects with missing or inadequate documentation

**Documentation Improvement Workflow:**
1. **Baseline Assessment**: Review all projects to understand current documentation state
2. **Template Development**: Create standard CLAUDE.md templates based on best practices
3. **Systematic Improvement**: Use Project Manager editor to enhance documentation across projects
4. **Quality Maintenance**: Regular review and updates to maintain documentation quality

**Documentation-Driven Project Organization:**
- **Consistent Structure**: Use Project Manager to maintain consistent CLAUDE.md structure across projects
- **Knowledge Transfer**: Well-documented projects facilitate team collaboration and onboarding
- **Context Preservation**: CLAUDE.md files provide valuable context for AI assistants working on projects
- **Project Evolution**: Documentation evolves with project changes through integrated editor

### Project Organization Features

### Project Status Management

**Understanding Project Status:**
CChorus provides comprehensive project organization through status-based categorization:

- **Active Projects**: Default status for all discovered projects, visible in main project view
- **Archived Projects**: Completed or inactive projects moved to archive for organization
- **Hidden Projects**: Experimental or temporary projects hidden from main view
- **Favorited Projects**: Frequently used projects marked for quick access

**Status Filter Tabs:**
The Projects interface includes dedicated tabs for each status category:
- **Active Tab**: Shows only active (non-archived, non-hidden) projects
- **Favorites Tab**: Displays favorited projects regardless of other status
- **Archived Tab**: Shows archived projects with restore options
- **Hidden Tab**: Displays hidden projects with show options
- **All Tab**: Shows all projects regardless of status

### Project Actions and Operations

**Right-Click Context Menu:**
Each project card includes a context menu (three dots icon) with organization actions:

**Archive/Unarchive:**
- Archive completed projects to reduce clutter in main view
- Archived projects remain accessible through Archived tab
- Unarchive projects to restore them to active status
- Archiving preserves all project data and metadata

**Hide/Show:**
- Hide experimental or temporary projects from main view
- Hidden projects accessible through Hidden tab only
- Show hidden projects to restore visibility
- Ideal for work-in-progress or testing projects

**Favorite/Unfavorite:**
- Mark frequently used projects as favorites
- Favorited projects appear in dedicated Favorites tab
- Star icon indicates favorited status in all views
- Quick access to most important projects

**Mark as Viewed:**
- Automatic timestamp tracking for project access
- Used for analytics and recent project identification
- Helps identify frequently accessed projects

### Project Organization Workflows

**Organizing Large Project Collections:**
1. **Initial Assessment**: Review all projects in "All" tab to understand complete collection
2. **Archive Completed**: Move finished projects to archived status for organization
3. **Hide Experimental**: Hide work-in-progress or testing projects to reduce clutter
4. **Favorite Key Projects**: Mark frequently used projects as favorites for quick access
5. **Regular Maintenance**: Periodically review and reorganize project statuses

**Project Lifecycle Management:**
1. **New Project**: Starts as active project, appears in main Active tab
2. **Development Phase**: Remains active, optionally favorite if frequently accessed
3. **Testing Phase**: Optionally hide if experimental or unstable
4. **Production Use**: Favorite for quick access, maintain active status
5. **Project Completion**: Archive to preserve but remove from main view
6. **Long-term Storage**: Remain archived with full access through Archived tab

**Team Project Organization:**
1. **Shared Standards**: Establish team conventions for project status usage
2. **Archive Coordination**: Archive completed team projects consistently
3. **Favorite Team Projects**: Team members favorite shared critical projects
4. **Status Communication**: Use status to communicate project lifecycle stage
5. **Regular Review**: Team review of project organization and status accuracy

### Persistent Project Preferences

**Client-Side Storage:**
- All project preferences stored in browser localStorage
- Preferences persist across browser sessions and application restarts
- No server-side storage required - fully client-side preference management
- Preferences synchronized with cached project data for consistency

**Data Management:**
- Preferences automatically cleaned up for non-existent projects
- Export functionality for backup and migration
- Import functionality for preference restoration
- Version management for preference format compatibility

**Performance Benefits:**
- Instant preference application without server communication
- Preferences preserved during cache refresh operations
- Efficient filtering and organization without API calls
- Responsive UI updates for all preference changes

## Advanced Project Management Features

**Multi-View Project Browsing:**
- **Grid View Advantages**: Visual project cards with comprehensive metadata, health indicators, and resource badges
- **List View Advantages**: Compact display for quick browsing of many projects, efficient use of screen space
- **Responsive Design**: Both views adapt to screen size and user preferences
- **View State Persistence**: Selected view mode maintained across sessions

**Advanced Search and Discovery:**
- **Multi-field Search**: Simultaneously searches project names, paths, and descriptions
- **Real-time Filtering**: Instant results as you type with no search delays
- **Case-insensitive Matching**: Find projects regardless of capitalization
- **Partial Match Support**: Locate projects with incomplete information

**Editor Integration Benefits:**
- **Immediate Context**: Select project and immediately access/edit its CLAUDE.md file
- **Template Automation**: Automatic template generation reduces setup time for new projects
- **Change Tracking**: Visual indicators prevent loss of unsaved work
- **Atomic Operations**: Save/cancel operations ensure data integrity

## Integration with Development Workflows

### New Project Setup with Project Manager

**Enhanced Project Setup Workflow:**
1. **Project Discovery**: Project Manager automatically discovers new projects with CLAUDE.md files
2. **Template Creation**: Use Project Manager editor to create comprehensive CLAUDE.md files
3. **Health Assessment**: Monitor project health indicators to ensure proper setup
4. **Documentation First**: Create thorough CLAUDE.md documentation before resource deployment
5. **Resource Integration**: Use health-assessed projects as targets for resource deployment
6. **Iterative Improvement**: Use Project Manager to continuously improve project documentation and setup

### Project Maintenance with Integrated Management

**Comprehensive Project Maintenance:**
1. **Documentation Maintenance**: Use Project Manager editor to keep CLAUDE.md files current
2. **Health Monitoring**: Regular review of project health indicators to identify maintenance needs
3. **Template Updates**: Update and standardize CLAUDE.md templates across projects
4. **Resource Coordination**: Coordinate resource deployment with documentation updates
5. **Quality Assurance**: Use health assessments to maintain high project standards
6. **Knowledge Management**: Maintain project documentation as institutional knowledge

### Team Collaboration with Project Manager

**Enhanced Team Collaboration:**
1. **Documentation Standards**: Use Project Manager to establish and maintain consistent CLAUDE.md standards
2. **Template Sharing**: Share well-documented projects as templates for new team projects
3. **Knowledge Transfer**: Comprehensive project documentation facilitates team member onboarding
4. **Quality Standards**: Use health indicators to maintain consistent project quality across team
5. **Collaborative Editing**: Team members can use Project Manager to contribute to project documentation
6. **Best Practice Propagation**: Identify and replicate successful project documentation patterns

## Advanced Project Management

### CLAUDE.md Template Management

**Creating Standard Documentation Templates:**
1. **Template Development**: Create comprehensive CLAUDE.md templates based on successful projects
2. **Template Standardization**: Use Project Manager to apply consistent templates across projects
3. **Template Evolution**: Continuously improve templates based on project experience
4. **Template Distribution**: Share successful templates across team and projects
5. **Customization Framework**: Create flexible templates that adapt to different project types
6. **Quality Templates**: Use health indicators to identify projects with exemplary documentation

### Documentation Synchronization

**Keeping Project Documentation Current:**
1. **Documentation Audits**: Regular review of CLAUDE.md content across all projects
2. **Template Updates**: Systematic application of improved templates using Project Manager
3. **Content Standards**: Maintain consistency in documentation structure and quality
4. **Version Coordination**: Coordinate documentation updates with project development cycles
5. **Health Monitoring**: Use health indicators to identify projects needing documentation updates
6. **Continuous Improvement**: Iterative enhancement of project documentation quality

### Project Lifecycle Management

**Complete Project Lifecycle with Documentation Management:**
1. **Project Onboarding**: Use Project Manager to establish comprehensive CLAUDE.md documentation for new projects
2. **Documentation Evolution**: Continuously update project documentation through Project Manager as projects evolve
3. **Knowledge Preservation**: Maintain thorough CLAUDE.md files as institutional knowledge throughout project lifecycle
4. **Migration Preparation**: Use Project Manager to document final project state before migration or archival
5. **Archive Documentation**: Ensure CLAUDE.md files capture complete project context for future reference
6. **Template Extraction**: Extract successful documentation patterns for use in future projects

## Troubleshooting Project Management

### Projects Not Detected

**Symptoms:**
- Expected projects don't appear in Projects tab
- Project Manager shows fewer projects than expected
- Streaming discovery completes but missing known projects
- "Found X projects..." counter stops updating prematurely

**Common Causes & Solutions:**

**Missing CLAUDE.md:**
- Ensure each project directory contains CLAUDE.md file
- CLAUDE.md can be empty but must exist for project detection
- Check file permissions - must be readable by CChorus backend

**Directory Structure Issues:**
- Verify project directories are within scanned locations (typically home directory)
- Check for proper directory permissions
- Ensure projects aren't in excluded directories (node_modules, .git, etc.)

**Streaming Discovery Issues:**
- Use Refresh button to trigger new streaming discovery
- Check browser console for EventSource connection errors
- Verify backend server is running and accessible on port 3001
- If streaming fails, system automatically falls back to batch loading
- Look for "Stream Error" toast notifications indicating connection issues

### CLAUDE.md Editor Issues

**Symptoms:**
- CLAUDE.md content doesn't load when project selected
- Save operation fails with error message
- Editor shows "No CLAUDE.md file found" for existing files
- Unsaved changes indicator doesn't clear after successful save

**Troubleshooting Steps:**
1. **Check Backend Connection**: Ensure backend server is running on port 3001
2. **Verify File Permissions**: Confirm read/write access to CLAUDE.md files
3. **Check Project Path**: Ensure project path doesn't contain special characters causing encoding issues
4. **File System Issues**: Verify CLAUDE.md file exists and is accessible
5. **Browser Console**: Check for JavaScript errors or network failures
6. **Refresh Project**: Click another project and return to refresh state
7. **Restart Application**: Restart both frontend and backend if issues persist

### Project Health Indicators Not Updating

**Symptoms:**
- Health indicators show incorrect status (wrong color)
- Project health doesn't reflect recent changes
- All projects show same health status
- Recently added projects not showing expected health status

**Resolution Steps:**
1. **Force Fresh Data**: Use manual "Refresh" button to bypass cache and get fresh project data
2. **Check Cache Status**: Look for "Cached" badge and wait for automatic background refresh
3. **Check Project Changes**: Verify recent changes (Git setup, resource additions) are actually present
4. **Health Calculation**: Understand that health is based on Git status, agents, commands, and documentation quality
5. **Cache Management**: Use browser dev tools to clear CChorus cache if data appears stale
6. **File System Sync**: Ensure file system changes are reflected in project discovery
7. **Backend Restart**: Restart backend server to refresh project scanning

### Cache-Related Issues

**Symptoms:**
- Projects show "Cached" but data appears outdated
- Cache doesn't refresh automatically after expected 5 minutes
- Manual refresh doesn't override cached data
- "Updating..." indicator appears but never completes

**Troubleshooting Cache Issues:**
1. **Manual Refresh**: Use "Refresh" button to force bypass cache and get fresh data
2. **Check Background Updates**: Look for "Updating..." badge during background refresh operations
3. **Cache Timeout**: Wait for automatic cache expiration (5 minutes) or force refresh
4. **Browser Storage**: Clear localStorage in browser dev tools to reset cache
5. **Network Issues**: Check browser console for network errors preventing cache updates
6. **Backend Connectivity**: Ensure backend server is accessible for fresh data retrieval

### Project Organization Issues

**Symptoms:**
- Project status changes don't persist across browser sessions
- Archived/hidden projects still appear in active view
- Favorite projects don't show star icons
- Status filter tabs show incorrect project counts
- Project preferences lost after cache refresh

**Troubleshooting Project Organization:**
1. **localStorage Issues**: Check if browser localStorage is enabled and functioning
2. **Browser Storage Quota**: Ensure sufficient browser storage space for preferences
3. **Incognito Mode**: Note that preferences don't persist in private browsing mode
4. **Multiple Browsers**: Preferences are browser-specific and don't sync across browsers
5. **Preference Conflicts**: Clear localStorage 'project_preferences' key if corrupted
6. **Filter Reset**: Try switching between filter tabs to refresh project filtering
7. **Cache Integration**: Ensure project preferences load correctly after cache refresh

## Best Practices for Project Management

### Project Documentation Standards
- **Comprehensive CLAUDE.md**: Use Project Manager to maintain thorough, up-to-date CLAUDE.md files
- **Template Consistency**: Apply consistent documentation templates across projects
- **Regular Updates**: Keep project documentation current with project evolution
- **Quality Focus**: Use health indicators to maintain high documentation standards
- **Team Standards**: Establish and maintain team-wide documentation standards

### Project Health Management
- **Regular Assessment**: Monitor project health indicators to identify improvement opportunities
- **Systematic Improvement**: Use health indicators to prioritize project enhancement efforts
- **Template Application**: Apply successful project patterns to improve lower-health projects
- **Continuous Monitoring**: Regular review of project health trends and patterns
- **Quality Maintenance**: Maintain high standards across all projects using health indicators

### Documentation-Driven Collaboration
- **Shared Templates**: Use Project Manager to develop and share documentation templates
- **Knowledge Management**: Maintain project documentation as team institutional knowledge
- **Onboarding Support**: Use comprehensive CLAUDE.md files to facilitate new team member onboarding
- **Best Practice Sharing**: Identify and replicate successful documentation patterns across team
- **Collaborative Editing**: Enable team members to contribute to project documentation through Project Manager

### Performance and Efficiency
- **Efficient Discovery**: Organize projects to optimize system-wide scanning performance
- **Documentation Efficiency**: Use templates and standardized structures to reduce documentation effort
- **Health Monitoring**: Use automated health indicators to efficiently identify projects needing attention
- **Batch Documentation**: Apply template updates across multiple projects efficiently
- **Search Optimization**: Use advanced search features to quickly locate specific projects

## Next Steps

After mastering Project Manager:
- **Advanced Documentation**: Develop sophisticated CLAUDE.md templates and standards
- **Integration Workflows**: Integrate project documentation with development and deployment workflows
- **Team Documentation Standards**: Establish comprehensive team-wide documentation practices
- **Automation**: Develop automated tools that leverage project discovery and documentation APIs
- **Quality Systems**: Build systems that use health indicators for project quality assurance
- **Knowledge Management**: Develop comprehensive knowledge management systems using project documentation