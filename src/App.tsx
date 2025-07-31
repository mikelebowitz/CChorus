import React, { useState, useEffect } from 'react';
import { SubAgent, PRESET_COLORS } from './types';
import { AgentCard } from './components/AgentCard';
import { AgentEditor } from './components/AgentEditor';
import { AgentTabbedEditor } from './components/AgentTabbedEditor';
import { FileBrowser } from './components/FileBrowser';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ApiFileSystemService } from './utils/apiFileSystem';
import { parseAgentFile } from './utils/agentUtils';
import { Plus, Bot, RefreshCw, Search, Filter, User, Folder, FileText, Menu } from 'lucide-react';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

const fileSystem = new ApiFileSystemService();

function AppContent() {
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState<SubAgent | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [showFileSearch, setShowFileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'user' | 'project'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  // Get theme context
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  // Add keyboard shortcut for theme switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + T
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        
        // Toggle between light and dark themes
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const themeLabel = newTheme === 'light' ? 'Light' : 'Dark';
        
        setTheme(newTheme);
        
        // Show toast notification
        toast({
          title: "Theme Changed",
          description: `Switched to ${themeLabel} mode`,
          duration: 2000,
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [theme, setTheme]);



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
    // Clear form data to ensure empty state shows properly
    setFormData({
      name: '',
      description: '',
      tools: [],
      color: PRESET_COLORS[0],
      prompt: '',
      level: 'project'
    });
    setErrors({});
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
          <Button
            onClick={() => {
              handleCreateAgent();
              onClose?.();
            }}
            size="sm"
            className="flex-1"
          >
            <Plus size={16} />
            New Agent
          </Button>
          
          <Button
            onClick={() => {
              setShowFileSearch(true);
              onClose?.();
            }}
            variant="outline"
            size="sm"
          >
            <FileText size={16} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'all' | 'user' | 'project')} className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin" size={16} />
              <span className="ml-2 text-sm">Loading agents...</span>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <img 
                src="/cchorus-logo.png" 
                alt="CChorus" 
                className="mx-auto h-8 w-auto logo faded mb-3"
              />
              <p className="text-sm text-muted-foreground">
                {searchQuery 
                  ? `No agents match "${searchQuery}"` 
                  : viewMode === 'project' 
                    ? 'No project agents found'
                    : 'No agents yet'
                }
              </p>
              {!searchQuery && (
                viewMode === 'project' ? (
                  <Button
                    onClick={() => {
                      setShowFileSearch(true);
                      onClose?.();
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Folder size={14} />
                    Select Project Folder
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleCreateAgent();
                      onClose?.();
                    }}
                    size="sm"
                    className="mt-3"
                  >
                    <Plus size={14} />
                    Create Agent
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgents.map((agent) => (
                <Card
                  key={`${agent.name}-${agent.level}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    editingAgent?.name === agent.name && editingAgent?.level === agent.level
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => {
                    handleEditAgent(agent);
                    onClose?.();
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: agent.color || '#3B82F6' }}
                          />
                          <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className="text-xs bg-muted text-muted-foreground">
                            {agent.level}
                          </Badge>
                          {agent.tools && agent.tools.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {agent.tools.length} tools
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⋮
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Statistics - Directly below agent list */}
        <div className="p-4 border-t border-border bg-muted/50">
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
            <div className="text-xs text-muted-foreground/60 text-center mt-2">
              Showing results for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-foreground">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading agents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-4">
          <div className="flex lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <Menu size={20} />
            </button>
          </div>
          
          <div className="flex flex-1 items-center gap-3 lg:ml-0 ml-4">
            <img 
              src="/cchorus-logo.png" 
              alt="CChorus" 
              className="h-10 w-auto logo"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <button
              onClick={loadAgents}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              title="Reload agents from file system"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-background flex flex-col">
              <div className="flex items-center justify-between p-4">
                <h2 className="font-semibold">Agents</h2>
                <Button
                  onClick={() => setSidebarOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  ×
                </Button>
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
          <div className="w-80 bg-background flex-col flex">
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
            <div className="h-full w-full flex items-center justify-center bg-background">
              <div className="text-center max-w-md px-6">
                <img 
                  src="/cchorus-logo.png" 
                  alt="CChorus" 
                  className="mx-auto h-16 w-auto logo faded mb-4"
                />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Select an agent to edit
                </h3>
                <p className="text-muted-foreground/60 mb-4">
                  Choose an agent from the sidebar or create a new one to get started
                </p>
                <Button
                  onClick={handleCreateAgent}
                  variant="default"
                >
                  <Plus size={16} />
                  Create New Agent
                </Button>
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
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cchorus-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;