# ResourceEditor Component

**File**: `src/components/ResourceEditor.tsx`  
**Purpose**: Professional resource content editing interface for CChorus  
**Column**: 2 (Middle column of ThreeColumnLayout)  
**Status**: ✅ Core functionality implemented, ⚠️ UX architecture issues require repair

## Overview

ResourceEditor provides a professional content editing experience for all resource types in CChorus, including agents, commands, hooks, and CLAUDE.md files. Built with MDXEditor integration, it offers syntax highlighting, code blocks, and intelligent content templates.

## Current Status

### ✅ Working Features
- **Project File Loading** - Successfully loads project files after 403 error fix
- **MDXEditor Integration** - Professional markdown editing with syntax highlighting
- **Resource-Type Templates** - Dynamic content generation based on resource type  
- **Content Display** - Properly renders existing content in editor
- **Basic Save Operations** - Can save content to files

### ⚠️ Known Issues (Requires Repair)
- **Dual Save Architecture** - Conflicting save buttons with PropertiesPanel
- **Cursor Positioning** - Text insertion happens at wrong positions
- **Change Detection Fragmentation** - Inconsistent change tracking across components
- **State Management Issues** - Multiple components managing overlapping state

## Architecture

### Component Props Interface
```typescript
interface ResourceEditorProps {
  selectedResource: Resource | null;
  onResourceChange?: (resource: Resource) => void;
  onSave?: (resource: Resource, content: string) => Promise<void>;
  className?: string;
}

interface Resource {
  id: string;
  name: string;
  type: 'agent' | 'command' | 'hook' | 'claude-md';
  path: string;
  projectPath?: string;
  content?: string;
  isReadOnly?: boolean;
  systemSource?: string;
}
```

### Core Dependencies
```typescript
import { MDXEditor } from '@mdxeditor/editor';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
```

### Key Features Implementation

#### 1. **Resource-Type Awareness**
```typescript
const getResourceTemplate = (type: string): string => {
  switch (type) {
    case 'agent':
      return `---
name: agent-name
description: When to invoke this agent
tools: tool1, tool2, tool3
---

System prompt content...`;
    case 'command':
      return `name: command-name
description: Command description
usage: Usage instructions`;
    // ... other templates
  }
};
```

#### 2. **MDXEditor Integration**
```typescript
<MDXEditor
  markdown={content}
  onChange={handleContentChange}
  plugins={[
    headingsPlugin(),
    listsPlugin(), 
    quotePlugin(),
    codeBlockPlugin(),
    // ... additional plugins
  ]}
  contentEditableClassName="prose prose-slate max-w-none"
/>
```

#### 3. **Change Detection** (Current Implementation)
```typescript
const [hasChanges, setHasChanges] = useState(false);
const [originalContent, setOriginalContent] = useState('');

const handleContentChange = (newContent: string) => {
  setContent(newContent);
  setHasChanges(newContent !== originalContent);
};
```

## Critical Issues Analysis

### 1. **Dual Save Button Architecture**

**Problem**: ResourceEditor and PropertiesPanel both have save functionality that operates independently.

**Current State**:
```typescript
// ResourceEditor save button
<Button onClick={handleSave} disabled={!hasChanges}>
  Save Changes
</Button>

// PropertiesPanel also has save functionality for the same resource
// These operate independently causing user confusion
```

**Impact**: 
- Users don't know which save button to use
- Inconsistent save states between components
- Potential for data loss or overwrite conflicts

### 2. **MDXEditor Cursor Issues**

**Problem**: Text insertion (templates, content) happens at wrong cursor positions.

**Manifestation**:
- Template insertion doesn't respect cursor position
- Content appears at beginning/end instead of cursor location
- Focus management issues after content loads

**Technical Details**:
```typescript
// Current problematic implementation
const insertTemplate = (template: string) => {
  // This doesn't properly handle cursor positioning
  setContent(content + template);
};

// Needed: Proper cursor-aware insertion
const insertAtCursor = (text: string) => {
  // Get current cursor position from MDXEditor
  // Insert text at cursor location
  // Restore cursor position after insertion
};
```

