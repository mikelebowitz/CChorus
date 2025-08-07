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
      // TODO: Replace with actual API call to load resource content
      // For now, simulate loading content based on resource type
      let mockContent = '';
      
      switch (selectedResource.type) {
        case 'agent':
          mockContent = `---
name: ${selectedResource.name}
description: ${selectedResource.description || 'AI assistant for various tasks'}
tools: ${selectedResource.tools ? JSON.stringify(selectedResource.tools) : '[]'}
---

# ${selectedResource.name}

${selectedResource.description || 'This is an AI assistant designed to help with various tasks.'}

## Instructions

Add your detailed instructions here...

## Guidelines

- Be helpful and accurate
- Provide clear explanations
- Ask for clarification when needed
`;
          break;
          
        case 'command':
          mockContent = `# ${selectedResource.name}

## Description
${selectedResource.description || 'Command description'}

## Usage
\`\`\`bash
${selectedResource.name} [options]
\`\`\`

## Examples
\`\`\`bash
${selectedResource.name} --help
\`\`\`
`;
          break;
          
        case 'hook':
          mockContent = `#!/bin/bash
# ${selectedResource.name}
# ${selectedResource.description || 'Hook description'}

# Hook implementation here
echo "Executing ${selectedResource.name}"
`;
          break;
          
        case 'claude-file':
          mockContent = `# CLAUDE.md

Essential guidance for Claude Code when working with this project.

## Project Overview

Describe your project here...

## Key Guidelines

- Important instructions
- Best practices
- Specific requirements
`;
          break;
          
        default:
          mockContent = `# ${selectedResource.name}\n\n${selectedResource.description || 'Resource content'}`;
      }
      
      setContent(mockContent);
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
      // TODO: Replace with actual API call to save resource content
      console.log('Saving resource:', selectedResource.name, 'Content:', content);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(false);
      toast({
        title: "✅ Resource Saved",
        description: `${selectedResource.name} has been updated successfully.`,
      });
      
      if (onResourceUpdate) {
        onResourceUpdate(selectedResource);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error Saving Resource",
        description: "Failed to save resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== content);
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