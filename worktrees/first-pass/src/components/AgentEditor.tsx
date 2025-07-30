import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { X, Save, Plus, Minus, Server } from 'lucide-react';

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
    <div className="bg-base-100 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">
          {agent ? 'Edit Agent' : 'Create New Agent'}
        </h2>
        <button
          onClick={onCancel}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name *</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input input-bordered w-full ${
                    errors.name ? 'input-error' : ''
                  }`}
                  placeholder="e.g., code-reviewer"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description *</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`textarea textarea-bordered w-full resize-none ${
                    errors.description ? 'textarea-error' : ''
                  }`}
                  placeholder="When should this agent be invoked?"
                />
                {errors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.description}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Level</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="level"
                      value="user"
                      checked={formData.level === 'user'}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="radio radio-primary"
                    />
                    <span className="label-text">User (~/.claude/agents/)</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="level"
                      value="project"
                      checked={formData.level === 'project'}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="radio radio-primary"
                    />
                    <span className="label-text">Project (.claude/agents/)</span>
                  </label>
                </div>
                <label className="label">
                  <span className="label-text-alt">Project agents take precedence over user agents with the same name</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Color</span>
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
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tools</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllTools}
                    className="btn btn-outline btn-xs"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectNoTools}
                    className="btn btn-outline btn-xs"
                  >
                    None
                  </button>
                </div>
              </label>
              {loadingTools ? (
                <div className="card border border-base-300 p-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm">Loading available tools...</span>
                  </div>
                </div>
              ) : (
                <div className="card border border-base-300 p-3">
                  <div className="space-y-4">
                    {/* Default Claude Code Tools */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Claude Code Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {toolsData.defaultTools.map((tool) => (
                          <label key={tool} className="label cursor-pointer justify-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTools.has(tool)}
                              onChange={() => handleToolToggle(tool)}
                              className="checkbox checkbox-primary checkbox-sm"
                            />
                            <span className="label-text font-mono text-xs">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* MCP Servers */}
                    {toolsData.mcpServers.length > 0 && (
                      <div className="border-t border-base-300 pt-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Server size={14} />
                          MCP Servers
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {toolsData.mcpServers.map((server) => (
                            <label key={server.id} className="label cursor-pointer justify-start gap-2">
                              <input
                                type="checkbox"
                                checked={selectedTools.has(server.id)}
                                onChange={() => handleToolToggle(server.id)}
                                className={`checkbox checkbox-sm ${
                                  server.permitted ? 'checkbox-success' : 'checkbox-warning'
                                }`}
                                disabled={!server.permitted}
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{server.displayName}</span>
                                  {!server.permitted && (
                                    <span className="badge badge-warning badge-xs">Not Permitted</span>
                                  )}
                                </div>
                                <span className="font-mono text-xs opacity-60">
                                  {server.server} → {server.name}
                                </span>
                                {server.description && (
                                  <span className="text-xs opacity-50 mt-1">{server.description}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <label className="label">
                <span className="label-text-alt">
                  {selectedTools.size === 0 
                    ? 'All tools will be available' 
                    : `${selectedTools.size} tools selected`
                  }
                  {toolsData.mcpServers.length > 0 && (
                    <span className="block">
                      {toolsData.mcpServers.length} MCP server{toolsData.mcpServers.length !== 1 ? 's' : ''} available
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
          
          {/* System Prompt - Outside grid for natural height */}
          <div className="form-control mt-6 textarea-container">
            <label className="label">
              <span className="label-text font-medium">System Prompt *</span>
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              rows={15}
              className={`textarea textarea-bordered w-full font-mono text-sm natural-textarea ${
                errors.prompt ? 'textarea-error' : ''
              }`}
              placeholder="Enter the system prompt for this agent..."
            />
            {errors.prompt && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.prompt}</span>
              </label>
            )}
          </div>
          
          
          <div className="flex justify-end gap-3 mt-6 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} />
              {agent ? 'Update Agent' : 'Create Agent'}
            </button>
          </div>
        </form>
    </div>
  );
};