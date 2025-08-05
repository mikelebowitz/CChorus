# ResourceLibraryService

## Overview

The `ResourceLibraryService` is a comprehensive service class that manages Claude Code resource library operations, including resource discovery, assignment, and deployment across different scopes (user, project, system). It provides unified access to agents, commands, hooks, projects, and settings with sophisticated assignment capabilities.

## Class Interface

```typescript
export class ResourceLibraryService {
  // Core resource loading methods
  async loadAllResources(): Promise<ResourceItem[]>
  async loadProjects(): Promise<ResourceItem[]>
  async loadAgents(): Promise<ResourceItem[]>
  async loadCommands(): Promise<ResourceItem[]>
  async loadHooks(): Promise<ResourceItem[]>
  async loadSettings(): Promise<ResourceItem[]>
  
  // Resource filtering and search
  filterResources(resources: ResourceItem[], filters: FilterOptions): ResourceItem[]
  
  // Resource assignment operations
  async assignResource(assignment: ResourceAssignment): Promise<AssignmentResult>
  
  // Deployment status management
  async getDeploymentStatus(): Promise<{ [resourceId: string]: DeploymentStatus[] }>
  async getAvailableTargets(): Promise<TargetScope[]>
}
```

## Key Type Definitions

### ResourceItem Interface

```typescript
export interface ResourceItem {
  id: string;
  type: 'agent' | 'command' | 'hook' | 'project' | 'settings';
  name: string;
  description: string;
  scope: 'user' | 'project' | 'builtin' | 'system';
  projectPath?: string;
  projectName?: string;
  filePath?: string;
  lastModified: Date | string;
  isActive: boolean;
  metadata: any; // Original resource data
}
```

### ResourceAssignment Interface

```typescript
export interface ResourceAssignment {
  resourceId: string;
  resourceType: 'agent' | 'command' | 'hook' | 'settings';
  targetScope: 'user' | 'project';
  targetProjectPath?: string;
  operation: 'copy' | 'move' | 'activate' | 'deactivate';
}
```

### AssignmentResult Interface

```typescript
export interface AssignmentResult {
  success: boolean;
  resourceId: string;
  operation: string;
  targetScope: string;
  targetPath?: string;
  error?: string;
}
```

## Core Features

### Unified Resource Discovery

The service provides comprehensive resource discovery across all Claude Code resource types:

```typescript
async loadAllResources(): Promise<ResourceItem[]> {
  const [projects, agents, commands, hooks, settings] = await Promise.all([
    this.loadProjects(),
    this.loadAgents(),
    this.loadCommands(),
    this.loadHooks(),
    this.loadSettings()
  ]);
  
  const allResources = [...projects, ...agents, ...commands, ...hooks, ...settings];
  
  // Deduplicate by ID to prevent duplicate key warnings
  const deduplicatedResources = new Map<string, ResourceItem>();
  for (const resource of allResources) {
    deduplicatedResources.set(resource.id, resource);
  }
  
  return Array.from(deduplicatedResources.values()).sort((a, b) => a.name.localeCompare(b.name));
}
```

### Advanced Resource Assignment

Sophisticated resource assignment system supporting multiple operations:

