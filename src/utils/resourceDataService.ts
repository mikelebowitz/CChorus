/**
 * Service for fetching resource data (agents, commands, hooks)
 * Provides unified interface for loading real resource data into 3-column layout
 */

export interface ResourceItem {
  id: string;
  name: string;
  type: 'agent' | 'command' | 'hook' | 'claude-file';
  scope: 'user' | 'system' | 'project';
  filePath?: string;
  projectPath?: string;
  description?: string;
  lastModified?: Date | string;
  enabled?: boolean;
}

export interface AgentResource extends ResourceItem {
  type: 'agent';
  content?: string;
  tools?: string[];
  color?: string;
}

export interface CommandResource extends ResourceItem {
  type: 'command';
  isBuiltIn?: boolean;
  usage?: string;
}

export interface HookResource extends ResourceItem {
  type: 'hook';
  hookType?: string;
  configuration?: any;
}

export class ResourceDataService {
  private static readonly BASE_URL = 'http://localhost:3001/api';

  /**
   * Fetch system-wide agents
   */
  static async fetchAgents(scope: 'user' | 'system' = 'system'): Promise<AgentResource[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/agents/${scope}`);
      if (!response.ok) throw new Error(`Failed to fetch ${scope} agents`);
      
      const data = await response.json();
      return data.map((agent: any): AgentResource => ({
        id: `agent-${scope}-${agent.name || agent.filePath}`,
        name: agent.name,
        type: 'agent',
        scope: agent.projectPath ? 'project' : scope,
        filePath: agent.filePath,
        projectPath: agent.projectPath,
        description: agent.description || 'Agent description',
        lastModified: agent.lastModified || new Date(),
        content: agent.content,
        tools: agent.tools,
        color: agent.color
      }));
    } catch (error) {
      console.error(`Error fetching ${scope} agents:`, error);
      return [];
    }
  }

  /**
   * Fetch system-wide commands
   */
  static async fetchCommands(scope: 'system' | 'user' = 'system'): Promise<CommandResource[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/commands/${scope}`);
      if (!response.ok) throw new Error(`Failed to fetch ${scope} commands`);
      
      const data = await response.json();
      const commands = data.commands || []; // Extract commands array from response
      
