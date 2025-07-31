# CChorus User Guide

<!-- STATUS_TRACKER -->
<!-- Features: Resource Library [COMPLETED], Assignment Manager [COMPLETED], Project Manager [PENDING], Hooks Manager [PENDING], Commands Manager [PENDING], Settings Manager [PENDING] -->

## 🚀 Quick Start

<!-- QUICK_START_SECTION -->
<!-- UPDATE_TRIGGER: After Phase 1 completion -->
<!-- PLACEHOLDER: Installation, first-time setup, basic navigation -->

CChorus is a comprehensive management platform for Claude Code resources. Get started by running the development servers:

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev:full
```

Navigate to `http://localhost:5173` to access the CChorus interface.

## 📚 Features Overview

### Resource Library
<!-- FEATURE_RESOURCE_LIBRARY -->
<!-- UPDATE_TRIGGER: When ResourceLibrary.tsx is modified -->
<!-- CONTENT: Feature description, screenshots, key benefits -->

The Resource Library provides a unified view of all your Claude Code resources across your system:

- **Universal Discovery**: Find agents, hooks, commands, settings, and projects in one place
- **Smart Filtering**: Filter by resource type, scope (user/project), and search queries
- **Bulk Operations**: Select multiple resources for batch assignment operations
- **Real-time Status**: See which resources are active and where they're deployed

**Key Benefits:**
- Discover resources you forgot you had
- Understand resource distribution across projects
- Quickly find the right resource for your needs

### Assignment Manager  
<!-- FEATURE_ASSIGNMENT_MANAGER -->
<!-- UPDATE_TRIGGER: When AssignmentManager.tsx is modified -->
<!-- CONTENT: Assignment workflows, scope management, deployment tracking -->

The Assignment Manager handles resource deployment and management:

- **Scope Management**: Deploy resources at user level (global) or project level (specific)
- **Copy/Move Operations**: Safely copy or move resources between scopes
- **Deployment Tracking**: Visual indicators showing where resources are active
- **Conflict Resolution**: Detect and resolve resource conflicts during deployment

**Key Benefits:**
- Experiment with configurations safely
- Standardize resources across projects
- Maintain clean separation between user and project resources

### Project Manager
<!-- FEATURE_PROJECT_MANAGER -->
<!-- UPDATE_TRIGGER: When ProjectManager.tsx is created/modified -->
<!-- PLACEHOLDER: Project discovery, CLAUDE.md editing, project-specific resource management -->

*[To be implemented in feature/resource-managers branch]*

The Project Manager discovers and manages Claude Code projects:

- **Project Discovery**: Automatically find all projects with CLAUDE.md files
- **Project Overview**: See resource counts and project metadata
- **CLAUDE.md Editor**: Edit project configuration files directly
- **Resource Summary**: View all resources associated with each project

### Resource Managers
<!-- FEATURE_RESOURCE_MANAGERS -->
<!-- UPDATE_TRIGGER: When specialized manager components are implemented -->
<!-- PLACEHOLDER: Hooks, Commands, Settings management interfaces -->

*[To be implemented in feature/resource-managers branch]*

Specialized interfaces for managing each resource type:

- **Hooks Manager**: Visual interface for configuring Claude Code hooks
- **Commands Manager**: Create and edit slash commands with YAML frontmatter
- **Settings Manager**: Manage settings file hierarchy and JSON configuration

## 🔄 Common Workflows

### Discovering Resources
<!-- WORKFLOW_DISCOVERY -->
<!-- SCREENSHOT: resource-library-overview.png -->
<!-- STEPS: 1. Navigate to Resource Library, 2. Use search/filters, 3. Preview resources -->

1. **Open Resource Library**: Click the "Resource Library" tab in the main navigation
2. **Browse All Resources**: See your complete Claude Code ecosystem at a glance
3. **Use Filters**: Filter by resource type (agents, commands, hooks, etc.) or scope (user/project)
4. **Search Resources**: Use the search bar to find resources by name or description
5. **Preview Details**: Click any resource card to see detailed information

### Assigning Resources
<!-- WORKFLOW_ASSIGNMENT -->
<!-- SCREENSHOT: assignment-manager-deploy.png -->
<!-- STEPS: 1. Select resource, 2. Choose target scope, 3. Deploy with copy/move -->

1. **Select Resource**: From the Resource Library, click the copy icon on any resource
2. **Choose Target**: Select target scope (User Level or specific project)
3. **Deploy Resource**: Choose "Copy" to duplicate or "Move" to relocate
4. **Verify Deployment**: Check the Assignment Manager to confirm deployment status

### Managing Projects
<!-- WORKFLOW_PROJECT_MANAGEMENT -->
<!-- UPDATE_TRIGGER: After feature/resource-managers branch -->
<!-- PLACEHOLDER: Project-specific resource management workflows -->

*[To be documented when Project Manager is implemented]*

## 🔧 Troubleshooting

<!-- TROUBLESHOOTING_SECTION -->
<!-- UPDATE_TRIGGER: When common issues are identified during testing -->
<!-- CONTENT: Error messages, solutions, FAQ items -->

### Common Issues

**Q: Resource Library shows "Loading resources..." indefinitely**
A: Check that the backend server is running on port 3001. Run `npm run dev:server` to start it.

**Q: Resources appear duplicated in the library**
A: This can happen if resources exist at both user and project levels. Use the scope filter to see resources by their deployment location.

**Q: Assignment operations fail**
A: Ensure you have write permissions to the target directories (.claude/agents/, .claude/commands/, etc.).

### Error Messages

**"Failed to load resources"**
- Backend server may not be running
- Check console for network errors
- Verify API endpoints are accessible

**"Assignment failed"**
- Check file permissions in target directories  
- Ensure target project exists and has .claude directory
- Review console for specific error details

## 📖 Advanced Topics

<!-- ADVANCED_TOPICS -->
<!-- UPDATE_TRIGGER: After feature/integration-polish branch -->
<!-- CONTENT: Keyboard shortcuts, bulk operations, advanced configurations -->

*[To be documented in feature/integration-polish branch]*

### Keyboard Shortcuts
- `Ctrl/Cmd + R`: Refresh resource library
- `Ctrl/Cmd + T`: Toggle theme (light/dark)

### Bulk Operations
- Select multiple resources using checkboxes
- Use "Assign Selected Resources" for batch deployment

## 📊 System Requirements

- Node.js 16+ and npm
- Write access to ~/.claude/ directory
- Projects with .claude/ directories for project-level resources

## 🆘 Getting Help

- Check the troubleshooting section above
- Review console logs for detailed error messages
- Consult the developer documentation for technical details
- Report issues on the project GitHub repository