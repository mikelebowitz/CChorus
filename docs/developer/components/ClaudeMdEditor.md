# ClaudeMdEditor Component

## Overview

The `ClaudeMdEditor` component provides comprehensive CLAUDE.md file editing capabilities within CChorus's 3-column layout. It features full react-md-editor integration, professional editing workflows, and intelligent template generation for new files.

## Component Interface

```tsx
interface ClaudeMdEditorProps {
  project: ClaudeProject | null;
  onContentChange?: (project: ClaudeProject, content: string) => void;
}
```

## Key Features

### Professional Editing Workflow
- **Edit/Preview Modes**: Toggle between markdown editing and rendered preview
- **Save/Cancel Actions**: Clear workflow with dirty state tracking
- **Auto-save Prevention**: Prevents accidental data loss with unsaved changes indicator
- **Template Generation**: Intelligent CLAUDE.md templates for new projects

### React-MD-Editor Integration
```tsx
<MDEditor
  value={editorContent}
  onChange={(value) => setEditorContent(value || '')}
  height="100%"
  visibleDragBar={false}
  textareaProps={{
    placeholder: 'Enter CLAUDE.md content...',
    style: { 
      fontSize: 14, 
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      resize: 'none'
    }
  }}
/>
```

### State Management
```tsx
const [editorContent, setEditorContent] = useState('');
const [originalContent, setOriginalContent] = useState('');
const [isEditing, setIsEditing] = useState(false);
const [isDirty, setIsDirty] = useState(false);
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(false);
```

## API Integration

### Loading Project Content
```tsx
const loadProjectContent = async (project: ClaudeProject) => {
  const encodedPath = encodeURIComponent(project.path);
  const response = await fetch(`http://localhost:3001/api/projects/${encodedPath}/claudemd`);
  
  if (response.status === 404) {
    // Generate template for new CLAUDE.md files
    const template = `# ${project.name}

This file provides guidance to Claude Code when working with this project.

## Project Overview
${project.description || 'Describe your project here...'}

## Development Guidelines
- Coding standards and conventions
- Architecture decisions  
- Important patterns to follow

// ... rest of template
`;
  }
};
```

### Saving Content
```tsx
const handleSave = async () => {
  const response = await fetch(`http://localhost:3001/api/projects/${encodedPath}/claudemd`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: editorContent }),
  });
};
```

## Template System

### Intelligent Template Generation
When a project doesn't have a CLAUDE.md file, the component generates a comprehensive template:

```markdown
# ${project.name}

This file provides guidance to Claude Code when working with this project.

## Project Overview
${project.description || 'Describe your project here...'}

## Development Guidelines
- Coding standards and conventions
- Architecture decisions
- Important patterns to follow

## Key Files and Directories
- `src/` - Main source code
- `tests/` - Test files
- ...

## Getting Started
\`\`\`bash
# Installation
npm install

# Development
npm run dev

# Testing
npm test
\`\`\`

## Important Notes
- Any specific considerations for this project
- Dependencies or environment requirements
- Known issues or limitations
```

## UI States

### Empty State (No Project Selected)
```tsx
<div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
  <div className="text-center">
    <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium text-muted-foreground mb-2">
      Select a project to edit
    </h3>
    <p className="text-sm text-muted-foreground max-w-md">
      Choose a project from the list to view and edit its CLAUDE.md file.
    </p>
  </div>
</div>
```

### Loading State
- Animated spinner with contextual messaging
- Project name display during loading
- Professional loading indicator styling

### Editing State
- Full-height MDEditor with monospace font
- Theme-aware editor styling (`data-color-mode="auto"`)
- Consistent placeholder text and styling

### Preview State
- Rendered markdown with `prose` styling
- Theme-aware content rendering
- Professional typography and spacing

## Header Integration

### Information Display
```tsx
<div className="h-12 bg-card border-b flex items-center px-4">
  <div className="flex items-center gap-2 flex-1">
    <FileText size={16} className="text-muted-foreground" />
    <span className="font-medium text-sm">CLAUDE.md</span>
    <span className="text-sm text-muted-foreground">- {project.name}</span>
  </div>
  // ... action buttons
</div>
```

### Action Buttons
- **Edit Mode**: Cancel and Save buttons with proper state management
- **View Mode**: Edit button to enter editing mode
- **Status Indicators**: "Unsaved changes" badge when content is dirty
- **Loading States**: Proper disabled states during save operations

## Theme Integration

### CSS Custom Properties
The component fully integrates with CChorus's theme system:
- `bg-background` and `text-foreground` for main content
- `bg-card` and `border-b` for header styling
- `text-muted-foreground` for secondary information
- `bg-muted` for status indicators

### Dark Mode Support
```tsx
<div 
  className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm"
  data-color-mode="auto"
>
  <MDEditor.Markdown source={editorContent} />
</div>
```

## Error Handling

### Network Errors
```tsx
catch (error) {
  console.error('Error loading CLAUDE.md:', error);
  toast({
    title: "Error",
    description: "Failed to load CLAUDE.md content",
    duration: 3000,
  });
}
```

### Save Failures
- Toast notifications for save errors
- State preservation during failed saves
- Retry mechanisms for transient failures

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for editor and buttons
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Focus Management**: Clear focus indicators throughout editing workflow
- **High Contrast**: Compatible with system high contrast modes

## Performance Optimizations

### Content Loading
- Lazy loading of CLAUDE.md content
- Efficient state updates with proper dependencies
- Memory cleanup on component unmount

### Editor Performance
- Minimal re-renders during editing
- Efficient dirty state tracking
- Optimized markdown rendering

## Usage Example

```tsx
import { ClaudeMdEditor } from '@/components/ClaudeMdEditor';

function ProjectView() {
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null);

  return (
    <ClaudeMdEditor 
      project={selectedProject}
      onContentChange={(project, content) => {
        console.log(`CLAUDE.md updated for ${project.name}`);
      }}
    />
  );
}
```

## Integration with ThreeColumnLayout

The ClaudeMdEditor is designed specifically for integration within the 3-column layout:

```tsx
// In ThreeColumnLayout.tsx
const renderContentColumn = () => {
  if (selectedNavItem === 'projects') {
    return (
      <ClaudeMdEditor 
        project={selectedProject}
        onContentChange={(project, content) => {
          console.log('CLAUDE.md updated for project:', project.name);
        }}
      />
    );
  }
  // ... other content types
};
```

## Future Enhancements

### Planned Features
- **Auto-save**: Periodic auto-save with conflict resolution
- **Version History**: Track and restore previous versions
- **Collaborative Editing**: Real-time collaborative editing support
- **Syntax Highlighting**: Enhanced markdown syntax highlighting

### Extension Points
- **Custom Templates**: User-configurable CLAUDE.md templates
- **Validation**: CLAUDE.md content validation and linting
- **Export Options**: Export to various formats (PDF, HTML, etc.)

## Testing Strategy

### Manual Testing
- Create new CLAUDE.md files and verify template generation
- Edit existing files and confirm save/cancel workflows
- Test theme switching during editing sessions
- Validate error handling for network failures

### Integration Testing
- Verify proper integration with ProjectManager selection
- Test callback functionality with parent components
- Confirm state management across project switches

## Development Notes

- **Component Isolation**: Self-contained with minimal external dependencies
- **TypeScript Integration**: Full type safety with ClaudeProject interface
- **Error Boundaries**: Graceful error handling for failed operations
- **State Persistence**: Editor state maintained during theme switches

This component represents the professional-grade CLAUDE.md editing experience that integrates seamlessly with CChorus's 3-column architecture.