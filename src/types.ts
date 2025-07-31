export interface SubAgent {
  name: string;
  description: string;
  tools?: string[];
  color?: string;
  prompt: string;
  filePath?: string;
  level?: 'user' | 'project';
  // System-wide discovery metadata
  projectName?: string;
  projectPath?: string;
  relativePath?: string;
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
  server: string;
  permitted?: boolean;
  description?: string;
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

// Claude Code Project interfaces
export interface ClaudeProject {
  name: string;
  path: string;
  claudeMdPath: string;
  description: string;
  lastModified: Date | string;
  hasAgents: boolean;
  hasCommands: boolean;
  agentCount: number;
  commandCount: number;
  isGitRepo: boolean;
  contentPreview: string;
  size: number;
  origin?: string;
  relativePath?: string;
  error?: string;
}

// Claude Code Hook interfaces
export interface ClaudeHook {
  type: 'command' | 'script';
  command?: string;
  script?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface HookMatcher {
  matcher: string | RegExp;
  hooks: ClaudeHook[];
}

export interface HookConfiguration {
  PreToolUse?: HookMatcher[];
  PostToolUse?: HookMatcher[];
  UserPromptSubmit?: HookMatcher[];
  [eventType: string]: HookMatcher[] | undefined;
}

// Claude Code Slash Command interfaces
export interface SlashCommand {
  name: string;
  path: string;
  description?: string;
  allowedTools?: string[];
  content: string;
  isCustom: boolean;
  namespace?: string;
  args?: string[];
}

// Claude Code Settings interfaces
export interface PermissionRule {
  allow?: string[];
  deny?: string[];
  working_directory?: string;
  default_mode?: 'allow' | 'deny';
}

export interface ClaudeSettings {
  permissions?: PermissionRule;
  hooks?: HookConfiguration;
  environment?: Record<string, string>;
  [key: string]: any;
}

export interface SettingsFile {
  path: string;
  type: 'user' | 'project' | 'local';
  content: ClaudeSettings;
  lastModified: Date | string;
  exists: boolean;
  error?: string;
}

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