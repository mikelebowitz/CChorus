# ThreeColumnLayout Component

## Overview

The `ThreeColumnLayout` component provides CChorus's modern professional interface, featuring a hierarchical navigation sidebar, context-aware middle column, and enhanced content editor. This component represents the primary user interface for CChorus as of August 2025.

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

### Right Column (Flexible width)
- **Content Editor**: Dynamic editor based on selected resource type
- **CLAUDE.md Integration**: Full ClaudeMdEditor for project files
- **Placeholder States**: Professional empty states when no selection

## Information-Rich Header

- **Contextual Breadcrumbs**: Dynamic path showing current selection hierarchy
- **Action Buttons**: Context-aware actions (Export, Save Changes)
- **Metadata Display**: Last updated timestamps and status indicators
- **Professional Styling**: Clean, consistent with shadcn/ui design system

## Key Features

### Navigation System
```tsx
type NavItemType = 'users' | 'projects' | 'agents' | 'commands' | 'hooks' | 'claude-files';

const navItems: NavItem[] = [
  { id: 'users', label: 'Users', icon: User, count: 1 },
  { id: 'projects', label: 'Projects', icon: FolderOpen, count: 5, expanded: true },
  { id: 'agents', label: 'Agents', icon: Bot, count: 4 },
  { id: 'commands', label: 'Commands', icon: Terminal, count: 2 },
  { id: 'hooks', label: 'Hooks', icon: Webhook, count: 4 },
  { id: 'claude-files', label: 'CLAUDE.md', icon: FileText, count: 3 },
];
```

### State Management
- `selectedNavItem`: Currently active navigation category
- `sidebarCollapsed`: Sidebar visibility state
- `searchQuery`: Global search input
- `selectedProject`: Current project for CLAUDE.md editing

### Integration Points

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

#### ClaudeMdEditor Integration
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

## Future Enhancements

### Planned Features
- **Resizable Columns**: User-adjustable column widths with persistence
- **Drag & Drop**: Resource movement between columns
- **Quick Switcher**: Cmd+K navigation overlay
- **Mobile Responsive**: Collapsible columns for mobile devices

### Extension Points
- **Custom Navigation Items**: Plugin system for additional resource types
- **Content Renderers**: Custom editors for different resource types
- **Context Actions**: Extensible action system in header

## Related Components

- [`ClaudeMdEditor`](./ClaudeMdEditor.md) - Integrated CLAUDE.md editor
- [`LayoutToggle`](./LayoutToggle.md) - Interface switching component
- [`ProjectManager`](./ProjectManager.md) - Enhanced project management

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