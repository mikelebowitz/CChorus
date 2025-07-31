# Project Management Workflow

<!-- WORKFLOW_PROJECT_MANAGEMENT -->
<!-- UPDATE_TRIGGER: When project management features are accessed -->
<!-- SCREENSHOT: assignment-manager-projects.png -->
<!-- STATUS: COMPLETED - Implemented through Assignment Manager integration -->

## Overview

The Project Management workflow helps you discover, understand, and manage Claude Code projects across your system. Through the Assignment Manager's Projects tab, you can view all your Claude Code projects, understand their resource distributions, and manage project-specific resources effectively.

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

### Navigation to Projects View
1. **Open CChorus**: Navigate to `http://localhost:5173`
2. **Assignment Manager**: Click the "Assignments" tab in main navigation  
3. **Projects Tab**: Click the "Projects" tab within Assignment Manager
4. **System Scan**: Allow initial project discovery to complete

**Expected Result:** Grid view of all discovered Claude Code projects with statistics

## Project Discovery Workflow

### 1.System-Wide Project Scan
**Automatic Process:**
- CChorus scans your entire home directory for CLAUDE.md files
- Each CLAUDE.md file indicates a Claude Code project
- Project metadata extracted from file content and directory structure
- Resource counts calculated by scanning .claude subdirectories

**Manual Refresh:**
- Use the "Refresh" button in Assignment Manager header
- Triggers new system-wide scan for recently created projects
- Updates project metadata and resource counts

### 2. Project Grid Overview
Each project card displays:
- **Project Icon**: Folder icon indicating project type
- **Project Name**: Primary project identifier
- **Project Path**: Full filesystem location (truncated for display)
- **Resource Statistics**: Breakdown by type
  - Agents count with bot icon
  - Commands count with terminal icon
  - Hooks count with webhook icon
  - Settings count with settings icon
- **Total Resources**: Combined count across all types

### 3. Project Filtering and Search
**Via Resource Library:**
- Filter by "Project" scope to see project-specific resources
- Search by project name to find project-associated resources
- Use project name badges to identify resource sources

**Via Assignment Manager:**
- Projects tab shows all projects regardless of resource content
- Overview tab provides system-wide project statistics
- User Level tab shows resources that could be deployed to projects

## Project-Specific Resource Management

### Understanding Project Resources

**Project-Level Resources Location:**
- **Agents**: `./project/.claude/agents/*.md`
- **Commands**: In project `settings.json` file
- **Hooks**: In project `settings.json` file  
- **Settings**: `./project/.claude/settings.json` or `.claude_settings.json`

**Project Resource Characteristics:**
- Available only within the specific project context
- Override user-level resources with same names
- Can be deployed to other projects or user level
- Inherit from user-level resources when not overridden

### Project Resource Workflows

#### Discover Project Resources
1. **Resource Library Method:**
   - Filter by "Project" scope
   - Look for resources with project name badges
   - Each project's resources clearly identified

2. **Assignment Manager Method:**
   - Click on specific project card in Projects tab
   - View resource statistics and breakdowns
   - Navigate to other tabs to see project resources in context

#### Deploy Resources to Projects
1. **From Resource Library:**
   - Select resource (agent, command, hook, or settings)
   - Click copy icon to start assignment
   - Choose target project from available targets
   - Select Copy or Move operation

2. **From Assignment Manager:**
   - Navigate to Projects tab
   - Select target project card
   - Use assignment actions to deploy resources to project

#### Standardize Resources Across Projects
1. **Identify Standard Resources:**
   - Use Resource Library to find proven resources
   - Filter by User scope for globally available resources
   - Select resources suitable for standardization

2. **Bulk Deployment:**
   - Multi-select resources for standardization
   - Use "Assign Selected Resources" for batch deployment
   - Choose multiple target projects for consistent deployment

3. **Verify Standardization:**
   - Check Projects tab for consistent resource counts
   - Use Overview tab to verify deployment success
   - Test resources in target projects to ensure functionality

## Project Analysis Workflows

### Project Resource Audit

**Objective**: Understand what resources each project has and identify gaps or duplications

**Steps:**
1. **Projects Tab Overview**: Review all project cards for resource distribution patterns
2. **Resource Library Analysis**: Filter by Project scope and analyze project-specific resources
3. **Comparison Analysis**: Compare similar projects to identify resource standardization opportunities
4. **Gap Identification**: Look for projects with unusually low resource counts that might need additional resources

**Expected Insights:**
- Which projects are resource-rich vs resource-sparse
- Common resources that should be standardized
- Project-specific customizations that might be useful elsewhere
- Opportunities for resource consolidation

### Resource Distribution Analysis

**Objective**: Understand how resources are distributed across your project ecosystem

**Steps:**
1. **Overview Tab**: Review system-wide statistics
   - Total resource counts by type
   - Distribution patterns across projects
   - Resource density metrics

2. **Comparative Analysis**: Compare projects by resource type
   - Which projects have many agents vs commands vs hooks
   - Identify resource usage patterns
   - Find projects with unique resource combinations

3. **Standardization Opportunities**: Identify resources that appear in multiple projects
   - Find commonly duplicated resources
   - Identify candidates for user-level deployment
   - Plan resource consolidation strategies

### Project Health Assessment

**Objective**: Evaluate project configuration health and completeness

**Indicators of Healthy Projects:**
- **CLAUDE.md Present**: Project has proper configuration file
- **Resource Balance**: Appropriate mix of agents, commands, and hooks
- **Settings Configuration**: Project-specific settings when needed
- **Resource Organization**: Clean separation of project vs user resources

