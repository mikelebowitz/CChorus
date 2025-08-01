import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
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
  Menu
} from 'lucide-react';
import { Input } from './ui/input';
import { ProjectManager } from './ProjectManager';
import { ClaudeMdEditor } from './ClaudeMdEditor';
import { ClaudeProject } from '../types';

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

  // Navigation structure
  const navItems: NavItem[] = [
    { id: 'users', label: 'Users', icon: User, count: 1 },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: 5, expanded: true },
    { id: 'agents', label: 'Agents', icon: Bot, count: 4 },
    { id: 'commands', label: 'Commands', icon: Terminal, count: 2 },
    { id: 'hooks', label: 'Hooks', icon: Webhook, count: 4 },
    { id: 'claude-files', label: 'CLAUDE.md', icon: FileText, count: 3 },
  ];

  const handleNavItemClick = (itemId: NavItemType) => {
    setSelectedNavItem(itemId);
    // Clear selected project when switching nav items
    if (itemId !== 'projects') {
      setSelectedProject(null);
    }
  };

  const handleProjectSelect = (project: ClaudeProject) => {
    setSelectedProject(project);
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
          <div className="h-full p-4">
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
          <div className="p-2">
            {/* Placeholder content - this will be dynamic based on selectedNavItem */}
            {Array.from({ length: 8 }, (_, i) => (
              <Card key={i} className="mb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full bg-primary`} />
                        <h4 className="font-medium text-sm truncate">
                          {selectedNavItem === 'agents' ? `Agent ${i + 1}` :
                           `${selectedNavItem} Item ${i + 1}`}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Description for {selectedNavItem} item {i + 1}. This shows contextual information about the selected resource type.
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Available
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Modified 2h ago
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContentColumn = () => {
    if (selectedNavItem === 'projects') {
      return (
        <ClaudeMdEditor 
          project={selectedProject}
          onContentChange={(project, content) => {
            console.log('CLAUDE.md updated for project:', project.name);
          }}
        />
      );
    }

    return (
      <div className="h-full flex flex-col bg-background">
        {/* Default placeholder */}
        <div className="flex-1 p-6">
          <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Select a resource to edit
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Choose an item from the list to view and edit its content. The editor will adapt based on the type of resource selected.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
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
        
        {/* Middle Column - Fixed width for now */}
        <div className="w-80 flex-shrink-0">
          {renderMiddleColumn()}
        </div>
        
        {/* Right Content Column - Takes remaining space */}
        <div className="flex-1 min-w-0">
          {renderContentColumn()}
        </div>
      </div>
    </div>
  );
}