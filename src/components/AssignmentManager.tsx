import React, { useState, useEffect } from 'react';
import { ResourceLibraryService, ResourceItem, ResourceAssignment, AssignmentResult } from '../utils/resourceLibraryService';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Target,
  User,
  Folder,
  Copy,
  Move,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  Terminal,
  Webhook,
  FolderOpen,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface AssignmentManagerProps {
  selectedResource?: ResourceItem;
  onClose?: () => void;
}

const resourceService = new ResourceLibraryService();

const RESOURCE_TYPE_ICONS = {
  agent: Bot,
  command: Terminal,
  hook: Webhook,
  project: FolderOpen,
  settings: Settings
};

export function AssignmentManager({ selectedResource, onClose }: AssignmentManagerProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [availableTargets, setAvailableTargets] = useState<{ scope: string; name: string; path?: string }[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<{ [resourceId: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string>('user');
  const [activeAssignments, setActiveAssignments] = useState<AssignmentResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allResources, targets, status] = await Promise.all([
        resourceService.loadAllResources(),
        resourceService.getAvailableTargets(),
        resourceService.getDeploymentStatus()
      ]);
      
      setResources(allResources);
      setAvailableTargets(targets);
      setDeploymentStatus(status);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assignment data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResource = async (resource: ResourceItem, targetScope: string, targetPath?: string, operation: string = 'copy') => {
    try {
      const assignment: ResourceAssignment = {
        resourceId: resource.id,
        resourceType: resource.type as any,
        targetScope: targetScope as 'user' | 'project',
        targetProjectPath: targetPath,
        operation: operation as any
      };

      const result = await resourceService.assignResource(assignment);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Resource ${operation === 'copy' ? 'copied' : 'moved'} successfully`,
        });
        
        setActiveAssignments(prev => [...prev, result]);
        await loadData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to assign resource",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to assign resource",
        variant: "destructive",
      });
    }
  };

  const getResourcesByScope = (scope: string) => {
    if (scope === 'user') {
      return resources.filter(r => r.scope === 'user');
    } else if (scope === 'project') {
      return resources.filter(r => r.scope === 'project');
    }
    return resources;
  };

  const getProjectResources = (projectPath: string) => {
    return resources.filter(r => r.projectPath === projectPath);
  };

  const ResourceAssignmentCard = ({ resource }: { resource: ResourceItem }) => {
    const TypeIcon = RESOURCE_TYPE_ICONS[resource.type];
    const deployments = deploymentStatus[resource.id] || [];

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon size={20} className="text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">{resource.name}</h3>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {resource.type}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs ${resource.isActive ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}
              >
                {resource.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Current Deployments */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Current Deployments</h4>
            <div className="flex flex-wrap gap-1">
              {deployments.map((deployment: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {deployment.scope === 'user' ? (
                    <><User size={10} className="mr-1" />User Level</>
                  ) : (
                    <><Folder size={10} className="mr-1" />{deployment.projectPath?.split('/').pop()}</>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Assignment Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAssignResource(resource, 'user', undefined, 'copy')}
              disabled={resource.scope === 'user'}
            >
              <Copy size={12} className="mr-1" />
              Copy to User
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAssignResource(resource, 'user', undefined, 'move')}
              disabled={resource.scope === 'user'}
            >
              <Move size={12} className="mr-1" />
              Move to User
            </Button>

            {/* Project Assignment Dropdown - simplified for now */}
            <Button size="sm" variant="outline">
              <Folder size={12} className="mr-1" />
              Assign to Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ScopeOverview = ({ scope, targetInfo }: { scope: string; targetInfo: any }) => {
    const scopeResources = scope === 'user' 
      ? getResourcesByScope('user')
      : getProjectResources(targetInfo.path);

    const resourceCounts = {
      agents: scopeResources.filter(r => r.type === 'agent').length,
      commands: scopeResources.filter(r => r.type === 'command').length,
      hooks: scopeResources.filter(r => r.type === 'hook').length,
      settings: scopeResources.filter(r => r.type === 'settings').length
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {scope === 'user' ? (
                <User size={20} className="text-blue-500" />
              ) : (
                <Folder size={20} className="text-green-500" />
              )}
              <div>
                <h3 className="font-medium">{targetInfo.name}</h3>
                {targetInfo.path && (
                  <p className="text-xs text-muted-foreground">{targetInfo.path}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">{scopeResources.length}</div>
              <div className="text-xs text-muted-foreground">Resources</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bot size={16} className="text-muted-foreground" />
              </div>
              <div className="font-medium">{resourceCounts.agents}</div>
              <div className="text-xs text-muted-foreground">Agents</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Terminal size={16} className="text-muted-foreground" />
              </div>
              <div className="font-medium">{resourceCounts.commands}</div>
              <div className="text-xs text-muted-foreground">Commands</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Webhook size={16} className="text-muted-foreground" />
              </div>
              <div className="font-medium">{resourceCounts.hooks}</div>
              <div className="text-xs text-muted-foreground">Hooks</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Settings size={16} className="text-muted-foreground" />
              </div>
              <div className="font-medium">{resourceCounts.settings}</div>
              <div className="text-xs text-muted-foreground">Settings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load assignments</div>
          <div className="text-sm text-muted-foreground mb-4">{error}</div>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-1" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If a specific resource is selected for assignment
  if (selectedResource) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Assign Resource</h1>
              <p className="text-sm text-muted-foreground">
                Deploy "{selectedResource.name}" to a target scope
              </p>
            </div>
            
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Resource */}
            <div>
              <h3 className="font-medium mb-3">Source Resource</h3>
              <ResourceAssignmentCard resource={selectedResource} />
            </div>
            
            {/* Target Selection */}
            <div>
              <h3 className="font-medium mb-3">Available Targets</h3>
              <div className="space-y-3">
                {availableTargets.map((target, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {target.scope === 'user' ? (
                            <User size={16} className="text-blue-500" />
                          ) : (
                            <Folder size={16} className="text-green-500" />
                          )}
                          <span className="font-medium text-sm">{target.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleAssignResource(
                              selectedResource, 
                              target.scope, 
                              target.path, 
                              'copy'
                            )}
                          >
                            <Copy size={12} className="mr-1" />
                            Copy
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAssignResource(
                              selectedResource, 
                              target.scope, 
                              target.path, 
                              'move'
                            )}
                          >
                            <Move size={12} className="mr-1" />
                            Move
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main assignment manager view
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Assignment Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage resource deployments across scopes
            </p>
          </div>
          
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </Button>
        </div>

        {/* Recent Assignments */}
        {activeAssignments.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Recent Assignments</h3>
            <div className="flex flex-wrap gap-2">
              {activeAssignments.slice(-3).map((assignment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {assignment.success ? (
                    <CheckCircle size={10} className="mr-1 text-green-500" />
                  ) : (
                    <XCircle size={10} className="mr-1 text-red-500" />
                  )}
                  {assignment.operation} → {assignment.targetScope}
                </Badge>
              ))}
            </div>
          </div>  
        )}
      </div>

      {/* Tabs for different scopes */}
      <Tabs value={selectedScope} onValueChange={setSelectedScope} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="user">
            <User size={16} className="mr-1" />
            User Level
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Folder size={16} className="mr-1" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="overview">
            <Target size={16} className="mr-1" />
            Overview
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4">
          <TabsContent value="user">
            <div className="space-y-4">
              <ScopeOverview 
                scope="user" 
                targetInfo={{ name: "User Level (Global)", path: null }}
              />
              
              <div>
                <h3 className="font-medium mb-3">User-Level Resources</h3>
                <div className="space-y-2">
                  {getResourcesByScope('user').map((resource) => (
                    <ResourceAssignmentCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTargets
                .filter(t => t.scope === 'project')
                .map((project, index) => (
                  <ScopeOverview 
                    key={index}
                    scope="project" 
                    targetInfo={project}
                  />
                ))
              }
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Global Statistics */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium">System Overview</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{resources.filter(r => r.type === 'agent').length}</div>
                      <div className="text-xs text-muted-foreground">Agents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">{resources.filter(r => r.type === 'command').length}</div>
                      <div className="text-xs text-muted-foreground">Commands</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-500">{resources.filter(r => r.type === 'hook').length}</div>
                      <div className="text-xs text-muted-foreground">Hooks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">{resources.filter(r => r.type === 'project').length}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-500">{resources.filter(r => r.type === 'settings').length}</div>
                      <div className="text-xs text-muted-foreground">Settings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}