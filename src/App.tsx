import React, { useState, useEffect } from 'react';
import { SubAgent } from './types';
import { AgentCard } from './components/AgentCard';
import { AgentEditor } from './components/AgentEditor';
import { FileBrowser } from './components/FileBrowser';
import { ApiFileSystemService } from './utils/apiFileSystem';
import { parseAgentFile } from './utils/agentUtils';
import { Plus, Bot, RefreshCw, Search, Filter, User, Folder, FileText } from 'lucide-react';

const fileSystem = new ApiFileSystemService();

function App() {
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<SubAgent | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'user' | 'project'>('all');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    console.log('App: Starting to load agents...');
    console.log('App: Setting loading to true');
    setLoading(true);
    try {
      const loadedAgents = await fileSystem.loadAgents();
      console.log('App: Received agents from fileSystem:', loadedAgents);
      console.log('App: About to call setAgents with:', loadedAgents);
      setAgents(loadedAgents);
      console.log('App: Called setAgents, agents should be updated');
    } catch (error) {
      console.error('App: Failed to load agents:', error);
    } finally {
      console.log('App: In finally block, setting loading to false');
      setLoading(false);
      console.log('App: Called setLoading(false)');
    }
  };

  const handleCreateAgent = () => {
    setEditingAgent(undefined);
    setShowEditor(true);
  };

  const handleEditAgent = (agent: SubAgent) => {
    setEditingAgent(agent);
    setShowEditor(true);
  };

  const handleSaveAgent = async (agent: SubAgent) => {
    try {
      await fileSystem.saveAgent(agent);
      
      // Update local state
      setAgents(prev => {
        const existingIndex = prev.findIndex(a => a.name === agent.name);
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
      setAgents(prev => prev.filter(a => a.name !== name));
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

  console.log('App render: loading =', loading, ', agents.length =', agents.length, ', filteredAgents.length =', filteredAgents.length);
  console.log('App render: typeof loading =', typeof loading, ', loading === true?', loading === true, ', loading === false?', loading === false);

  if (loading) {
    console.log('App render: RETURNING LOADING SCREEN because loading is truthy');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading agents...</span>
        </div>
      </div>
    );
  }

  console.log('App render: NOT showing loading screen, proceeding with main UI');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bot className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">
                Claude Code Agent Editor
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Filter size={14} />
                  All
                </button>
                <button
                  onClick={() => setViewMode('user')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'user' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User size={14} />
                  User
                </button>
                <button
                  onClick={() => setViewMode('project')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    viewMode === 'project' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Folder size={14} />
                  Project
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateAgent}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  New Agent
                </button>
                
                <button
                  onClick={() => setShowFileSearch(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FileText size={16} />
                  Import from File
                </button>
              </div>
              
              <button
                onClick={loadAgents}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No agents found' : 'No agents yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No agents match "${searchQuery}"`
                : 'Create your first Claude Code sub-agent to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateAgent}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Create Agent
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.name}
                  agent={agent}
                  onEdit={handleEditAgent}
                  onDelete={handleDeleteAgent}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {showEditor && (
        <AgentEditor
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={handleCancelEdit}
        />
      )}

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