**Assessment Workflow:**
1. **Project Detection**: Verify all expected projects are discovered
2. **Resource Completeness**: Check that projects have expected resource types
3. **Configuration Validation**: Ensure CLAUDE.md files are present and readable
4. **Resource Conflicts**: Identify potential naming conflicts between project and user resources

## Integration with Development Workflows

### New Project Setup

**When Creating New Claude Code Projects:**
1. **Create CLAUDE.md**: Establish project as Claude Code project
2. **Initialize .claude Structure**: Create necessary subdirectories
3. **Deploy Standard Resources**: Use Assignment Manager to deploy standard agents/commands/hooks
4. **Project-Specific Customization**: Create or modify resources for project-specific needs
5. **Verify Setup**: Check Projects tab to confirm proper project detection and resource deployment

### Project Maintenance

**Regular Project Maintenance Tasks:**
1. **Resource Updates**: Deploy updated standard resources to all projects
2. **Cleanup Unused Resources**: Remove obsolete project-specific resources
3. **Standardization**: Move useful project-specific resources to user level for sharing
4. **Documentation**: Update CLAUDE.md files with current project configuration

### Team Collaboration

**Coordinating Project Resources Across Team:**
1. **Resource Standards**: Establish team standards for resource deployment
2. **Project Templates**: Create standard resource sets for new projects
3. **Resource Sharing**: Use Assignment Manager to share useful project-specific resources
4. **Version Control**: Coordinate resource changes through version control systems

## Advanced Project Management

### Project Resource Templates

**Creating Standard Project Configurations:**
1. **Template Development**: Create "template" project with standard resource set
2. **Resource Export**: Use copy operations to deploy template resources to new projects
3. **Customization**: Modify template resources for project-specific needs
4. **Template Maintenance**: Update template and redeploy to existing projects

### Project Resource Synchronization

**Keeping Projects Updated with Standard Resources:**
1. **Identify Standard Resources**: Determine which resources should be consistent across projects
2. **Deployment Strategy**: Use Assignment Manager for systematic deployment
3. **Update Coordination**: Plan resource updates to minimize disruption
4. **Verification**: Use Projects tab to verify successful deployment across all target projects

### Project Migration and Archival

**Managing Project Lifecycle:**
1. **Resource Extraction**: Before archiving projects, extract useful resources to user level
2. **Resource Cleanup**: Remove project-specific resources that won't be needed
3. **Documentation**: Update project documentation with final resource configuration
4. **Archive Verification**: Confirm all valuable resources preserved before project archival

## Troubleshooting Project Management

### Projects Not Detected

**Symptoms:**
- Expected projects don't appear in Projects tab
- Resource Library shows no project-scoped resources for known projects
- Assignment Manager shows fewer projects than expected

**Common Causes & Solutions:**

**Missing CLAUDE.md:**
- Ensure each project directory contains CLAUDE.md file
- CLAUDE.md can be empty but must exist for project detection
- Check file permissions - must be readable by CChorus backend

**Directory Structure Issues:**
- Verify project directories are within scanned locations (typically home directory)
- Check for proper directory permissions
- Ensure projects aren't in excluded directories (node_modules, .git, etc.)

**Scanning Issues:**
- Use Refresh button to trigger new project scan
- Check browser console for scan errors
- Verify backend server is running and accessible

### Project Resource Mismatches

**Symptoms:**
- Project shows resource counts that don't match expectations
- Resources visible in file system but not in CChorus
- Resource counts change unexpectedly

**Troubleshooting Steps:**
1. **Refresh Resource Data**: Use refresh button to update resource counts
2. **Check File Formats**: Ensure resources follow proper format (YAML frontmatter for agents)
3. **Verify Directory Structure**: Confirm resources are in correct .claude subdirectories
4. **File Permissions**: Check read permissions on resource files
5. **Resource Validation**: Test resources individually to ensure they're properly formatted

### Assignment Operations to Projects Fail

**Symptoms:**
- Resource assignment to project fails with error
- Success notification but resource doesn't appear in project
- Partial assignment success in batch operations

**Resolution Steps:**
1. **Check Project Structure**: Ensure target project has .claude directory structure
2. **Verify Permissions**: Confirm write access to project .claude directories
3. **Disk Space**: Ensure sufficient space for resource files
4. **Path Validation**: Verify project paths are accessible
5. **Resource Conflicts**: Check for existing resources with same names

## Best Practices for Project Management

### Project Organization
- **Consistent Naming**: Use clear, consistent project naming conventions
- **Resource Standards**: Establish team standards for resource organization
- **Documentation**: Maintain up-to-date CLAUDE.md files with project descriptions
- **Directory Structure**: Keep consistent .claude directory organization

### Resource Management
- **Separation of Concerns**: Clear distinction between project-specific and global resources
- **Resource Lifecycle**: Manage resource creation, modification, and removal systematically
- **Version Control**: Consider version control for important project resources
- **Backup Strategy**: Backup project resources before major changes

### Team Collaboration
- **Resource Sharing**: Share useful project-specific resources through Assignment Manager
- **Standards Documentation**: Document team standards for project resource management
- **Change Coordination**: Coordinate resource changes across team projects
- **Knowledge Transfer**: Use Assignment Manager for onboarding new team members

### Performance Optimization
- **Efficient Scanning**: Organize projects to optimize discovery scanning
- **Resource Cleanup**: Regularly clean up unused project resources
- **Batch Operations**: Use bulk assignment for efficient resource deployment
- **Monitoring**: Regular review of project resource distribution and health

## Next Steps

After mastering project management:
- **Advanced Resource Development**: Create sophisticated project-specific resources
- **Automation Integration**: Integrate project management with CI/CD pipelines
- **Team Workflows**: Develop team-specific project management workflows
- **Custom Tooling**: Build custom tools that leverage project discovery and management APIs