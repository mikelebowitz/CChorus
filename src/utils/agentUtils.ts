import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import { SubAgent, SubAgentConfig } from '../types';

export function parseAgentFile(content: string): SubAgent {
  console.log('parseAgentFile: Starting to parse content of length:', content.length);
  console.log('parseAgentFile: First 200 chars:', content.substring(0, 200));
  
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    console.error('parseAgentFile: No frontmatter match found');
    console.error('parseAgentFile: Content was:', content);
    throw new Error('Invalid agent file format: missing frontmatter');
  }

  const [, frontmatterContent, prompt] = frontmatterMatch;
  console.log('parseAgentFile: Extracted frontmatter:', frontmatterContent);
  console.log('parseAgentFile: Extracted prompt length:', prompt?.length || 0);
  
  try {
    const config = yamlLoad(frontmatterContent) as SubAgentConfig;
    console.log('parseAgentFile: Parsed YAML config:', config);
    
    const result = {
      name: config.name,
      description: config.description,
      tools: config.tools ? config.tools.split(',').map(t => t.trim()) : undefined,
      color: config.color,
      prompt: prompt.trim()
    };
    
    console.log('parseAgentFile: Final parsed agent:', result);
    return result;
  } catch (yamlError) {
    console.error('parseAgentFile: YAML parsing failed:', yamlError);
    console.error('parseAgentFile: YAML content was:', frontmatterContent);
    throw new Error(`YAML parsing failed: ${yamlError}`);
  }
}

export function serializeAgentFile(agent: SubAgent): string {
  const config: SubAgentConfig = {
    name: agent.name,
    description: agent.description,
    ...(agent.tools && agent.tools.length > 0 && { tools: agent.tools.join(', ') }),
    ...(agent.color && { color: agent.color })
  };

  const frontmatter = yamlDump(config, { 
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