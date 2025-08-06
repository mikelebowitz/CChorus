import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ResourceItem, ResourceDataService } from '../utils/resourceDataService';
import { AlertTriangle, FileText, Edit3, Save, X } from 'lucide-react';

interface ResourceModificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  projectPath: string;
  onModificationComplete?: (modifiedResource: ResourceItem) => void;
}

export function ResourceModificationDialog({
  isOpen,
  onClose,
  resource,
  projectPath,
  onModificationComplete
}: ResourceModificationDialogProps) {
  const [modificationReason, setModificationReason] = useState('');
  const [modifiedContent, setModifiedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (resource && isOpen) {
      // Initialize with original content or current content
      setModifiedContent(resource.originalContent || 'Resource content would be loaded here...');
      setModificationReason('');
      setError(null);
    }
  }, [resource, isOpen]);

  const handleSave = async () => {
    if (!resource || !modificationReason.trim()) {
      setError('Please provide a reason for this modification');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create the resource modification with change tracking
      const change = await ResourceDataService.createResourceModification(
        resource.id,
        projectPath,
        modificationReason.trim(),
        modifiedContent,
        resource.originalContent || resource.description
      );

      // Create the modified resource object
      const modifiedResource: ResourceItem = {
        ...resource,
        isModified: true,
        modificationReason: modificationReason.trim(),
        modificationDate: change.timestamp,
        originalContent: resource.originalContent || resource.description,
        description: modifiedContent, // Update description with new content
        resourceVersion: (resource.resourceVersion || 1) + 1
      };

      // Call completion callback
      onModificationComplete?.(modifiedResource);
      
      // Close dialog
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save modification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Modify System Resource
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resource Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{resource.name}</span>
              {resource.systemName && (
                <Badge variant="outline" className="text-xs">
                  {resource.systemName}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div>Type: {resource.type}</div>
              <div>Scope: {resource.scope}</div>
              {resource.filePath && <div>Path: {resource.filePath}</div>}
            </div>
          </div>

          <Separator />

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">System Resource Modification</div>
              <div className="text-yellow-700 mt-1">
                You are modifying a system resource. The original will be preserved and your 
                project-specific variant will be tracked separately. This change will only 
                affect the current project: <span className="font-mono text-xs">{projectPath}</span>
              </div>
            </div>
          </div>

          {/* Modification Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Modification <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reason"
              placeholder="e.g., Customize for project requirements, fix compatibility issue..."
              value={modificationReason}
              onChange={(e) => setModificationReason(e.target.value)}
              className={error && !modificationReason.trim() ? 'border-red-500' : ''}
            />
            <div className="text-xs text-muted-foreground">
              This will help you and others understand why this change was made.
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label htmlFor="content">Resource Content</Label>
            <Textarea
              id="content"
              value={modifiedContent}
              onChange={(e) => setModifiedContent(e.target.value)}
              placeholder="Resource content..."
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Modify the resource content as needed for your project.
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isLoading || !modificationReason.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Modification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}