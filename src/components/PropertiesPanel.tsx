import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Tag, Settings } from 'lucide-react';

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

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedItem }) => {
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

  return (
    <div className="w-80 border-l bg-background p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Properties</h3>
      </div>

      <Separator />

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Name</Label>
          <p className="text-sm font-medium mt-1">{selectedItem.name}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Type</Label>
          <Badge variant="secondary" className={getPriorityColor(selectedItem.type)}>
            {selectedItem.type}
          </Badge>
        </div>

        {selectedItem.scope && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Scope</Label>
            <Badge variant="secondary" className={getStatusColor(selectedItem.scope)}>
              {selectedItem.scope}
            </Badge>
          </div>
        )}
      </div>

      <Separator />

      {/* Metadata */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Metadata</h4>
        
        {selectedItem.lastModified && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label className="text-xs text-muted-foreground">Last Modified</Label>
              <p className="text-sm">
                {selectedItem.lastModified instanceof Date 
                  ? selectedItem.lastModified.toLocaleDateString()
                  : String(selectedItem.lastModified)}
              </p>
            </div>
          </div>
        )}

        {selectedItem.path && (
          <div>
            <Label className="text-xs text-muted-foreground">Path</Label>
            <p className="text-sm font-mono text-muted-foreground break-all">{selectedItem.path}</p>
          </div>
        )}

        {selectedItem.description && (
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <p className="text-sm">{selectedItem.description}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Actions</h4>
        
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
      </div>

      {/* Agent-specific Properties */}
      {selectedItem.type === 'agent' && selectedItem.tools && (
        <>
          <Separator />
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
        </>
      )}

      {/* Assignment Panel */}
      {selectedItem.scope === 'user' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Project Assignments</h4>
            <p className="text-xs text-muted-foreground">
              This is a user-level resource. Assign to projects:
            </p>
            
            {/* This would be populated with actual project data */}
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
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;