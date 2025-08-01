import React, { useState, useEffect } from 'react';
import { ClaudeProject } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import MDEditor from '@uiw/react-md-editor';
import { 
  FileText,
  Save,
  X,
  Edit3,
  Eye
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ClaudeMdEditorProps {
  project: ClaudeProject | null;
  onContentChange?: (project: ClaudeProject, content: string) => void;
}

export function ClaudeMdEditor({ project, onContentChange }: ClaudeMdEditorProps) {
  const [editorContent, setEditorContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      loadProjectContent(project);
    } else {
      setEditorContent('');
      setOriginalContent('');
      setIsEditing(false);
      setIsDirty(false);
    }
  }, [project]);

  useEffect(() => {
    setIsDirty(editorContent !== originalContent);
  }, [editorContent, originalContent]);

  const loadProjectContent = async (project: ClaudeProject) => {
    setLoading(true);
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
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const encodedPath = encodeURIComponent(project.path);
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

      if (onContentChange) {
        onContentChange(project, editorContent);
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

  if (!project) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 p-6">
          <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Select a project to edit
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Choose a project from the list to view and edit its CLAUDE.md file.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="h-12 bg-card border-b flex items-center px-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <span className="font-medium text-sm">CLAUDE.md</span>
            <span className="text-sm text-muted-foreground">- {project.name}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading CLAUDE.md...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 bg-card border-b flex items-center px-4">
        <div className="flex items-center gap-2 flex-1">
          <FileText size={16} className="text-muted-foreground" />
          <span className="font-medium text-sm">CLAUDE.md</span>
          <span className="text-sm text-muted-foreground">- {project.name}</span>
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

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {isEditing ? (
          <div className="h-full w-full" data-color-mode="auto">
            <MDEditor
              value={editorContent}
              onChange={(value) => setEditorContent(value || '')}
              height="100%"
              visibleDragBar={false}
              textareaProps={{
                placeholder: 'Enter CLAUDE.md content...',
                style: { 
                  fontSize: 14, 
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  resize: 'none'
                }
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
      </div>
    </div>
  );
}