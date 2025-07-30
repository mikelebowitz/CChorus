import * as yaml from 'js-yaml';
import { SubAgent, SubAgentConfig } from '../types';

export function parseAgentFile(content: string): SubAgent {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    throw new Error('Invalid agent file format: missing frontmatter');
  }

  const [, frontmatterContent, prompt] = frontmatterMatch;
  const config = yaml.load(frontmatterContent) as SubAgentConfig;

  return {
    name: config.name,
    description: config.description,
    tools: config.tools ? config.tools.split(',').map(t => t.trim()) : undefined,
    color: config.color,
    prompt: prompt.trim()
  };
}

export function serializeAgentFile(agent: SubAgent): string {
  const config: SubAgentConfig = {
    name: agent.name,
    description: agent.description,
    ...(agent.tools && agent.tools.length > 0 && { tools: agent.tools.join(', ') }),
    ...(agent.color && { color: agent.color })
  };

  const frontmatter = yaml.dump(config, { 
    indent: 2,
    lineWidth: -1 
  }).trim();

  return `---\n${frontmatter}\n---\n\n${agent.prompt}`;
}

export function validateAgentName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (!/^[a-z0-9-]+$/.test(name)) return 'Name must be lowercase letters, numbers, and hyphens only';
  return null;
}

export function getAgentFilename(name: string): string {
  return `${name}.md`;
}