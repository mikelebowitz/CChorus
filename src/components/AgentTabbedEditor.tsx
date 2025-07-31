import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { Save, X, Server, Info, Palette, FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AgentTabbedEditorProps {
  agent?: SubAgent;
  onSave: (agent: SubAgent) => void;
  onCancel: () => void;
  formData: SubAgent;
  onFormDataChange: (field: keyof SubAgent, value: any) => void;
  errors: { [key: string]: string };
  onErrorsChange: (errors: { [key: string]: string }) => void;
}

type TabType = 'basic' | 'styling' | 'prompt';

export const AgentTabbedEditor: React.FC<AgentTabbedEditorProps> = ({
  agent,
  onSave,
  onCancel,
  formData,
  onFormDataChange,
  errors,
  onErrorsChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
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

  const handleInputChange = (field: keyof SubAgent, value: any) => {
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
      // Switch to the tab with the error
      if (newErrors.name || newErrors.description) {
        setActiveTab('basic');
      } else if (newErrors.prompt) {
        setActiveTab('prompt');
      }
      return;
    }
    
    onSave({
      ...formData,
      tools: selectedTools.size > 0 ? Array.from(selectedTools) : undefined
    });
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'basic': return <Info size={16} />;
      case 'styling': return <Palette size={16} />;
      case 'prompt': return <FileText size={16} />;
    }
  };

  const getTabName = (tab: TabType) => {
    switch (tab) {
      case 'basic': return 'Basic Info';
      case 'styling': return 'Color & Tools';
      case 'prompt': return 'Prompt';
    }
  };

  const hasTabError = (tab: TabType) => {
    switch (tab) {
      case 'basic': return !!(errors.name || errors.description);
      case 'styling': return false; // No required fields in styling tab
      case 'prompt': return !!errors.prompt;
    }
  };

  // Show empty state when no agent is selected
  if (!agent && !formData.name) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <img 
            src="/cchorus-logo.png" 
            alt="CChorus" 
            className="mx-auto h-16 w-auto logo faded mb-4"
          />
          <h3 className="text-lg font-medium text-foreground/60 mb-2">
            No agent selected
          </h3>
          <p className="text-foreground/40 mb-4">
            Choose an agent from the sidebar or create a new one
          </p>
          <Button
            onClick={() => {
              // Initialize form with defaults
              onFormDataChange('name', '');
              onFormDataChange('description', '');
              onFormDataChange('level', 'project');
              onFormDataChange('color', PRESET_COLORS[0]);
              onFormDataChange('prompt', '');
            }}
            variant="default"
          >
            <Plus size={16} />
            Create New Agent
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {formData.color && (
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
          )}
          <h2 className="text-lg font-semibold">
            {agent ? `Edit ${formData.name || 'Agent'}` : 'Create New Agent'}
          </h2>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {(['basic', 'styling', 'prompt'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              } ${hasTabError(tab) ? 'text-error' : ''}`}
            >
              {getTabIcon(tab)}
              {getTabName(tab)}
              {hasTabError(tab) && (
                <div className="w-2 h-2 bg-error rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'basic' && (
          <div className="p-6 space-y-6">
            {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full ${
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
                    rows={4}
                    className={`w-full resize-none ${
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
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="user" id="level-user" />
                      <label htmlFor="level-user" className="text-sm cursor-pointer">
                        User (~/.claude/agents/)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="project" id="level-project" />
                      <label htmlFor="level-project" className="text-sm cursor-pointer">
                        Project (.claude/agents/)
                      </label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-1">
                    Project agents take precedence over user agents with the same name
                  </p>
                </div>
          </div>
        )}

        {activeTab === 'styling' && (
          <div className="p-6 space-y-6">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Color
              </label>
              <div className="flex gap-3 flex-wrap">
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">Loading tools...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                    {/* Default Claude Code Tools */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Claude Code Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
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
                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Server size={14} />
                          MCP Servers
                        </h4>
                        <div className="space-y-2">
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
                                    <Badge variant="secondary" className="text-xs ml-2">No Access</Badge>
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
                  ? 'All tools will be available' 
                  : `${selectedTools.size} tools selected`
                }
              </p>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="p-6 h-full flex flex-col">
            <div className="flex-1 flex flex-col">
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
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                className={`w-full font-mono text-sm flex-1 ${
                  errors.prompt ? 'border-destructive' : ''
                }`}
                placeholder="Enter the system prompt for this agent..."
                style={{ minHeight: '400px' }}
              />
              {errors.prompt && (
                <p className="text-xs text-destructive mt-1">{errors.prompt}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Footer Buttons */}
      <div className="fixed bottom-8 right-8 flex gap-3 z-40">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="shadow-lg"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="default"
          className="shadow-lg"
        >
          <Save size={16} />
          {agent ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </div>
  );
};