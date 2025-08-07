import React, { useState } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { ResourceItem } from '../utils/resourceDataService';
import { ClaudeProject } from '../types';
import { ResourceLibraryService, ResourceAssignment } from '../utils/resourceLibraryService';
import { useToast } from '../hooks/use-toast';

interface ResourceAssignmentPanelProps {
  resource: ResourceItem;
  assignments: string[]; // Project paths where this resource is assigned
  allProjects: ClaudeProject[];
  onAssignmentChange: (resourceName: string) => void;
}

const resourceService = new ResourceLibraryService();

export function ResourceAssignmentPanel({ 
  resource, 
  assignments, 
  allProjects,
  onAssignmentChange 
}: ResourceAssignmentPanelProps) {
  // ✅ [UX Spec] Replaced Checkbox with Switch component for project toggles
  //    Reference: docs/ux.md - Section 4B specifies Switch for on/off control
  //    GitHub Issue: #77 - COMPLETED
  
  // ✅ [UX Spec] Added filter input at top of project list for large project sets
  //    Reference: docs/ux.md - Section 4B Implementation Details specifies filter input
  //    GitHub Issue: #81 - COMPLETED
  
  const [loading, setLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState('');
  const { toast } = useToast();

  const handleToggleAssignment = async (project: ClaudeProject, isCurrentlyAssigned: boolean) => {
    setLoading(true);
    
    try {
      const assignment: ResourceAssignment = {
        resourceId: `${resource.type}:${resource.name}:${resource.scope}:${resource.projectPath || 'user'}`,
        resourceType: resource.type as any,
        targetScope: 'project',
        targetProjectPath: project.path,
        operation: isCurrentlyAssigned ? 'deactivate' : 'copy'
      };

      const result = await resourceService.assignResource(assignment);
      
      if (result.success) {
        toast({
          title: isCurrentlyAssigned ? 'Resource removed' : 'Resource assigned',
          description: `${resource.name} ${isCurrentlyAssigned ? 'removed from' : 'assigned to'} ${project.name}`,
        });
        onAssignmentChange(resource.name);
      } else {
        toast({
          title: 'Assignment failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update assignment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show for assignable resource types
  if (!['agent', 'command', 'hook'].includes(resource.type)) {
    return null;
  }

  // Filter projects based on search input
  const filteredProjects = allProjects.filter(project =>
    project.name.toLowerCase().includes(projectFilter.toLowerCase())
  );

  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Project Assignments</h3>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      
      {/* Filter Input */}
      {allProjects.length > 3 && (
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter projects..."
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>
      )}
      
      {/* Project List with Switches */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const isAssigned = assignments.includes(project.path);
            const isOriginProject = resource.projectPath === project.path;
            
            return (
              <div key={project.path} className="flex items-center justify-between">
                <Label
                  htmlFor={`assign-${project.path}`}
                  className={`text-sm font-medium cursor-pointer ${
                    isOriginProject ? 'text-muted-foreground' : ''
                  }`}
                >
                  {project.name}
                  {isOriginProject && (
                    <span className="text-xs text-muted-foreground ml-2">(origin)</span>
                  )}
                </Label>
                <Switch
                  id={`assign-${project.path}`}
                  checked={isAssigned}
                  disabled={loading || isOriginProject}
                  onCheckedChange={() => handleToggleAssignment(project, isAssigned)}
                />
              </div>
            );
          })
        ) : allProjects.length > 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No projects match "{projectFilter}"</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No projects available</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        {resource.scope === 'user' ? (
          <p>This is a user-level resource. Use switches to assign it to project .claude folders.</p>
        ) : (
          <p>This resource originates from {resource.projectPath ? 'a project' : 'the system'}.</p>
        )}
      </div>
    </div>
  );
}