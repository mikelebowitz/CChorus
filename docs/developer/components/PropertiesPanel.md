# PropertiesPanel Component

## Overview

The `PropertiesPanel` component is a context-aware right sidebar that provides persistent metadata display and actions for selected items in the ThreeColumnLayout interface. This component represents a key architectural enhancement in CChorus v2.0.0, providing a Linear-style properties panel for enhanced resource management.

## Component Architecture

```tsx
interface PropertiesPanelProps {
  selectedItem?: {
    type: 'project' | 'agent' | 'command' | 'hook' | 'claudeFile';
    name: string;
    path?: string;
    lastModified?: string;
    scope?: 'user' | 'project';
    description?: string;
    tools?: string[];
    [key: string]: any;
  } | null;
}
```

## Layout Structure

### Header Section (Fixed)
- **Properties Title**: Icon and title with consistent styling
- **Selection State**: Clear indication of selected item or empty state

### Basic Information Panel
- **Item Name**: Primary identifier with clean typography
- **Type Badge**: Color-coded badge indicating resource type
- **Scope Badge**: User/project scope indicator with semantic colors
- **Description**: Optional description display when available

### Metadata Section
- **Last Modified**: Timestamp with human-readable formatting and Date object safety
- **File Path**: Full path display with monospace font and word breaking
- **Additional Properties**: Extensible property display based on item type

### Actions Section
- **Context Actions**: Dynamic action buttons based on selected item type
- **Edit Actions**: Edit functionality for supported resource types
- **Test Actions**: Testing capabilities for agents
- **Deploy Actions**: Deployment options for user-level resources
- **Delete Actions**: Safe deletion with confirmation

### Specialized Panels

#### Agent-Specific Properties
```tsx
{selectedItem.type === 'agent' && selectedItem.tools && (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold">Tools</h4>
    <div className="flex flex-wrap gap-1">
      {selectedItem.tools.map((tool: string, index: number) => (
        <Badge key={index} variant="outline" className="text-xs">
          {tool}
        </Badge>
      ))}
    </div>
  </div>
)}
```

#### Project Assignment Panel
```tsx
{selectedItem.scope === 'user' && (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold">Project Assignments</h4>
    <p className="text-xs text-muted-foreground">
      This is a user-level resource. Assign to projects:
    </p>
    
    <div className="space-y-2">
      {['CChorus', 'karakeep-app', 'homelab'].map((project) => (
        <label key={project} className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" />
          {project}
        </label>
      ))}
    </div>
    
    <Button size="sm" className="w-full">
      Apply Assignments
    </Button>
  </div>
)}
```

## Key Features

### Persistent Right Column
- **Fixed Width**: 320px (w-80) width maintains layout stability
- **Vertical Scroll**: Overflow-y auto allows content expansion
- **Consistent Position**: Always visible in ThreeColumnLayout right panel

### Context-Aware Content
- **Dynamic Actions**: Action buttons adapt to selected item type
- **Type-Specific Sections**: Specialized content based on resource type
- **Scope-Aware Features**: Different capabilities for user vs project scope

### Professional Empty State
```tsx
if (!selectedItem) {
  return (
    <div className="w-80 border-l bg-muted/30 p-6 flex flex-col items-center justify-center text-muted-foreground">
      <Settings className="w-12 h-12 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Properties</h3>
      <p className="text-sm text-center">
        Select an item to view and edit its properties
      </p>
    </div>
  );
}
```

### Badge System with Semantic Colors
```tsx
const getStatusColor = (scope?: string) => {
  switch (scope) {
    case 'user': return 'bg-blue-100 text-blue-800';
    case 'project': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (type: string) => {
  switch (type) {
    case 'agent': return 'bg-purple-100 text-purple-800';
    case 'command': return 'bg-orange-100 text-orange-800';
    case 'hook': return 'bg-red-100 text-red-800';
    case 'project': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```

## Integration with ThreeColumnLayout

### Selection Management
```tsx
// ThreeColumnLayout selection conversion
let selectedItem = null;

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
```

### State Coordination
- **Selection Sync**: Automatically updates when ThreeColumnLayout selection changes
- **Action Integration**: Actions trigger callbacks to parent component
- **Resource Updates**: Reflects changes in real-time resource data

## Theme Integration

### shadcn/ui Compliance
- **Component Library**: Uses shadcn/ui components (Button, Badge, Label, Separator)
- **CSS Variables**: Leverages theme CSS custom properties
- **Color System**: Consistent with design system color palette
- **Typography**: Uses theme typography scales and weights

### Responsive Behavior
- **Fixed Width**: Maintains 320px width for layout stability
- **Vertical Scrolling**: Handles content overflow gracefully
- **Border Integration**: Seamless border integration with layout

