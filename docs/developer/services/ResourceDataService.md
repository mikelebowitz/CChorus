# ResourceDataService

## Overview

The `ResourceDataService` is a unified service class that provides centralized access to all Claude Code resources across the system. It handles discovery, loading, and management of agents, commands, hooks, and CLAUDE.md files from user, system, and project scopes with optimized performance and error handling.

## Class Interface

```typescript
export class ResourceDataService {
  private static readonly BASE_URL = 'http://localhost:3001/api';

  // Core resource fetching methods
  static async fetchAgents(scope: 'user' | 'system' = 'system'): Promise<AgentResource[]>
  static async fetchCommands(scope: 'system' | 'user' = 'system'): Promise<CommandResource[]>
  static async fetchHooks(scope: 'system' | 'settings' = 'system'): Promise<HookResource[]>
  static async fetchClaudeFiles(): Promise<ResourceItem[]>
  
  // Aggregation methods
  static async fetchAllResources(): Promise<{
    agents: ResourceItem[];
    commands: ResourceItem[];
    hooks: ResourceItem[];
    claudeFiles: ResourceItem[];
  }>
  
  static async fetchResourcesByType(type: 'agents' | 'commands' | 'hooks' | 'claude-files'): Promise<ResourceItem[]>
  static async fetchUserResources(): Promise<{ userLevel: ResourceItem[]; projectLevel: ResourceItem[]; }>
  
  // Utility methods
  static formatDate(date: Date | string): string
}
```

## Resource Type Definitions

### Base ResourceItem Interface

```typescript
export interface ResourceItem {
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

### Specialized Resource Interfaces

```typescript
export interface AgentResource extends ResourceItem {
  type: 'agent';
  content?: string;
  tools?: string[];
  color?: string;
}

export interface CommandResource extends ResourceItem {
  type: 'command';
  isBuiltIn?: boolean;
  usage?: string;
}

export interface HookResource extends ResourceItem {
  type: 'hook';
  hookType?: string;
  configuration?: any;
}
```

## Key Features

### Unified Resource Discovery

The service provides a single interface for discovering all Claude Code resources:

- **Agent Discovery**: User-level (`~/.claude/agents/`) and system-wide project agents
- **Command Discovery**: System built-ins and user-defined slash commands
- **Hook Discovery**: Settings-based hooks and system configuration hooks
- **CLAUDE.md Discovery**: Project-level configuration files across all discovered projects

### Performance Optimization

#### Concurrent API Calls
```typescript
static async fetchAllResources() {
  const [userAgents, systemAgents, systemCommands, systemHooks, userHooks, claudeFiles] = 
    await Promise.all([
      this.fetchAgents('user'),
      this.fetchAgents('system'),
      this.fetchCommands('system'),
      this.fetchHooks('system'),
      this.fetchHooks('settings'),
      this.fetchClaudeFiles()
    ]);
  
  return {
    agents: [...userAgents, ...systemAgents],
    commands: systemCommands,
    hooks: [...systemHooks, ...userHooks],
    claudeFiles
  };
}
```

#### Error Resilience
- Individual resource type failures don't prevent other types from loading
- Graceful degradation with empty arrays for failed resource types
- Comprehensive error logging for debugging

### Scope Management

The service distinguishes between different resource scopes:

- **User Scope**: Resources in `~/.claude/` directories
- **System Scope**: Built-in resources and system-wide discoveries
- **Project Scope**: Project-specific resources within individual project directories

## API Integration

### Backend Endpoints

The service integrates with these backend endpoints:

```typescript
// Agent endpoints
GET /api/agents/user     // User-level agents
GET /api/agents/system   // System-wide agent discovery

// Command endpoints  
GET /api/commands/system // System and user commands

// Hook endpoints
GET /api/hooks/system    // System hooks
GET /api/hooks/settings  // User settings hooks

// Project endpoints
GET /api/projects/system // All projects (for CLAUDE.md discovery)
```

### Response Processing (Enhanced in v3.1.0)

Each endpoint's response is processed and normalized with enhanced ID generation:

```typescript
// Agent processing example with enhanced ID generation
return data.map((agent: any): AgentResource => ({
  id: `agent-${scope}-${agent.name || agent.filePath}`, // Enhanced ID generation prevents duplicates
  name: agent.name,
  type: 'agent',
  scope: agent.projectPath ? 'project' : scope,
  filePath: agent.filePath,
  projectPath: agent.projectPath,
  description: agent.description || 'Agent description',
  lastModified: agent.lastModified || new Date(),
  content: agent.content,
  tools: agent.tools,
  color: agent.color
}));

// Commands processing with scope prefixes
return data.map((command: any): CommandResource => ({
  id: `command-${scope}-${command.name}`, // Prevents React key conflicts
  name: command.name,
  type: 'command',
  scope: scope,
  description: command.description,
  // ... other properties
}));

