# ResourceAssignmentPanel Component

## Overview

The `ResourceAssignmentPanel` component provides cross-project resource assignment functionality within CChorus's 3-column layout. It enables users to copy, activate, and deactivate Claude Code resources (agents, commands, hooks) across different projects with visual tracking and conflict management.

## Component Props

```typescript
interface ResourceAssignmentPanelProps {
  resource: ResourceItem;
  assignments: string[]; // Project paths where this resource is assigned
  allProjects: ClaudeProject[];
  onAssignmentChange: (resourceName: string) => void;
}

interface ResourceItem {
  id: string;
  name: string;
  type: 'agent' | 'command' | 'hook' | 'claude-file';
  scope: 'user' | 'system' | 'project';
  filePath?: string;
  projectPath?: string;
  description?: string;
  lastModified?: Date | string;
  enabled?: boolean;
}
```

## Key Features

### Cross-Project Assignment
- **Resource Deployment**: Copy resources from user level to specific projects
- **Activation Management**: Enable/disable resources in target projects
- **Origin Tracking**: Visual indicators for resource origin projects
- **Conflict Prevention**: Prevents assignment to origin projects

### Visual Interface
- **Checkbox Controls**: Simple toggle interface for each project
- **Status Indicators**: Clear visual feedback for assignment states
- **Loading States**: Progress indicators during assignment operations
- **Error Handling**: Toast notifications for operation feedback

### Resource Type Support
- **Agents**: Copy agent files between user and project scopes
- **Commands**: Deploy custom commands to specific projects
- **Hooks**: Configure project-specific hook behaviors
- **Exclusions**: CLAUDE.md files are excluded (project-specific by nature)

## Implementation Details

### Assignment Logic

The component integrates with `ResourceLibraryService` for backend operations:

```typescript
const assignment: ResourceAssignment = {
  resourceId: `${resource.type}:${resource.name}:${resource.scope}:${resource.projectPath || 'user'}`,
  resourceType: resource.type as any,
  targetScope: 'project',
  targetProjectPath: project.path,
  operation: isCurrentlyAssigned ? 'deactivate' : 'copy'
};

const result = await resourceService.assignResource(assignment);
```

### State Management

- **Loading State**: Prevents multiple simultaneous operations
- **Assignment Tracking**: Maps resource names to assigned project paths
- **Real-time Updates**: Triggers parent component refresh on changes
- **Error Recovery**: Graceful handling of assignment failures

### User Experience Features

- **Origin Project Protection**: Prevents users from "deactivating" resources from their origin projects
- **Clear Visual Hierarchy**: Distinguishes between assigned/unassigned states
- **Contextual Help**: Explains resource scope and assignment implications
- **Responsive Design**: Scrollable project list for large project counts

## Integration Points

### ThreeColumnLayout Integration

The component appears in the right column when a resource is selected:

```typescript
{['agent', 'command', 'hook'].includes(selectedResource.type) && (
  <ResourceAssignmentPanel 
    resource={selectedResource}
    assignments={assignments}
    allProjects={projects}
    onAssignmentChange={handleAssignmentChange}
  />
)}
```

### Backend Service Integration

Uses `ResourceLibraryService` for assignment operations:

```typescript
import { ResourceLibraryService, ResourceAssignment } from '../utils/resourceLibraryService';

const resourceService = new ResourceLibraryService();
```

## Error Handling

Comprehensive error handling with user feedback:

```typescript
try {
  const result = await resourceService.assignResource(assignment);
  if (result.success) {
    // Success toast
  } else {
    // Error toast with specific message
  }
} catch (error) {
  // Exception handling with fallback error message
}
```

## Accessibility Features

- **Semantic Markup**: Proper label associations and form structure
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Screen Reader Support**: Descriptive labels and status announcements
- **Focus Management**: Clear focus indicators and logical tab order

## Usage Example

```typescript
import { ResourceAssignmentPanel } from './components/ResourceAssignmentPanel';

function ResourceViewer() {
  const [assignments, setAssignments] = useState<Map<string, string[]>>(new Map());
  
  const handleAssignmentChange = async (resourceName: string) => {
    // Reload assignments and refresh view
    await loadResourceAssignments();
    await refreshResourceList();
  };

  return (
    <div className="resource-editor">
      <ResourceAssignmentPanel 
        resource={selectedResource}
        assignments={assignments.get(selectedResource.name) || []}
        allProjects={allProjects}
        onAssignmentChange={handleAssignmentChange}
      />
    </div>
  );
}
```

## Testing Considerations

### Manual Testing Checklist
- [ ] Resource assignment creates files in correct project directories
- [ ] Deactivation removes resources without affecting origin
- [ ] Origin project checkboxes are properly disabled
- [ ] Loading states prevent multiple simultaneous operations
- [ ] Toast notifications provide clear feedback
- [ ] Assignment state persists across component remounts

### Error Scenarios
- [ ] Handle network failures during assignment operations
- [ ] Validate file permissions before attempting assignments
- [ ] Test behavior with invalid project paths
- [ ] Verify rollback behavior on partial assignment failures

## Future Enhancements

- **Batch Assignment**: Select multiple projects for simultaneous deployment
- **Assignment Validation**: Pre-check for conflicts before attempting assignment
- **Assignment History**: Track and display assignment operation history
- **Selective Sync**: Sync only specific resource properties across projects
- **Template Management**: Create assignment templates for common deployment patterns

## Related Components

- [`ThreeColumnLayout`](./ThreeColumnLayout.md) - Container component for the assignment panel
- [`ResourceDataService`](../services/ResourceDataService.md) - Resource discovery and management
- [`ResourceLibraryService`](../services/ResourceLibraryService.md) - Backend assignment operations

## Development Notes

- **Component Isolation**: Self-contained with minimal external dependencies
- **TypeScript Integration**: Full type safety with comprehensive interfaces
- **Performance Optimization**: Efficient re-rendering with proper state isolation
- **Error Boundaries**: Graceful degradation when assignment operations fail

This component is essential for CChorus's resource deployment capabilities, enabling users to efficiently manage Claude Code resources across multiple projects while maintaining clear visibility into deployment status and origin tracking.