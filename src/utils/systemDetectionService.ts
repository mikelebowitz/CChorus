/**
 * Service for detecting and managing resource systems like CCPlugins, Claude Flow, etc.
 * Identifies when resources belong to larger coordinated systems.
 */

import { ResourceItem, ResourceSystem } from './resourceDataService';

export class SystemDetectionService {
  
  /**
   * Analyze resources and detect which belong to known systems
   */
  static analyzeResources(resources: ResourceItem[]): ResourceItem[] {
    return resources.map(resource => {
      const systemInfo = this.detectSystemMembership(resource);
      
      return {
        ...resource,
        ...systemInfo,
        isEditable: this.isResourceEditable(resource, systemInfo),
        resourceVersion: 1 // Default version for new resources
      };
    });
  }

  /**
   * Detect if a resource belongs to a known system
   */
  private static detectSystemMembership(resource: ResourceItem): Partial<ResourceItem> {
    // CCPlugins detection
    const ccPluginsInfo = this.detectCCPlugins(resource);
    if (ccPluginsInfo.systemId) return ccPluginsInfo;

    // Claude Flow detection  
    const claudeFlowInfo = this.detectClaudeFlow(resource);
    if (claudeFlowInfo.systemId) return claudeFlowInfo;

    // Built-in Claude Code detection
    const builtInInfo = this.detectBuiltIn(resource);
    if (builtInInfo.systemId) return builtInInfo;

    // Custom system detection (directory-based)
    const customSystemInfo = this.detectCustomSystem(resource);
    if (customSystemInfo.systemId) return customSystemInfo;

    // No system detected
    return {
      isSystemResource: false,
      isEditable: true
    };
  }

