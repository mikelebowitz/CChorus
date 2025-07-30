import { SubAgent } from '../types';
import { parseAgentFile, serializeAgentFile, getAgentFilename } from './agentUtils';

export class BrowserFileSystemService {
  private userAgentsDir: string;
  private projectAgentsDir: string;

  constructor() {
    // In a browser environment, we'll simulate these paths
    this.userAgentsDir = '~/.claude/agents';
    this.projectAgentsDir = '.claude/agents';
  }

  async loadUserAgents(): Promise<SubAgent[]> {
    // In a real implementation, this would scan the user's home directory
    // For now, return mock user agents
    const mockUserAgents: SubAgent[] = [
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
        filePath: `${this.userAgentsDir}/code-reviewer.md`
      },
      {
        name: 'documentation-writer',
        description: 'Specialized in creating and maintaining project documentation',
        tools: ['Read', 'Write', 'Glob'],
        color: '#F59E0B',
        level: 'user',
        prompt: `You are a technical documentation specialist focused on creating clear, comprehensive documentation.

Your expertise includes:
1. Writing clear API documentation
2. Creating user guides and tutorials
3. Maintaining README files and changelogs
4. Structuring documentation for easy navigation
5. Ensuring documentation stays up-to-date with code changes

Best practices:
- Use clear, concise language
- Include practical examples
- Structure information logically
- Consider the audience's technical level
- Regular reviews and updates`,
        filePath: `${this.userAgentsDir}/documentation-writer.md`
      }
    ];

    return mockUserAgents;
  }

  async loadProjectAgents(): Promise<SubAgent[]> {
    const agents: SubAgent[] = [];
    
    try {
      // Try to load the test agent we created
      const testAgentPath = `${this.projectAgentsDir}/test-agent.md`;
      
      // In a real browser implementation, we'd need to use the File System Access API
      // or have a backend service. For now, we'll simulate with fetch
      try {
        const response = await fetch(`/${testAgentPath}`);
        if (response.ok) {
          const content = await response.text();
          const agent = parseAgentFile(content);
          agent.filePath = testAgentPath;
          agent.level = 'project';
          agents.push(agent);
        }
      } catch {
        // File doesn't exist or can't be accessed, add mock data
      }
    } catch (error) {
      console.warn('Failed to load project agents:', error);
    }

    // Add some mock project agents if none were found
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
      
      // In a browser environment, we'd need to use the File System Access API
      // or download the file for the user
      console.log(`Would save agent to ${filePath}:`, content);
      
      // For demo purposes, create a downloadable file
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Agent "${agent.name}" has been downloaded as ${filename}`);
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
      
      console.log(`Would delete agent file: ${filePath}`);
      
      // In a browser environment, we can't actually delete files
      // This would need backend support or user confirmation
      alert(`In a real implementation, this would delete ${filePath}`);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw new Error(`Failed to delete agent: ${error}`);
    }
  }

  async searchProjectFiles(query: string): Promise<string[]> {
    // Mock search results for demo
    const mockFiles = [
      '.claude/agents/existing-agent.md',
      'docs/agents/custom-agent.md',
      'config/claude-agents/helper.md',
      'scripts/agent-templates/base.md',
      'README.md',
      'CLAUDE.md'
    ];
    
    return mockFiles.filter(file => 
      file.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes('agent') ||
      query.toLowerCase().includes('md')
    );
  }

  async readAgentFile(filePath: string): Promise<string> {
    // Mock file content for demo
    const mockContent = `---
name: imported-agent
description: An agent imported from ${filePath}
tools: Read, Write, Bash
color: "#8B5CF6"
---

This is an imported agent from ${filePath}.

You are an agent that was discovered through file search and imported into the system.

Your responsibilities:
1. Demonstrate the file import functionality
2. Show how existing files can be parsed as agents
3. Validate the import process

This content would normally be read from the actual file.`;

    return mockContent;
  }
}