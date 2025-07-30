import { SubAgent } from '../types';
import { parseAgentFile, serializeAgentFile, getAgentFilename } from './agentUtils';

const API_BASE = 'http://localhost:3001/api';

export class ApiFileSystemService {
  async loadUserAgents(): Promise<SubAgent[]> {
    try {
      console.log('Loading user agents from API...');
      const response = await fetch(`${API_BASE}/agents/user`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const agentFiles = await response.json();
      console.log('Raw agent files received:', agentFiles);
      const agents: SubAgent[] = [];
      
      for (const file of agentFiles) {
        try {
          console.log(`Parsing agent: ${file.name}`);
          const agent = parseAgentFile(file.content);
          agent.filePath = file.filePath;
          agent.level = 'user';
          agents.push(agent);
          console.log(`Successfully parsed agent: ${agent.name}`);
        } catch (error) {
          console.error(`Failed to parse user agent ${file.name}:`, error);
          console.error('Content was:', file.content?.substring(0, 200));
        }
      }
      
      console.log(`Loaded ${agents.length} user agents:`, agents);
      return agents;
    } catch (error) {
      console.error('Failed to load user agents:', error);
      return [];
    }
  }

  async loadProjectAgents(): Promise<SubAgent[]> {
    try {
      console.log('Loading project agents from API...');
      const response = await fetch(`${API_BASE}/agents/project`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const agentFiles = await response.json();
      console.log('Raw project agent files received:', agentFiles);
      const agents: SubAgent[] = [];
      
      for (const file of agentFiles) {
        try {
          console.log(`Parsing project agent: ${file.name}`);
          const agent = parseAgentFile(file.content);
          agent.filePath = file.filePath;
          agent.level = 'project';
          agents.push(agent);
          console.log(`Successfully parsed project agent: ${agent.name}`);
        } catch (error) {
          console.error(`Failed to parse project agent ${file.name}:`, error);
          console.error('Content was:', file.content?.substring(0, 200));
        }
      }
      
      console.log(`Loaded ${agents.length} project agents:`, agents);
      return agents;
    } catch (error) {
      console.error('Failed to load project agents:', error);
      return [];
    }
  }

  async loadAgents(): Promise<SubAgent[]> {
    try {
      console.log('Starting to load all agents...');
      const [userAgents, projectAgents] = await Promise.all([
        this.loadUserAgents(),
        this.loadProjectAgents()
      ]);
      
      console.log(`Loaded ${userAgents.length} user agents and ${projectAgents.length} project agents`);
      
      // Combine all agents without overriding - use unique key of name + level
      const agentMap = new Map<string, SubAgent>();
      
      // Add user agents
      userAgents.forEach(agent => {
        const key = `${agent.name}-${agent.level}`;
        console.log(`Adding user agent: ${agent.name} with key: ${key}`);
        agentMap.set(key, agent);
      });
      
      // Add project agents (no longer overriding, just adding with different key)
      projectAgents.forEach(agent => {
        const key = `${agent.name}-${agent.level}`;
        console.log(`Adding project agent: ${agent.name} with key: ${key}`);
        agentMap.set(key, agent);
      });
      
      const finalAgents = Array.from(agentMap.values());
      console.log(`Final combined agents (${finalAgents.length}):`, finalAgents);
      return finalAgents;
    } catch (error) {
      console.error('Error in loadAgents:', error);
      return [];
    }
  }

  async saveAgent(agent: SubAgent): Promise<void> {
    try {
      const content = serializeAgentFile(agent);
      
      const response = await fetch(`${API_BASE}/agents/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: agent.name,
          content,
          level: agent.level || 'project'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save agent');
      }
      
      const result = await response.json();
      console.log(`Agent "${agent.name}" saved to ${result.filePath}`);
    } catch (error) {
      console.error('Failed to save agent:', error);
      throw new Error(`Failed to save agent: ${error}`);
    }
  }

  async deleteAgent(name: string, level: 'user' | 'project'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/agents/${name}?level=${level}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete agent');
      }
      
      console.log(`Agent "${name}" deleted`);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw new Error(`Failed to delete agent: ${error}`);
    }
  }

  async searchProjectFiles(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/files/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results = await response.json();
      return results.map((file: any) => file.path);
    } catch (error) {
      console.warn('Failed to search project files:', error);
      return [];
    }
  }

  async readAgentFile(filePath: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/files/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to read file');
      }
      
      const result = await response.json();
      return result.content;
    } catch (error) {
      throw new Error(`Failed to read agent file ${filePath}: ${error}`);
    }
  }
}