export interface SubAgent {
  name: string;
  description: string;
  tools?: string[];
  color?: string;
  prompt: string;
  filePath?: string;
  level?: 'user' | 'project';
}

export interface SubAgentConfig {
  name: string;
  description: string;
  tools?: string;
  color?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  displayName: string;
}

export interface ToolsData {
  defaultTools: string[];
  mcpServers: MCPServer[];
}

export const AVAILABLE_TOOLS = [
  'Task',
  'Bash',
  'Glob',
  'Grep',
  'LS',
  'ExitPlanMode',
  'Read',
  'Edit',
  'MultiEdit',
  'Write',
  'NotebookRead',
  'NotebookEdit',
  'WebFetch',
  'TodoWrite',
  'WebSearch'
];

export const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];