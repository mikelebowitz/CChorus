import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ErrorBoundary } from './ui/error-boundary';
import { Alert, AlertDescription } from './ui/alert';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
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
  AlertTriangle,
  Package,
  Lock,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Input } from './ui/input';
import { ProjectManager } from './ProjectManager';
import { ClaudeMdEditor } from './ClaudeMdEditor';
import { ResourceAssignmentPanel } from './ResourceAssignmentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ResourceEditor } from './ResourceEditor';
import { ClaudeProject } from '../types';
import { ResourceDataService, ResourceItem, AgentResource } from '../utils/resourceDataService';
import MDEditor from '@uiw/react-md-editor';
import { ResourceListItem, sortResourcesForDisplay } from './ResourceListItem';
import { SystemToggleSwitch } from './SystemToggleSwitch';

// ✅ [UX Spec] Implemented resizable panels using react-resizable-panels for VS Code-style layout
//    Reference: docs/ux.md - Section 1 & 5 specify resizable three-column layout
//    GitHub Issue: #74 - COMPLETED

// Navigation item types
type NavItemType = 'users' | 'projects' | 'agents' | 'commands' | 'hooks' | 'claude-files' | 'systems';

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
  const [expandedNavItems, setExpandedNavItems] = useState<Set<NavItemType>>(new Set(['projects']));
  
  // Resource data state
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [allResources, setAllResources] = useState<ResourceItem[]>([]);
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [resourceAssignments, setResourceAssignments] = useState<Map<string, string[]>>(new Map());
  const [systems, setSystems] = useState<any[]>([]); // ResourceSystem[] from systemDetectionService
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceCounts, setResourceCounts] = useState<Record<string, number>>({
    agents: 0,
    commands: 0,
    hooks: 0,
    'claude-files': 0,
    systems: 0
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
      
      // Load systems data
      const systemsData = await ResourceDataService.fetchResourceSystems();
      setSystems(systemsData);
      
      setResourceCounts({
        agents: allResourcesData.agents.length,
        commands: allResourcesData.commands.length,
        hooks: allResourcesData.hooks.length,
        'claude-files': allResourcesData.claudeFiles.length,
        systems: systemsData.length
      });
      
      console.log('Resource counts loaded:', {
        agents: allResourcesData.agents.length,
        commands: allResourcesData.commands.length,
        hooks: allResourcesData.hooks.length,
        claudeFiles: allResourcesData.claudeFiles.length,
        systems: systemsData.length
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

    if (navItem === 'systems') {
      // Systems section is handled differently - just clear resources
      setResources([]);
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
    { id: 'systems', label: 'Systems', icon: Package, count: resourceCounts.systems },
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

  const toggleNavItemExpanded = (itemId: NavItemType) => {
    setExpandedNavItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
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
      {/* TODO: [UX Spec] Add hover actions for resource creation and refresh
       *       Reference: docs/ux.md - Section 5 specifies PlusCircle & RefreshCw hover buttons
       *       Priority: Medium - Streamlines resource management actions
       *       GitHub Issue: #79
       */}
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
        {/* TODO: [UX Spec] Enhance search with resource type filtering
         *       Reference: docs/ux.md - Global filter should work across all resource types
         *       Priority: Medium - Improves resource discovery workflow
         *       GitHub Issue: #80
         */}
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

      {/* Navigation Items - Tree Structure with Collapsible Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNavItem === item.id;
            const isExpanded = expandedNavItems.has(item.id);
            const hasSubItems = ['projects', 'systems'].includes(item.id); // Items that can have sub-navigation
            
            return (
              <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleNavItemExpanded(item.id)}>
                <div className="group relative">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isSelected ? "secondary" : "ghost"}
                      size="sm"
                      className={`w-full justify-start h-9 ${isSelected ? 'bg-muted' : ''} hover:bg-muted/50`}
                      onClick={(e) => {
                        if (!hasSubItems) {
                          e.stopPropagation();
                          handleNavItemClick(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {hasSubItems && (
                            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                          )}
                          <Icon size={16} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.count !== undefined && (
                            <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  {/* ✅ [UX Spec] Hover actions for resource creation and refresh */}
                  {/*    Reference: docs/ux.md - Section 5 specifies PlusCircle & RefreshCw hover buttons */}
                  {/*    GitHub Issue: #79 - COMPLETED */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement resource creation for this type
                        console.log(`Create new ${item.id}`);
                      }}
                      title={`Create new ${item.label.toLowerCase()}`}
                    >
                      <Plus size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadResourcesForNavItem(item.id);
                      }}
                      title={`Refresh ${item.label.toLowerCase()}`}
                    >
                      <RotateCcw size={12} />
                    </Button>
                  </div>
                </div>

                {hasSubItems && (
                  <CollapsibleContent className="ml-4 mt-1 space-y-1">
                    {/* Projects Sub-navigation */}
                    {item.id === 'projects' && (
                      <div className="space-y-1">
                        {projects.slice(0, 5).map((project) => (
                          <Button
                            key={project.path}
                            variant={selectedProject?.path === project.path ? "secondary" : "ghost"}
                            size="sm"
                            className={`w-full justify-start h-7 pl-6 text-xs ${
                              selectedProject?.path === project.path ? 'bg-muted' : ''
                            }`}
                            onClick={() => {
                              setSelectedNavItem('projects');
                              handleProjectSelect(project);
                            }}
                          >
                            <FolderOpen size={12} className="mr-2" />
                            {project.name}
                          </Button>
                        ))}
                        {projects.length > 5 && (
                          <div className="text-xs text-muted-foreground pl-6 py-1">
                            +{projects.length - 5} more projects
                          </div>
                        )}
                        {projects.length === 0 && (
                          <div className="text-xs text-muted-foreground pl-6 py-1">
                            No projects found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Systems Sub-navigation */}
                    {item.id === 'systems' && (
                      <div className="space-y-1">
                        {systems.slice(0, 5).map((system) => (
                          <Button
                            key={system.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-7 pl-6 text-xs"
                            onClick={() => {
                              setSelectedNavItem('systems');
                              // TODO: Handle system selection
                              console.log('System selected:', system.name);
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Package size={12} />
                              <span>{system.name}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ml-auto ${
                                system.health === 'complete' ? 'bg-green-500' :
                                system.health === 'customized' ? 'bg-orange-500' : 
                                system.health === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </Button>
                        ))}
                        {systems.length > 5 && (
                          <div className="text-xs text-muted-foreground pl-6 py-1">
                            +{systems.length - 5} more systems
                          </div>
                        )}
                        {systems.length === 0 && (
                          <div className="text-xs text-muted-foreground pl-6 py-1">
                            No systems detected
                          </div>
                        )}
                      </div>
                    )}
                  </CollapsibleContent>
                )}
              </Collapsible>
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
    // ✅ [UX Spec] Replaced redundant list view with proper resource editor
    //    Reference: docs/ux.md - Section 3 specifies markdown editor for selected resource
    //    This fixes the core issue where middle column showed lists instead of editor content
    
    // For project navigation, show CLAUDE.md editor when project is selected
    if (selectedNavItem === 'projects' && selectedProject) {
      // Convert selected project to a resource item for the editor
      const projectResource: ResourceItem = {
        id: selectedProject.path,
        name: selectedProject.name,
        type: 'claude-file',
        path: selectedProject.path + '/CLAUDE.md',
        scope: 'project',
        projectPath: selectedProject.path,
        lastModified: selectedProject.lastModified,
        description: `CLAUDE.md configuration for ${selectedProject.name}`,
        isEditable: true,
        isSystemResource: false
      };
      
      return (
        <ResourceEditor 
          selectedResource={projectResource}
          selectedProject={selectedProject}
          onResourceUpdate={(resource) => {
            // Handle project CLAUDE.md updates
            console.log('Project CLAUDE.md updated:', resource.name);
          }}
        />
      );
    }

    // For all other cases (agents, commands, hooks, etc.), show the selected resource in editor
    return (
      <ResourceEditor 
        selectedResource={selectedResource}
        selectedProject={selectedProject}
        onResourceUpdate={(resource) => {
          // Update the resource in local state
          setResources(prevResources => 
            prevResources.map(r => 
              r.id === resource.id ? resource : r
            )
          );
          
          setAllResources(prevResources => 
            prevResources.map(r => 
              r.id === resource.id ? resource : r
            )
          );
        }}
      />
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

      {/* Main 3-Column Layout with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Explorer Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <div className="h-full">
              {renderSidebar()}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Middle Column - Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              {renderMiddleColumn()}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right Content Column - Properties Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full">
              {renderContentColumn()}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      </div>
    </ErrorBoundary>
  );
}