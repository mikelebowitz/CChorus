import React, { useState, useEffect } from 'react';
import { SubAgent } from './types';
import { AgentCard } from './components/AgentCard';
import { AgentEditor } from './components/AgentEditor';
import { FileSystemService } from './utils/fileSystem';
import { Plus, Bot, RefreshCw, Search } from 'lucide-react';

const fileSystem = new FileSystemService();

function App() {
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<SubAgent | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

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
    
    try {
      await fileSystem.deleteAgent(name);
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

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              
              <button
                onClick={handleCreateAgent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                New Agent
              </button>
              
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
    </div>
  );
}

export default App;