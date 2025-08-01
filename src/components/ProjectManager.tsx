import React, { useState, useEffect, useRef } from 'react';
import { ClaudeProject, ProjectFilterStatus } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import MDEditor from '@uiw/react-md-editor';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Search,
  FolderOpen,
  GitBranch,
  FileText,
  Bot,
  Terminal,
  Calendar,
  Save,
  X,
  Edit3,
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
  FileCode,
  FolderGit2,
  MoreVertical,
  Archive,
  ArchiveRestore,
  EyeOff,
  Heart,
  Star
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { CacheService } from '../utils/cacheService';
import { ProjectPreferencesService } from '../utils/projectPreferencesService';

interface ProjectManagerProps {
  onProjectSelect?: (project: ClaudeProject) => void;
  onProjectEdit?: (project: ClaudeProject, content: string) => void;
}

export function ProjectManager({ onProjectSelect, onProjectEdit }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ClaudeProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectFilterStatus>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editorContent, setEditorContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanningMessage, setScanningMessage] = useState<string>('');
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, filterStatus]);

  useEffect(() => {
    setIsDirty(editorContent !== originalContent);
  }, [editorContent, originalContent]);

  // Cleanup effect to close EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const loadProjects = async (forceRefresh: boolean = false) => {
    const CACHE_KEY = 'projects';
    
    // Try to load from cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedProjects = CacheService.get<ClaudeProject[]>(CACHE_KEY);
      if (cachedProjects && cachedProjects.length > 0) {
        // Add current user preferences to cached projects
        const projectsWithPreferences = cachedProjects.map(project => ({
          ...project,
          ...ProjectPreferencesService.getProjectPreferences(project.path)
        }));
        setProjects(projectsWithPreferences);
        setFilteredProjects(projectsWithPreferences);
        setLoadedFromCache(true);
        setLoading(false);
        
        toast({
          title: "Loaded from cache",
          description: `${cachedProjects.length} projects loaded instantly`,
          duration: 2000,
        });
        
        // Check if we should refresh in background
        if (CacheService.isStale(CACHE_KEY)) {
          setRefreshing(true);
          loadProjectsStreaming(true); // Refresh in background
        }
        return;
      }
    }
    
    // No cache or forced refresh - load fresh data
    setLoading(true);
    setError(null);
    if (!loadedFromCache) {
      setProjects([]); // Only clear if not loaded from cache
      setFilteredProjects([]);
    }
    
    loadProjectsStreaming(forceRefresh);
  };

  const loadProjectsStreaming = async (isBackgroundRefresh: boolean = false) => {
    try {
      // Clean up any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Use Server-Sent Events for streaming project discovery
      const eventSource = new EventSource('http://localhost:3001/api/projects/stream');
      eventSourceRef.current = eventSource;
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('Project stream connected');
              break;
              
            case 'scan_started':
              console.log('Scanning started from roots:', data.roots);
              setScanningMessage('Scanning for projects...');
              toast({
                title: "Scanning",
                description: "Discovering projects across your system...",
                duration: 2000,
              });
              break;
              
            case 'project_found':
              // Add new project to the list as it's found, including user preferences
              setProjects(prev => {
                const projectWithPreferences = {
                  ...data.project,
                  ...ProjectPreferencesService.getProjectPreferences(data.project.path)
                };
                const updated = [...prev, projectWithPreferences];
                return updated;
              });
              setScanningMessage(`Found ${data.count} project${data.count !== 1 ? 's' : ''}...`);
              break;
              
            case 'project_error':
              console.warn(`Project error at ${data.path}:`, data.error);
              break;
              
            case 'scan_complete':
              console.log(`Project scan complete: ${data.total} projects found`);
              setLoading(false);
              setRefreshing(false);
              setScanningMessage('');
              
              // Cache the results
              const currentProjects = projects.length > 0 ? projects : [];
              if (currentProjects.length > 0) {
                CacheService.set('projects', currentProjects);
              }
              
              // Show appropriate toast message
              if (isBackgroundRefresh) {
                toast({
                  title: "Projects Updated",
                  description: `Refreshed ${data.total} projects`,
                  duration: 2000,
                });
              } else {
                toast({
                  title: "Scan Complete", 
                  description: `Found ${data.total} projects`,
                  duration: 3000,
                });
              }
              
              eventSource.close();
              eventSourceRef.current = null;
              break;
              
            case 'error':
              throw new Error(data.error);
          }
        } catch (parseError) {
          console.error('Error parsing stream data:', parseError);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setError('Failed to stream project data');
        setLoading(false);
        setRefreshing(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        toast({
          title: "Stream Error",
          description: "Falling back to batch loading...",
          duration: 3000,
        });
        
        // Fallback to batch loading
        loadProjectsBatch(isBackgroundRefresh);
      };
      
    } catch (error) {
      console.error('Error setting up project stream:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
      setLoading(false);
      setRefreshing(false);
      
      // Fallback to batch loading
      loadProjectsBatch(isBackgroundRefresh);
    }
  };

  // Fallback batch loading method
  const loadProjectsBatch = async (isBackgroundRefresh: boolean = false) => {
    try {
      const response = await fetch('http://localhost:3001/api/projects/system');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      
      // Add user preferences to each project
      const projectsWithPreferences = data.map((project: ClaudeProject) => ({
        ...project,
        ...ProjectPreferencesService.getProjectPreferences(project.path)
      }));
      
      setProjects(projectsWithPreferences);
      setFilteredProjects(projectsWithPreferences);
      setLoading(false);
      setRefreshing(false);
      
      // Cache the results
      if (data.length > 0) {
        CacheService.set('projects', data);
      }
      
      // Show appropriate toast
      if (isBackgroundRefresh) {
        toast({
          title: "Projects Updated",
          description: `Refreshed ${data.length} projects`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error loading projects (batch):', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
      setLoading(false);
      setRefreshing(false);
      toast({
        title: "Error",
        description: "Failed to load projects. Please check the backend server.",
        duration: 5000,
      });
    }
  };

  const cancelScan = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setLoading(false);
      setScanningMessage('');
      toast({
        title: "Scan Cancelled",
        description: "Project scanning has been stopped",
        duration: 2000,
      });
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by status
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(project => !project.archived && !project.hidden);
        break;
      case 'archived':
        filtered = filtered.filter(project => project.archived);
        break;
      case 'hidden':
        filtered = filtered.filter(project => project.hidden);
        break;
      case 'favorited':
        filtered = filtered.filter(project => project.favorited);
        break;
      case 'all':
        // Show all projects
        break;
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.path.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      );
    }

    setFilteredProjects(filtered);
  };

  const loadProjectContent = async (project: ClaudeProject) => {
    try {
      const encodedPath = encodeURIComponent(project.path);
      const response = await fetch(`http://localhost:3001/api/projects/${encodedPath}/claudemd`);
      
      if (response.status === 404) {
        // CLAUDE.md doesn't exist, start with template
        const template = `# ${project.name}

This file provides guidance to Claude Code when working with this project.

## Project Overview

${project.description || 'Describe your project here...'}

## Development Guidelines

- Coding standards and conventions
- Architecture decisions
- Important patterns to follow

## Key Files and Directories

- \`src/\` - Main source code
- \`tests/\` - Test files
- ...

## Getting Started

\`\`\`bash
# Installation
npm install

# Development
npm run dev

# Testing
npm test
\`\`\`

## Important Notes

- Any specific considerations for this project
- Dependencies or environment requirements
- Known issues or limitations
`;
        setEditorContent(template);
        setOriginalContent('');
        return;
      }

      if (!response.ok) throw new Error('Failed to load CLAUDE.md');
      
      const data = await response.json();
      setEditorContent(data.content || '');
      setOriginalContent(data.content || '');
    } catch (error) {
      console.error('Error loading CLAUDE.md:', error);
      toast({
        title: "Error",
        description: "Failed to load CLAUDE.md content",
        duration: 3000,
      });
    }
  };

  const handleProjectSelect = async (project: ClaudeProject) => {
    setSelectedProject(project);
    await loadProjectContent(project);
    
    // Mark as viewed
    ProjectPreferencesService.markAsViewed(project.path);
    
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handleArchiveProject = (project: ClaudeProject) => {
    const wasArchived = project.archived;
    
    if (wasArchived) {
      ProjectPreferencesService.unarchiveProject(project.path);
      toast({
        title: "Project Unarchived",
        description: `${project.name} has been moved back to active projects`,
        duration: 2000,
      });
    } else {
      ProjectPreferencesService.archiveProject(project.path);
      toast({
        title: "Project Archived",
        description: `${project.name} has been archived`,
        duration: 2000,
      });
    }
    
    // Update the project in state
    setProjects(prev => prev.map(p => 
      p.path === project.path 
        ? { ...p, archived: !wasArchived }
        : p
    ));
  };

  const handleHideProject = (project: ClaudeProject) => {
    const wasHidden = project.hidden;
    
    if (wasHidden) {
      ProjectPreferencesService.showProject(project.path);
      toast({
        title: "Project Shown",
        description: `${project.name} is now visible`,
        duration: 2000,
      });
    } else {
      ProjectPreferencesService.hideProject(project.path);
      toast({
        title: "Project Hidden",
        description: `${project.name} has been hidden`,
        duration: 2000,
      });
    }
    
    // Update the project in state
    setProjects(prev => prev.map(p => 
      p.path === project.path 
        ? { ...p, hidden: !wasHidden }
        : p
    ));
  };

  const handleToggleFavorite = (project: ClaudeProject) => {
    const newFavoriteStatus = ProjectPreferencesService.toggleFavorite(project.path);
    
    toast({
      title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
      description: `${project.name} ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
      duration: 2000,
    });
    
    // Update the project in state
    setProjects(prev => prev.map(p => 
      p.path === project.path 
        ? { ...p, favorited: newFavoriteStatus }
        : p
    ));  
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    setSaving(true);
    try {
      const encodedPath = encodeURIComponent(selectedProject.path);
      const response = await fetch(`http://localhost:3001/api/projects/${encodedPath}/claudemd`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editorContent }),
      });

      if (!response.ok) throw new Error('Failed to save CLAUDE.md');

      setOriginalContent(editorContent);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "CLAUDE.md saved successfully",
        duration: 3000,
      });

      if (onProjectEdit) {
        onProjectEdit(selectedProject, editorContent);
      }
    } catch (error) {
      console.error('Error saving CLAUDE.md:', error);
      toast({
        title: "Error",
        description: "Failed to save CLAUDE.md",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditorContent(originalContent);
    setIsEditing(false);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const getProjectHealth = (project: ClaudeProject) => {
    let score = 0;
    if (project.hasAgents) score += 25;
    if (project.hasCommands) score += 25;
    if (project.isGitRepo) score += 25;
    if (project.description && project.description.length > 50) score += 25;
    
    if (score >= 75) return { status: 'healthy', color: 'text-green-600 dark:text-green-400' };
    if (score >= 50) return { status: 'good', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 25) return { status: 'fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { status: 'needs-attention', color: 'text-red-600 dark:text-red-400' };
  };

  const ProjectCard = ({ project }: { project: ClaudeProject }) => {
    const health = getProjectHealth(project);
    
    return (
      <Card className="hover:shadow-lg transition-shadow relative group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer flex-1" 
              onClick={() => handleProjectSelect(project)}
            >
              <FolderGit2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{project.name}</h3>
              {project.favorited && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <div className="flex items-center gap-2">
              <Check className={`h-4 w-4 ${health.color}`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggleFavorite(project)}>
                    <Star className={`h-4 w-4 mr-2 ${project.favorited ? 'text-yellow-500 fill-current' : ''}`} />
                    {project.favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleArchiveProject(project)}>
                    {project.archived ? (
                      <>
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Unarchive Project
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Project
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleHideProject(project)}>
                    {project.hidden ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Project
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Project
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent onClick={() => handleProjectSelect(project)} className="cursor-pointer">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {project.archived && (
              <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
            {project.hidden && (
              <Badge variant="outline" className="text-xs text-gray-600 dark:text-gray-400">
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
              </Badge>
            )}
            {project.isGitRepo && (
              <Badge variant="secondary" className="text-xs">
                <GitBranch className="h-3 w-3 mr-1" />
                Git
              </Badge>
            )}
            {project.hasAgents && (
              <Badge variant="secondary" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                {project.agentCount} agents
              </Badge>
            )}
            {project.hasCommands && (
              <Badge variant="secondary" className="text-xs">
                <Terminal className="h-3 w-3 mr-1" />
                {project.commandCount} commands
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[200px]" title={project.path}>
              {project.path}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(project.lastModified)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadProjects}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Projects List */}
      <div className={`${selectedProject ? 'w-1/2' : 'w-full'} space-y-4`}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Cache status and refresh controls */}
            <div className="flex items-center gap-2">
              {loadedFromCache && (
                <Badge variant="secondary" className="text-xs">
                  Cached
                </Badge>
              )}
              {refreshing && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Updating...
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadProjects(true)}
                disabled={loading || refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {loading && eventSourceRef.current && (
              <Button
                variant="outline"
                size="sm"
                onClick={cancelScan}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Scan
              </Button>
            )}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Project Filter Tabs */}
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as ProjectFilterStatus)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="favorited">Favorites</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="text-sm text-muted-foreground">
          {loading && scanningMessage ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {scanningMessage}
            </span>
          ) : (
            `Found ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`
          )}
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.path} project={project} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <Card 
                key={project.path}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProjectSelect(project)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.path}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.isGitRepo && <GitBranch className="h-4 w-4 text-muted-foreground" />}
                      {project.hasAgents && <Bot className="h-4 w-4 text-muted-foreground" />}
                      {project.hasCommands && <Terminal className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Editor Panel */}
      {selectedProject && (
        <div className="w-1/2 border-l pl-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">CLAUDE.md Editor</h3>
                    <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <Badge variant="secondary" className="text-xs">
                      Unsaved changes
                    </Badge>
                  )}
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isEditing ? (
                <div className="h-full w-full" data-color-mode="auto">
                  <MDEditor
                    value={editorContent}
                    onChange={(value) => setEditorContent(value || '')}
                    height={400}
                    visibleDragBar={false}
                    textareaProps={{
                      placeholder: 'Enter CLAUDE.md content...',
                      style: { fontSize: 14, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }
                    }}
                  />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm"
                    data-color-mode="auto"
                  >
                    {editorContent ? (
                      <MDEditor.Markdown source={editorContent} />
                    ) : (
                      <span className="italic text-muted-foreground">No CLAUDE.md file found. Click Edit to create one.</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}