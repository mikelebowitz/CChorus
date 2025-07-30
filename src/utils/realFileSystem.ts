import { SubAgent } from '../types';
import { parseAgentFile, serializeAgentFile, getAgentFilename } from './agentUtils';

export class RealFileSystemService {
  private userAgentsDir: string;
  private projectAgentsDir: string;

  constructor() {
    // Get user home directory
    this.userAgentsDir = `${process.env.HOME || '~'}/.claude/agents`;
    this.projectAgentsDir = '.claude/agents';
  }

  async scanAgentFiles(directory: string): Promise<string[]> {
    try {
      // Use a simple implementation that can work with the available tools
      // In a browser environment, we'll need to simulate this
      const response = await this.makeToolRequest('glob', {
        pattern: '*.md',
        path: directory
      });
      
      return response.files || [];
    } catch (error) {
      console.warn(`Failed to scan directory ${directory}:`, error);
      return [];
    }
  }

  private async makeToolRequest(tool: string, params: any): Promise<any> {
    // This would integrate with the Claude Code tool system
    // For now, we'll simulate the response
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock response based on tool type
        if (tool === 'glob') {
          resolve({ files: [] }); // No files found in demo
        } else if (tool === 'read') {
          resolve({ content: '' });
        }
      }, 100);
    });
  }

  async readAgentFile(filePath: string): Promise<string> {
    try {
      const response = await this.makeToolRequest('read', {
        file_path: filePath
      });
      
      return response.content || '';
    } catch (error) {
      throw new Error(`Failed to read agent file ${filePath}: ${error}`);
    }
  }

  async writeAgentFile(filePath: string, content: string): Promise<void> {
    try {
      await this.makeToolRequest('write', {
        file_path: filePath,
        content: content
      });
    } catch (error) {
      throw new Error(`Failed to write agent file ${filePath}: ${error}`);
    }
  }

  async loadUserAgents(): Promise<SubAgent[]> {
    const agents: SubAgent[] = [];
    
    try {
      const files = await this.scanAgentFiles(this.userAgentsDir);
      
      for (const file of files) {
        try {
          const filePath = `${this.userAgentsDir}/${file}`;
          const content = await this.readAgentFile(filePath);
          const agent = parseAgentFile(content);
          agent.filePath = filePath;
          agent.level = 'user';
          agents.push(agent);
        } catch (error) {
          console.warn(`Failed to parse user agent file ${file}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load user agents:', error);
    }

    // Add mock user agent for demo
    if (agents.length === 0) {
      agents.push({
        name: 'code-reviewer',
        description: 'Expert code review specialist for quality analysis and security audits',
        tools: ['Read', 'Grep', 'Glob', 'Bash'],
        color: '#3B82F6',
        level: 'user',
        prompt: `You are a senior software engineer specializing in code review and quality assurance.

When invoked:
1. Analyze code for bugs, security vulnerabilities, and performance issues
2. Check for adherence to coding standards and best practices
3. Suggest improvements and optimizations
4. Provide detailed feedback with specific recommendations

Key focus areas:
- Security vulnerabilities
- Performance bottlenecks
- Code maintainability
- Design patterns usage
- Error handling
- Test coverage

Always provide constructive, actionable feedback with examples.`,
        filePath: `${this.userAgentsDir}/code-reviewer.md`
      });
    }
    
    return agents;
  }

  async loadProjectAgents(): Promise<SubAgent[]> {
    const agents: SubAgent[] = [];
    
    try {
      const files = await this.scanAgentFiles(this.projectAgentsDir);
      
      for (const file of files) {
        try {
          const filePath = `${this.projectAgentsDir}/${file}`;
          const content = await this.readAgentFile(filePath);
          const agent = parseAgentFile(content);
          agent.filePath = filePath;
          agent.level = 'project';
          agents.push(agent);
        } catch (error) {
          console.warn(`Failed to parse project agent file ${file}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load project agents:', error);
    }

    // Add mock project agent for demo
    if (agents.length === 0) {
      agents.push({
        name: 'project-manager',
        description: 'Handles task planning, documentation, and project organization',
        tools: ['TodoWrite', 'Read', 'Write'],
        color: '#10B981',
        level: 'project',
        prompt: `You are a project management specialist focused on organizing and tracking development work.

Your responsibilities:
1. Break down complex tasks into manageable steps
2. Create and maintain project documentation
3. Track progress and milestones
4. Coordinate between different development phases
5. Ensure all requirements are captured and addressed

Best practices:
- Always use TodoWrite to track multi-step tasks
- Maintain clear documentation of decisions and changes
- Regular progress updates and status reports
- Risk identification and mitigation planning`,
        filePath: `${this.projectAgentsDir}/project-manager.md`
      });
    }
    
    return agents;
  }

  async loadAgents(): Promise<SubAgent[]> {
    const [userAgents, projectAgents] = await Promise.all([
      this.loadUserAgents(),
      this.loadProjectAgents()
    ]);
    
    // Project agents take precedence over user agents with the same name
    const agentMap = new Map<string, SubAgent>();
    
    // Add user agents first
    userAgents.forEach(agent => agentMap.set(agent.name, agent));
    
    // Add project agents (overriding user agents with same name)
    projectAgents.forEach(agent => agentMap.set(agent.name, agent));
    
    return Array.from(agentMap.values());
  }

  async saveAgent(agent: SubAgent): Promise<void> {
    try {
      const content = serializeAgentFile(agent);
      const filename = getAgentFilename(agent.name);
      
      let filePath: string;
      if (agent.level === 'user') {
        filePath = `${this.userAgentsDir}/${filename}`;
      } else {
        filePath = `${this.projectAgentsDir}/${filename}`;
      }
      
      await this.writeAgentFile(filePath, content);
      console.log(`Saved agent to ${filePath}`);
    } catch (error) {
      console.error('Failed to save agent:', error);
      throw new Error(`Failed to save agent: ${error}`);
    }
  }

  async deleteAgent(name: string, level: 'user' | 'project'): Promise<void> {
    try {
      const filename = getAgentFilename(name);
      const filePath = level === 'user' 
        ? `${this.userAgentsDir}/${filename}`
        : `${this.projectAgentsDir}/${filename}`;
      
      await this.makeToolRequest('delete', { file_path: filePath });
      console.log(`Deleted agent file: ${filePath}`);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw new Error(`Failed to delete agent: ${error}`);
    }
  }

  async searchProjectFiles(query: string): Promise<string[]> {
    try {
      // Search for markdown files that might be agents
      const response = await this.makeToolRequest('glob', {
        pattern: `**/*${query}*.md`
      });
      
      return response.files || [];
    } catch (error) {
      console.warn('Failed to search project files:', error);
      return [];
    }
  }
}