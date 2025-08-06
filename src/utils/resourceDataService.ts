/**
 * Service for fetching resource data (agents, commands, hooks)
 * Provides unified interface for loading real resource data into 3-column layout
 * Now includes system detection and grouping capabilities
 */

import { SystemDetectionService } from './systemDetectionService';

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
  
  // System grouping properties
  systemId?: string;              // "ccplugins", "claude-flow", "builtin"
  systemName?: string;            // "CCPlugins", "Claude Flow", "Built-in"
  systemVersion?: string;         // System version when resource was created
  isSystemResource?: boolean;     // Part of a larger system
  isEditable?: boolean;          // Can user modify this resource
  
  // Change tracking properties
  originalResourceId?: string;    // Reference to original system resource
  isModified?: boolean;          // Has been customized from original
  modificationReason?: string;   // Why was this changed
  modificationDate?: Date;       // When was it modified
  resourceVersion?: number;      // Version of this specific resource
  originalContent?: string;      // Original system content for comparison
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

// Change tracking interface
export interface ResourceChange {
  id: string;
  timestamp: Date;
  author: string;
  reason: string;                // User-provided explanation
  changeType: 'create' | 'modify' | 'delete' | 'restore';
  beforeContent?: string;
  afterContent: string;
  projectPath: string;
  // TODO: Add additional change metadata fields
  // parentChangeId?: string;     // For tracking change chains
  // reviewStatus?: 'pending' | 'approved' | 'rejected';
  // impactScore?: number;        // Estimated impact of change
  // rollbackData?: any;          // Data needed for rollback
}

// System management interface
export interface ResourceSystem {
  id: string;
  name: string;
  description: string;
  version?: string;
  author?: string;
  enabled: boolean;
  resources: {
    original: ResourceItem[];    // Unmodified system resources
    modified: ResourceItem[];    // Project-customized variants
    counts: { 
      agents: number; 
      commands: number; 
      hooks: number; 
      claudeFiles: number;
      total: number;
    };
  };
  health: 'complete' | 'partial' | 'broken' | 'customized';
  modifications: {
    total: number;
    byProject: Map<string, number>;
  };
  isEditable: boolean;
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
        // Need to parse ~/.claude/settings.json directly to find user-defined hooks
        // This will enable full resource system detection for user-level customizations
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

      // Combine all resources for system detection
      const allResources = [
        ...userAgents,
        ...systemAgents,
        ...systemCommands,
        ...systemHooks,
        ...userHooks,
        ...claudeFiles
      ];

      // Apply system detection to all resources
      const resourcesWithSystemInfo = SystemDetectionService.analyzeResources(allResources);

      // Separate back into categories
      const processedAgents = resourcesWithSystemInfo.filter(r => r.type === 'agent');
      const processedCommands = resourcesWithSystemInfo.filter(r => r.type === 'command');
      const processedHooks = resourcesWithSystemInfo.filter(r => r.type === 'hook');
      const processedClaudeFiles = resourcesWithSystemInfo.filter(r => r.type === 'claude-file');

