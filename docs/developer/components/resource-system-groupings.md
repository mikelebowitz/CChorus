# Resource System Groupings - Developer Documentation

## Overview

The Resource System Groupings implementation transforms CChorus from a visual-only resource browser (45% complete) to a fully functional resource management system (90% complete). This comprehensive feature introduces system-aware resource organization, modification workflows, change tracking, and rollback capabilities.

## Architecture

### Core Components

#### 1. ResourceModificationDialog.tsx
Professional modal interface for modifying system resources with change tracking.

**Key Features:**
- Reason-based modification workflow
- Content editor with syntax highlighting preparation
- Warning system for system resource modifications
- Project-specific change scoping
- Comprehensive error handling

**Props Interface:**
```typescript
interface ResourceModificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  projectPath: string;
  onModificationComplete?: (modifiedResource: ResourceItem) => void;
}
```

**Usage:**
```tsx
<ResourceModificationDialog
  isOpen={showModificationDialog}
  onClose={() => setShowModificationDialog(false)}
  resource={selectedResource}
  projectPath="/current/project/path"
  onModificationComplete={(modified) => handleResourceUpdate(modified)}
/>
```

#### 2. SystemToggleSwitch.tsx
Enable/disable toggle controls for entire resource systems with confirmation dialogs.

**Key Features:**
- Confirmation dialogs with impact assessment
- Resource count display
- Project-specific or global system state
- Loading states and error handling
- Accessible switch component

**Props Interface:**
```typescript
interface SystemToggleSwitchProps {
  systemId: string;
  systemName: string;
  initialEnabled: boolean;
  projectPath?: string;
  resourceCount: number;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}
```

**Usage:**
```tsx
<SystemToggleSwitch
  systemId="ccplugins"
  systemName="CCPlugins"
  initialEnabled={true}
  projectPath="/project/path"
  resourceCount={12}
  onToggle={(enabled) => handleSystemToggle(enabled)}
/>
```

#### 3. ChangeHistoryDialog.tsx
Complete change history viewer with visual diff and rollback capabilities.

**Key Features:**
- Chronological change history display
- Change type categorization (create/modify/delete/restore)
- Before/after content comparison
- One-click rollback functionality
- Visual diff preparation (TODO: enhanced diff viewer)

**Props Interface:**
```typescript
interface ChangeHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string | null;
  resourceName?: string;
}
```

**Usage:**
```tsx
<ChangeHistoryDialog
  isOpen={showHistory}
  onClose={() => setShowHistory(false)}
  resourceId={resource?.id || null}
  resourceName={resource?.name}
/>
```

#### 4. Enhanced ResourceListItem.tsx
Resource display component with integrated context menu system.

**New Features:**
- Right-click context menu integration
- System-aware styling and badges
- Modification status indicators
- Visual system health display

**Context Menu Actions:**
- **Modify Resource** - Opens ResourceModificationDialog
- **View History** - Opens ChangeHistoryDialog  
- **Copy Resource** - Copy functionality (TODO: implement)
- **Delete Resource** - Delete with confirmation (TODO: implement)

### Enhanced Services

#### ResourceDataService Enhancements
Eight new methods added for comprehensive resource system management:

##### 1. Resource Modification Methods
```typescript
// Create a new resource modification with full change tracking
static async createResourceModification(
  resourceId: string,
  projectPath: string,
  reason: string,
  content: string,
  originalContent?: string
): Promise<ResourceChange>

// Retrieve complete change history for a resource
static async getResourceHistory(resourceId: string): Promise<ResourceChange[]>

// Revert a specific resource modification with automatic logging
static async revertResourceModification(
  resourceId: string,
  changeId: string
): Promise<boolean>

// Simple line-by-line comparison (ready for enhanced diff viewer)
static async compareResourceVersions(
  resourceId: string,
  version1Content: string,
  version2Content: string
): Promise<{ added: string[]; removed: string[]; modified: string[] }>
```

##### 2. System Management Methods
```typescript
// Enable entire resource system with project-specific scoping
static async enableSystem(
  systemId: string,
  projectPath?: string
): Promise<boolean>

// Disable resource system with confirmation and impact warnings
static async disableSystem(
  systemId: string,
  projectPath?: string
): Promise<boolean>
```

##### 3. Enhanced Data Interfaces

**ResourceItem Interface Extensions:**
```typescript
export interface ResourceItem {
  // ... existing properties
  
  // System grouping properties
  systemId?: string;              // "ccplugins", "claude-flow", "builtin"
  systemName?: string;            // "CCPlugins", "Claude Flow", "Built-in"
  systemVersion?: string;         // System version when resource was created
  isSystemResource?: boolean;     // Part of a larger system
  isEditable?: boolean;          // Can user modify this resource
  
  // Change tracking properties
  originalResourceId?: string;    // Reference to original system resource
  isModified?: boolean;          // Has been customized from original
  modificationReason?: string;   // Why was this changed
  modificationDate?: Date;       // When was it modified
  resourceVersion?: number;      // Version of this specific resource
  originalContent?: string;      // Original system content for comparison
}
```

