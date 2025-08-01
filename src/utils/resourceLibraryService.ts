import { ClaudeProject, SlashCommand, ClaudeSettings, SubAgent } from '../types';

const API_BASE = 'http://localhost:3001/api';

/**
 * Unified resource data structure for the library system
 */
export interface ResourceItem {
  id: string;
  type: 'agent' | 'command' | 'hook' | 'project' | 'settings';
  name: string;
  description: string;
  scope: 'user' | 'project' | 'builtin' | 'system';
  projectPath?: string;
  projectName?: string;
  filePath?: string;
  lastModified: Date | string;
  isActive: boolean;
  metadata: any; // Original resource data
}

/**
 * Resource assignment operation
 */
export interface ResourceAssignment {
  resourceId: string;
  resourceType: 'agent' | 'command' | 'hook' | 'settings';
  targetScope: 'user' | 'project';
  targetProjectPath?: string;
  operation: 'copy' | 'move' | 'activate' | 'deactivate';
}

/**
 * Assignment result
 */
export interface AssignmentResult {
  success: boolean;
  resourceId: string;
  operation: string;
  targetScope: string;
  targetPath?: string;
  error?: string;
}

/**
 * Service class for managing Claude Code resource library operations
 */
export class ResourceLibraryService {
  
  /**
   * Loads all Claude Code resources from the system
   */
  async loadAllResources(): Promise<ResourceItem[]> {
    try {
      const [projects, agents, commands, hooks, settings] = await Promise.all([
        this.loadProjects(),
        this.loadAgents(),
        this.loadCommands(),
        this.loadHooks(),
        this.loadSettings()
      ]);
      
      const allResources = [
        ...projects,
        ...agents,
        ...commands,
        ...hooks,
        ...settings
      ];
      
      // Deduplicate by ID to prevent duplicate key warnings
      const deduplicatedResources = new Map<string, ResourceItem>();
      for (const resource of allResources) {
        deduplicatedResources.set(resource.id, resource);
      }
      
      return Array.from(deduplicatedResources.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Failed to load all resources:', error);
      return [];
    }
  }
  
  /**
   * Loads all Claude Code projects
   */
  async loadProjects(): Promise<ResourceItem[]> {
    try {
      const response = await fetch(`${API_BASE}/projects/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const projects: ClaudeProject[] = await response.json();
      
      return projects.map(project => ({
        id: `project:${project.path}`,
        type: 'project' as const,
        name: project.name,
        description: project.description,
        scope: 'system' as const,
        projectPath: project.path,
        projectName: project.name,
        filePath: project.claudeMdPath,
        lastModified: project.lastModified,
        isActive: true, // Projects are always "active"
        metadata: project
      }));
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }
  
  /**
   * Loads all agents from system-wide discovery
   */
  async loadAgents(): Promise<ResourceItem[]> {
    try {
      const response = await fetch(`${API_BASE}/agents/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const agents: SubAgent[] = await response.json();
      
      return agents.map(agent => ({
        id: `agent:${agent.name}:${agent.level}:${agent.projectPath || 'user'}`,
        type: 'agent' as const,
        name: agent.name,
        description: agent.description,
        scope: agent.level as 'user' | 'project',
        projectPath: agent.projectPath,
        projectName: agent.projectName,
        filePath: agent.filePath,
        lastModified: new Date(), // Agents don't currently have lastModified
        isActive: true,
        metadata: agent
      }));
    } catch (error) {
      console.error('Failed to load agents:', error);
      return [];
    }
  }
  
  /**
   * Loads all slash commands
   */
  async loadCommands(): Promise<ResourceItem[]> {
    try {
      const response = await fetch(`${API_BASE}/commands/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const commands: SlashCommand[] = data.commands || [];
      
      return commands.map(command => ({
        id: `command:${command.id}`,
        type: 'command' as const,
        name: command.name,
        description: command.description || 'Custom slash command',
        scope: command.scope as 'user' | 'project' | 'builtin',
        projectPath: command.projectPath,
        projectName: command.projectName,
        filePath: command.path,
        lastModified: command.lastModified || new Date(),
        isActive: true,
        metadata: command
      }));
    } catch (error) {
      console.error('Failed to load commands:', error);
      return [];
    }
  }
  
  /**
   * Loads all hooks from settings files
   */
  async loadHooks(): Promise<ResourceItem[]> {
    try {
      const response = await fetch(`${API_BASE}/hooks/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const hooks = data.hooks || [];
      
      return hooks.map((hook: any) => ({
        id: `hook:${hook.id}`,
        type: 'hook' as const,
        name: `${hook.eventType}:${hook.matcher}`,
        description: `${hook.eventType} hook for ${hook.matcher}`,
        scope: hook.sourceType as 'user' | 'project',
        projectPath: hook.projectPath,
        projectName: hook.projectName,
        filePath: hook.sourceFile,
        lastModified: hook.lastModified || new Date(),
        isActive: hook.enabled,
        metadata: hook
      }));
    } catch (error) {
      console.error('Failed to load hooks:', error);
      return [];
    }
  }
  
  /**
   * Loads settings profiles
   */
  async loadSettings(): Promise<ResourceItem[]> {
    try {
      // Get all projects first to scan their settings
      const projects = await this.loadProjects();
      const settingsItems: ResourceItem[] = [];
      
      // Add user settings
      try {
        const userResponse = await fetch(`${API_BASE}/settings/effective`);
        if (userResponse.ok) {
          const userSettings = await userResponse.json();
          
          settingsItems.push({
            id: 'settings:user',
            type: 'settings' as const,
            name: 'User Settings',
            description: 'Global user-level Claude Code settings',
            scope: 'user' as const,
            filePath: userSettings.sources?.user?.path,
            lastModified: userSettings.sources?.user?.lastModified || new Date(),
            isActive: userSettings.sources?.user?.exists,
            metadata: userSettings.sources?.user
          });
        }
      } catch (error) {
        console.warn('Could not load user settings:', error);
      }
      
      // Add project settings
      for (const project of projects) {
        try {
          const projectResponse = await fetch(`${API_BASE}/settings/effective?projectPath=${encodeURIComponent(project.projectPath!)}`);
          if (projectResponse.ok) {
            const projectSettings = await projectResponse.json();
            
            if (projectSettings.sources?.project?.exists) {
              settingsItems.push({
                id: `settings:project:${project.projectPath}`,
                type: 'settings' as const,
                name: `${project.name} Settings`,
                description: `Project-level settings for ${project.name}`,
                scope: 'project' as const,
                projectPath: project.projectPath,
                projectName: project.name,
                filePath: projectSettings.sources.project.path,
                lastModified: projectSettings.sources.project.lastModified || new Date(),
                isActive: true,
                metadata: projectSettings.sources.project
              });
            }
            
            if (projectSettings.sources?.local?.exists) {
              settingsItems.push({
                id: `settings:local:${project.projectPath}`,
                type: 'settings' as const,
                name: `${project.name} Local Settings`,
                description: `Local settings for ${project.name}`,
                scope: 'project' as const,
                projectPath: project.projectPath,
                projectName: project.name,
                filePath: projectSettings.sources.local.path,
                lastModified: projectSettings.sources.local.lastModified || new Date(),
                isActive: true,
                metadata: projectSettings.sources.local
              });
            }
          }
        } catch (error) {
          console.warn(`Could not load settings for project ${project.name}:`, error);
        }
      }
      
      return settingsItems;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return [];
    }
  }
  
  /**
   * Filters resources by type, scope, or search query
   */
  filterResources(
    resources: ResourceItem[], 
    filters: {
      type?: string;
      scope?: string;
      search?: string;
      projectPath?: string;
      isActive?: boolean;
    }
  ): ResourceItem[] {
    let filtered = resources;
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    
    if (filters.scope && filters.scope !== 'all') {
      filtered = filtered.filter(r => r.scope === filters.scope);
    }
    
    if (filters.projectPath) {
      filtered = filtered.filter(r => r.projectPath === filters.projectPath);
    }
    
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(r => r.isActive === filters.isActive);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search) ||
        (r.projectName && r.projectName.toLowerCase().includes(search))
      );
    }
    
    return filtered;
  }
  
