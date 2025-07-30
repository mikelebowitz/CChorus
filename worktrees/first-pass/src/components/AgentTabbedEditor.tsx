import React, { useState, useEffect } from 'react';
import { SubAgent, AVAILABLE_TOOLS, PRESET_COLORS, ToolsData } from '../types';
import { validateAgentName } from '../utils/agentUtils';
import { Save, X, Server, Info, Palette, FileText, Plus } from 'lucide-react';

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
      <div className="flex-1 bg-base-100 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <img 
            src="/cchorus-logo.png" 
            alt="CChorus" 
            className="mx-auto h-16 w-auto logo faded mb-4"
          />
          <h3 className="text-lg font-medium text-base-content/60 mb-2">
            No agent selected
          </h3>
          <p className="text-base-content/40 mb-4">
            Choose an agent from the sidebar or create a new one
          </p>
          <button
            onClick={() => {
              // Initialize form with defaults
              onFormDataChange('name', '');
              onFormDataChange('description', '');
              onFormDataChange('level', 'project');
              onFormDataChange('color', PRESET_COLORS[0]);
              onFormDataChange('prompt', '');
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create New Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
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
        <button
          onClick={onCancel}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-base-300">
        <div className="flex">
          {(['basic', 'styling', 'prompt'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-base-content/60 hover:text-base-content'
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
                
                {/* Description */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Description *</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
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

                {/* Level */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Level</span>
                  </label>
                  <div className="flex gap-6">
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
          </div>
        )}

        {activeTab === 'styling' && (
          <div className="p-6 space-y-6">
            {/* Color */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Color</span>
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
                    <span className="text-sm">Loading tools...</span>
                  </div>
                </div>
              ) : (
                <div className="card border border-base-300 p-4">
                  <div className="space-y-4">
                    {/* Default Claude Code Tools */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Claude Code Tools</h4>
                      <div className="grid grid-cols-2 gap-2">
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
                      <div className="border-t border-base-300 pt-4">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Server size={14} />
                          MCP Servers
                        </h4>
                        <div className="space-y-2">
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
                                    <span className="badge badge-warning badge-xs ml-2">No Access</span>
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
                <span className="label-text-alt">
                  {selectedTools.size === 0 
                    ? 'All tools will be available' 
                    : `${selectedTools.size} tools selected`
                  }
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="p-6 h-full flex flex-col">
            <div className="form-control flex-1 flex flex-col">
              <label className="label">
                <span className="label-text font-medium">System Prompt *</span>
                <span className="label-text-alt text-xs">
                  {formData.prompt?.length || 0} characters
                </span>
              </label>
              <textarea
                value={formData.prompt || ''}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                className={`textarea textarea-bordered w-full font-mono text-sm natural-textarea flex-1 ${
                  errors.prompt ? 'textarea-error' : ''
                }`}
                placeholder="Enter the system prompt for this agent..."
                style={{ minHeight: '400px' }}
              />
              {errors.prompt && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.prompt}</span>
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Footer Buttons */}
      <div className="fixed bottom-8 right-8 flex gap-3 z-40">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline shadow-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary shadow-lg"
        >
          <Save size={16} />
          {agent ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </div>
  );
};