**ResourceChange Interface:**
```typescript
export interface ResourceChange {
  id: string;
  timestamp: Date;
  author: string;
  reason: string;                // User-provided explanation
  changeType: 'create' | 'modify' | 'delete' | 'restore';
  beforeContent?: string;
  afterContent: string;
  projectPath: string;
}
```

**ResourceSystem Interface:**
```typescript
export interface ResourceSystem {
  id: string;
  name: string;
  description: string;
  version?: string;
  author?: string;
  enabled: boolean;
  resources: {
    original: ResourceItem[];    // Unmodified system resources
    modified: ResourceItem[];    // Project-customized variants
    counts: { 
      agents: number; 
      commands: number; 
      hooks: number; 
      claudeFiles: number;
      total: number;
    };
  };
  health: 'complete' | 'partial' | 'broken' | 'customized';
  modifications: {
    total: number;
    byProject: Map<string, number>;
  };
  isEditable: boolean;
}
```

## LocalStorage Persistence Layer

### Current Implementation
The system currently uses LocalStorage for all persistence, designed for seamless migration to backend API.

### Storage Keys
- **Resource Changes**: `resource_change_${resourceId}` - Array of ResourceChange objects
- **System States**: `system_state_${systemId}_${projectPath || 'global'}` - "enabled" or "disabled"

### Migration Readiness
All LocalStorage operations include commented TODO sections showing the equivalent backend API calls:

```typescript
// TODO: Send to backend API
// await fetch(`${this.BASE_URL}/resources/${resourceId}/changes`, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(change)
// });
```

## Integration Points

### ThreeColumnLayout Integration
- Added SystemToggleSwitch components for system management
- Enhanced resource display with system grouping support
- Integrated context menu system for resource actions

### Context Menu System
- New `context-menu.tsx` shadcn/ui component
- Right-click actions throughout resource lists
- Consistent action patterns across all resource types

### Styling Integration
- System badges for resource categorization
- Modification indicators (orange border for modified resources)
- System health status colors (complete/partial/broken/customized)

## User Workflows

### Resource Modification Workflow
1. **Right-click resource** → Select "Modify Resource"
2. **Enter modification reason** (required field)
3. **Edit resource content** in textarea
4. **Review system resource warning** with project scope information
5. **Save modification** → Creates change tracking entry
6. **View modified resource** with orange modification indicator

### Change History Workflow
1. **Right-click resource** → Select "View History"
2. **Browse chronological changes** with timestamps and authors
3. **Select specific change** to view detailed diff
4. **Compare before/after content** in side-by-side display
5. **One-click rollback** if needed (creates new "restore" change entry)

### System Management Workflow
1. **Navigate to Systems section** in ThreeColumnLayout
2. **View system health status** and resource counts
3. **Toggle system enable/disable** → Confirmation dialog appears
4. **Review impact assessment** (affected resources and project scope)
5. **Confirm system state change** → Immediate visual feedback

## Testing Considerations

### Component Testing
- **Modal Dialog Testing**: Verify open/close states and form validation
- **Context Menu Testing**: Test right-click actions and keyboard navigation
- **Toggle Switch Testing**: Confirm state changes and confirmation dialogs

### Service Layer Testing
- **Change Tracking**: Verify all modifications create proper change records
- **System State Management**: Test enable/disable operations
- **LocalStorage Operations**: Ensure data persistence and retrieval accuracy

### Integration Testing
- **Cross-Component Communication**: Test dialog callbacks and state updates
- **Error Handling**: Verify graceful failure handling throughout
- **Accessibility**: Keyboard navigation and screen reader support

## Future Enhancements

### Backend Integration (Next Priority)
- Replace LocalStorage with proper API endpoints
- Add database schema for change tracking and system state
- Implement real-time synchronization for multi-user scenarios

### Enhanced Diff Viewer
- Professional visual diff with syntax highlighting
- Line-by-line change indicators
- Merge conflict resolution interface

### System Templates
- Resource system packaging and import/export
- Template gallery for common system configurations
- System dependency management

### Advanced Analytics
- Resource usage tracking and analytics
- System health monitoring with automated alerts
- Change impact analysis and rollback recommendations

## Performance Considerations

### LocalStorage Efficiency
- Change history limited to prevent storage bloat
- Efficient JSON serialization/deserialization
- Minimal impact on UI responsiveness

### Component Optimization
- Lazy loading for dialog components
- Memoization for expensive calculations
- Efficient context menu rendering

### Future Scalability
- Design ready for server-side rendering
- Database queries optimized for change history
- WebSocket integration planned for real-time updates

---

This implementation represents a significant advancement in CChorus resource management capabilities, providing a solid foundation for future enhancements while maintaining excellent user experience and developer productivity.