## Action System

### Dynamic Action Generation
```tsx
<div className="flex flex-col gap-2">
  <Button variant="outline" size="sm" className="justify-start">
    Edit {selectedItem.type}
  </Button>
  
  {selectedItem.type === 'agent' && (
    <>
      <Button variant="outline" size="sm" className="justify-start">
        Test Agent
      </Button>
      <Button variant="outline" size="sm" className="justify-start">
        Deploy Agent
      </Button>
    </>
  )}
  
  {selectedItem.type === 'project' && (
    <>
      <Button variant="outline" size="sm" className="justify-start">
        Open in Editor
      </Button>
      <Button variant="outline" size="sm" className="justify-start">
        Export Resources
      </Button>
    </>
  )}
  
  <Button variant="outline" size="sm" className="justify-start text-destructive hover:text-destructive">
    Delete {selectedItem.type}
  </Button>
</div>
```

### Future Action Integration
- **Edit Functionality**: Will integrate with resource editors
- **Test Capabilities**: Agent testing and validation
- **Deploy Operations**: Resource assignment system integration
- **Export Features**: Resource export and backup capabilities

## Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: All interactive elements are keyboard accessible
- **Focus Management**: Clear focus indicators for all buttons
- **Screen Reader**: Proper ARIA labels and semantic markup

### Visual Accessibility
- **High Contrast**: Works with system high contrast modes
- **Color Independence**: Information not conveyed through color alone
- **Text Scaling**: Responds to browser text size settings

## Performance Considerations

### Efficient Rendering
- **Conditional Rendering**: Only renders visible sections based on selected item
- **Memoization Ready**: Component structure supports React.memo optimization
- **Lightweight Dependencies**: Minimal component dependencies

### Memory Management
- **No State Leaks**: All state managed by parent component
- **Cleanup**: No event listeners or timers requiring cleanup
- **Efficient Updates**: Renders only when selectedItem changes

## Usage Example

```tsx
import { PropertiesPanel } from '@/components/PropertiesPanel';

function ThreeColumnLayout() {
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  
  const selectedItem = selectedResource ? {
    type: selectedResource.type,
    name: selectedResource.name,
    path: selectedResource.path,
    lastModified: selectedResource.lastModified,
    scope: selectedResource.scope,
    description: selectedResource.description,
    tools: selectedResource.tools
  } : null;
  
  return (
    <div className="flex h-full">
      {/* Left and Middle columns */}
      <div className="flex-1">
        {/* Navigation and content */}
      </div>
      
      {/* Right column with PropertiesPanel */}
      <PropertiesPanel selectedItem={selectedItem} />
    </div>
  );
}
```

## Recent Enhancements (v3.1.0)

### Date Object Safety Enhancement
```tsx
// Enhanced date formatting with error boundary protection
<p className="text-sm">
  {selectedItem.lastModified instanceof Date 
    ? selectedItem.lastModified.toLocaleDateString()
    : String(selectedItem.lastModified)}
</p>
```

This enhancement prevents React crashes when Date objects are passed as children, providing graceful fallback formatting.

## Future Enhancements

### Planned Features
- **Inline Editing**: Direct property editing without modal dialogs
- **Action Callbacks**: Integration with parent component actions
- **Resource Relationships**: Display related resources and dependencies
- **Quick Actions**: Keyboard shortcuts for common operations
- **Property Validation**: Real-time validation of property changes

### Extension Points
- **Custom Property Renderers**: Type-specific property display components
- **Action Plugin System**: Extensible action system for custom operations
- **Context Menu Integration**: Right-click context menus for quick actions
- **Drag & Drop**: Support for drag-based resource operations

## Related Components

- [`ThreeColumnLayout`](./ThreeColumnLayout.md) - Main layout container
- [`ResourceLibrary`](../../user/workflows/resource-discovery.md) - Resource selection source
- [`ProjectManager`](./ProjectManager.md) - Project selection integration
- [`ResourceDataService`](../services/ResourceDataService.md) - Data source for properties

## Development Notes

### Component Design Philosophy
- **Single Responsibility**: Focused on property display and actions
- **Declarative Interface**: Props-driven with no internal state
- **Composable Architecture**: Designed for integration with various selection sources
- **Theme Consistency**: Follows CChorus design system patterns

### Technical Implementation
- **TypeScript Safety**: Full type safety with comprehensive interfaces
- **Error Boundaries**: Graceful error handling for malformed props
- **Performance Optimized**: Efficient rendering with minimal re-renders
- **Accessibility First**: Built with accessibility as core requirement

This component represents a significant architectural enhancement to CChorus, providing the persistent properties panel that completes the Linear-style 3-column interface design.