  /**
   * Assigns a resource to a target scope (copy/move operation)
   */
  async assignResource(assignment: ResourceAssignment): Promise<AssignmentResult> {
    try {
      const { resourceId, resourceType, targetScope, targetProjectPath, operation } = assignment;
      
      if (resourceType === 'agent') {
        return await this.assignAgent(resourceId, targetScope, targetProjectPath, operation);
      } else if (resourceType === 'command') {
        return await this.assignCommand(resourceId, targetScope, targetProjectPath, operation);
      } else if (resourceType === 'hook') {
        return await this.assignHook(resourceId, targetScope, targetProjectPath, operation);
      } else if (resourceType === 'settings') {
        return await this.assignSettings(resourceId, targetScope, targetProjectPath, operation);
      }
      
      throw new Error(`Unsupported resource type: ${resourceType}`);
    } catch (error) {
      return {
        success: false,
        resourceId: assignment.resourceId,
        operation: assignment.operation,
        targetScope: assignment.targetScope,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Assigns an agent to a target scope
   */
  private async assignAgent(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
    try {
      // Parse the resource ID to get agent info
      const parts = resourceId.split(':');
      if (parts.length < 3) {
        throw new Error('Invalid agent resource ID format');
      }
      
      const agentName = parts[1];
      const currentScope = parts[2] as 'user' | 'project';
      const currentProjectPath = parts[3] !== 'user' ? parts[3] : undefined;
      
      // Get the agent data
      const response = await fetch(`${API_BASE}/agents/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const agents: SubAgent[] = await response.json();
      const agent = agents.find(a => 
        a.name === agentName && 
        a.level === currentScope && 
        a.projectPath === currentProjectPath
      );
      
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }
      
      // Create the assignment request
      const assignmentPayload = {
        name: agent.name,
        description: agent.description,
        tools: agent.tools || [],
        color: agent.color,
        prompt: agent.prompt,
        level: targetScope,
        operation,
        sourcePath: agent.filePath,
        targetProjectPath
      };
      
      // Call the backend assignment API
      const assignResponse = await fetch(`${API_BASE}/agents/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentPayload),
      });
      
      if (!assignResponse.ok) {
        const errorData = await assignResponse.text();
        throw new Error(`Assignment failed: ${errorData}`);
      }
      
      const result = await assignResponse.json();
      
      return {
        success: true,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath
      };
    } catch (error) {
      return {
        success: false,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Assigns a command to a target scope
   */
  private async assignCommand(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
    try {
      // Parse the resource ID to get command info
      const parts = resourceId.split(':');
      if (parts.length < 2) {
        throw new Error('Invalid command resource ID format');
      }
      
      const commandId = parts[1];
      
      // Get all commands to find the specific one
      const response = await fetch(`${API_BASE}/commands/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const commands: SlashCommand[] = data.commands || [];
      const command = commands.find(c => c.id === commandId);
      
      if (!command) {
        throw new Error(`Command ${commandId} not found`);
      }
      
      // Create the assignment payload
      const assignmentPayload = {
        id: command.id,
        name: command.name,
        description: command.description,
        command: command.command,
        scope: targetScope,
        operation,
        sourcePath: command.path,
        targetProjectPath
      };
      
      // Call the backend assignment API
      const assignResponse = await fetch(`${API_BASE}/commands/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentPayload),
      });
      
      if (!assignResponse.ok) {
        const errorData = await assignResponse.text();
        throw new Error(`Command assignment failed: ${errorData}`);
      }
      
      return {
        success: true,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath
      };
    } catch (error) {
      return {
        success: false,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Assigns a hook to a target scope
   */
  private async assignHook(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
    try {
      // Parse the resource ID to get hook info
      const parts = resourceId.split(':');
      if (parts.length < 2) {
        throw new Error('Invalid hook resource ID format');
      }
      
      const hookId = parts[1];
      
      // Get all hooks to find the specific one
      const response = await fetch(`${API_BASE}/hooks/system`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const hooks = data.hooks || [];
      const hook = hooks.find((h: any) => h.id === hookId);
      
      if (!hook) {
        throw new Error(`Hook ${hookId} not found`);
      }
      
      // Create the assignment payload
      const assignmentPayload = {
        eventType: hook.eventType,
        matcher: hook.matcher,
        command: hook.command,
        enabled: hook.enabled,
        targetScope,
        operation,
        targetProjectPath
      };
      
      // Call the backend assignment API
      const assignResponse = await fetch(`${API_BASE}/hooks/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentPayload),
      });
      
      if (!assignResponse.ok) {
        const errorData = await assignResponse.text();
        throw new Error(`Hook assignment failed: ${errorData}`);
      }
      
      return {
        success: true,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath
      };
    } catch (error) {
      return {
        success: false,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Assigns settings to a target scope
   */
  private async assignSettings(resourceId: string, targetScope: string, targetProjectPath?: string, operation: string = 'copy'): Promise<AssignmentResult> {
    try {
      // Parse the resource ID to get settings info
      const parts = resourceId.split(':');
      if (parts.length < 2) {
        throw new Error('Invalid settings resource ID format');
      }
      
      const settingsType = parts[1]; // 'user', 'project', or 'local'
      const projectPath = parts[2]; // project path if applicable
      
      // Get the source settings
      let sourceUrl = `${API_BASE}/settings/effective`;
      if (settingsType === 'project' || settingsType === 'local') {
        sourceUrl += `?projectPath=${encodeURIComponent(projectPath)}`;
      }
      
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const settingsData = await response.json();
      const sourceSettings = settingsData.sources?.[settingsType];
      
      if (!sourceSettings || !sourceSettings.exists) {
        throw new Error(`Source settings ${settingsType} not found`);
      }
      
      // Create the assignment payload
      const assignmentPayload = {
        sourceType: settingsType,
        sourceProjectPath: projectPath,
        targetScope,
        targetProjectPath,
        operation,
        settings: sourceSettings.settings || {}
      };
      
      // Call the backend assignment API
      const assignResponse = await fetch(`${API_BASE}/settings/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentPayload),
      });
      
      if (!assignResponse.ok) {
        const errorData = await assignResponse.text();
        throw new Error(`Settings assignment failed: ${errorData}`);
      }
      
      return {
        success: true,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath
      };
    } catch (error) {
      return {
        success: false,
        resourceId,
        operation,
        targetScope,
        targetPath: targetProjectPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Gets deployment status for all resources
   */
  async getDeploymentStatus(): Promise<{ [resourceId: string]: { scope: string; isActive: boolean; projectPath?: string }[] }> {
    // This would return where each resource is currently deployed/active
    const resources = await this.loadAllResources();
    const status: { [resourceId: string]: { scope: string; isActive: boolean; projectPath?: string }[] } = {};
    
    for (const resource of resources) {
      status[resource.id] = [{
        scope: resource.scope,
        isActive: resource.isActive,
        projectPath: resource.projectPath
      }];
    }
    
    return status;
  }
  
  /**
   * Gets available target scopes for resource assignment
   */
  async getAvailableTargets(): Promise<{ scope: string; name: string; path?: string }[]> {
    const projects = await this.loadProjects();
    
    return [
      { scope: 'user', name: 'User Level (Global)' },
      ...projects.map(p => ({
        scope: 'project',
        name: p.metadata.name,
        path: p.metadata.path
      }))
    ];
  }
}