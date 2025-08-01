# ProjectManager Component Documentation

<!-- COMPONENT_PROJECT_MANAGER -->
<!-- UPDATE_TRIGGER: When ProjectManager.tsx is modified -->
<!-- STATUS: COMPLETED - Enhanced with react-md-editor integration -->

## Overview

The ProjectManager component provides comprehensive project discovery and CLAUDE.md editing capabilities with enhanced markdown editing features. It combines real-time project scanning with professional markdown editing tools.

## Component Props

```typescript
interface ProjectManagerProps {
  onProjectSelect?: (project: ClaudeProject) => void;
  onProjectEdit?: (project: ClaudeProject, content: string) => void;
}

interface ClaudeProject {
  name: string;
  path: string;
  relativePath: string;
  lastModified: Date;
  hasClaudeFile: boolean;
  claudeFilePath?: string;
  claudeFileSize?: number;
  sourceType: 'project' | 'user';
  gitStatus?: {
    isGitRepo: boolean;
    branch?: string;
    hasChanges?: boolean;
  };
}
```

## Key Features

### Enhanced Markdown Editing
- **react-md-editor Integration**: Professional markdown editor with live preview
- **WYSIWYG Experience**: Visual editing with split-view preview
- **Markdown Toolbar**: Rich formatting tools and shortcuts
- **Syntax Highlighting**: Code blocks with proper syntax highlighting
- **Live Preview**: Real-time preview of markdown rendering

### Project Discovery
- **System-wide Scanning**: Discovers all projects containing CLAUDE.md files
- **Server-Sent Events**: Real-time project discovery with live progress updates
- **Client-side Caching**: Intelligent caching with background refresh
- **Metadata Extraction**: Project paths, file sizes, modification dates, Git status

### Project Management
- **Status Filtering**: Filter by active, archived, hidden, favorited projects
- **Project Preferences**: LocalStorage-based preference management
- **Search Functionality**: Text-based project search
- **Dual View Modes**: Grid and list view layouts

## Dependencies

```json
{
  "@uiw/react-md-editor": "^4.0.8",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "lucide-react": "^0.263.1"
}
```

## Implementation Details

### MDEditor Integration

The component integrates `@uiw/react-md-editor` for enhanced CLAUDE.md editing:

```typescript
import MDEditor from '@uiw/react-md-editor';

// In render:
<MDEditor
  value={editingContent}
  onChange={(value) => setEditingContent(value || '')}
  preview="edit"
  hideToolbar={false}
  visibleDragBar={false}
/>
```

### Caching Strategy

The component uses intelligent caching for optimal performance:

```typescript
const cacheKey = 'cchorus-projects';
const cachedData = CacheService.get(cacheKey);

// Background refresh for stale data
if (CacheService.isStale(cacheKey, 5 * 60 * 1000)) {
  // Refresh in background
}
```

### Real-time Updates

Server-Sent Events provide live project discovery:

```typescript
const eventSource = new EventSource('/api/projects/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI with streaming data
};
```

## API Integration

### Endpoints Used

- `GET /api/projects/stream` - Server-Sent Events for real-time project discovery
- `GET /api/projects` - Cached project list
- `GET /api/file/read` - Read CLAUDE.md file content
- `POST /api/file/write` - Save CLAUDE.md file content

### Error Handling

The component implements comprehensive error handling:

```typescript
try {
  const content = await readFile(claudeFilePath);
  setEditingContent(content);
} catch (error) {
  toast({
    title: "Error",
    description: `Failed to load file: ${error.message}`,
    variant: "destructive",
  });
}
```

## Recent Enhancements (August 2025)

### react-md-editor Integration
- **Enhanced User Experience**: Replaced basic textarea with professional markdown editor
- **Visual Editing**: Live preview with split-view editing
- **Rich Formatting**: Toolbar with markdown formatting shortcuts
- **Improved Workflow**: Better CLAUDE.md editing experience

### Bug Fixes Applied
- **Duplicate Detection**: Projects now properly deduplicated in listings
- **User-level Discovery**: Home directory projects properly included
- **Error Resilience**: Better handling of filesystem access issues

## Usage Example

```typescript
import { ProjectManager } from './components/ProjectManager';

function App() {
  const handleProjectSelect = (project: ClaudeProject) => {
    console.log('Selected project:', project.name);
  };

  const handleProjectEdit = (project: ClaudeProject, content: string) => {
    console.log('Edited project:', project.name, 'Content length:', content.length);
  };

  return (
    <ProjectManager
      onProjectSelect={handleProjectSelect}
      onProjectEdit={handleProjectEdit}
    />
  );
}
```

## Testing Considerations

### Manual Testing Checklist
- [ ] Project discovery includes both user and project-level projects
- [ ] No duplicate projects appear in listings
- [ ] Markdown editor loads with proper formatting
- [ ] Live preview works correctly
- [ ] File saving preserves content correctly
- [ ] Caching provides instant loading on subsequent visits
- [ ] Server-Sent Events show real-time discovery progress

### Error Scenarios
- [ ] Handle missing CLAUDE.md files gracefully
- [ ] Show appropriate errors for filesystem permission issues
- [ ] Validate markdown content before saving
- [ ] Handle network errors during file operations

## Future Enhancements

- **Collaborative Editing**: Multi-user editing capabilities
- **Version Control**: Git integration for CLAUDE.md changes
- **Template Library**: Predefined CLAUDE.md templates
- **Advanced Search**: Full-text search within CLAUDE.md content
- **Export Functionality**: Export projects to various formats