      return commands.map((command: any): CommandResource => ({
        id: `command-${scope}-${command.id || command.name}`,
        name: command.name || command.fullName,
        type: 'command',
        scope: command.scope === 'builtin' ? 'system' : command.scope,
        filePath: command.path,
        description: command.description || 'Command description',
        lastModified: command.lastModified || new Date(),
        isBuiltIn: command.scope === 'builtin',
        usage: command.description
      }));
    } catch (error) {
      console.error(`Error fetching ${scope} commands:`, error);
      return [];
    }
  }

  /**
   * Fetch system-wide hooks
   */
  static async fetchHooks(scope: 'system' | 'settings' = 'system'): Promise<HookResource[]> {
    try {
      // For settings hooks, we need to fetch user-level hooks differently
      if (scope === 'settings') {
        // Instead of calling the problematic settings endpoint, return empty array for now
        // TODO: Implement proper user settings hooks discovery
        return [];
      }
      
      const response = await fetch(`${this.BASE_URL}/hooks/${scope}`);
      if (!response.ok) throw new Error(`Failed to fetch ${scope} hooks`);
      
      const data = await response.json();
      const hooks = data.hooks || []; // Extract hooks array from response
      
      return hooks.map((hook: any): HookResource => ({
        id: `hook-${scope}-${hook.id || hook.eventType}-${hook.matcher || 'default'}`,
        name: `${hook.eventType} (${hook.sourceType})`,
        type: 'hook',
        scope: hook.sourceType === 'user' ? 'user' : 'system',
        filePath: hook.sourceFile,
        description: `${hook.eventType} hook from ${hook.sourceFile}`,
        lastModified: hook.lastModified || new Date(),
        enabled: hook.enabled !== false,
        hookType: hook.eventType,
        configuration: hook.hooks
      }));
    } catch (error) {
      console.error(`Error fetching ${scope} hooks:`, error);
      return [];
    }
  }

  /**
   * Fetch CLAUDE.md files from projects
   */
  static async fetchClaudeFiles(): Promise<ResourceItem[]> {
    try {
      // Use the projects API to get all projects, then extract their CLAUDE.md info
      const response = await fetch(`${this.BASE_URL}/projects/system`);
      if (!response.ok) throw new Error('Failed to fetch projects for CLAUDE.md files');
      
      const projects = await response.json();
      return projects
        .filter((project: any) => project.claudeMdPath) // Only projects with CLAUDE.md
        .map((project: any): ResourceItem => ({
          id: `claude-${project.path}`,
          name: `${project.name}/CLAUDE.md`,
          type: 'claude-file' as any,
          scope: 'project' as any,
          filePath: `${project.path}/CLAUDE.md`,
          description: project.description || 'Project configuration file',
          lastModified: project.lastModified || new Date()
        }));
    } catch (error) {
      console.error('Error fetching CLAUDE.md files:', error);
      return [];
    }
  }

  /**
   * Fetch all resources at once for efficiency
   */
  static async fetchAllResources(): Promise<{
    agents: ResourceItem[];
    commands: ResourceItem[];
    hooks: ResourceItem[];
    claudeFiles: ResourceItem[];
  }> {
    try {
      // Make all API calls concurrently for better performance
      const [
        userAgents,
        systemAgents,
        systemCommands,
        systemHooks,
        userHooks,
        claudeFiles
      ] = await Promise.all([
        this.fetchAgents('user'),
        this.fetchAgents('system'),
        this.fetchCommands('system'),
        this.fetchHooks('system'),
        this.fetchHooks('settings'),
        this.fetchClaudeFiles()
      ]);

      return {
        agents: [...userAgents, ...systemAgents],
        commands: systemCommands,
        hooks: [...systemHooks, ...userHooks],
        claudeFiles
      };
    } catch (error) {
      console.error('Error fetching all resources:', error);
      return {
        agents: [],
        commands: [],
        hooks: [],
        claudeFiles: []
      };
    }
  }

  /**
   * Fetch all resources for a specific category
   */
  static async fetchResourcesByType(type: 'agents' | 'commands' | 'hooks' | 'claude-files'): Promise<ResourceItem[]> {
    switch (type) {
      case 'agents':
        const [userAgents, systemAgents] = await Promise.all([
          this.fetchAgents('user'),
          this.fetchAgents('system')
        ]);
        return [...userAgents, ...systemAgents];
        
      case 'commands':
        const [systemCommands] = await Promise.all([
          this.fetchCommands('system')
        ]);
        return systemCommands;
        
      case 'hooks':
        const [systemHooks, userHooks] = await Promise.all([
          this.fetchHooks('system'),
          this.fetchHooks('settings')
        ]);
        return [...systemHooks, ...userHooks];

      case 'claude-files':
        return await this.fetchClaudeFiles();
        
      default:
        return [];
    }
  }

  /**
   * Fetch user-level vs project-level resources for Users section
   */
  static async fetchUserResources(): Promise<{
    userLevel: ResourceItem[];
    projectLevel: ResourceItem[];
  }> {
    try {
      const [userAgents, userHooks] = await Promise.all([
        this.fetchAgents('user'),
        this.fetchHooks('settings')
      ]);

      const userLevel = [...userAgents, ...userHooks];
      
      // For now, project-level resources are empty - this would be populated
      // with project-specific agents, commands, hooks when a project is selected
      const projectLevel: ResourceItem[] = [];

      return { userLevel, projectLevel };
    } catch (error) {
      console.error('Error fetching user resources:', error);
      return { userLevel: [], projectLevel: [] };
    }
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }
}