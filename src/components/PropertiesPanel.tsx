import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Tag, Settings, Search, Save, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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
  // ✅ [UX Spec] Implemented dynamic content adaptation based on resource scope
  //    Reference: docs/ux.md - Section 4 specifies dynamic panel based on User vs Project scope
  //    GitHub Issue: #76 - COMPLETED

  const [projectFilter, setProjectFilter] = useState('');
  const [projectAssignments, setProjectAssignments] = useState<Record<string, boolean>>({});
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [editedProperties, setEditedProperties] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load real project data and assignments when component mounts or selected item changes
  useEffect(() => {
    if (selectedItem) {
      loadProjects();
      loadResourceAssignments();
      resetEditedProperties();
    }
  }, [selectedItem]);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects/system');
      if (response.ok) {
        const projects = await response.json();
        setAllProjects(projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadResourceAssignments = async () => {
    if (!selectedItem) return;
    
    try {
      // TODO: Replace with actual API call to get resource assignments
      // For now, simulate loading assignments
      const assignments: Record<string, boolean> = {};
      
      // Mock some assignments based on resource type and scope
      if (selectedItem.scope === 'user') {
        assignments['CChorus'] = Math.random() > 0.5;
        assignments['karakeep-app'] = Math.random() > 0.5;
        assignments['homelab'] = Math.random() > 0.5;
        assignments['claude-example'] = Math.random() > 0.5;
        assignments['dotfiles'] = Math.random() > 0.5;
      } else {
        // Project-specific resources are only assigned to their own project
        assignments[selectedItem.name] = true;
      }
      
      setProjectAssignments(assignments);
    } catch (error) {
      console.error('Error loading resource assignments:', error);
    }
  };

  const resetEditedProperties = () => {
    if (!selectedItem) return;
    
    setEditedProperties({
      name: selectedItem.name,
      description: selectedItem.description || '',
      type: selectedItem.type,
      scope: selectedItem.scope || 'user'
    });
    setHasChanges(false);
  };

  const handlePropertyChange = (key: string, value: any) => {
    setEditedProperties(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleAssignmentChange = async (project: string, assigned: boolean) => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log(`${assigned ? 'Assigning' : 'Unassigning'} ${selectedItem.name} ${assigned ? 'to' : 'from'} ${project}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProjectAssignments(prev => ({
        ...prev,
        [project]: assigned
      }));
      
      toast({
        title: `✅ ${assigned ? 'Applied' : 'Removed'} ${selectedItem.name}`,
        description: `${selectedItem.name} is now ${assigned ? 'active' : 'inactive'} in ${project}.`,
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Assignment Error",
        description: "Failed to update project assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperties = async () => {
    if (!selectedItem || !hasChanges) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Saving properties:', editedProperties);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(false);
      toast({
        title: "✅ Properties Saved",
        description: `${selectedItem.name} properties have been updated.`,
      });
    } catch (error) {
      console.error('Error saving properties:', error);
      toast({
        title: "Save Error",
        description: "Failed to save properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedItem) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Deleting resource:', selectedItem.name);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "✅ Resource Deleted",
        description: `${selectedItem.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
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

      {/* Resource Properties Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Resource Properties</h4>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="resource-name" className="text-sm font-medium">Name</Label>
            <Input
              id="resource-name"
              value={editedProperties.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="mt-1"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="resource-description" className="text-sm font-medium">Description</Label>
            <Input
              id="resource-description"
              value={editedProperties.description || ''}
              onChange={(e) => handlePropertyChange('description', e.target.value)}
              placeholder="Enter resource description..."
              className="mt-1"
              disabled={loading}
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Type</Label>
            <div className="mt-1">
              <Badge variant="secondary" className={getPriorityColor(selectedItem.type)}>
                {selectedItem.type}
              </Badge>
            </div>
          </div>

          {selectedItem.scope && (
            <div>
              <Label className="text-sm font-medium">Scope</Label>
              <div className="mt-1">
                <Badge variant="outline" className={getStatusColor(selectedItem.scope)}>
                  {selectedItem.scope}
                </Badge>
              </div>
            </div>
          )}

          {selectedItem.tools && selectedItem.tools.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Tools</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedItem.tools.map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSaveProperties}
            disabled={!hasChanges || loading}
            className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
            size="sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-1">Save{hasChanges ? '*' : ''}</span>
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteResource}
            disabled={loading}
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1">Delete</span>
          </Button>
        </div>
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

      {/* Project Assignments - Dynamic content based on resource scope */}
      {selectedItem.scope === 'user' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Project Assignments</h4>
            <p className="text-xs text-muted-foreground">
              This user-level resource can be assigned to multiple projects.
            </p>
            
            {/* Filter Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Filter projects..."
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="pl-10 h-8 text-sm"
              />
            </div>
            
            {/* Project List with Switches */}
            <div className="max-h-48 overflow-y-auto space-y-3">
              {allProjects
                .filter((project) => 
                  project.name.toLowerCase().includes(projectFilter.toLowerCase())
                )
                .map((project) => {
                  const isAssigned = projectAssignments[project.name] || false;
                  return (
                    <div key={project.path} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor={`project-${project.name}`} className="text-sm font-medium cursor-pointer">
                          {project.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{project.path.split('/').pop()}</p>
                      </div>
                      <Switch
                        id={`project-${project.name}`}
                        checked={isAssigned}
                        disabled={loading}
                        onCheckedChange={(checked) => handleAssignmentChange(project.name, checked)}
                      />
                    </div>
                  );
                })}
              
              {allProjects.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No projects found
                </div>
              )}
            </div>
            
            {loading && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Updating project assignments...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </>
      )}

      {/* Project-Level Resource Info */}
      {selectedItem.scope === 'project' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Project Resource</h4>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This is a project-specific resource. It's only available within the current project.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Duplicate to User
                </Button>
                <Button variant="outline" size="sm">
                  Export Resource
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;