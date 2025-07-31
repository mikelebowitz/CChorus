# Resource Discovery Workflow

<!-- WORKFLOW_DISCOVERY -->
<!-- UPDATE_TRIGGER: When ResourceLibrary.tsx is modified -->
<!-- SCREENSHOT: resource-library-overview.png -->

## Overview

The Resource Discovery workflow helps you find and explore all Claude Code resources across your system, including agents, hooks, commands, settings, and projects.

## Step-by-Step Process

### 1. Access the Resource Library
- Open CChorus in your browser (`http://localhost:5173`)
- Click the **"Resource Library"** tab in the main navigation
- Wait for the initial resource scan to complete

**Expected Result:** You'll see a unified view of all your Claude Code resources with search and filter options on the left sidebar.

### 2. Browse All Resources
- View the complete list of resources in the main grid area
- Each resource shows:
  - Resource type icon (agent, command, hook, project, settings)
  - Resource name and description
  - Scope indicator (user, project, builtin, system)
  - Active/inactive status
  - Project association (if applicable)

**Expected Result:** A comprehensive overview of your Claude Code ecosystem.

### 3. Filter by Resource Type
Use the left sidebar filters to focus on specific resource types:

- **All**: Shows all resource types
- **Agent**: Claude Code sub-agents for specialized tasks
- **Command**: Slash commands for enhanced workflows
- **Hook**: Event-driven automation hooks
- **Project**: Claude Code projects (CLAUDE.md files)
- **Settings**: Configuration files and profiles

**Tips:**
- Numbers next to each filter show the count of resources
- Click any filter to see only that resource type
- Use "All" to return to the complete view

### 4. Filter by Scope
Narrow down resources by their deployment scope:

- **All**: Resources from all scopes
- **User**: Global, user-level resources
- **Project**: Project-specific resources
- **Builtin**: Built-in Claude Code resources
- **System**: System-discovered resources

**Use Cases:**
- **User scope**: Find resources that apply globally
- **Project scope**: See resources specific to individual projects
- **System scope**: Discover resources from all projects on your system

### 5. Search Resources
- Use the search bar at the top to find specific resources
- Search works across:
  - Resource names
  - Resource descriptions
  - Project names (for project-scoped resources)

**Search Tips:**
- Search is case-insensitive
- Use partial matches (e.g., "test" finds "testing-agent")
- Clear the search to return to filtered results

### 6. Select and Preview Resources
- **Single Selection**: Click any resource card to select it
- **Multi-Selection**: Use checkboxes to select multiple resources
- **Preview**: Selected resources show additional details

**Expected Result:** Selected resources are highlighted and ready for further actions like assignment or detailed viewing.

### 7. Bulk Operations
When multiple resources are selected:
- The "Assign Selected Resources" button appears in the header
- Click to assign multiple resources to the same target scope
- Useful for deploying sets of related resources together

## Common Scenarios

### Finding Agents for a Specific Task
1. Filter by "Agent" type
2. Search for keywords related to your task
3. Review descriptions to find the best match
4. Select the agent for assignment or detailed review

### Discovering Forgotten Resources
1. Use "All" filter to see everything
2. Scroll through or use broad search terms
3. Filter by "User" scope to see global resources
4. Look for resources you haven't used recently

### Exploring Project-Specific Resources
1. Filter by "Project" scope
2. Look for resources associated with specific project names
3. Use this to understand how different projects are configured
4. Find resources to copy to other projects

### Understanding Your Claude Code Setup
1. Start with "All" filter to see the complete overview
2. Check the resource counts in the sidebar
3. Switch between different scopes to see distribution
4. Use this information to organize and standardize your setup

## Troubleshooting

### "Loading resources..." Never Finishes
- Check that the backend server is running (`npm run dev:server`)
- Verify you have read access to ~/.claude/ directories
- Check browser console for error messages

### No Resources Found
- Ensure you have Claude Code projects with resources in your system
- Check that .claude directories exist in your projects
- Verify resources are in the correct format (agents as .md files, etc.)

### Search Returns No Results
- Try broader search terms
- Check that you're not combining restrictive filters
- Clear search and filters to see all resources
- Verify the resource you're looking for actually exists

### Resources Appear Duplicated
- This can happen when resources exist at both user and project levels
- Use scope filters to see resources by their actual location
- Check the project name badges to distinguish between similar resources

## Next Steps

After discovering resources, you can:
- **Assign Resources**: Use the Assignment Manager to deploy them
- **Edit Resources**: Use specialized managers for detailed editing
- **Organize Resources**: Copy or move resources between scopes
- **Explore Projects**: View project-specific resource collections