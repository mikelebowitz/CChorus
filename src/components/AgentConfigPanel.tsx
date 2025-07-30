import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { Save, X, Server } from 'lucide-react';

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
    <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold">
          {agent ? 'Edit Agent' : 'New Agent'}
        </h2>
        <button
          onClick={onCancel}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Name *</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`input input-bordered input-sm w-full ${
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
        
        {/* Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Description *</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`textarea textarea-bordered textarea-sm w-full resize-none ${
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

        {/* Level */}
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
                className="radio radio-primary radio-sm"
              />
              <span className="label-text text-sm">User</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="level"
                value="project"
                checked={formData.level === 'project'}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="radio radio-primary radio-sm"
              />
              <span className="label-text text-sm">Project</span>
            </label>
          </div>
          <label className="label">
            <span className="label-text-alt text-xs">Project agents take precedence</span>
          </label>
        </div>
        
        {/* Color */}
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
                  color: color,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tools */}
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
            <div className="card border border-base-300 p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card border border-base-300 p-3 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {/* Default Claude Code Tools */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Claude Code Tools</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {toolsData.defaultTools.map((tool) => (
                      <label key={tool} className="label cursor-pointer justify-start gap-2 py-1">
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
                    <div className="grid grid-cols-1 gap-1">
                      {toolsData.mcpServers.map((server) => (
                        <label key={server.id} className="label cursor-pointer justify-start gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedTools.has(server.id)}
                            onChange={() => handleToolToggle(server.id)}
                            className={`checkbox checkbox-sm ${
                              server.permitted ? 'checkbox-success' : 'checkbox-warning'
                            }`}
                            disabled={!server.permitted}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{server.displayName}</span>
                              {!server.permitted && (
                                <span className="badge badge-warning badge-xs ml-1">No Access</span>
                              )}
                            </div>
                            <span className="font-mono text-xs opacity-60 truncate">
                              {server.server} → {server.name}
                            </span>
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
            <span className="label-text-alt text-xs">
              {selectedTools.size === 0 
                ? 'All tools available' 
                : `${selectedTools.size} tools selected`
              }
            </span>
          </label>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-base-300">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline btn-sm flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm flex-1"
          >
            <Save size={14} />
            {agent ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};