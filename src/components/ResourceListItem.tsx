import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Lock, Edit3, AlertTriangle, Copy, Trash2, History, Eye, MoreVertical } from 'lucide-react';
import { ResourceItem, ResourceDataService } from '../utils/resourceDataService';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';
import { ResourceModificationDialog } from './ResourceModificationDialog';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
import { Button } from './ui/button';

interface ResourceListItemProps {
  resource: ResourceItem;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
  projectPath?: string;
  onResourceModified?: (modifiedResource: ResourceItem) => void;
}

export function ResourceListItem({ 
  resource, 
  isSelected, 
  onClick, 
  index, 
  projectPath = '/current/project', 
  onResourceModified 
}: ResourceListItemProps) {
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  // Get styling based on resource system properties
  const getResourceStyles = (): string => {
    const baseStyles = "cursor-pointer hover:bg-accent/50 transition-colors px-4 py-3";
    const backgroundStyles = index && index % 2 === 0 ? "bg-muted/20" : "";
    const selectedStyles = isSelected ? "bg-primary/10 border-l-4 border-primary text-primary-foreground dark:bg-primary/20 dark:text-foreground" : "";
    
    // System-based styling
    if (!resource.isEditable && resource.isSystemResource) {
      return `${baseStyles} ${backgroundStyles} ${selectedStyles} opacity-50 cursor-not-allowed`;
    }
    
    if (resource.isModified) {
      return `${baseStyles} ${backgroundStyles} ${selectedStyles} border-l-4 border-orange-500 bg-orange-50/50`;
    }
    
    if (resource.systemId) {
      return `${baseStyles} ${backgroundStyles} ${selectedStyles} border-l-4 border-blue-500 bg-blue-50/30`;
    }
    
    return `${baseStyles} ${backgroundStyles} ${selectedStyles}`;
  };

  // Get system badge component
  const getSystemBadge = () => {
    if (resource.isModified) {
      return (
        <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
          <Edit3 className="w-3 h-3 mr-1" />
          Modified
        </Badge>
      );
    }
    
    if (resource.systemId) {
      return (
        <Badge variant="outline" className="text-xs">
          {resource.systemName}
        </Badge>
      );
    }
    
    return null;
  };

  // Get editability indicator
  const getEditabilityIndicator = () => {
    if (!resource.isEditable) {
      return <Lock className="w-3 h-3 text-muted-foreground" />;
    }
    
    if (resource.isSystemResource && resource.isEditable) {
      return <Edit3 className="w-3 h-3 text-blue-600" />;
    }
    
    return null;
  };

  // Get modification details
  const getModificationInfo = () => {
    if (resource.isModified && resource.modificationReason) {
      return (
        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{resource.modificationReason}</span>
        </div>
      );
    }
    return null;
  };

  // Action handlers
  const handleEditResource = () => {
    if (resource.isSystemResource) {
      setShowModificationDialog(true);
    } else {
      // TODO: Open regular resource editor
    }
  };

  const handleDuplicateResource = () => {
    // TODO: Implement resource duplication
  };

  const handleDeleteResource = () => {
    // TODO: Implement resource deletion with confirmation
  };

  const handleViewHistory = async () => {
    setShowHistoryDialog(true);
  };

  const handleViewOriginal = () => {
    // TODO: Show original system resource content
  };

  const handleCompareWithOriginal = () => {
    // TODO: Show diff between original and modified
  };

  const handleRevertChanges = async () => {
    // TODO: Implement revert functionality
    const history = await ResourceDataService.getResourceHistory(resource.id);
    if (history.length > 0) {
      const success = await ResourceDataService.revertResourceModification(resource.id, history[history.length - 1].id);
      if (success) {
        // TODO: Refresh resource list
      }
    }
  };

  const handleResourceModified = (modifiedResource: ResourceItem) => {
    onResourceModified?.(modifiedResource);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            className={`${getResourceStyles()} group`}
            onClick={resource.isEditable ? onClick : undefined}
          >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Resource name and type */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium truncate">
              {resource.name}
            </h4>
            {getEditabilityIndicator()}
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {resource.isSystemResource && resource.isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModificationDialog(true);
                  }}
                  title="Customize for Project"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewHistory();
                }}
                title="View History"
              >
                <History className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Resource description */}
          {resource.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {resource.description}
            </p>
          )}
          
          {/* System info and badges */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {resource.type}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              {resource.scope}
            </Badge>
            
            {getSystemBadge()}
          </div>
          
          {/* Modification info */}
          {getModificationInfo()}
          {/* TODO: Make modification info clickable to show change details
           * Open modal with complete modification history
           * Show diff view of original vs modified content  
           * Display modification metadata and rollback options
           * Link to project where modification was made
           */}
        </div>
        
        {/* Resource metadata */}
        <div className="flex flex-col items-end text-xs text-muted-foreground ml-2">
          {resource.lastModified && (
            <span>
              {ResourceDataService.formatDate(resource.lastModified)}
            </span>
          )}
          
          {resource.systemVersion && (
            <span className="text-xs text-blue-600">
              v{resource.systemVersion}
            </span>
          )}
          {/* TODO: Add resource version update indicator
           * Show "Update Available" badge for outdated resources
           * Display version comparison (current vs latest)
           * Add one-click update functionality with change preview
           */}
        </div>
      </div>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="w-56">
          {/* Edit Actions */}
          {resource.isEditable && (
            <>
              <ContextMenuItem onClick={handleEditResource} className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                {resource.isSystemResource ? 'Customize for Project' : 'Edit Resource'}
              </ContextMenuItem>
              
              <ContextMenuItem onClick={handleDuplicateResource} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </ContextMenuItem>
              
              <ContextMenuSeparator />
            </>
          )}
          
          {/* View Actions */}
          <ContextMenuItem onClick={handleViewHistory} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            View History
          </ContextMenuItem>
          
          {resource.isSystemResource && (
            <ContextMenuItem onClick={handleViewOriginal} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Original
            </ContextMenuItem>
          )}
          
          {/* Modified Resource Actions */}
          {resource.isModified && (
            <>
              <ContextMenuSeparator />
              
              <ContextMenuItem onClick={handleCompareWithOriginal} className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Compare with Original
              </ContextMenuItem>
              
              <ContextMenuItem 
                onClick={handleRevertChanges} 
                className="flex items-center gap-2 text-orange-600"
              >
                <AlertTriangle className="h-4 w-4" />
                Revert Changes
              </ContextMenuItem>
            </>
          )}
          
          {/* Delete Action */}
          {resource.isEditable && !resource.isSystemResource && (
            <>
              <ContextMenuSeparator />
              
              <ContextMenuItem 
                onClick={handleDeleteResource} 
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      
      {/* Resource Modification Dialog */}
      <ResourceModificationDialog
        isOpen={showModificationDialog}
        onClose={() => setShowModificationDialog(false)}
        resource={resource}
        projectPath={projectPath}
        onModificationComplete={handleResourceModified}
      />
      
      {/* Change History Dialog */}
      <ChangeHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        resourceId={resource.id}
        resourceName={resource.name}
      />
    </>
  );
}

// System-aware resource sorting priority for display
export function sortResourcesForDisplay(resources: ResourceItem[]): ResourceItem[] {
  // TODO: Add user-configurable sorting preferences
  // Allow users to choose sorting: alphabetical, by system, by type, by modification date
  // Save sorting preference per navigation section (agents vs commands vs hooks)
  // Add sort direction toggle (ascending/descending)
  
  return resources.sort((a, b) => {
    // Priority: User resources → Modified system → Original system → Built-in
    const getPriority = (resource: ResourceItem): number => {
      if (!resource.isSystemResource) return 0; // User resources first
      if (resource.isModified) return 1; // Modified system resources
      if (resource.systemId === 'builtin') return 3; // Built-in last
      return 2; // Original system resources
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, sort by system name, then resource name
    if (a.systemName !== b.systemName) {
      return (a.systemName || '').localeCompare(b.systemName || '');
    }

    return a.name.localeCompare(b.name);
  });
}

/* TODO: Implement resource modification workflow
 * When user clicks "Edit" on system resource:
 * 1. Show dialog asking for modification reason
 * 2. Create project-specific copy with change tracking
 * 3. Open editor with original content for modification
 * 4. Save changes with version tracking and metadata
 * 5. Update resource list to show modified status
 * 6. Enable rollback to original system version
 */

/* TODO: Implement resource filtering capabilities
 * Filter by system (show only CCPlugins resources)
 * Filter by modification status (show only modified resources)
 * Filter by editability (hide non-editable system resources)
 * Add search within filtered results
 * Save filter preferences per user
 */