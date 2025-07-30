import React, { useState, useEffect } from 'react';
import { SubAgent, PRESET_COLORS } from './types';
import { AgentCard } from './components/AgentCard';
import { AgentEditor } from './components/AgentEditor';
import { AgentTabbedEditor } from './components/AgentTabbedEditor';
import { FileBrowser } from './components/FileBrowser';
import { ApiFileSystemService } from './utils/apiFileSystem';
import { parseAgentFile } from './utils/agentUtils';
import { Plus, Bot, RefreshCw, Search, Filter, User, Folder, FileText, Menu, Palette } from 'lucide-react';

const fileSystem = new ApiFileSystemService();

// Available daisyUI themes
const DAISYUI_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter'
];

function App() {
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<SubAgent | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'user' | 'project'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Form state for the new column layout
  const [formData, setFormData] = useState<SubAgent>({
    name: '',
    description: '',
    tools: [],
    color: PRESET_COLORS[0],
    prompt: '',
    level: 'project'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadAgents();
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('cchorus-theme') || 'light';
    setCurrentTheme(savedTheme);
    console.log('Initial theme loaded:', savedTheme);
  }, []);

  // Separate effect for theme initialization after render
  useEffect(() => {
    if (currentTheme) {
      // Force immediate DOM update for data-theme attribute
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.body.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`theme-${currentTheme}`);
      
      // Trigger a reflow to ensure styles are recalculated
      document.documentElement.offsetHeight;
      
      console.log('Theme initialized:', currentTheme);
    }
  }, [currentTheme]);

  // Theme management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowThemeSelector(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowThemeSelector(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleThemeChange = (theme: string) => {
    console.log('Changing theme from', currentTheme, 'to', theme);
    
    // Set React state first
    setCurrentTheme(theme);
    localStorage.setItem('cchorus-theme', theme);
    setShowThemeSelector(false);
    
    // Force immediate DOM update for data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(`theme-${theme}`);
    
    // Trigger a reflow to ensure styles are recalculated
    document.documentElement.offsetHeight;
    
    // Verify theme application
    setTimeout(() => {
      const actualTheme = document.documentElement.getAttribute('data-theme');
      console.log('Theme change complete. Current theme:', actualTheme);
      console.log('Theme variables check:', {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
        base100: getComputedStyle(document.documentElement).getPropertyValue('--color-base-100')
      });
    }, 50);
  };


  const loadAgents = async () => {
    setLoading(true);
    try {
      const loadedAgents = await fileSystem.loadAgents();
      setAgents(loadedAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    setEditingAgent(undefined);
    setFormData({
      name: '',
      description: '',
      tools: [],
      color: PRESET_COLORS[0],
      prompt: '',
      level: 'project'
    });
    setErrors({});
    setShowEditor(true);
  };

  const handleEditAgent = (agent: SubAgent) => {
    setEditingAgent(agent);
    setFormData({
      ...agent,
      color: agent.color || PRESET_COLORS[0]
    });
    setErrors({});
    setShowEditor(true);
  };

  const handleFormDataChange = (field: keyof SubAgent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleErrorsChange = (newErrors: { [key: string]: string }) => {
    setErrors(newErrors);
  };

  const handleSaveAgent = async (agent: SubAgent) => {
    try {
      await fileSystem.saveAgent(agent);
      
      // Update local state
      setAgents(prev => {
        const existingIndex = prev.findIndex(a => a.name === agent.name && a.level === agent.level);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = agent;
          return updated;
        } else {
          return [...prev, agent];
        }
      });
      
      setShowEditor(false);
      setEditingAgent(undefined);
    } catch (error) {
      console.error('Failed to save agent:', error);
      alert('Failed to save agent. Please check the console for details.');
    }
  };

  const handleDeleteAgent = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the agent "${name}"?`)) {
      return;
    }
    
    const agent = agents.find(a => a.name === name);
    if (!agent) return;
    
    try {
      await fileSystem.deleteAgent(name, agent.level || 'project');
      setAgents(prev => prev.filter(a => !(a.name === name && a.level === agent.level)));
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please check the console for details.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingAgent(undefined);
  };

  const handleImportFromFile = async (filePath: string) => {
    try {
      // Read and parse the file as an agent
      const content = await fileSystem.readAgentFile(filePath);
      const agent = parseAgentFile(content);
      agent.filePath = filePath;
      agent.level = 'project'; // Files found in project are project-level
      
      // Open the editor with the imported agent
      setEditingAgent(agent);
      setShowEditor(true);
      setShowFileSearch(false);
    } catch (error) {
      console.error('Failed to import agent from file:', error);
      alert('Failed to import agent from file. Please check the file format.');
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesView = viewMode === 'all' || agent.level === viewMode;
    return matchesSearch && matchesView;
  });

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Sidebar Header */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => {
              handleCreateAgent();
              onClose?.();
            }}
            className="btn btn-primary btn-sm flex-1"
          >
            <Plus size={16} />
            New Agent
          </button>
          
          <button
            onClick={() => {
              setShowFileSearch(true);
              onClose?.();
            }}
            className="btn btn-outline btn-sm"
          >
            <FileText size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={16} />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered input-sm w-full pl-10"
          />
        </div>

        {/* View Mode Tabs */}
        <div className="tabs tabs-boxed mt-3">
          <button
            onClick={() => setViewMode('all')}
            className={`tab tab-sm ${viewMode === 'all' ? 'tab-active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('user')}
            className={`tab tab-sm ${viewMode === 'user' ? 'tab-active' : ''}`}
          >
            User
          </button>
          <button
            onClick={() => setViewMode('project')}
            className={`tab tab-sm ${viewMode === 'project' ? 'tab-active' : ''}`}
          >
            Project
          </button>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="ml-2 text-sm">Loading agents...</span>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <img 
                src="/cchorus-logo.png" 
                alt="CChorus" 
                className="mx-auto h-8 w-auto logo faded mb-3"
              />
              <p className="text-sm text-base-content/60">
                {searchQuery ? `No agents match "${searchQuery}"` : 'No agents yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    handleCreateAgent();
                    onClose?.();
                  }}
                  className="btn btn-primary btn-sm mt-3"
                >
                  <Plus size={14} />
                  Create Agent
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgents.map((agent) => (
                <div
                  key={`${agent.name}-${agent.level}`}
                  className={`card bg-base-100 shadow-sm border border-base-300 cursor-pointer transition-all hover:shadow-md ${
                    editingAgent?.name === agent.name && editingAgent?.level === agent.level
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => {
                    handleEditAgent(agent);
                    onClose?.();
                  }}
                >
                  <div className="card-body p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: agent.color || '#3B82F6' }}
                          />
                          <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                        </div>
                        <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`badge badge-xs ${
                            agent.level === 'user' ? 'badge-info' : 'badge-success'
                          }`}>
                            {agent.level}
                          </span>
                          {agent.tools && agent.tools.length > 0 && (
                            <span className="text-xs text-base-content/40">
                              {agent.tools.length} tools
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="dropdown dropdown-end">
                        <button 
                          tabIndex={0} 
                          className="btn btn-ghost btn-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ⋮
                        </button>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              handleEditAgent(agent);
                              onClose?.();
                            }}>
                              Edit
                            </button>
                          </li>
                          <li>
                            <button 
                              className="text-error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAgent(agent.name);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics - Directly below agent list */}
        <div className="p-4 border-t border-base-300 bg-base-200/50">
          <h3 className="font-semibold text-sm mb-3">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Agents:</span>
              <span className="font-medium">{agents.length}</span>
            </div>
            <div className="flex justify-between">
              <span>User Agents:</span>
              <span className="font-medium">{agents.filter(a => a.level === 'user').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Project Agents:</span>
              <span className="font-medium">{agents.filter(a => a.level === 'project').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Filtered:</span>
              <span className="font-medium">{filteredAgents.length}</span>
            </div>
          </div>
          {searchQuery && (
            <div className="text-xs text-base-content/60 text-center mt-2">
              Showing results for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading agents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hidden Theme Controllers for daisyUI */}
      <div className="hidden">
        {DAISYUI_THEMES.map((theme) => (
          <input
            key={theme}
            type="radio"
            name="theme-controller"
            value={theme}
            className="theme-controller"
            checked={theme === currentTheme}
            onChange={() => {}} // Controlled by our handleThemeChange
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-none lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost btn-sm"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 ml-2.5">
            <img 
              src="/cchorus-logo.png" 
              alt="CChorus" 
              className="h-10 w-auto logo"
            />
          </div>
        </div>
        
        <div className="flex-none gap-2">
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(prev => !prev)}
              className="btn btn-ghost btn-sm"
              title="Theme Selector (Ctrl/Cmd + T)"
            >
              <Palette size={16} />
            </button>
            
            {showThemeSelector && (
              <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-base-300">
                  <h3 className="font-medium text-sm">Choose Theme</h3>
                  <p className="text-xs text-base-content/60 mt-1">Current: {currentTheme}</p>
                  <p className="text-xs text-base-content/40 mt-1">Press Ctrl/Cmd + T to toggle</p>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1">
                  {DAISYUI_THEMES.map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-2 text-sm text-left rounded transition-colors capitalize ${
                        currentTheme === theme 
                          ? 'bg-primary text-primary-content' 
                          : 'hover:bg-base-200'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={loadAgents}
            className="btn btn-ghost btn-sm"
            title="Reload agents from file system"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-base-100 flex flex-col">
              <div className="flex items-center justify-between p-4">
                <h2 className="font-semibold">Agents</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <SidebarContent onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}
        
        {/* Two-column layout for desktop */}
        <div className="hidden lg:flex flex-1">
          {/* Column 1: Agent List + Statistics */}
          <div className="w-80 bg-base-100 flex-col flex">
            <SidebarContent />
          </div>

          {/* Column 2: Tabbed Editor */}
          <AgentTabbedEditor
            agent={editingAgent}
            onSave={handleSaveAgent}
            onCancel={handleCancelEdit}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            errors={errors}
            onErrorsChange={handleErrorsChange}
          />
        </div>

        {/* Mobile layout (unchanged) */}
        <div className="lg:hidden flex-1">
          {showEditor ? (
            <AgentEditor
              agent={editingAgent}
              onSave={handleSaveAgent}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-base-100">
              <div className="text-center max-w-md px-6">
                <img 
                  src="/cchorus-logo.png" 
                  alt="CChorus" 
                  className="mx-auto h-16 w-auto logo faded mb-4"
                />
                <h3 className="text-lg font-medium text-base-content/60 mb-2">
                  Select an agent to edit
                </h3>
                <p className="text-base-content/40 mb-4">
                  Choose an agent from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={handleCreateAgent}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  Create New Agent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Browser Modal */}
      {showFileSearch && (
        <FileBrowser
          onSelectFile={handleImportFromFile}
          onCancel={() => setShowFileSearch(false)}
        />
      )}
    </div>
  );
}

export default App;