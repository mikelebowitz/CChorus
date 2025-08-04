# 3-Column Interface Workflow

## Overview

CChorus's modern 3-column interface provides a professional resource management experience with hierarchical navigation, real-time resource data, and integrated editing capabilities. This workflow guides you through using the complete interface effectively.

## Interface Layout

### Left Sidebar (Navigation)
- **Resource Categories**: Users, Projects, Agents, Commands, Hooks, CLAUDE.md
- **Dynamic Counts**: Live resource counts for each category
- **Global Search**: Search across all resource types
- **Collapsible**: Toggle sidebar visibility for more space

### Middle Column (Resource Lists)
- **Context-Aware Content**: Dynamic lists based on selected navigation item
- **Real Resource Data**: Live data from your Claude Code ecosystem
- **Filtering & Search**: Category-specific search and filter options
- **Selection Management**: Select resources for detailed viewing

### Right Column (Content Editor)
- **Resource Content**: View and edit selected resources
- **Assignment Panel**: Cross-project resource deployment
- **CLAUDE.md Editor**: Professional markdown editing for project files
- **Placeholder States**: Helpful guidance when no selection is made

## Navigation Workflow

### 1. Users Section

**Purpose**: Manage user-level resources available across all projects

**Features:**
- View all user-level agents, hooks, and commands
- Resources from `~/.claude/` directories
- Global resource management interface

**Usage:**
1. Click **"Users"** in left sidebar
2. Browse user-level resources in middle column
3. Select any resource to view content in right column
4. Use assignment panel to deploy to specific projects

### 2. Projects Section

**Purpose**: Discover and manage project-specific resources and CLAUDE.md files

**Features:**
- Real-time project discovery with caching
- Clean project display with descriptions
- Integrated CLAUDE.md editing
- Project preferences management

**Usage:**
1. Click **"Projects"** in left sidebar
2. Browse discovered projects in middle column
3. Select a project to edit its CLAUDE.md file
4. Use the professional markdown editor in right column
5. Save changes with Ctrl+S or save button

**CLAUDE.md Editing:**
- Full react-md-editor integration
- Live preview with split-view editing
- Syntax highlighting and formatting tools
- Auto-save and dirty state tracking
- Template generation for new projects

### 3. Agents Section

**Purpose**: Manage all Claude Code agents across user and project scopes

**Features:**
- Complete agent discovery from user and system scopes
- Agent content viewing with markdown rendering
- Cross-project assignment capabilities
- Tool and color information display

**Usage:**
1. Click **"Agents"** in left sidebar
2. Browse all discovered agents in middle column
3. Select an agent to view its content
4. Review agent description, tools, and system prompt
5. Use assignment panel to deploy to specific projects

**Agent Content Viewing:**
- Agent metadata (name, description, tools)
- Full system prompt content with markdown rendering
- Assignment status across projects
- Origin project tracking

### 4. Commands Section

**Purpose**: Manage slash commands and custom command definitions

**Features:**
- System and user command discovery
- Command description and usage information
- Built-in vs custom command distinction
- Cross-project deployment capabilities

**Usage:**
1. Click **"Commands"** in left sidebar
2. Browse all available commands in middle column
3. Select a command to view details
4. Review command description and usage
5. Assign commands to specific projects as needed

### 5. Hooks Section

**Purpose**: Manage event hooks and configuration settings

**Features:**
- System and user hook discovery
- Hook configuration visualization
- Event type and matcher information
- Settings integration

**Usage:**
1. Click **"Hooks"** in left sidebar
2. Browse configured hooks in middle column
3. Select a hook to view configuration
4. Review event types and settings
5. Manage hook deployments across projects

### 6. CLAUDE.md Files Section

**Purpose**: Manage all CLAUDE.md files across discovered projects

**Features:**
- Project-wide CLAUDE.md file discovery
- Direct CLAUDE.md editing interface
- Project context integration
- Full markdown editing capabilities

**Usage:**
1. Click **"CLAUDE.md"** in left sidebar
2. Browse all CLAUDE.md files by project
3. Select a file to edit directly
4. Use integrated ClaudeMdEditor in right column
5. Save changes and manage project configuration

## Resource Assignment Workflow

### Assignment Panel Integration

When viewing agents, commands, or hooks, the assignment panel appears at the top of the right column:

**Features:**
- **Project List**: All discovered projects with checkboxes
- **Assignment Status**: Visual indicators for current assignments
- **Origin Protection**: Prevents accidental removal from origin projects
- **Real-time Updates**: Immediate feedback on assignment changes

### Assignment Process

1. **Select Resource**: Choose an agent, command, or hook from middle column
2. **Review Current Assignments**: See which projects currently have this resource
3. **Toggle Assignments**: Check/uncheck projects to add/remove assignments
4. **Monitor Progress**: Watch for loading indicators during operations
5. **Verify Results**: Receive toast notifications for success/failure

### Assignment Types

