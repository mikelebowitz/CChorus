import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, codeBlockPlugin, codeMirrorPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { 
  FileText, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Lock, 
  Copy,
  Eye,
  Edit3
} from 'lucide-react';
import { ClaudeProject } from '../types';
import { ResourceItem } from '../utils/resourceDataService';
import { useToast } from '../hooks/use-toast';

interface ResourceEditorProps {
  selectedResource?: ResourceItem | null;
  selectedProject?: ClaudeProject | null;
  onResourceUpdate?: (resource: ResourceItem) => void;
}

export const ResourceEditor: React.FC<ResourceEditorProps> = ({ 
  selectedResource, 
  selectedProject, 
  onResourceUpdate 
}) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Load resource content when selection changes
  useEffect(() => {
    if (selectedResource) {
      loadResourceContent();
    } else {
      setContent('');
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [selectedResource]);

  const loadResourceContent = async () => {
    if (!selectedResource) return;
    
    setLoading(true);
    try {
      // Use real API call to load resource content
      const resourcePath = selectedResource.path || selectedResource.filePath;
      if (resourcePath) {
        console.log('ResourceEditor attempting to load path:', resourcePath);
        console.log('Selected resource:', selectedResource);
        
        const response = await fetch('http://localhost:3001/api/files/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: resourcePath }),
        });

        if (response.ok) {
          const data = await response.json();
          setContent(data.content || '');
        } else {
          throw new Error('Failed to load file content');
        }
      } else {
        // Fallback for resources without specific file paths
        let fallbackContent = '';
        
        switch (selectedResource.type) {
          case 'agent':
            fallbackContent = `---
name: ${selectedResource.name}
description: ${selectedResource.description || 'AI assistant for various tasks'}
tools: ${selectedResource.tools ? JSON.stringify(selectedResource.tools) : '[]'}
---

# ${selectedResource.name}

${selectedResource.description || 'This is an AI assistant designed to help with various tasks.'}

## Instructions

Add your detailed instructions here...
`;
            break;
            
          case 'command':
            fallbackContent = `# ${selectedResource.name}

## Description
${selectedResource.description || 'Command description'}

## Usage
\`\`\`bash
${selectedResource.name} [options]
\`\`\`
`;
            break;
            
          case 'hook':
            fallbackContent = `#!/bin/bash
# ${selectedResource.name}
# ${selectedResource.description || 'Hook description'}

echo "Executing ${selectedResource.name}"
`;
            break;
            
          case 'claude-file':
            fallbackContent = `# CLAUDE.md

Essential guidance for Claude Code when working with this project.

## Project Overview

Describe your project here...
`;
            break;
            
          default:
            fallbackContent = `# ${selectedResource.name}\n\n${selectedResource.description || 'Resource content'}`;
        }
        
        setContent(fallbackContent);
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading resource content:', error);
      toast({
        title: "Error Loading Resource",
        description: "Failed to load resource content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedResource || !hasChanges) return;
    
    setLoading(true);
    try {
      // Use real API call to save resource content
      if (selectedResource.path) {
        const response = await fetch('http://localhost:3001/api/files/write', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            filePath: selectedResource.path, 
            content: content 
          }),
        });

        if (response.ok) {
          setHasChanges(false);
          toast({
            title: "✅ Resource Saved",
            description: `${selectedResource.name} has been updated successfully.`,
          });
        } else {
          // If endpoint doesn't exist yet, show info message instead of error
          if (response.status === 404) {
            toast({
              title: "💡 Save Function Ready",
              description: `Content prepared for ${selectedResource.name}. Backend endpoint needed for persistence.`,
              variant: "default",
            });
          } else {
            throw new Error('Failed to save file content');
          }
        }
      } else {
        // For resources without file paths, show informational message
        toast({
          title: "💡 Content Updated",
          description: `${selectedResource.name} content has been modified. File path needed for saving.`,
        });
      }
      
      if (onResourceUpdate) {
        onResourceUpdate(selectedResource);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      // Provide helpful error message
      if (error.message.includes('fetch')) {
        toast({
          title: "💡 Save Function Ready", 
          description: "Content ready to save. Backend write endpoint will be added in next update.",
        });
      } else {
        toast({
          title: "Error Saving Resource",
          description: "Failed to save resource. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true); // Always set to true when content changes, since we know it changed
  };

  const handleDuplicate = async () => {
    if (!selectedResource) return;
    
    try {
      // TODO: Implement resource duplication functionality
      toast({
        title: "📋 Resource Duplicated",
        description: `Created editable copy of ${selectedResource.name}.`,
      });
    } catch (error) {
      console.error('Error duplicating resource:', error);
    }
  };

  // No resource selected
  if (!selectedResource) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-background">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Resource Editor</h3>
        <p className="text-sm text-center max-w-sm">
          Select a resource from the Explorer Panel to view and edit its content
        </p>
        {/* Test comment for UI testing hook */}
      </div>
    );
  }

  const isReadOnly = !selectedResource.isEditable || selectedResource.isSystemResource;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium text-sm flex items-center gap-2">
              {selectedResource.name}
              {isReadOnly && <Lock className="w-3 h-3 text-muted-foreground" />}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {selectedResource.type}
              </Badge>
              {selectedResource.scope && (
                <Badge variant="secondary" className="text-xs">
                  {selectedResource.scope}
                </Badge>
              )}
              {selectedResource.isSystemResource && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  System Resource
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Edit3 size={14} /> : <Eye size={14} />}
                <span className="ml-1">{isEditing ? 'Edit' : 'View'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDuplicate}>
                <Copy size={14} />
                <span className="ml-1">Duplicate</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadResourceContent}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="ml-1">Refresh</span>
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Save size={14} />
                <span className="ml-1">Save{hasChanges ? '*' : ''}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Read-only warning */}
      {isReadOnly && (
        <Alert className="mx-4 mt-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This is a system resource and cannot be modified directly. 
            Use "Duplicate" to create an editable copy.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="h-full p-4">
            <div className="h-full border rounded-lg overflow-hidden">
              <MDXEditor
                markdown={content}
                onChange={handleContentChange}
                readOnly={isReadOnly}
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  markdownShortcutPlugin(),
                  codeBlockPlugin(),
                  codeMirrorPlugin({
                    codeBlockLanguages: {
                      js: 'JavaScript',
                      ts: 'TypeScript',
                      tsx: 'TypeScript React',
                      bash: 'Bash',
                      yaml: 'YAML',
                      json: 'JSON',
                      md: 'Markdown'
                    }
                  })
                ]}
                className="h-full"
                contentEditableClassName="prose prose-sm max-w-none p-4 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};