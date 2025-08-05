import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ErrorBoundary } from './ui/error-boundary';
import { Alert, AlertDescription } from './ui/alert';
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { 
  User, 
  FolderOpen, 
  Bot, 
  Terminal, 
  Webhook, 
  FileText, 
  ChevronRight,
  ChevronDown,
  Home,
  Search,
  Settings,
  Menu,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Input } from './ui/input';
import { ProjectManager } from './ProjectManager';
import { ClaudeMdEditor } from './ClaudeMdEditor';
import { ResourceAssignmentPanel } from './ResourceAssignmentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ClaudeProject } from '../types';
import { ResourceDataService, ResourceItem, AgentResource } from '../utils/resourceDataService';
import MDEditor from '@uiw/react-md-editor';

// Navigation item types
type NavItemType = 'users' | 'projects' | 'agents' | 'commands' | 'hooks' | 'claude-files';

interface NavItem {
  id: NavItemType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  count?: number;
  expanded?: boolean;
}

interface ThreeColumnLayoutProps {
  children?: React.ReactNode;
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const [selectedNavItem, setSelectedNavItem] = useState<NavItemType>('projects');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  
  // Resource data state
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [allResources, setAllResources] = useState<ResourceItem[]>([]);
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [resourceAssignments, setResourceAssignments] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceCounts, setResourceCounts] = useState<Record<string, number>>({
    agents: 0,
    commands: 0,
    hooks: 0,
    'claude-files': 0
  });

  // Load resources when nav item changes
  useEffect(() => {
    loadResourcesForNavItem(selectedNavItem);
  }, [selectedNavItem]);

  // Load all resource counts on component mount for better UX
  useEffect(() => {
    loadAllResourceCounts();
  }, []);

  const loadAllResourceCounts = async () => {
    try {
      console.log('Loading all resource counts...');
      const allResourcesData = await ResourceDataService.fetchAllResources();
      
      // Combine all resources
      const combinedResources = [
        ...allResourcesData.agents,
        ...allResourcesData.commands,
        ...allResourcesData.hooks,
        ...allResourcesData.claudeFiles
      ];
      setAllResources(combinedResources);
      
      // Build assignment map
      const assignments = new Map<string, string[]>();
      combinedResources.forEach(resource => {
        if (resource.projectPath) {
          const existing = assignments.get(resource.name) || [];
          if (!existing.includes(resource.projectPath)) {
            assignments.set(resource.name, [...existing, resource.projectPath]);
          }
        }
      });
      setResourceAssignments(assignments);
      
      // Load projects for assignment panel
      try {
        const projectsResponse = await fetch('http://localhost:3001/api/projects/system');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      }
      
      setResourceCounts({
        agents: allResourcesData.agents.length,
        commands: allResourcesData.commands.length,
        hooks: allResourcesData.hooks.length,
        'claude-files': allResourcesData.claudeFiles.length
      });
      
      console.log('Resource counts loaded:', {
        agents: allResourcesData.agents.length,
        commands: allResourcesData.commands.length,
        hooks: allResourcesData.hooks.length,
        claudeFiles: allResourcesData.claudeFiles.length
      });
    } catch (error) {
      console.error('Error loading resource counts:', error);
    }
  };

  const loadResourcesForNavItem = async (navItem: NavItemType) => {
    if (navItem === 'projects') {
      // Projects are handled by ProjectManager
      return;
    }

    if (navItem === 'users') {
      // Users section loads only user-level resources
      setLoading(true);
      setError(null);
      try {
        const { userLevel } = await ResourceDataService.fetchUserResources();
        setResources(userLevel);
      } catch (error) {
        console.error('Error loading user resources:', error);
        setError('Failed to load user resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (navItem === 'claude-files') {
      // Load CLAUDE.md files
      setLoading(true);
      setError(null);
      try {
        const claudeFiles = await ResourceDataService.fetchResourcesByType('claude-files');
        setResources(claudeFiles);
        setResourceCounts(prev => ({
          ...prev,
          ['claude-files']: claudeFiles.length
        }));
      } catch (error) {
        console.error('Error loading CLAUDE.md files:', error);
        setError('Failed to load CLAUDE.md files');
        setResources([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let resourceData: ResourceItem[] = [];
      
      switch (navItem) {
        case 'agents':
          resourceData = await ResourceDataService.fetchResourcesByType('agents');
          break;
        case 'commands':
          resourceData = await ResourceDataService.fetchResourcesByType('commands');
          break;
        case 'hooks':
          resourceData = await ResourceDataService.fetchResourcesByType('hooks');
          break;
      }
      
      setResources(resourceData);
      
      // Update counts
      setResourceCounts(prev => ({
        ...prev,
        [navItem]: resourceData.length
      }));
      
    } catch (error) {
      console.error(`Error loading ${navItem}:`, error);
      setError(`Failed to load ${navItem}`);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigation structure with dynamic counts
  const navItems: NavItem[] = [
    { id: 'users', label: 'Users', icon: User, count: 1 },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: 5, expanded: true },
    { id: 'agents', label: 'Agents', icon: Bot, count: resourceCounts.agents },
    { id: 'commands', label: 'Commands', icon: Terminal, count: resourceCounts.commands },
    { id: 'hooks', label: 'Hooks', icon: Webhook, count: resourceCounts.hooks },
    { id: 'claude-files', label: 'CLAUDE.md', icon: FileText, count: resourceCounts['claude-files'] },
  ];

  const handleNavItemClick = (itemId: NavItemType) => {
    setSelectedNavItem(itemId);
    // Clear selections when switching nav items
    if (itemId !== 'projects') {
      setSelectedProject(null);
    }
    setSelectedResource(null);
  };

  const handleProjectSelect = (project: ClaudeProject) => {
    setSelectedProject(project);
  };

  const handleAssignmentChange = async (resourceName: string) => {
    // Reload all resources to update assignment map
    await loadAllResourceCounts();
    // Reload current view
    await loadResourcesForNavItem(selectedNavItem);
  };

  const renderSidebar = () => (
    <div className="h-full flex flex-col bg-background border-r">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Resources</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-6 w-6 p-0"
          >
            <Menu size={14} />
          </Button>
        </div>
        
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNavItem === item.id;
            
            return (
              <div key={item.id}>
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  size="sm"
                  className={`w-full justify-start h-9 ${isSelected ? 'bg-muted' : ''}`}
                  onClick={() => handleNavItemClick(item.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">
                        {item.count}
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings size={16} />
          <span className="ml-2 text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );

  const renderMiddleColumn = () => {
    if (selectedNavItem === 'projects') {
      return (
        <div className="h-full flex flex-col bg-background border-r">
          {/* For projects, we'll embed the ProjectManager here but customized for middle column */}
          <div className="h-full">
            <ProjectManager 
              onProjectSelect={handleProjectSelect}
              onProjectEdit={(project, content) => {
                // Handle project edit if needed
                console.log('Project edited:', project.name);
              }}
              showEditor={false}
              layoutMode="list-only"
            />
          </div>
        </div>
      );
    }

    if (selectedNavItem === 'users') {
      return (
        <div className="h-full flex flex-col bg-background border-r">
          {/* Users Header */}
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm">User-Level Resources</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Resources available across all projects
            </p>
          </div>

          {/* Users Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-0">
                {resources.length > 0 ? (
                  resources.map((resource, i) => (
                    <div 
                      key={resource.id} 
                      className={`cursor-pointer hover:bg-accent/50 transition-colors px-4 py-3 ${
                        i % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                      } ${selectedResource?.id === resource.id ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedResource(resource)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{resource.name}</h4>
                            {resource.lastModified && (
                              <p className="text-xs text-muted-foreground">
                                Last updated {ResourceDataService.formatDate(resource.lastModified)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-sm text-muted-foreground">
                      No user-level resources found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-background border-r">
        {/* Middle Column Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm capitalize">
              {selectedNavItem.replace('-', ' ')}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 px-2">
                <span className="text-xs">Filter</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-0">
              {resources.length > 0 ? (
                resources.map((resource, i) => (
                  <div 
                    key={resource.id} 
                    className={`cursor-pointer hover:bg-accent/50 transition-colors px-4 py-3 ${
                      i % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                    } ${selectedResource?.id === resource.id ? 'bg-accent' : ''}`}
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${
                          resource.scope === 'user' ? 'bg-blue-500' : 
                          resource.scope === 'system' ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{resource.name}</h4>
                          {resource.lastModified && (
                            <p className="text-xs text-muted-foreground">
                              Last updated {ResourceDataService.formatDate(resource.lastModified)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground capitalize">
                          {resource.scope}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-muted-foreground">
                    No {selectedNavItem} found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContentColumn = () => {
    // Always show PropertiesPanel on the right
    let selectedItem = null;
    
    // Convert selected items to properties format
    if (selectedNavItem === 'projects' && selectedProject) {
      selectedItem = {
        type: 'project' as const,
        name: selectedProject.name,
        path: selectedProject.path,
        lastModified: selectedProject.lastModified,
        description: `Claude Code project configuration`
      };
    } else if (selectedResource && selectedNavItem !== 'projects') {
      selectedItem = {
        type: selectedResource.type,
        name: selectedResource.name,
        path: selectedResource.path,
        lastModified: selectedResource.lastModified,
        scope: selectedResource.scope,
        description: selectedResource.description,
        tools: (selectedResource as AgentResource).tools
      };
    }

    return <PropertiesPanel selectedItem={selectedItem} />;
  };

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
      {/* Information-Rich Header */}
      <div className="h-12 bg-card border-b flex items-center px-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Home size={14} />
            <ChevronRight size={12} />
            <span className="capitalize">{selectedNavItem.replace('-', ' ')}</span>
            {selectedProject && (
              <>
                <ChevronRight size={12} />
                <span className="text-foreground">{selectedProject.name}</span>
              </>
            )}
            {!selectedProject && (
              <>
                <ChevronRight size={12} />
                <span className="text-foreground">Overview</span>
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: 5 minutes ago
          </span>
          <Button variant="outline" size="sm" className="h-7">
            Export
          </Button>
          <Button size="sm" className="h-7">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Fixed width for now */}
        <div className="w-64 flex-shrink-0">
          {renderSidebar()}
        </div>
        
        {/* Middle Column - Widest column */}
        <div className="flex-1 min-w-0">
          {renderMiddleColumn()}
        </div>
        
        {/* Right Content Column - Fixed width for properties */}
        <div className="w-80 flex-shrink-0">
          {renderContentColumn()}
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}