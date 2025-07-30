import { SubAgent } from '../types';
import { parseAgentFile, serializeAgentFile, getAgentFilename } from './agentUtils';

const PROJECT_AGENTS_DIR = '.claude/agents';
const USER_AGENTS_DIR = '~/.claude/agents';

export class FileSystemService {
  private async scanDirectory(dirPath: string, level: 'user' | 'project'): Promise<SubAgent[]> {
    const agents: SubAgent[] = [];
    
    try {
      // Use the task system to scan for agent files
      const response = await fetch('/api/scan-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: dirPath, level })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to scan directory: ${response.statusText}`);
      }
      
      const files = await response.json();
      
      for (const file of files) {
        try {
          const content = await this.readFile(file.path);
          const agent = parseAgentFile(content);
          agent.filePath = file.path;
          agent.level = level;
          agents.push(agent);
        } catch (error) {
          console.warn(`Failed to parse agent file ${file.path}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan ${level} agents directory:`, error);
      
      // Fallback to mock data for demo
      if (level === 'user') {
        return this.getMockUserAgents();
      } else {
        return this.getMockProjectAgents();
      }
    }
    
    return agents;
  }

  private async readFile(filePath: string): Promise<string> {
    // In a real implementation, this would read from the file system
    // For now, we'll simulate with an API call
    const response = await fetch('/api/read-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    
    return await response.text();
  }

  private getMockUserAgents(): SubAgent[] {
    return [
      {
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
        filePath: `${USER_AGENTS_DIR}/code-reviewer.md`
      }
    ];
  }

  private getMockProjectAgents(): SubAgent[] {
    return [
      {
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
        filePath: `${PROJECT_AGENTS_DIR}/project-manager.md`
      }
    ];
  }

  async loadUserAgents(): Promise<SubAgent[]> {
    return await this.scanDirectory(USER_AGENTS_DIR, 'user');
  }

  async loadProjectAgents(): Promise<SubAgent[]> {
    return await this.scanDirectory(PROJECT_AGENTS_DIR, 'project');
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
      const filePath = `${AGENTS_DIR}/${filename}`;
      
      // In a real implementation, you would write to the file system
      console.log(`Saving agent to ${filePath}:`, content);
      
      // For demo purposes, we'll just log the action
      alert(`Agent "${agent.name}" would be saved to ${filePath}`);
    } catch (error) {
      console.error('Failed to save agent:', error);
      throw new Error(`Failed to save agent: ${error}`);
    }
  }

  async deleteAgent(name: string): Promise<void> {
    try {
      const filename = getAgentFilename(name);
      const filePath = `${AGENTS_DIR}/${filename}`;
      
      // In a real implementation, you would delete the file
      console.log(`Deleting agent file: ${filePath}`);
      
      // For demo purposes, we'll just log the action
      alert(`Agent "${name}" would be deleted from ${filePath}`);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw new Error(`Failed to delete agent: ${error}`);
    }
  }
}