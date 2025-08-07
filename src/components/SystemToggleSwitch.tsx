import React, { useState } from 'react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { AlertTriangle, Power, PowerOff } from 'lucide-react';
import { ResourceDataService } from '../utils/resourceDataService';
import { useToast } from '../hooks/use-toast';

interface SystemToggleSwitchProps {
  systemId: string;
  systemName: string;
  initialEnabled: boolean;
  projectPath?: string;
  resourceCount: number;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export function SystemToggleSwitch({
  systemId,
  systemName,
  initialEnabled,
  projectPath,
  resourceCount,
  onToggle,
  className
}: SystemToggleSwitchProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleClick = (newEnabled: boolean) => {
    // If disabling a system, show confirmation dialog
    if (!newEnabled && enabled) {
      setPendingEnabled(false);
      setShowConfirmDialog(true);
    } else {
      // Enabling - proceed directly
      setPendingEnabled(true);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmToggle = async () => {
    setIsLoading(true);
    
    try {
      if (pendingEnabled) {
        await ResourceDataService.enableSystem(systemId, projectPath);
      } else {
        await ResourceDataService.disableSystem(systemId, projectPath);
      }
      
      setEnabled(pendingEnabled);
      onToggle?.(pendingEnabled);
      setShowConfirmDialog(false);

      // ✅ [UX Spec] Show Toast notification when system is enabled/disabled
      //    Reference: docs/ux.md - Section 6 workflow shows Toast feedback for all actions
      //    GitHub Issue: #78 - COMPLETED
      toast({
        title: `✅ System ${pendingEnabled ? 'Enabled' : 'Disabled'}`,
        description: `${systemName} has been ${pendingEnabled ? 'enabled' : 'disabled'}. ${resourceCount} resources ${pendingEnabled ? 'are now active' : 'have been deactivated'}.`,
      });
    } catch (error) {
      console.error('Error toggling system:', error);
      toast({
        title: 'System Toggle Failed',
        description: `Failed to ${pendingEnabled ? 'enable' : 'disable'} ${systemName}. ${error instanceof Error ? error.message : 'Unknown error occurred.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelToggle = () => {
    setShowConfirmDialog(false);
    setPendingEnabled(enabled); // Reset to current state
  };

  return (
    <>
      {/* Toggle Switch */}
      <div className={`flex items-center gap-2 ${className}`}>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggleClick}
          disabled={isLoading}
          className="data-[state=checked]:bg-green-500"
        />
        <span className={`text-sm ${enabled ? 'text-green-700' : 'text-gray-500'}`}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingEnabled ? (
                <Power className="h-5 w-5 text-green-600" />
              ) : (
                <PowerOff className="h-5 w-5 text-red-600" />
              )}
              {pendingEnabled ? 'Enable' : 'Disable'} System
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">
                  {pendingEnabled ? 'Enable' : 'Disable'} {systemName}?
                </div>
                <div className="text-yellow-700 mt-1">
                  {pendingEnabled ? (
                    <>
                      This will enable all {resourceCount} resources in the {systemName} system.
                      {projectPath && ' This change will apply to the current project only.'}
                    </>
                  ) : (
                    <>
                      This will disable all {resourceCount} resources in the {systemName} system.
                      Resources will be hidden from the interface and won't be available for use.
                      {projectPath && ' This change will apply to the current project only.'}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-1">Affected Resources:</div>
              <div>{resourceCount} resources will be {pendingEnabled ? 'enabled' : 'disabled'}</div>
              {projectPath && (
                <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                  Project: {projectPath}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancelToggle}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmToggle}
              disabled={isLoading}
              variant={pendingEnabled ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              {pendingEnabled ? (
                <Power className="h-4 w-4" />
              ) : (
                <PowerOff className="h-4 w-4" />
              )}
              {isLoading ? 'Processing...' : (pendingEnabled ? 'Enable System' : 'Disable System')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}