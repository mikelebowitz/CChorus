import React, { useState, useEffect } from 'react';
import { ResourceLibraryService, ResourceItem } from '../utils/resourceLibraryService';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Bot, 
  Terminal, 
  Webhook, 
  FolderOpen, 
  Settings,
  User,
  Folder,
  Globe,
  Copy,
  Move,
  Play,
  Pause
} from 'lucide-react';

interface ResourceLibraryProps {
  onResourceSelect?: (resource: ResourceItem) => void;
  onResourceAssign?: (resource: ResourceItem) => void;
}

const resourceService = new ResourceLibraryService();

const RESOURCE_TYPE_ICONS = {
  agent: Bot,
  command: Terminal,
  hook: Webhook,
  project: FolderOpen,
  settings: Settings
};

const SCOPE_ICONS = {
  user: User,
  project: Folder,
  builtin: Globe,
  system: Globe
};

const SCOPE_COLORS = {
  user: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  project: 'bg-green-500/10 text-green-700 dark:text-green-300', 
  builtin: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  system: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
};

export function ResourceLibrary({ onResourceSelect, onResourceAssign }: ResourceLibraryProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    // Apply filters whenever resources or filter criteria change
    const filtered = resourceService.filterResources(resources, {
      type: selectedType,
      scope: selectedScope,
      search: searchQuery
    });
    setFilteredResources(filtered);
  }, [resources, selectedType, selectedScope, searchQuery]);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const allResources = await resourceService.loadAllResources();
      setResources(allResources);
    } catch (error) {
      console.error('Failed to load resources:', error);
      setError(error instanceof Error ? error.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSelect = (resource: ResourceItem) => {
    if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };

  const handleResourceAssign = (resource: ResourceItem) => {
    if (onResourceAssign) {
      onResourceAssign(resource);
    }
  };

  const toggleResourceSelection = (resourceId: string) => {
    const newSelection = new Set(selectedResources);
    if (newSelection.has(resourceId)) {
      newSelection.delete(resourceId);
    } else {
      newSelection.add(resourceId);
    }
    setSelectedResources(newSelection);
  };

  const getResourceCounts = () => {
    const counts = {
      all: resources.length,
      agent: resources.filter(r => r.type === 'agent').length,
      command: resources.filter(r => r.type === 'command').length,
      hook: resources.filter(r => r.type === 'hook').length,
      project: resources.filter(r => r.type === 'project').length,
      settings: resources.filter(r => r.type === 'settings').length
    };
    return counts;
  };

  const getScopeCounts = () => {
    const counts = {
      all: resources.length,
      user: resources.filter(r => r.scope === 'user').length,
      project: resources.filter(r => r.scope === 'project').length,
      builtin: resources.filter(r => r.scope === 'builtin').length,
      system: resources.filter(r => r.scope === 'system').length
    };
    return counts;
  };

  const ResourceCard = ({ resource }: { resource: ResourceItem }) => {
    const TypeIcon = RESOURCE_TYPE_ICONS[resource.type];
    const ScopeIcon = SCOPE_ICONS[resource.scope];
    const isSelected = selectedResources.has(resource.id);

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handleResourceSelect(resource)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TypeIcon size={20} className="text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate">{resource.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {resource.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleResourceSelection(resource.id);
                }}
                className="w-4 h-4"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                className={`text-xs ${SCOPE_COLORS[resource.scope]}`}
                variant="secondary"
              >
                <ScopeIcon size={12} className="mr-1" />
                {resource.scope}
              </Badge>
              
              {resource.projectName && (
                <Badge className="text-xs bg-muted text-muted-foreground" variant="secondary">
                  {resource.projectName}
                </Badge>
              )}
              
              <Badge 
                className={`text-xs ${resource.isActive 
                  ? 'bg-green-500/10 text-green-700 dark:text-green-300' 
                  : 'bg-red-500/10 text-red-700 dark:text-red-300'
                }`}
                variant="secondary"
              >
                {resource.isActive ? (
                  <><Play size={10} className="mr-1" />Active</>
                ) : (
                  <><Pause size={10} className="mr-1" />Inactive</>
                )}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleResourceAssign(resource);
              }}
              title="Assign resource"
            >
              <Copy size={12} />
            </Button>
          </div>
          
          {resource.filePath && (
            <div className="text-xs text-muted-foreground/60 mt-2 truncate">
              {resource.filePath}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load resources</div>
          <div className="text-sm text-muted-foreground mb-4">{error}</div>
          <Button onClick={loadResources} variant="outline" size="sm">
            <RefreshCw size={16} className="mr-1" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const resourceCounts = getResourceCounts();
  const scopeCounts = getScopeCounts();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Resource Library</h1>
            <p className="text-sm text-muted-foreground">
              Discover and manage all your Claude Code resources
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedResources.size > 0 && (
              <Button variant="outline" size="sm">
                <Copy size={16} className="mr-1" />
                Assign {selectedResources.size} Resources
              </Button>
            )}
            
            <Button onClick={loadResources} variant="outline" size="sm">
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters and Content */}
      <div className="flex-1 flex">
        {/* Sidebar Filters */}
        <div className="w-64 border-r bg-card p-4">
          <div className="space-y-4">
            {/* Resource Type Filter */}
            <div>
              <h3 className="font-medium text-sm mb-2">Resource Type</h3>
              <div className="space-y-1">
                {Object.entries(resourceCounts).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between ${
                      selectedType === type ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="capitalize">{type}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Filter */}
            <div>
              <h3 className="font-medium text-sm mb-2">Scope</h3>
              <div className="space-y-1">
                {Object.entries(scopeCounts).map(([scope, count]) => (
                  <button
                    key={scope}
                    onClick={() => setSelectedScope(scope)}
                    className={`w-full text-left px-2 py-1 rounded text-sm flex items-center justify-between ${
                      selectedScope === scope ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="capitalize">{scope}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="flex-1 p-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <Filter size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No resources found
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No resources match "${searchQuery}"`
                  : 'Try adjusting your filters or refresh the library'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}