**Copy Operation**: Resource is copied to target project
- Original resource remains in source location
- New copy created in target project's `.claude` directory
- Both versions exist independently

**Activate Operation**: Resource is activated in target project
- Resource becomes available in target project
- Assignment tracking updated
- No file duplication (for system resources)

**Deactivate Operation**: Resource is removed from target project
- Resource no longer available in target project
- Original source resource unaffected
- Assignment tracking updated

## Search and Filtering

### Global Search
- **Location**: Top of left sidebar
- **Scope**: Searches across all resource types
- **Features**: Real-time filtering, partial matches
- **Usage**: Type to filter resources across all categories

### Category-Specific Filtering
- **Location**: Within each middle column view
- **Scope**: Filters resources within selected category
- **Features**: Type-specific search, metadata filtering
- **Usage**: Focus on specific resources within category

## Professional Features

### Theme Integration
- **Automatic Theme Support**: Adapts to light/dark themes
- **Consistent Styling**: Professional color scheme throughout
- **Keyboard Shortcut**: Ctrl/Cmd + T to toggle theme
- **Persistent Settings**: Theme preference saved across sessions

### Keyboard Navigation
- **Full Keyboard Support**: Navigate entire interface without mouse
- **Logical Tab Order**: Intuitive keyboard navigation flow
- **Focus Indicators**: Clear visual feedback for keyboard users
- **Shortcut Keys**: Common operations accessible via keyboard

### Responsive Design
- **Fixed Layout**: Prevents layout shifts during navigation
- **Optimal Widths**: Professional column proportions
- **Scrollable Content**: Handle large resource lists efficiently
- **Collapsible Sidebar**: More space when needed

## Performance Features

### Real-time Loading
- **Dynamic Counts**: Resource counts update as data loads
- **Streaming Updates**: Resources appear as discovered
- **Loading Indicators**: Clear feedback during operations
- **Error Handling**: Graceful handling of loading failures

### Caching Strategy
- **Intelligent Caching**: Faster loading on subsequent visits
- **Background Refresh**: Updates happen transparently
- **Cache Management**: Automatic cleanup of stale data
- **Performance Optimization**: Minimal network requests

### Memory Management
- **Efficient Rendering**: Only visible resources fully loaded
- **Cleanup on Navigation**: Proper resource cleanup
- **Minimal Re-renders**: Optimized component updates
- **Large Dataset Handling**: Smooth performance with many resources

## Troubleshooting

### Interface Not Loading
**Symptoms**: Blank columns, missing resource counts, loading spinners persist

**Solutions:**
1. Check backend server is running on port 3001
2. Verify network connectivity
3. Clear browser cache and refresh
4. Check browser console for errors

### Resources Not Appearing
**Symptoms**: Empty resource lists, zero counts, missing resources

**Solutions:**
1. Verify `.claude` directories exist in expected locations
2. Check file permissions for resource directories
3. Refresh the interface to reload resource data
4. Check resource file formats (YAML frontmatter for agents)

### Assignment Operations Failing
**Symptoms**: Assignment checkboxes don't respond, error notifications

**Solutions:**
1. Verify write permissions to target project directories
2. Ensure target projects have proper `.claude` directory structure
3. Check for naming conflicts in target locations
4. Review error messages for specific failure details

## Best Practices

### Navigation Efficiency
- **Use Keyboard Navigation**: Faster than mouse for power users
- **Leverage Search**: Quickly find specific resources
- **Organize by Category**: Use appropriate sections for different tasks
- **Keep Sidebar Open**: Better overview of resource distribution

### Resource Management
- **Regular Review**: Periodically check resource assignments
- **Consistent Naming**: Use clear, descriptive resource names
- **Proper Categorization**: Keep resources in appropriate scopes
- **Clean Up Unused**: Remove obsolete resource assignments

### Workflow Optimization
- **Use Assignment Panel**: Efficient cross-project resource management
- **Leverage Real-time Data**: Take advantage of live resource counts
- **Batch Operations**: Group related assignment tasks
- **Test Before Deployment**: Verify resources work before wide deployment

## Integration with Development

### Version Control
- Resource assignments modify `.claude` directories
- Consider committing resource changes to Git
- Document resource dependencies in project README
- Use `.gitignore` for temporary or sensitive resources

### Team Collaboration
- Standardize resource organization across team
- Share useful resources through version control
- Coordinate assignment changes to avoid conflicts
- Document resource management workflows

### Automation Opportunities
- Script common resource assignment patterns
- Automate project setup with standard resources
- Integrate resource management with CI/CD
- Build custom tools using CChorus patterns

## Next Steps

After mastering the 3-column interface:
- **Explore Advanced Features**: Dive deeper into each resource type
- **Customize Workflows**: Develop team-specific resource management patterns
- **Integrate with Tools**: Connect CChorus with your development workflow
- **Contribute Improvements**: Share feedback and suggestions for interface enhancement

The 3-column interface provides the foundation for professional Claude Code resource management, enabling efficient discovery, assignment, and maintenance of your Claude Code ecosystem.