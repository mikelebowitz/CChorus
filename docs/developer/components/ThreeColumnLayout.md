# ThreeColumnLayout Component

## Overview

The `ThreeColumnLayout` component provides CChorus's modern professional interface with real resource data integration, featuring a hierarchical navigation sidebar, context-aware middle column with live resource data, and enhanced content editor with resource assignment capabilities. This component represents the primary user interface for CChorus as of August 2025.

## Component Architecture

```tsx
interface ThreeColumnLayoutProps {
  children?: React.ReactNode;
}
```

## Layout Structure

### Left Sidebar (Fixed 256px width)
- **Navigation Categories**: Users, Projects, Agents, Commands, Hooks, CLAUDE.md
- **Global Search**: Full-text search across all resource types
- **Resource Counts**: Dynamic count badges for each category
- **Collapse Toggle**: Collapsible sidebar with menu button

### Middle Column (Fixed 320px width)
- **Context-Aware Lists**: Dynamic content based on selected navigation item
- **Project Integration**: Embedded ProjectManager for project browsing
- **Filter Controls**: Search and filter functionality for each resource type
- **Selection Management**: Handles resource selection for right column

### Right Column (Fixed 320px width)
- **PropertiesPanel Component**: Persistent properties and actions panel for selected items
- **Context-Aware Content**: Dynamic metadata display based on selected resource/project type
- **Action Integration**: Type-specific actions (edit, test, deploy, delete) for enhanced workflow
- **Professional Empty States**: Guided empty states when no selection with clear instructions

## Information-Rich Header

- **Contextual Breadcrumbs**: Dynamic path showing current selection hierarchy
- **Action Buttons**: Context-aware actions (Export, Save Changes)
- **Metadata Display**: Last updated timestamps and status indicators
- **Professional Styling**: Clean, consistent with shadcn/ui design system

## Key Features

### Real Resource Data Integration

The component integrates with `ResourceDataService` to provide live resource data:

```tsx
// Dynamic resource loading based on navigation
const loadResourcesForNavItem = async (navItem: NavItemType) => {
  switch (navItem) {
    case 'agents':
      resourceData = await ResourceDataService.fetchResourcesByType('agents');
      break;
    case 'commands':
      resourceData = await ResourceDataService.fetchResourcesByType('commands');
      break;
    case 'hooks':
      resourceData = await ResourceDataService.fetchResourcesByType('hooks');
      break;
    case 'claude-files':
      resourceData = await ResourceDataService.fetchResourcesByType('claude-files');
      break;
  }
  setResources(resourceData);
};
```

### Navigation System with Dynamic Counts
```tsx
type NavItemType = 'users' | 'projects' | 'agents' | 'commands' | 'hooks' | 'claude-files';

// Navigation items with real resource counts
const navItems: NavItem[] = [
  { id: 'users', label: 'Users', icon: User, count: 1 },
  { id: 'projects', label: 'Projects', icon: FolderOpen, count: 5, expanded: true },
  { id: 'agents', label: 'Agents', icon: Bot, count: resourceCounts.agents },
  { id: 'commands', label: 'Commands', icon: Terminal, count: resourceCounts.commands },
  { id: 'hooks', label: 'Hooks', icon: Webhook, count: resourceCounts.hooks },
  { id: 'claude-files', label: 'CLAUDE.md', icon: FileText, count: resourceCounts['claude-files'] },
];
```

### Resource Assignment System

Integrated resource assignment capabilities:

```tsx
const handleAssignmentChange = async (resourceName: string) => {
  // Reload all resources to update assignment map
  await loadAllResourceCounts();
  // Reload current view
  await loadResourcesForNavItem(selectedNavItem);
};
```

### State Management
- `selectedNavItem`: Currently active navigation category
- `sidebarCollapsed`: Sidebar visibility state
- `searchQuery`: Global search input
- `selectedProject`: Current project for CLAUDE.md editing
- `selectedResource`: Current resource for content editing
- `resources`: Current resource list based on selected navigation item
- `allResources`: Complete resource collection for assignment operations
- `resourceAssignments`: Map of resource assignments across projects
- `resourceCounts`: Dynamic counts for each navigation category

### Integration Points

#### ResourceDataService Integration
```tsx
import { ResourceDataService, ResourceItem } from '../utils/resourceDataService';

// Load all resource counts on component mount
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

#### ProjectManager Integration
```tsx
<ProjectManager 
  onProjectSelect={handleProjectSelect}
  onProjectEdit={(project, content) => {
    console.log('Project edited:', project.name);
  }}
  showEditor={false}
  layoutMode="list-only"
