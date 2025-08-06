import React, { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
  // TODO: [UX Spec] Replace Checkbox with Switch component for project toggles
  //       Reference: docs/ux.md - Section 4B specifies Switch for on/off control
  //       Priority: High - Key UX consistency requirement
  //       GitHub Issue: #77
  
  // TODO: [UX Spec] Add filter input at top of project list for large project sets
  //       Reference: docs/ux.md - Section 4B Implementation Details specifies filter input
  //       Priority: Medium - Essential for scalability with many projects
  //       GitHub Issue: #81
  
  // TODO: [UX Spec] Implement scrollable container with max-height for project list
  //       Reference: docs/ux.md - Section 4B specifies overflow-y: auto container
  //       Priority: Low - UI polish for better space utilization
  //       GitHub Issue: (Part of #81)
  
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Project Assignments</h3>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {allProjects.length > 0 ? (
          allProjects.map((project) => {
            const isAssigned = assignments.includes(project.path);
            const isOriginProject = resource.projectPath === project.path;
            
            return (
              <div key={project.path} className="flex items-center space-x-2">
                <Checkbox
                  id={`assign-${project.path}`}
                  checked={isAssigned}
                  disabled={loading || isOriginProject}
                  onCheckedChange={() => handleToggleAssignment(project, isAssigned)}
                />
                <label
                  htmlFor={`assign-${project.path}`}
                  className={`text-sm flex-1 cursor-pointer ${
                    isOriginProject ? 'text-muted-foreground' : ''
                  }`}
                >
                  {project.name}
                  {isOriginProject && (
                    <span className="text-xs text-muted-foreground ml-2">(origin)</span>
                  )}
                </label>
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>No projects available</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        {resource.scope === 'user' ? (
          <p>This is a user-level resource. Check projects to copy it to their .claude folders.</p>
        ) : (
          <p>This resource originates from {resource.projectPath ? 'a project' : 'the system'}.</p>
        )}
      </div>
    </div>
  );
}