#### Agent Assignment
```typescript
private async assignAgent(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
  // Parse resource ID to extract agent information
  const parts = resourceId.split(':');
  const agentName = parts[1];
  const currentScope = parts[2] as 'user' | 'project';
  const currentProjectPath = parts[3] !== 'user' ? parts[3] : undefined;
  
  // Fetch agent data and create assignment payload
  const assignmentPayload = {
    name: agent.name,
    description: agent.description,
    tools: agent.tools || [],
    color: agent.color,
    prompt: agent.prompt,
    level: targetScope,
    operation,
    sourcePath: agent.filePath,
    targetProjectPath
  };
  
  // Execute assignment via backend API
  const assignResponse = await fetch(`${API_BASE}/agents/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignmentPayload),
  });
  
  return processAssignmentResult(assignResponse);
}
```

#### Command Assignment
```typescript
private async assignCommand(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
  // Similar pattern for command assignment
  const assignmentPayload = {
    id: command.id,
    name: command.name,
    description: command.description,
    command: command.command,
    scope: targetScope,
    operation,
    sourcePath: command.path,
    targetProjectPath
  };
  
  // Execute via /api/commands/assign endpoint
}
```

#### Hook Assignment
```typescript
private async assignHook(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
  // Hook-specific assignment logic
  const assignmentPayload = {
    eventType: hook.eventType,
    matcher: hook.matcher,
    command: hook.command,
    enabled: hook.enabled,
    targetScope,
    operation,
    targetProjectPath
  };
  
  // Execute via /api/hooks/assign endpoint
}
```

### Resource Filtering and Search

Comprehensive filtering system with multiple criteria:

```typescript
filterResources(resources: ResourceItem[], filters: {
  type?: string;
  scope?: string;
  search?: string;
  projectPath?: string;
  isActive?: boolean;
}): ResourceItem[] {
  let filtered = resources;
  
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(r => r.type === filters.type);
  }
  
  if (filters.scope && filters.scope !== 'all') {
    filtered = filtered.filter(r => r.scope === filters.scope);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(search) ||
      r.description.toLowerCase().includes(search) ||
      (r.projectName && r.projectName.toLowerCase().includes(search))
    );
  }
  
  return filtered;
}
```

## Integration with Backend APIs

### API Endpoints Used

The service integrates with multiple backend endpoints:

```typescript
// Resource discovery endpoints
GET /api/projects/system          // Project discovery
GET /api/agents/system           // Agent discovery
GET /api/commands/system         // Command discovery
GET /api/hooks/system            // Hook discovery
GET /api/settings/effective      // Settings discovery