/>
```

#### ResourceAssignmentPanel Integration
```tsx
{['agent', 'command', 'hook'].includes(selectedResource.type) && (
  <ResourceAssignmentPanel 
    resource={selectedResource}
    assignments={assignments}
    allProjects={projects}
    onAssignmentChange={handleAssignmentChange}
  />
)}
```

#### PropertiesPanel Integration
```tsx
const renderContentColumn = () => {
  // Always show PropertiesPanel on the right
  let selectedItem = null;
  
  // Convert selected items to properties format
  if (selectedNavItem === 'projects' && selectedProject) {
    selectedItem = {
      type: 'project' as const,
      name: selectedProject.name,
      path: selectedProject.path,
      lastModified: selectedProject.lastModified,
      description: `Claude Code project configuration`
    };
  } else if (selectedResource && selectedNavItem !== 'projects') {
    selectedItem = {
      type: selectedResource.type,
      name: selectedResource.name,
      path: selectedResource.path,
      lastModified: selectedResource.lastModified,
      scope: selectedResource.scope,
      description: selectedResource.description,
      tools: (selectedResource as AgentResource).tools
    };
  }

  return <PropertiesPanel selectedItem={selectedItem} />;
};
```

#### ClaudeMdEditor Integration (Legacy)
```tsx
<ClaudeMdEditor 
  project={selectedProject}
  onContentChange={(project, content) => {
    console.log('CLAUDE.md updated for project:', project.name);
  }}
/>
```

## Theme Integration

The component fully integrates with CChorus's theme system:

- **CSS Custom Properties**: Uses `--background`, `--foreground`, `--muted`, etc.
- **Responsive Classes**: `bg-background`, `text-muted-foreground`, `border-r`
- **Theme Awareness**: Adapts to light/dark themes automatically
- **Consistent Spacing**: Uses Tailwind spacing utilities throughout

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Works with system high contrast modes

## Performance Considerations

- **Fixed Layout**: Prevents layout shifts during navigation
- **Lazy Loading**: Content loaded only when needed
- **Efficient Re-renders**: State isolation prevents unnecessary updates
- **Memory Management**: Proper cleanup of event listeners and timers

## Usage Example

```tsx
import { ThreeColumnLayout } from '@/components/ThreeColumnLayout';

function App() {
  return (
    <div className="h-screen">
      <ThreeColumnLayout />
    </div>
  );
}
```

## Resource Content Rendering

The component provides specialized content rendering for each resource type:

### Agent Resources
```tsx
{selectedResource.type === 'agent' && (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold mb-2">{selectedResource.name}</h2>
      <p className="text-sm text-muted-foreground mb-4">{selectedResource.description}</p>
      {(selectedResource as AgentResource).tools && (
        <div className="mb-4">
          <span className="text-sm font-medium">Tools: </span>
          <span className="text-sm text-muted-foreground">
            {(selectedResource as AgentResource).tools?.join(', ')}
          </span>
        </div>
      )}
    </div>
    <MDEditor
      value={(selectedResource as AgentResource).content || ''}
      preview="preview"
      hideToolbar
      height={400}
    />
  </div>
)}
```

### Command Resources
```tsx
{selectedResource.type === 'command' && (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold mb-2">{selectedResource.name}</h2>
      <p className="text-sm text-muted-foreground mb-4">{selectedResource.description}</p>
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm font-mono">{selectedResource.description}</p>
      </div>
    </div>
  </div>
)}
```

## Future Enhancements

### Planned Features
- **Enhanced Resource Editing**: Visual editors for hooks and commands
- **Resizable Columns**: User-adjustable column widths with persistence
- **Drag & Drop**: Resource movement between columns
- **Quick Switcher**: Cmd+K navigation overlay
- **Mobile Responsive**: Collapsible columns for mobile devices

### Extension Points
- **Custom Navigation Items**: Plugin system for additional resource types
- **Content Renderers**: Custom editors for different resource types
- **Context Actions**: Extensible action system in header
- **Assignment Templates**: Predefined assignment patterns for common workflows

## Related Components

- [`ClaudeMdEditor`](./ClaudeMdEditor.md) - Integrated CLAUDE.md editor
- [`LayoutToggle`](./LayoutToggle.md) - Interface switching component
- [`ProjectManager`](./ProjectManager.md) - Enhanced project management
- [`ResourceAssignmentPanel`](./ResourceAssignmentPanel.md) - Cross-project resource assignment
- [`ResourceDataService`](../services/ResourceDataService.md) - Unified resource discovery service

## Testing Strategy

### Manual Testing
- Verify navigation between all resource categories
- Test project selection and CLAUDE.md editing workflow
- Validate theme switching maintains layout integrity
- Confirm responsive behavior at different screen sizes

### Accessibility Testing
- Screen reader navigation through all components
- Keyboard-only navigation verification
- High contrast mode compatibility
- Focus management validation

## Development Notes

- **Component Isolation**: ThreeColumnLayout is self-contained with minimal external dependencies
- **TypeScript Integration**: Full type safety with proper interfaces
- **Error Boundaries**: Graceful error handling for failed content loading
- **State Persistence**: Navigation state maintained across sessions

This component represents the culmination of CChorus's evolution into a professional-grade Claude Code resource management platform.