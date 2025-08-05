# ProjectManager Component Documentation

<!-- COMPONENT_PROJECT_MANAGER -->
<!-- UPDATE_TRIGGER: When ProjectManager.tsx is modified -->
<!-- STATUS: COMPLETED - Enhanced with react-md-editor integration -->

## Overview

The ProjectManager component provides comprehensive project discovery and CLAUDE.md editing capabilities with streaming discovery, enhanced caching, and integrated project preferences management. It combines real-time project scanning with professional markdown editing tools and advanced project management features.

## Component Props

```typescript
interface ProjectManagerProps {
  onProjectSelect?: (project: ClaudeProject) => void;
  onProjectEdit?: (project: ClaudeProject, content: string) => void;
  showEditor?: boolean; // Control whether to show the editor panel
  layoutMode?: 'standalone' | 'list-only'; // Layout mode for 3-column integration
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

### Enhanced Project Management
- **Advanced Status Filtering**: Filter by active, archived, hidden, favorited, and all projects with dedicated tab interface
- **Project Preferences System**: Comprehensive preference management with archiving, favoriting, and visibility controls
- **Search Functionality**: Real-time text-based project search with instant filtering
- **Professional UI**: Clean list layout with alternating row colors and metadata display
- **Cache Management**: Intelligent caching with background refresh and cache clearing capabilities
- **Streaming Discovery**: Server-Sent Events for real-time project discovery with progress feedback

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

Server-Sent Events provide live project discovery with comprehensive event handling:

```typescript
const eventSource = new EventSource('http://localhost:3001/api/projects/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'scan_started':
      setScanningMessage('Scanning for projects...');
      break;
    case 'project_found':
      const projectWithPreferences = {
        ...data.project,
        ...ProjectPreferencesService.getProjectPreferences(data.project.path)
      };
      setProjects(prev => [...prev, projectWithPreferences]);
      setScanningMessage(`Found ${data.count} project${data.count !== 1 ? 's' : ''}...`);
      break;
    case 'scan_complete':
      setLoading(false);
      setScanningMessage('');
      break;
  }
};
```

## API Integration

### Endpoints Used

- `GET /api/projects/stream` - Server-Sent Events for real-time project discovery with progress updates
- `GET /api/projects/system` - System-wide project discovery with batch loading fallback
- `GET /api/projects/:projectPath(*)/claudemd` - Read CLAUDE.md file content with proper path encoding
- `PUT /api/projects/:projectPath(*)/claudemd` - Save CLAUDE.md file content with backup creation
- Project preferences managed via `ProjectPreferencesService` with localStorage persistence

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
- **Enhanced User Experience**: Full MDEditor integration with live preview and visual editing
- **Template Generation**: Automatic CLAUDE.md template creation for projects without existing files
- **Professional Editing**: Split-view editing with toolbar and syntax highlighting
- **Height Management**: Configurable editor height (400px) with responsive design

### Project Preferences System
- **Archiving System**: Archive/unarchive projects with status persistence
- **Favoriting System**: Star/unstar projects with visual indicators
- **Visibility Controls**: Hide/show projects with proper filtering
- **View Tracking**: Mark projects as viewed with automatic preference updates

### Streaming and Caching Enhancements
- **Cache Invalidation**: Intelligent cache clearing on first load to fix inconsistent state
- **Background Refresh**: Automatic cache refresh when data becomes stale
- **Streaming Accumulator**: Reliable project accumulation during streaming discovery
- **Progress Feedback**: Real-time scanning progress with user-friendly messages
- **Fallback Handling**: Graceful fallback to batch loading when streaming fails

### Performance and Reliability Improvements
- **Event Source Management**: Proper cleanup and error handling for streaming connections
- **Toast Notifications**: Comprehensive user feedback for all operations
- **Error Recovery**: Robust error handling with retry mechanisms
- **Memory Management**: Efficient state management and component cleanup

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