  /**
   * Detect CCPlugins resources
   */
  private static detectCCPlugins(resource: ResourceItem): Partial<ResourceItem> {
    const ccPluginsPatterns = {
      commands: [
        '/review', '/commit', '/security-scan', '/docs', '/test', '/format',
        '/scaffold', '/undo', '/refactor', '/implement', '/session-start', 
        '/session-end', '/todos-to-issues', '/create-todos', '/cleanproject'
      ],
      agents: [
        'code-reviewer', 'security-scanner', 'test-generator', 'documentation-writer'
      ],
      hooks: [
        'pre-commit', 'post-commit', 'session-start', 'session-end'
      ],
      pathPatterns: [
        /ccplugins/i,
        /\.claude\/ccplugins/,
        /ccplugins.*commands/,
        /ccplugins.*agents/
      ]
    };

    // Check command names
    if (resource.type === 'command' && ccPluginsPatterns.commands.includes(resource.name)) {
      return {
        systemId: 'ccplugins',
        systemName: 'CCPlugins',
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check agent names
    if (resource.type === 'agent' && ccPluginsPatterns.agents.includes(resource.name)) {
      return {
        systemId: 'ccplugins',
        systemName: 'CCPlugins', 
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check file paths
    if (resource.filePath && ccPluginsPatterns.pathPatterns.some(pattern => pattern.test(resource.filePath!))) {
      return {
        systemId: 'ccplugins',
        systemName: 'CCPlugins',
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check descriptions for CCPlugins markers
    if (resource.description && /ccplugins|professional command|enterprise-grade/i.test(resource.description)) {
      return {
        systemId: 'ccplugins',
        systemName: 'CCPlugins',
        isSystemResource: true
      };
    }

    return {};
  }

  /**
   * Detect Claude Flow resources
   */
  private static detectClaudeFlow(resource: ResourceItem): Partial<ResourceItem> {
    const claudeFlowPatterns = {
      commands: [
        'swarm', 'hive-mind', 'orchestrate', 'workflow'
      ],
      agents: [
        'queen-agent', 'worker-agent', 'coordinator', 'swarm-intelligence'
      ],
      pathPatterns: [
        /claude-flow/i,
        /\.claude\/flow/,
        /swarm.*agents/,
        /hive.*mind/
      ],
      descriptionPatterns: [
        /swarm intelligence/i,
        /hive.?mind/i,
        /orchestration/i,
        /claude.?flow/i
      ]
    };

    // Check command names
    if (resource.type === 'command' && claudeFlowPatterns.commands.some(cmd => resource.name.includes(cmd))) {
      return {
        systemId: 'claude-flow',
        systemName: 'Claude Flow',
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check agent names
    if (resource.type === 'agent' && claudeFlowPatterns.agents.some(agent => resource.name.includes(agent))) {
      return {
        systemId: 'claude-flow',
        systemName: 'Claude Flow',
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check file paths
    if (resource.filePath && claudeFlowPatterns.pathPatterns.some(pattern => pattern.test(resource.filePath!))) {
      return {
        systemId: 'claude-flow',
        systemName: 'Claude Flow',
        systemVersion: this.extractVersionFromPath(resource.filePath),
        isSystemResource: true
      };
    }

    // Check descriptions
    if (resource.description && claudeFlowPatterns.descriptionPatterns.some(pattern => pattern.test(resource.description!))) {
      return {
        systemId: 'claude-flow',
        systemName: 'Claude Flow',
        isSystemResource: true
      };
    }

    return {};
  }

  /**
   * Detect built-in Claude Code resources
   */
  private static detectBuiltIn(resource: ResourceItem): Partial<ResourceItem> {
    const builtInPatterns = {
      commands: [
        'help', 'version', 'config', 'init', 'login', 'logout'
      ],
      scopes: ['system'],
      pathPatterns: [
        /node_modules.*claude/i,
        /\.claude.*builtin/,
        /system.*commands/
      ]
    };

    // Check if it's a built-in command
    if (resource.type === 'command' && 
        (resource as any).isBuiltIn === true ||
        builtInPatterns.commands.includes(resource.name)) {
      return {
        systemId: 'builtin',
        systemName: 'Built-in',
        systemVersion: 'system',
        isSystemResource: true
      };
    }

    // Check scope
    if (resource.scope === 'system' && resource.type === 'command') {
      return {
        systemId: 'builtin',
        systemName: 'Built-in',
        isSystemResource: true
      };
    }

    return {};
  }

  /**
   * Detect custom systems based on directory structure
   */
  private static detectCustomSystem(resource: ResourceItem): Partial<ResourceItem> {
    if (!resource.filePath) return {};

    // Look for grouped resources in same directory
    const pathParts = resource.filePath.split('/');
    const parentDir = pathParts[pathParts.length - 2]; // Parent directory name

    // Skip common directories
    const commonDirs = ['agents', 'commands', 'hooks', '.claude', 'src', 'bin'];
    if (!parentDir || commonDirs.includes(parentDir)) return {};

    // Check if parent directory looks like a system name
    const systemNamePattern = /^[a-z][a-z0-9-_]*$/i;
    if (systemNamePattern.test(parentDir)) {
      return {
        systemId: parentDir.toLowerCase(),
        systemName: this.formatSystemName(parentDir),
        isSystemResource: true
      };
    }

    return {};
  }

  /**
   * Determine if a resource is editable by the user
   */
  private static isResourceEditable(resource: ResourceItem, systemInfo: Partial<ResourceItem>): boolean {
    // Built-in resources are never editable
    if (systemInfo.systemId === 'builtin') return false;
    
    // System resources installed in user directories are editable
    if (systemInfo.isSystemResource && resource.scope === 'user') return true;
    
    // System resources installed in project directories are editable
    if (systemInfo.isSystemResource && resource.scope === 'project') return true;
    
    // System resources at system level are not editable
    if (systemInfo.isSystemResource && resource.scope === 'system') return false;
    
    // User resources are always editable
    return true;
  }

  /**
   * Extract version from file path if available
   */
  private static extractVersionFromPath(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    
    const versionPattern = /v?(\d+\.\d+(?:\.\d+)?)/;
    const match = filePath.match(versionPattern);
    return match ? match[1] : undefined;
  }

  /**
   * Format system name for display
   */
  private static formatSystemName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Group resources by their detected systems
   */
  static groupResourcesBySystem(resources: ResourceItem[]): Map<string, ResourceItem[]> {
    const systemGroups = new Map<string, ResourceItem[]>();
    
    resources.forEach(resource => {
      const systemId = resource.systemId || 'user';
      
      if (!systemGroups.has(systemId)) {
        systemGroups.set(systemId, []);
      }
      
      systemGroups.get(systemId)!.push(resource);
    });
    
    return systemGroups;
  }

  /**
   * Create system summary objects
   */
  static createSystemSummaries(resources: ResourceItem[]): ResourceSystem[] {
    const systemGroups = this.groupResourcesBySystem(resources);
    const systems: ResourceSystem[] = [];

    systemGroups.forEach((systemResources, systemId) => {
      if (systemId === 'user') return; // Skip ungrouped user resources

      const firstResource = systemResources[0];
      const originalResources = systemResources.filter(r => !r.isModified);
      const modifiedResources = systemResources.filter(r => r.isModified);

      const counts = {
        agents: systemResources.filter(r => r.type === 'agent').length,
        commands: systemResources.filter(r => r.type === 'command').length,
        hooks: systemResources.filter(r => r.type === 'hook').length,
        claudeFiles: systemResources.filter(r => r.type === 'claude-file').length,
        total: systemResources.length
      };

      // Determine system health
      let health: ResourceSystem['health'] = 'complete';
      if (modifiedResources.length > 0) health = 'customized';
      if (systemResources.some(r => !r.enabled)) health = 'partial';

      const system: ResourceSystem = {
        id: systemId,
        name: firstResource.systemName || this.formatSystemName(systemId),
        description: this.getSystemDescription(systemId),
        version: firstResource.systemVersion,
        enabled: systemResources.every(r => r.enabled !== false),
        resources: {
          original: originalResources,
          modified: modifiedResources,
          counts
        },
        health,
        modifications: {
          total: modifiedResources.length,
          // TODO: Implement project-based modification counting
          // Track which projects have modified resources from this system
          // This will enable cross-project change analysis and rollback capabilities
          // Also add modification impact analysis and conflict detection
          // Enable bulk rollback of modifications across projects
          byProject: new Map()
        },
        isEditable: systemResources.some(r => r.isEditable)
      };

      systems.push(system);
    });

    return systems;
  }

  /**
   * Get system description based on system ID
   */
  private static getSystemDescription(systemId: string): string {
    const descriptions: Record<string, string> = {
      'ccplugins': '24 professional commands that make Claude behave like a practical person',
      'claude-flow': 'AI-powered development orchestration with swarm intelligence',
      'builtin': 'Built-in Claude Code commands and functionality'
    };

    return descriptions[systemId] || `Custom resource system: ${systemId}`;
  }

  /**
   * Sort resources with system-aware priority
   */
  static sortResourcesWithSystemPriority(resources: ResourceItem[]): ResourceItem[] {
    return resources.sort((a, b) => {
      // Priority: User resources → Modified system → Original system → Built-in
      const getPriority = (resource: ResourceItem): number => {
        if (!resource.isSystemResource) return 0; // User resources first
        if (resource.isModified) return 1; // Modified system resources
        if (resource.systemId === 'builtin') return 3; // Built-in last
        return 2; // Original system resources
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within same priority, sort by system name, then resource name
      if (a.systemName !== b.systemName) {
        return (a.systemName || '').localeCompare(b.systemName || '');
      }

      return a.name.localeCompare(b.name);
    });
  }

  /* TODO: Add advanced system detection features
   * detectSystemDependencies(systemId) - Find resource dependencies
   * validateSystemIntegrity(systemId) - Check for missing/corrupted resources
   * suggestSystemUpdates() - Recommend updates based on usage patterns
   * detectConflictingSystems() - Find systems that might conflict
   * These will enhance system management capabilities
   */

  /* TODO: Implement smart system pattern learning
   * learnNewSystemPatterns(resources) - ML-based pattern detection
   * improveDetectionAccuracy() - Self-improving detection algorithms
   * generateSystemSignatures() - Create unique fingerprints for systems
   * These will make system detection more intelligent over time
   */
}