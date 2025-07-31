import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { Save, X, Server } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AgentConfigPanelProps {
  agent?: SubAgent;
  onSave: (agent: SubAgent) => void;
  onCancel: () => void;
  formData: SubAgent;
  onFormDataChange: (field: keyof SubAgent, value: any) => void;
  errors: { [key: string]: string };
  onErrorsChange: (errors: { [key: string]: string }) => void;
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({
  agent,
  onSave,
  onCancel,
  formData,
  onFormDataChange,
  errors,
  onErrorsChange
}) => {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [toolsData, setToolsData] = useState<ToolsData>({ defaultTools: AVAILABLE_TOOLS, mcpServers: [] });
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    if (agent) {
      setSelectedTools(new Set(agent.tools || []));
    } else {
      setSelectedTools(new Set());
    }
  }, [agent]);

  useEffect(() => {
    const loadToolsData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/mcp-servers');
        if (response.ok) {
          const data = await response.json();
          setToolsData(data);
        }
      } catch (error) {
        console.warn('Failed to load MCP servers:', error);
      } finally {
        setLoadingTools(false);
      }
    };

    loadToolsData();
  }, []);

  const handleInputChange = (field: keyof SubAgent, value: string) => {
    onFormDataChange(field, value);
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      onErrorsChange(newErrors);
    }
  };

  const handleToolToggle = (tool: string) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(tool)) {
      newSelected.delete(tool);
    } else {
      newSelected.add(tool);
    }
    setSelectedTools(newSelected);
    onFormDataChange('tools', Array.from(newSelected));
  };

  const handleSelectAllTools = () => {
    const allAvailableTools = new Set([
      ...toolsData.defaultTools,
      ...toolsData.mcpServers.filter(server => server.permitted).map(server => server.id)
    ]);
    setSelectedTools(allAvailableTools);
    onFormDataChange('tools', Array.from(allAvailableTools));
  };

  const handleSelectNoTools = () => {
    setSelectedTools(new Set());
    onFormDataChange('tools', []);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};
    
    const nameError = validateAgentName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.prompt?.trim()) {
      newErrors.prompt = 'Prompt is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      onErrorsChange(newErrors);
      return;
    }
    
    onSave({
      ...formData,
      tools: selectedTools.size > 0 ? Array.from(selectedTools) : undefined
    });
  };

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {agent ? 'Edit Agent' : 'New Agent'}
        </h2>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`h-8 w-full ${
              errors.name ? 'border-destructive' : ''
            }`}
            placeholder="e.g., code-reviewer"
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description *
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`text-sm w-full resize-none ${
              errors.description ? 'border-destructive' : ''
            }`}
            placeholder="When should this agent be invoked?"
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description}</p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Level
          </label>
          <RadioGroup
            value={formData.level}
            onValueChange={(value) => handleInputChange('level', value)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="user" id="level-user" />
              <label htmlFor="level-user" className="text-sm cursor-pointer">
                User
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="project" id="level-project" />
              <label htmlFor="level-project" className="text-sm cursor-pointer">
                Project
              </label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-1">Project agents take precedence</p>
        </div>
        
        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleInputChange('color', color)}
                className={`color-picker-button ${
                  formData.color === color ? 'selected' : ''
                }`}
                style={{ 
                  backgroundColor: color,
                  color: color,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">
              Tools
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSelectAllTools}
                variant="outline"
                className="h-6 text-xs px-2"
              >
                All
              </Button>
              <Button
                type="button"
                onClick={handleSelectNoTools}
                variant="outline"
                className="h-6 text-xs px-2"
              >
                None
              </Button>
            </div>
          </div>
          {loadingTools ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-h-64 overflow-y-auto">
              <CardContent className="p-3">
                <div className="space-y-3">
                {/* Default Claude Code Tools */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Claude Code Tools</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {toolsData.defaultTools.map((tool) => (
                      <div key={tool} className="flex items-center gap-2 py-1">
                        <Checkbox
                          id={`tool-${tool}`}
                          checked={selectedTools.has(tool)}
                          onCheckedChange={() => handleToolToggle(tool)}
                        />
                        <label
                          htmlFor={`tool-${tool}`}
                          className="font-mono text-xs cursor-pointer"
                        >
                          {tool}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* MCP Servers */}
                {toolsData.mcpServers.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Server size={14} />
                      MCP Servers
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {toolsData.mcpServers.map((server) => (
                        <div key={server.id} className="flex items-start gap-2 py-1">
                          <Checkbox
                            id={`server-${server.id}`}
                            checked={selectedTools.has(server.id)}
                            onCheckedChange={() => handleToolToggle(server.id)}
                            disabled={!server.permitted}
                            className="mt-0.5"
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={`server-${server.id}`}
                                className="text-sm font-medium truncate cursor-pointer"
                              >
                                {server.displayName}
                              </label>
                              {!server.permitted && (
                                <Badge variant="secondary" className="text-xs ml-1">No Access</Badge>
                              )}
                            </div>
                            <span className="font-mono text-xs opacity-60 truncate">
                              {server.server} → {server.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {selectedTools.size === 0 
              ? 'All tools available' 
              : `${selectedTools.size} tools selected`
            }
          </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <Save size={14} />
            {agent ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};