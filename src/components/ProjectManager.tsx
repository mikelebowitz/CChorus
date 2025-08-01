import React, { useState, useEffect, useRef } from 'react';
import { ClaudeProject } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
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
  FolderGit2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ProjectManagerProps {
  onProjectSelect?: (project: ClaudeProject) => void;
  onProjectEdit?: (project: ClaudeProject, content: string) => void;
}

export function ProjectManager({ onProjectSelect, onProjectEdit }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ClaudeProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ClaudeProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editorContent, setEditorContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  useEffect(() => {
    setIsDirty(editorContent !== originalContent);
  }, [editorContent, originalContent]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/projects/system');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to load projects');
      toast({
        title: "Error",
        description: "Failed to load projects. Please check the backend server.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.path.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
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
    if (onProjectSelect) {
      onProjectSelect(project);
    }
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
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleProjectSelect(project)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{project.name}</h3>
            </div>
            <Check className={`h-4 w-4 ${health.color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="text-sm text-muted-foreground">
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
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
                <Textarea
                  ref={editorRef}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="h-full w-full resize-none font-mono text-sm"
                  placeholder="Enter CLAUDE.md content..."
                />
              ) : (
                <div className="h-full overflow-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                    {editorContent || <span className="italic">No CLAUDE.md file found. Click Edit to create one.</span>}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}