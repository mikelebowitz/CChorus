import React from 'react';
import { Badge } from './ui/badge';
import { Lock, Edit3, AlertTriangle } from 'lucide-react';
import { ResourceItem } from '../utils/resourceDataService';

interface ResourceListItemProps {
  resource: ResourceItem;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
}

export function ResourceListItem({ resource, isSelected, onClick, index }: ResourceListItemProps) {
  // Get styling based on resource system properties
  const getResourceStyles = (): string => {
    const baseStyles = "cursor-pointer hover:bg-accent/50 transition-colors px-4 py-3";
    const backgroundStyles = index && index % 2 === 0 ? "bg-muted/20" : "";
    const selectedStyles = isSelected ? "bg-accent border-l-4 border-primary" : "";
    
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

  return (
    <div 
      className={getResourceStyles()}
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
        </div>
        
        {/* Resource metadata */}
        <div className="flex flex-col items-end text-xs text-muted-foreground ml-2">
          {resource.lastModified && (
            <span>
              {resource.lastModified instanceof Date 
                ? resource.lastModified.toLocaleDateString()
                : String(resource.lastModified)}
            </span>
          )}
          
          {resource.systemVersion && (
            <span className="text-xs text-blue-600">
              v{resource.systemVersion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// System-aware resource sorting priority for display
export function sortResourcesForDisplay(resources: ResourceItem[]): ResourceItem[] {
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