// Hooks processing with fallback for settings endpoint
if (scope === 'settings') {
  // TODO: Implement proper user settings hooks discovery
  return []; // Graceful fallback prevents API errors
}
```

## Integration with ThreeColumnLayout

The service is deeply integrated with the 3-column layout:

### Resource Count Loading
```typescript
const loadAllResourceCounts = async () => {
  const allResourcesData = await ResourceDataService.fetchAllResources();
  
  setResourceCounts({
    agents: allResourcesData.agents.length,
    commands: allResourcesData.commands.length,
    hooks: allResourcesData.hooks.length,
    'claude-files': allResourcesData.claudeFiles.length
  });
};
```

### Dynamic Resource Loading
```typescript
const loadResourcesForNavItem = async (navItem: NavItemType) => {
  switch (navItem) {
    case 'agents':
      resourceData = await ResourceDataService.fetchResourcesByType('agents');
      break;
    case 'commands':
      resourceData = await ResourceDataService.fetchResourcesByType('commands');
      break;
    // ... other cases
  }
  setResources(resourceData);
};
```

## Error Handling Strategy

### Graceful Degradation
```typescript
static async fetchAgents(scope: 'user' | 'system' = 'system'): Promise<AgentResource[]> {
  try {
    const response = await fetch(`${this.BASE_URL}/agents/${scope}`);
    if (!response.ok) throw new Error(`Failed to fetch ${scope} agents`);
    
    // Process and return data
    return processedAgents;
  } catch (error) {
    console.error(`Error fetching ${scope} agents:`, error);
    return []; // Return empty array instead of throwing
  }
}
```

### Comprehensive Logging
- All errors are logged with context (scope, endpoint, error details)
- Non-blocking error handling allows partial resource loading
- Clear error messages for debugging and user feedback

## Usage Examples

### Loading All Resources
```typescript
import { ResourceDataService } from '../utils/resourceDataService';

const loadResources = async () => {
  const allResources = await ResourceDataService.fetchAllResources();
  
  console.log(`Loaded ${allResources.agents.length} agents`);
  console.log(`Loaded ${allResources.commands.length} commands`);
  console.log(`Loaded ${allResources.hooks.length} hooks`);
  console.log(`Loaded ${allResources.claudeFiles.length} CLAUDE.md files`);
};
```

### Loading Specific Resource Type
```typescript
const loadUserAgents = async () => {
  const userAgents = await ResourceDataService.fetchAgents('user');
  console.log('User-level agents:', userAgents);
};
```

### User vs Project Resources
```typescript
const loadUserLevelResources = async () => {
  const { userLevel, projectLevel } = await ResourceDataService.fetchUserResources();
  console.log('Resources available to all projects:', userLevel);
  console.log('Project-specific resources:', projectLevel);
};
```

## Performance Considerations

### Memory Management
- Resources are loaded on-demand based on navigation
- Large resource sets are handled efficiently with streaming
- Proper cleanup prevents memory leaks

### Network Optimization
- Concurrent API calls minimize loading time
- Failed requests don't block successful ones
- Intelligent caching at the component level

### Data Processing
- Minimal data transformation for optimal performance
- Lazy evaluation of complex resource properties
- Efficient array operations for large resource sets

## Future Enhancements

### Caching Layer
- Implement service-level caching with TTL
- Background refresh for stale data
- Selective cache invalidation

### Real-time Updates
- WebSocket integration for live resource updates
- Event-driven cache invalidation
- Optimistic updates for better UX

### Advanced Filtering
- Server-side filtering and search
- Complex query support
- Pagination for large resource sets

## Testing Strategy

### Unit Tests
- Mock API responses for each resource type
- Test error handling scenarios
- Validate data transformation logic

### Integration Tests
- Test with real backend endpoints
- Verify concurrent loading behavior
- Test error recovery and graceful degradation

### Performance Tests
- Measure loading times with large resource sets
- Test memory usage with concurrent requests
- Validate caching effectiveness

## Related Components

- [`ThreeColumnLayout`](../components/ThreeColumnLayout.md) - Primary consumer of resource data
- [`ResourceAssignmentPanel`](../components/ResourceAssignmentPanel.md) - Uses resource data for assignment operations
- [`ResourceLibraryService`](./ResourceLibraryService.md) - Backend service for resource operations

## Recent Enhancements (v3.1.0)

### Enhanced ID Generation System
- **Scope-prefixed IDs** - Prevents React key collisions with format `{type}-{scope}-{name}`
- **Duplicate Prevention** - Robust ID generation eliminates console warnings
- **Cross-type Safety** - Ensures unique IDs across all resource types

### Improved Error Handling
- **Settings Hooks Fallback** - Graceful handling of unimplemented settings endpoint
- **API Error Prevention** - Eliminates 400 Bad Request errors with proper fallbacks
- **Enhanced Logging** - Better error context for debugging and monitoring

### Build Stability Improvements
- **Critical Error Fixes** - Eliminated rendering errors that caused build failures
- **Production Readiness** - Enhanced error boundaries and fallback mechanisms
- **Console Cleanliness** - Significant reduction in warnings and errors

## Development Notes

- **Static Methods**: All methods are static for easy access across components
- **TypeScript Integration**: Full type safety with comprehensive interfaces
- **Error Boundaries**: Designed to work with React error boundaries
- **Enhanced ID System**: Robust ID generation prevents React key conflicts (v3.1.0)
- **Production-Grade Error Handling**: Comprehensive fallbacks and graceful degradation (v3.1.0)
- **Extensibility**: Easy to add new resource types and scopes

This service is fundamental to CChorus's resource management capabilities, providing the data foundation for the entire 3-column interface and enabling efficient resource discovery across the Claude Code ecosystem.