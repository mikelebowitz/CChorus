# Resource Assignment Workflow

<!-- WORKFLOW_ASSIGNMENT -->
<!-- UPDATE_TRIGGER: When AssignmentManager.tsx is modified -->
<!-- SCREENSHOT: assignment-manager-deploy.png -->
<!-- STATUS: COMPLETED - Full workflow implemented -->

## Overview

The Resource Assignment workflow enables you to deploy Claude Code resources between different scopes (user-level global vs project-specific) using copy and move operations. This is essential for standardizing resources across projects, experimenting safely, and maintaining organized resource hierarchies.

## Understanding Scopes

### User Level (Global)
- **Location**: `~/.claude/` directories
- **Scope**: Available to all Claude Code sessions
- **Use Case**: Resources you want available globally
- **Examples**: Core agents, frequently used commands, standard hooks

### Project Level (Specific)
- **Location**: `./project/.claude/` directories  
- **Scope**: Available only within specific projects
- **Use Case**: Project-specific configurations and resources
- **Examples**: Project-specific agents, custom commands, project hooks

## Assignment Operations

### Copy Operations
- **Purpose**: Duplicate resources while preserving originals
- **Safety**: Non-destructive - original resource remains unchanged
- **Use Case**: Experiment with modifications, share resources across projects
- **Result**: Resource exists in both source and target locations

### Move Operations
- **Purpose**: Relocate resources from source to target
- **Effect**: Original resource is removed from source location
- **Use Case**: Reorganize resources, change scope permanently
- **Result**: Resource exists only in target location

## Step-by-Step Assignment Process

### Method 1: Direct Assignment from Resource Library

#### 1. Select Resource for Assignment
- Open CChorus and navigate to the **Resource Library** tab
- Browse or search for the resource you want to assign
- Locate the resource card in the grid view
- Click the **copy icon (📋)** in the bottom-right corner of the resource card

**Expected Result:** System automatically navigates to Assignment Manager with your resource pre-selected

#### 2. Review Source Resource
In the Assignment Manager, you'll see:
- **Source Resource Section**: Shows the resource you selected
  - Resource name, description, and type
  - Current deployment status and locations
  - Available assignment actions (Copy/Move buttons)

#### 3. Choose Target Scope
In the **Available Targets** section:
- **User Level (Global)**: Deploy to `~/.claude/` for system-wide availability
- **Specific Projects**: Deploy to individual project `.claude/` directories
- Each target shows:
  - Target scope (user vs project)
  - Target name and path
  - Available actions (Copy/Move buttons)

#### 4. Execute Assignment
- **For Copy Operation**: Click **"Copy"** button next to your chosen target
- **For Move Operation**: Click **"Move"** button next to your chosen target
- Wait for the operation to complete (usually instant)

**Expected Result:** Toast notification shows success/failure with details

#### 5. Verify Assignment
- Check for green success notification
- Review **Recent Assignments** section in Assignment Manager header
- Verify resource appears in target location using file browser or Resource Library scope filters

### Method 2: Bulk Assignment

#### 1. Multi-Select Resources
- In Resource Library, use **checkboxes** to select multiple resources
- Selected resources show with highlighted borders
- Selection counter appears in header

#### 2. Initiate Bulk Assignment
- Click **"Assign Selected Resources"** button in Resource Library header
- System navigates to Assignment Manager in bulk mode

#### 3. Choose Target for All Resources
- Select single target scope for all selected resources
- All resources will be assigned to the same target location
- Choose Copy or Move operation for the entire batch

#### 4. Monitor Batch Results  
- Individual success/failure indicators for each resource
- Overall batch completion status
- Detailed error messages for any failures

### Method 3: Direct Assignment Manager Access

#### 1. Navigate to Assignment Manager
- Click **"Assignments"** tab in main navigation
- Choose from three management views:
  - **User Level**: Manage global resources
  - **Projects**: Manage project-specific resources  
  - **Overview**: System-wide resource statistics

#### 2. Browse Resource Cards
- Each resource card shows:
  - Current deployment locations
  - Active/inactive status
  - Available assignment actions

#### 3. Direct Assignment Actions
- Use **Copy/Move** buttons directly on resource cards
- Target selection integrated into action buttons
- Immediate feedback on operation results

## Assignment Scenarios

### Scenario 1: Share Agent Across Projects

**Goal**: Copy a useful agent from one project to user level for global access

**Steps:**
1. Find the project-specific agent in Resource Library (filter by Project scope)
2. Click copy icon to start assignment
3. Select "User Level (Global)" as target
4. Click "Copy" to duplicate agent globally
5. Verify agent now appears in both project and user scopes

**Result**: Agent is available globally while maintaining project-specific copy

### Scenario 2: Standardize Commands Across Projects

**Goal**: Deploy proven slash commands to multiple projects

**Steps:**
1. In Resource Library, multi-select working commands (filter by Command type)
2. Click "Assign Selected Resources" for bulk assignment
3. Choose target project from available targets
4. Select "Copy" to preserve originals
5. Repeat for additional target projects

**Result**: Commands deployed consistently across selected projects

### Scenario 3: Reorganize Resources by Scope

**Goal**: Move project-specific resources to appropriate user level

