import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { X, Save, Plus, Minus, Server } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AgentEditorProps {
  agent?: SubAgent;
  onSave: (agent: SubAgent) => void;
  onCancel: () => void;
}

export const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SubAgent>({
    name: '',
    description: '',
    tools: [],
    color: PRESET_COLORS[0],
    prompt: '',
    level: 'project'
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [toolsData, setToolsData] = useState<ToolsData>({ defaultTools: AVAILABLE_TOOLS, mcpServers: [] });
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    if (agent) {
      setFormData({
        ...agent,
        color: agent.color || PRESET_COLORS[0] // Ensure color is always set
      });
      setSelectedTools(new Set(agent.tools || []));
    } else {
      // Reset form for new agent
      setFormData({
        name: '',
        description: '',
        tools: [],
        color: PRESET_COLORS[0],
        prompt: '',
        level: 'project'
      });
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
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    setFormData(prev => ({ 
      ...prev, 
      tools: Array.from(newSelected) 
    }));
  };

  const handleSelectAllTools = () => {
    const allAvailableTools = new Set([
      ...toolsData.defaultTools,
      ...toolsData.mcpServers.filter(server => server.permitted).map(server => server.id)
    ]);
    setSelectedTools(allAvailableTools);
    setFormData(prev => ({ 
      ...prev, 
      tools: Array.from(allAvailableTools) 
    }));
  };

  const handleSelectNoTools = () => {
    setSelectedTools(new Set());
    setFormData(prev => ({ 
      ...prev, 
      tools: [] 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    const nameError = validateAgentName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({
      ...formData,
      tools: selectedTools.size > 0 ? Array.from(selectedTools) : undefined
    });
  };

  return (
    <div className="bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">
          {agent ? 'Edit Agent' : 'Create New Agent'}
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
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
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
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full resize-none ${
                    errors.description ? 'border-destructive' : ''
                  }`}
                  placeholder="When should this agent be invoked?"
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description}</p>
                )}
              </div>

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
                        color: color, // For the currentColor in box-shadow
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
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
                      <span className="text-sm">Loading available tools...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-4">
                    {/* Default Claude Code Tools */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Claude Code Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {toolsData.defaultTools.map((tool) => (
                          <div key={tool} className="flex items-center gap-2">
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
                        <div className="grid grid-cols-1 gap-2">
                          {toolsData.mcpServers.map((server) => (
                            <div key={server.id} className="flex items-start gap-2">
                              <Checkbox
                                id={`server-${server.id}`}
                                checked={selectedTools.has(server.id)}
                                onCheckedChange={() => handleToolToggle(server.id)}
                                disabled={!server.permitted}
                                className="mt-0.5"
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                  <label
                                    htmlFor={`server-${server.id}`}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {server.displayName}
                                  </label>
                                  {!server.permitted && (
                                    <Badge variant="secondary" className="text-xs">Not Permitted</Badge>
                                  )}
                                </div>
                                <span className="font-mono text-xs opacity-60">
                                  {server.server} → {server.name}
                                </span>
                                {server.description && (
                                  <span className="text-xs opacity-50 mt-1">{server.description}</span>
                                )}
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
                {toolsData.mcpServers.length > 0 && (
                  <span className="block">
                    {toolsData.mcpServers.length} MCP server{toolsData.mcpServers.length !== 1 ? 's' : ''} available
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* System Prompt - Outside grid for natural height */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">
              System Prompt *
            </label>
            <Textarea
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              rows={15}
              className={`w-full font-mono text-sm ${
                errors.prompt ? 'border-destructive' : ''
              }`}
              placeholder="Enter the system prompt for this agent..."
            />
            {errors.prompt && (
              <p className="text-xs text-destructive mt-1">{errors.prompt}</p>
            )}
          </div>
          
          
          <div className="flex justify-end gap-3 mt-6 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
            >
              <Save size={16} />
              {agent ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </form>
    </div>
  );
};