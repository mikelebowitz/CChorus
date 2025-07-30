import { SubAgent } from '../types';
import { parseAgentFile, serializeAgentFile, getAgentFilename } from './agentUtils';

const API_BASE = 'http://localhost:3001/api';

export class ApiFileSystemService {
  async loadUserAgents(): Promise<SubAgent[]> {
    try {
      const response = await fetch(`${API_BASE}/agents/user`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const agentFiles = await response.json();
      const agents: SubAgent[] = [];
      
      for (const file of agentFiles) {
        try {
          const agent = parseAgentFile(file.content);
          agent.filePath = file.filePath;
          agent.level = 'user';
          agents.push(agent);
        } catch (error) {
          console.error(`Failed to parse user agent ${file.name}:`, error);
        }
      }
      
      return agents;
    } catch (error) {
      console.error('Failed to load user agents:', error);
      return [];
    }
  }

  async loadProjectAgents(): Promise<SubAgent[]> {
    try {
      const response = await fetch(`${API_BASE}/agents/project`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const agentFiles = await response.json();
      const agents: SubAgent[] = [];
      
      for (const file of agentFiles) {
        try {
          const agent = parseAgentFile(file.content);
          agent.filePath = file.filePath;
          agent.level = 'project';
          agents.push(agent);
        } catch (error) {
          console.error(`Failed to parse project agent ${file.name}:`, error);
        }
      }
      
      return agents;
    } catch (error) {
      console.error('Failed to load project agents:', error);
      return [];
    }
  }

  async loadAgents(): Promise<SubAgent[]> {
    try {
      const [userAgents, projectAgents] = await Promise.all([
        this.loadUserAgents(),
        this.loadProjectAgents()
      ]);
      
      // Combine all agents without overriding - use unique key of name + level
      const agentMap = new Map<string, SubAgent>();
      
      // Add user agents
      userAgents.forEach(agent => {
        const key = `${agent.name}-${agent.level}`;
        agentMap.set(key, agent);
      });
      
      // Add project agents
      projectAgents.forEach(agent => {
        const key = `${agent.name}-${agent.level}`;
        agentMap.set(key, agent);
      });
      
      return Array.from(agentMap.values());
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