**Steps:**
1. Filter Resource Library by specific project scope
2. Select resources that should be global
3. Use Assignment Manager to move resources to user level
4. Select "Move" operation to clean up project-specific copies
5. Verify resources moved to global scope

**Result**: Clean separation between global and project-specific resources

### Scenario 4: Experiment with Resource Modifications

**Goal**: Test modifications to existing resource without breaking original

**Steps:**
1. Copy resource from current location to test project
2. Select "Copy" operation to preserve original
3. Modify copied resource in test environment
4. If successful, optionally move or copy tested version to target locations
5. Clean up test resources when finished

**Result**: Safe experimentation without risking production resources

## Assignment Manager Views

### User Level Tab

**Purpose**: Manage global resources that apply system-wide

**Features:**
- Overview card showing user-level resource statistics
- Breakdown by resource type (agents, commands, hooks, settings)  
- Direct assignment actions for deploying resources to user scope
- Resource cards showing current global deployments

**Use Cases:**
- Deploy project resources to global scope
- Manage user-level resource library
- Standardize frequently used resources

### Projects Tab

**Purpose**: Manage project-specific resources and deployments

**Features:**
- Grid of project cards with resource statistics per project
- Per-project resource counts and deployment status
- Project-specific resource management interface
- Visual project metadata and resource summaries

**Use Cases:**
- Deploy resources to specific projects
- Compare resource distribution across projects
- Manage project-specific configurations

### Overview Tab

**Purpose**: System-wide resource management and statistics

**Features:**
- Comprehensive statistics across all resource types
- Global resource distribution metrics
- System health indicators and deployment status
- High-level ecosystem insights

**Use Cases:**
- Understand complete Claude Code setup
- Identify resource distribution patterns
- Monitor system-wide resource health

## Troubleshooting Assignment Issues

### Assignment Operation Fails

**Symptoms:**
- Red error notification appears
- Resource not found in target location
- "Assignment failed" error message

**Common Causes & Solutions:**

**Permission Issues:**
- Ensure write access to target `.claude` directories
- Check file permissions in both source and target locations
- Verify user has permissions for target projects

**Directory Structure Issues:**
- Ensure target project has `.claude` directory structure
- Create missing directories: `.claude/agents/`, `.claude/commands/`, etc.
- Verify project has proper `CLAUDE.md` file for project detection

**Resource Conflicts:**
- Check for existing resources with same names in target
- Review conflict resolution options in error messages
- Use different resource names or backup existing resources

**File System Issues:**
- Verify sufficient disk space for resource files
- Check that source resource files still exist
- Ensure target paths are valid and accessible

### Resources Not Appearing After Assignment

**Symptoms:**
- Assignment reports success but resource not visible
- Resource Library doesn't show newly assigned resource
- File exists in target location but not detected

**Troubleshooting Steps:**
1. **Refresh Resource Library**: Use refresh button to update resource discovery
2. **Check Scope Filters**: Ensure you're viewing the correct scope (user vs project)
3. **Verify File Format**: Ensure assigned resource has proper format (YAML frontmatter for agents)
4. **Check File Permissions**: Verify read permissions on newly created files
5. **Review File Paths**: Confirm files are in correct subdirectories

### Partial Batch Assignment Failures

**Symptoms:**
- Some resources in batch succeed, others fail
- Mixed success/failure indicators in results
- Incomplete resource deployment

**Resolution Strategy:**
1. **Review Individual Errors**: Check detailed error messages for each failed resource
2. **Retry Failed Resources**: Select only failed resources for retry assignment
3. **Check Prerequisites**: Ensure all target requirements met for failed resources
4. **Incremental Assignment**: Assign resources individually to isolate issues

## Best Practices

### Resource Organization
- **Use User Level for**: Frequently used agents, standard commands, common hooks
- **Use Project Level for**: Project-specific configurations, custom workflows
- **Maintain Separation**: Keep clear distinction between global and project resources

### Safe Assignment Practices
- **Test with Copy First**: Use copy operations to test before moving resources
- **Backup Important Resources**: Create copies before major reorganization
- **Verify Assignments**: Always check assignment results and test resource functionality
- **Clean Up Gradually**: Remove old resources only after confirming new deployments work

### Workflow Efficiency
- **Use Bulk Operations**: Assign related resources together for consistency
- **Leverage Filters**: Use Resource Library filters to focus on relevant resources
- **Follow Naming Conventions**: Use consistent naming for easier resource management
- **Document Changes**: Keep track of major resource assignments and reorganization

## Integration with Development Workflow

### Version Control Considerations
- Assignment operations modify `.claude` directories
- Consider committing resource changes to version control
- Use `.gitignore` patterns for temporary or sensitive resources
- Document resource assignments in project documentation

### Team Collaboration
- Standardize resource assignments across team members
- Share useful resources through version control
- Document resource dependencies and requirements
- Coordinate bulk assignments to avoid conflicts

### Automated Workflows
- Consider scripting common assignment patterns
- Use assignment operations in setup scripts
- Integrate resource deployment with CI/CD pipelines
- Automate resource synchronization between environments

## Next Steps

After mastering resource assignment:
- **Explore Resource Creation**: Create custom agents, commands, and hooks
- **Advanced Filtering**: Use complex filter combinations for precise resource discovery
- **Workflow Optimization**: Develop standardized assignment workflows for your team
- **Integration Development**: Build custom tools that leverage the assignment API