// Assignment endpoints
POST /api/agents/assign          // Agent assignment
POST /api/commands/assign        // Command assignment
POST /api/hooks/assign           // Hook assignment
POST /api/settings/assign        // Settings assignment
```

### Error Handling Strategy

Comprehensive error handling with graceful degradation:

```typescript
try {
  const result = await resourceService.assignResource(assignment);
  
  if (result.success) {
    // Success feedback
    toast({
      title: 'Resource assigned',
      description: `${resource.name} assigned to ${project.name}`,
    });
  } else {
    // Error feedback with specific message
    toast({
      title: 'Assignment failed',
      description: result.error || 'Unknown error occurred',
      variant: 'destructive',
    });
  }
} catch (error) {
  // Exception handling with fallback
  return {
    success: false,
    resourceId: assignment.resourceId,
    operation: assignment.operation,
    targetScope: assignment.targetScope,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

## Integration with UI Components

### ResourceAssignmentPanel Integration

The service is primarily used by the ResourceAssignmentPanel component:

```typescript
import { ResourceLibraryService, ResourceAssignment } from '../utils/resourceLibraryService';

const resourceService = new ResourceLibraryService();

const handleToggleAssignment = async (project: ClaudeProject, isCurrentlyAssigned: boolean) => {
  const assignment: ResourceAssignment = {
    resourceId: `${resource.type}:${resource.name}:${resource.scope}:${resource.projectPath || 'user'}`,
    resourceType: resource.type as any,
    targetScope: 'project',
    targetProjectPath: project.path,
    operation: isCurrentlyAssigned ? 'deactivate' : 'copy'
  };

  const result = await resourceService.assignResource(assignment);
  // Handle result and update UI
};
```

### ThreeColumnLayout Integration

Used for comprehensive resource loading and management:

```typescript
const loadAllResourcesWithService = async () => {
  const resourceService = new ResourceLibraryService();
  const allResources = await resourceService.loadAllResources();
  
  // Process resources for UI display
  const resourcesByType = {
    projects: allResources.filter(r => r.type === 'project'),
    agents: allResources.filter(r => r.type === 'agent'),
    commands: allResources.filter(r => r.type === 'command'),
    hooks: allResources.filter(r => r.type === 'hook'),
    settings: allResources.filter(r => r.type === 'settings')
  };
  
  setAllResources(allResources);
  updateResourceCounts(resourcesByType);
};
```

## Advanced Features

### Deployment Status Tracking

Comprehensive deployment status management:

```typescript
async getDeploymentStatus(): Promise<{ [resourceId: string]: { scope: string; isActive: boolean; projectPath?: string }[] }> {
  const resources = await this.loadAllResources();
  const status: { [resourceId: string]: { scope: string; isActive: boolean; projectPath?: string }[] } = {};
  
  for (const resource of resources) {
    status[resource.id] = [{
      scope: resource.scope,
      isActive: resource.isActive,
      projectPath: resource.projectPath
    }];
  }
  
  return status;
}
```

### Available Target Discovery

Dynamic target scope discovery for assignment operations:

```typescript
async getAvailableTargets(): Promise<{ scope: string; name: string; path?: string }[]> {
  const projects = await this.loadProjects();
  
  return [
    { scope: 'user', name: 'User Level (Global)' },
    ...projects.map(p => ({
      scope: 'project',
      name: p.metadata.name,
      path: p.metadata.path
    }))
  ];
}
```

## Performance Features

### Deduplication System

Advanced deduplication prevents duplicate resources:

```typescript
// Deduplicate by ID to prevent duplicate key warnings
const deduplicatedResources = new Map<string, ResourceItem>();
for (const resource of allResources) {
  deduplicatedResources.set(resource.id, resource);
}

return Array.from(deduplicatedResources.values())
  .sort((a, b) => a.name.localeCompare(b.name));
```

### Concurrent Loading

Parallel API calls for optimal performance:

```typescript
const [projects, agents, commands, hooks, settings] = await Promise.all([
  this.loadProjects(),
  this.loadAgents(),
  this.loadCommands(),
  this.loadHooks(),
  this.loadSettings()
]);
```

## Usage Examples

### Basic Resource Loading

```typescript
import { ResourceLibraryService } from '../utils/resourceLibraryService';

const service = new ResourceLibraryService();

// Load all resources
const allResources = await service.loadAllResources();
console.log(`Loaded ${allResources.length} total resources`);

// Load specific resource type
const agents = await service.loadAgents();
console.log(`Found ${agents.length} agents`);
```

### Resource Assignment

```typescript
const assignment = {
  resourceId: 'agent:my-agent:user:user',
  resourceType: 'agent' as const,
  targetScope: 'project' as const,
  targetProjectPath: '/path/to/project',
  operation: 'copy' as const
};

const result = await service.assignResource(assignment);
if (result.success) {
  console.log('Assignment successful');
} else {
  console.error('Assignment failed:', result.error);
}
```

### Resource Filtering

```typescript
const allResources = await service.loadAllResources();

const filtered = service.filterResources(allResources, {
  type: 'agent',
  scope: 'user',
  search: 'documentation',
  isActive: true
});

console.log(`Found ${filtered.length} matching resources`);
```

## Future Enhancements

### Batch Operations
- Support for bulk resource assignment operations
- Transaction-like semantics for multiple assignments
- Rollback capabilities for failed batch operations

### Advanced Assignment Options
- Selective property assignment (copy only specific agent properties)
- Assignment templates for common deployment patterns
- Conditional assignment based on project characteristics

### Performance Optimizations
- Caching layer for frequently accessed resources
- Incremental loading for large resource sets
- Background refresh for stale resource data

### Assignment Validation
- Pre-assignment validation to prevent conflicts
- Dependency checking for complex resource relationships
- Resource compatibility validation across different scopes

## Testing Strategy

### Unit Tests
- Test individual resource loading methods
- Validate assignment operation logic
- Test error handling scenarios

### Integration Tests
- Test with real backend endpoints
- Validate assignment workflows end-to-end
- Test resource discovery across different scopes

### Performance Tests
- Measure loading times with large resource sets
- Test concurrent assignment operations
- Validate memory usage with extensive resource collections

## Related Components

- [`ResourceDataService`](./ResourceDataService.md) - Complementary service for resource discovery
- [`ResourceAssignmentPanel`](../components/ResourceAssignmentPanel.md) - Primary UI consumer
- [`ThreeColumnLayout`](../components/ThreeColumnLayout.md) - Main interface integration
- [`ProjectManager`](../components/ProjectManager.md) - Project-specific resource management

## Development Notes

- **Service Architecture**: Designed as an instantiable class for state management
- **TypeScript Integration**: Comprehensive type safety with detailed interfaces
- **Error Resilience**: Graceful handling of individual resource loading failures
- **Extensibility**: Easy to add new resource types and assignment operations

This service is essential for CChorus's resource management capabilities, providing the operational foundation for cross-project resource deployment and sophisticated resource assignment workflows.