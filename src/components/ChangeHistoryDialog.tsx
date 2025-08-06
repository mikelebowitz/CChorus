import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ResourceChange, ResourceDataService } from '../utils/resourceDataService';
import { History, Clock, User, FileText, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChangeHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string | null;
  resourceName?: string;
}

export function ChangeHistoryDialog({
  isOpen,
  onClose,
  resourceId,
  resourceName
}: ChangeHistoryDialogProps) {
  const [changes, setChanges] = useState<ResourceChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ResourceChange | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (isOpen && resourceId) {
      loadChangeHistory();
    }
  }, [isOpen, resourceId]);

  const loadChangeHistory = async () => {
    if (!resourceId) return;
    
    setIsLoading(true);
    try {
      const history = await ResourceDataService.getResourceHistory(resourceId);
      setChanges(history.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading change history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertChange = async (change: ResourceChange) => {
    if (!resourceId) return;
    
    try {
      const success = await ResourceDataService.revertResourceModification(resourceId, change.id);
      if (success) {
        // Reload history to show the revert
        await loadChangeHistory();
        // TODO: Show success toast
      }
    } catch (error) {
      console.error('Error reverting change:', error);
      // TODO: Show error toast
    }
  };

  const getChangeTypeIcon = (changeType: ResourceChange['changeType']) => {
    switch (changeType) {
      case 'create':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'modify':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'restore':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getChangeTypeColor = (changeType: ResourceChange['changeType']) => {
    switch (changeType) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'modify':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'restore':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
            {resourceName && <span className="text-muted-foreground">- {resourceName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex gap-4">
          {/* Change List */}
          <div className="w-1/2 flex flex-col">
            <div className="text-sm font-medium mb-3">
              History ({changes.length} changes)
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-muted-foreground">Loading history...</div>
                </div>
              ) : changes.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-muted-foreground">No changes recorded</div>
                </div>
              ) : (
                changes.map((change) => (
                  <div
                    key={change.id}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-colors',
                      selectedChange?.id === change.id
                        ? 'bg-accent border-primary'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedChange(change)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getChangeTypeIcon(change.changeType)}
                      <Badge className={`text-xs ${getChangeTypeColor(change.changeType)}`}>
                        {change.changeType}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(change.timestamp)}
                      </div>
                    </div>
                    
                    <div className="text-sm font-medium mb-1">{change.reason}</div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {change.author}
                      {change.projectPath && (
                        <span className="font-mono bg-muted px-1 rounded">
                          {change.projectPath.split('/').pop()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator orientation="vertical" />

          {/* Change Details */}
          <div className="w-1/2 flex flex-col">
            {selectedChange ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Change Details</div>
                  
                  {selectedChange.changeType !== 'restore' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevertChange(selectedChange)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Revert
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {/* Change Metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getChangeTypeIcon(selectedChange.changeType)}
                      <Badge className={`text-xs ${getChangeTypeColor(selectedChange.changeType)}`}>
                        {selectedChange.changeType}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium">{selectedChange.reason}</div>
                      <div className="text-muted-foreground mt-1">
                        By {selectedChange.author} on {formatTimestamp(selectedChange.timestamp)}
                      </div>
                      {selectedChange.projectPath && (
                        <div className="text-muted-foreground">
                          Project: <span className="font-mono text-xs">{selectedChange.projectPath}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Content Changes */}
                  <div className="space-y-3">
                    {selectedChange.beforeContent && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">Before:</div>
                        <div className="text-xs font-mono bg-red-50 border border-red-200 rounded p-2 max-h-32 overflow-y-auto">
                          {selectedChange.beforeContent.substring(0, 500)}
                          {selectedChange.beforeContent.length > 500 && '...'}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">After:</div>
                      <div className="text-xs font-mono bg-green-50 border border-green-200 rounded p-2 max-h-32 overflow-y-auto">
                        {selectedChange.afterContent.substring(0, 500)}
                        {selectedChange.afterContent.length > 500 && '...'}
                      </div>
                    </div>

                    {/* TODO: Add proper diff viewer */}
                    {selectedChange.beforeContent && selectedChange.afterContent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDiff(!showDiff)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {showDiff ? 'Hide' : 'Show'} Diff
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select a change to view details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}