      return {
        agents: processedAgents,
        commands: processedCommands,
        hooks: processedHooks,
        claudeFiles: processedClaudeFiles
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

  /**
   * Get all detected resource systems
   */
  static async fetchResourceSystems(): Promise<ResourceSystem[]> {
    try {
      const allResourcesData = await this.fetchAllResources();
      const allResources = [
        ...allResourcesData.agents,
        ...allResourcesData.commands,
        ...allResourcesData.hooks,
        ...allResourcesData.claudeFiles
      ];

      return SystemDetectionService.createSystemSummaries(allResources);
    } catch (error) {
      console.error('Error fetching resource systems:', error);
      return [];
    }
  }

  /**
   * Fetch resources with system-aware sorting
   */
  static async fetchResourcesWithSystemSorting(type?: 'agents' | 'commands' | 'hooks' | 'claude-files'): Promise<ResourceItem[]> {
    try {
      let resources: ResourceItem[];
      
      if (type) {
        resources = await this.fetchResourcesByType(type);
      } else {
        const allResourcesData = await this.fetchAllResources();
        resources = [
          ...allResourcesData.agents,
          ...allResourcesData.commands,
          ...allResourcesData.hooks,
          ...allResourcesData.claudeFiles
        ];
      }

      return SystemDetectionService.sortResourcesWithSystemPriority(resources);
    } catch (error) {
      console.error('Error fetching resources with system sorting:', error);
      return [];
    }
  }

  /**
   * Get resources grouped by system
   */
  static async fetchResourcesBySystem(): Promise<Map<string, ResourceItem[]>> {
    try {
      const allResourcesData = await this.fetchAllResources();
      const allResources = [
        ...allResourcesData.agents,
        ...allResourcesData.commands,
        ...allResourcesData.hooks,
        ...allResourcesData.claudeFiles
      ];

      return SystemDetectionService.groupResourcesBySystem(allResources);
    } catch (error) {
      console.error('Error fetching resources by system:', error);
      return new Map();
    }
  }

  /**
   * Create a new resource modification with change tracking
   */
  static async createResourceModification(
    resourceId: string,
    projectPath: string,
    reason: string,
    content: string,
    originalContent?: string
  ): Promise<ResourceChange> {
    try {
      const change: ResourceChange = {
        id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        author: 'current-user', // TODO: Get from user context
        reason,
        changeType: 'modify',
        beforeContent: originalContent,
        afterContent: content,
        projectPath
      };

      // Store change in local storage for now (TODO: implement proper persistence)
      const changeKey = `resource_change_${resourceId}`;
      const existingChanges = JSON.parse(localStorage.getItem(changeKey) || '[]');
      existingChanges.push(change);
      localStorage.setItem(changeKey, JSON.stringify(existingChanges));

      // TODO: Send to backend API
      // await fetch(`${this.BASE_URL}/resources/${resourceId}/changes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(change)
      // });

      return change;
    } catch (error) {
      console.error('Error creating resource modification:', error);
      throw error;
    }
  }

  /**
   * Get the change history for a resource
   */
  static async getResourceHistory(resourceId: string): Promise<ResourceChange[]> {
    try {
      // Get from local storage for now (TODO: implement proper persistence)
      const changeKey = `resource_change_${resourceId}`;
      const changes = JSON.parse(localStorage.getItem(changeKey) || '[]');
      
      // Convert timestamp strings back to Date objects
      return changes.map((change: any) => ({
        ...change,
        timestamp: new Date(change.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching resource history:', error);
      return [];
    }
  }

  /**
   * Revert a resource modification
   */
  static async revertResourceModification(
    resourceId: string,
    changeId: string
  ): Promise<boolean> {
    try {
      const history = await this.getResourceHistory(resourceId);
      const changeToRevert = history.find(change => change.id === changeId);
      
      if (!changeToRevert || !changeToRevert.beforeContent) {
        throw new Error('Cannot revert: original content not available');
      }

      // Create a revert change entry
      const revertChange: ResourceChange = {
        id: `revert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        author: 'current-user',
        reason: `Reverted change: ${changeToRevert.reason}`,
        changeType: 'restore',
        beforeContent: changeToRevert.afterContent,
        afterContent: changeToRevert.beforeContent,
        projectPath: changeToRevert.projectPath
      };

      // Store revert change
      const changeKey = `resource_change_${resourceId}`;
      const existingChanges = JSON.parse(localStorage.getItem(changeKey) || '[]');
      existingChanges.push(revertChange);
      localStorage.setItem(changeKey, JSON.stringify(existingChanges));

      // TODO: Apply revert to actual resource file
      // TODO: Update resource in backend

      return true;
    } catch (error) {
      console.error('Error reverting resource modification:', error);
      return false;
    }
  }

  /**
   * Compare two versions of a resource
   */
  static async compareResourceVersions(
    resourceId: string,
    version1Content: string,
    version2Content: string
  ): Promise<{ added: string[]; removed: string[]; modified: string[] }> {
    try {
      // Simple line-by-line comparison (TODO: implement proper diff algorithm)
      const lines1 = version1Content.split('\n');
      const lines2 = version2Content.split('\n');
      
      const added: string[] = [];
      const removed: string[] = [];
      const modified: string[] = [];

      const maxLines = Math.max(lines1.length, lines2.length);
      
      for (let i = 0; i < maxLines; i++) {
        const line1 = lines1[i];
        const line2 = lines2[i];
        
        if (line1 === undefined && line2 !== undefined) {
          added.push(`${i + 1}: ${line2}`);
        } else if (line1 !== undefined && line2 === undefined) {
          removed.push(`${i + 1}: ${line1}`);
        } else if (line1 !== line2) {
          modified.push(`${i + 1}: "${line1}" → "${line2}"`);
        }
      }

      return { added, removed, modified };
    } catch (error) {
      console.error('Error comparing resource versions:', error);
      return { added: [], removed: [], modified: [] };
    }
  }

  /**
   * Enable a system and all its resources
   */
  static async enableSystem(
    systemId: string,
    projectPath?: string
  ): Promise<boolean> {
    try {
      const stateKey = projectPath 
        ? `system_state_${systemId}_${projectPath}` 
        : `system_state_${systemId}_global`;
      
      localStorage.setItem(stateKey, 'enabled');
      
      // TODO: [UX Spec] Show Toast notification when system is enabled/disabled
      //       Reference: docs/ux.md - Section 6 workflow shows Toast feedback for all actions
      //       Priority: High - User needs immediate confirmation of system state changes
      //       GitHub Issue: #78
      
      // TODO: Send to backend API
      // await fetch(`${this.BASE_URL}/systems/${systemId}/enable`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ projectPath })
      // });

      return true;
    } catch (error) {
      console.error('Error enabling system:', error);
      return false;
    }
  }

  /**
   * Disable a system and all its resources
   */
  static async disableSystem(
    systemId: string,
    projectPath?: string
  ): Promise<boolean> {
    try {
      const stateKey = projectPath 
        ? `system_state_${systemId}_${projectPath}` 
        : `system_state_${systemId}_global`;
      
      localStorage.setItem(stateKey, 'disabled');
      
      // TODO: Send to backend API
      // await fetch(`${this.BASE_URL}/systems/${systemId}/disable`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ projectPath })
      // });

      return true;
    } catch (error) {
      console.error('Error disabling system:', error);
      return false;
    }
  }

  /**
   * Get the current state of a system (enabled/disabled)
   */
  static async getSystemState(
    systemId: string,
    projectPath?: string
  ): Promise<boolean> {
    try {
      const stateKey = projectPath 
        ? `system_state_${systemId}_${projectPath}` 
        : `system_state_${systemId}_global`;
      
      const state = localStorage.getItem(stateKey);
      return state !== 'disabled'; // Default to enabled if not set
    } catch (error) {
      console.error('Error getting system state:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Update system resources to a new version
   */
  static async updateSystemResources(
    systemId: string,
    newVersion: string
  ): Promise<boolean> {
    try {
      // TODO: Implement system resource update logic
      return true;
    } catch (error) {
      console.error('Error updating system resources:', error);
      return false;
    }
  }

  /**
   * Detect outdated system resources
   */
  static async detectOutdatedSystemResources(): Promise<ResourceItem[]> {
    try {
      // TODO: Implement outdated resource detection
      return [];
    } catch (error) {
      console.error('Error detecting outdated resources:', error);
      return [];
    }
  }
}