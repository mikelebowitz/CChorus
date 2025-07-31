import React from 'react';
import { SubAgent } from '../types';
import { Textarea } from './ui/textarea';

interface PromptEditorProps {
  agent?: SubAgent;
  formData: SubAgent;
  onFormDataChange: (field: keyof SubAgent, value: any) => void;
  errors: { [key: string]: string };
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  agent,
  formData,
  onFormDataChange,
  errors
}) => {
  const handlePromptChange = (value: string) => {
    onFormDataChange('prompt', value);
  };

  if (!agent && !formData.name) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <img 
            src="/cchorus-logo.png" 
            alt="CChorus" 
            className="mx-auto h-16 w-auto logo faded mb-4"
          />
          <h3 className="text-lg font-medium text-foreground/60 mb-2">
            Select an agent to edit
          </h3>
          <p className="text-foreground/40">
            Choose an agent from the sidebar to start editing its system prompt
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {formData.color && (
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">
              {formData.name || 'New Agent'} - System Prompt
            </h2>
            {formData.description && (
              <p className="text-sm text-foreground/60">
                {formData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="flex-1 p-4 min-h-0">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">
              System Prompt *
            </label>
            <span className="text-xs text-muted-foreground">
              {formData.prompt?.length || 0} characters
            </span>
          </div>
          <Textarea
            value={formData.prompt || ''}
            onChange={(e) => handlePromptChange(e.target.value)}
            className={`w-full font-mono text-sm flex-1 ${
              errors.prompt ? 'border-destructive' : ''
            }`}
            placeholder="Enter the system prompt for this agent..."
            style={{ minHeight: 'calc(100vh - 250px)' }}
          />
          {errors.prompt && (
            <p className="text-xs text-destructive mt-1">{errors.prompt}</p>
          )}
        </div>
      </div>
    </div>
  );
};