### 3. **Change Detection Fragmentation**

**Problem**: PropertiesPanel doesn't detect changes made in ResourceEditor.

**Current Flow**:
```
User edits in MDXEditor → ResourceEditor.hasChanges = true
PropertiesPanel.hasChanges remains false → Save button doesn't activate
```

**Required Flow**:
```
User edits in MDXEditor → ResourceEditor → ThreeColumnLayout → PropertiesPanel
All components reflect consistent change state
```

### 4. **State Management Architecture**

**Problem**: Multiple components managing overlapping resource state.

**Current Issues**:
- ResourceEditor manages content and hasChanges
- PropertiesPanel manages resource metadata and assignments
- ThreeColumnLayout manages selectedResource
- No coordination between state management layers

## Repair Plan Implementation

### Phase 1: Consolidate Save Button Logic

**Objective**: Single source of truth for save operations

**Implementation Steps**:

1. **Remove PropertiesPanel Save Button** (for project resources)
```typescript
// PropertiesPanel.tsx - Conditional save button rendering
{resourceType !== 'project-file' && (
  <Button onClick={handleSave}>Save</Button>
)}
```

2. **Enhance ResourceEditor as Authority**
```typescript
// ResourceEditor.tsx - Become the authoritative save interface
interface ResourceEditorProps {
  // ... existing props
  onChangeStateUpdate: (hasChanges: boolean) => void; // New prop
}

const ResourceEditor = ({ onChangeStateUpdate, ...props }) => {
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const changes = newContent !== originalContent;
    setHasChanges(changes);
    onChangeStateUpdate?.(changes); // Notify parent
  };
};
```

3. **Update ThreeColumnLayout State Bridge**
```typescript
// ThreeColumnLayout.tsx - Bridge change state
const [resourceHasChanges, setResourceHasChanges] = useState(false);

<ResourceEditor 
  onChangeStateUpdate={setResourceHasChanges}
  // ... other props
/>

<PropertiesPanel 
  resourceHasChanges={resourceHasChanges}
  // ... other props
/>
```

### Phase 2: Fix MDXEditor Integration

**Focus Areas**:

1. **Cursor Position Management**
```typescript
// Get MDXEditor instance reference
const editorRef = useRef<MDXEditor>(null);

const insertAtCursor = (text: string) => {
  const editor = editorRef.current;
  if (editor) {
    // Use MDXEditor API to insert at cursor
    editor.insertText(text);
    // Or manipulate editor state directly
  }
};
```

2. **Focus Management**
```typescript
useEffect(() => {
  if (selectedResource && content) {
    // Content loaded, restore cursor position
    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      // Set cursor to appropriate position
    }
  }
}, [selectedResource, content]);
```

### Phase 3: Unify Change Detection

**Architecture Changes**:

1. **Lift Change State to Parent**
```typescript
// ThreeColumnLayout.tsx - Central state management
const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
const [resourceContent, setResourceContent] = useState('');
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Pass down to children
<ResourceEditor 
  resource={selectedResource}
  content={resourceContent}
  onContentChange={setResourceContent}
  onChangeStateUpdate={setHasUnsavedChanges}
/>

<PropertiesPanel
  resource={selectedResource}
  hasUnsavedChanges={hasUnsavedChanges}
/>
```

2. **Synchronized Save Operations**
```typescript
// Unified save handler in ThreeColumnLayout
const handleSave = async (resource: Resource, content: string) => {
  try {
    await saveResourceContent(resource, content);
    setHasUnsavedChanges(false);
    toast.success('Resource saved successfully');
  } catch (error) {
    toast.error('Failed to save resource');
  }
};
```

## File Structure

### Current Implementation Files
- `src/components/ResourceEditor.tsx` - Main component
- `src/components/PropertiesPanel.tsx` - Related save functionality
- `src/components/ThreeColumnLayout.tsx` - Parent container

### API Integration
- `GET /api/files/read` - Load resource content (✅ Working after 403 fix)
- `POST /api/files/write` - Save resource content
- `GET /api/projects/system` - Load project data for assignment context

### Backend Fix Applied
**File**: `server.js:1383-1402`  
**Fix**: Enhanced file access security to dynamically include project directories
```javascript
// Dynamic project directory discovery for legitimate access
const projects = await getProjects();
for (const project of projects) {
  const projectDir = path.dirname(project.path);
  if (!allowedPaths.some(allowed => projectDir.startsWith(allowed))) {
    allowedPaths.push(projectDir);
  }
}
```

## Testing Strategy

### Current Status
- ✅ **File Loading Tests** - Verify 403 errors resolved
- ⚠️ **Editing Workflow Tests** - Need comprehensive testing after repair
- ❌ **Save Operation Tests** - Required after dual save fix
- ❌ **Cursor Position Tests** - Need automated testing for text insertion

### Required Testing (Post-Repair)
1. **Save Button Coordination** - Verify single save interface works correctly
2. **Cursor Position Accuracy** - Test text insertion at various cursor positions
3. **Change Detection Consistency** - Verify all components reflect same change state
4. **Cross-Component State** - Test state synchronization between editing components

## Usage Examples

### Basic Resource Loading
```typescript
<ResourceEditor 
  selectedResource={resource}
  onResourceChange={handleResourceChange}
  onSave={handleSave}
/>
```

### With Parent State Management (Post-Repair)
```typescript
<ResourceEditor 
  resource={selectedResource}
  content={resourceContent}
  onContentChange={setResourceContent}
  onChangeStateUpdate={setHasUnsavedChanges}
  onSave={handleUnifiedSave}
/>
```

## Dependencies

### Required Packages
```json
{
  "@mdxeditor/editor": "^2.x.x",
  "sonner": "^1.x.x",
  "@/components/ui/*": "shadcn/ui components"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.x.x",
  "typescript": "^5.x.x"
}
```

## Future Enhancements

### Post-Repair Improvements
- **Enhanced diff viewer** - Visual comparison of changes
- **Auto-save functionality** - Periodic background saving
- **Version history integration** - Connect with ChangeHistoryDialog
- **Advanced template system** - More sophisticated content scaffolding
- **Real-time collaboration** - Multi-user editing support

### Integration Points
- **ChangeHistoryDialog** - Version history viewing
- **ResourceModificationDialog** - Modification workflow integration
- **SystemToggleSwitch** - System-level resource management
- **ResourceAssignmentPanel** - Cross-project deployment

## Troubleshooting

### Common Issues

**403 Forbidden Errors**
- ✅ **Fixed**: Backend security enhanced to support project file access
- **Solution**: `server.js` now dynamically discovers project directories

**Content Not Loading**
- **Check**: Resource path and project directory access
- **Verify**: API endpoint `/api/files/read` responds correctly

**Save Button Issues**  
- ⚠️ **Known Issue**: Dual save architecture causes confusion
- **Status**: Repair plan established, implementation pending

**Cursor Position Problems**
- ⚠️ **Known Issue**: Text insertion happens at wrong positions
- **Status**: Phase 2 of repair plan addresses this issue

### Debug Information
```typescript
// Enable debug logging
const debugResourceEditor = {
  selectedResource: selectedResource?.id,
  hasChanges,
  contentLength: content?.length,
  isReadOnly: selectedResource?.isReadOnly
};
console.log('ResourceEditor Debug:', debugResourceEditor);
```

---

**Next Actions**: 
1. Implement Phase 1 of repair plan - consolidate save button logic
2. Test Phase 1 changes thoroughly
3. Proceed with Phase 2 - MDXEditor cursor positioning fixes
4. Implement comprehensive testing suite for all editing workflows

**Priority**: HIGH - ResourceEditor is core to professional resource management workflow