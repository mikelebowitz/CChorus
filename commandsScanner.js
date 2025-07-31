import readdirp, { readdirpPromise } from 'readdirp';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

/**
 * Scans for Claude Code slash commands in .claude/commands/ directories
 * 
 * @param {string[]} projectPaths - Array of project paths to scan
 * @returns {Promise<Array>} Array of discovered slash commands
 */
export async function scanSlashCommands(projectPaths = []) {
  const commands = [];
  
  // User-level commands
  const userCommandsDir = path.join(os.homedir(), '.claude', 'commands');
  try {
    const userCommands = await scanCommandsDirectory(userCommandsDir, 'user');
    commands.push(...userCommands);
  } catch (error) {
    console.warn(`Could not scan user commands from ${userCommandsDir}:`, error.message);
  }
  
  // Project-level commands for each discovered project
  for (const projectPath of projectPaths) {
    const projectCommandsDir = path.join(projectPath, '.claude', 'commands');
    try {
      const projectCommands = await scanCommandsDirectory(projectCommandsDir, 'project', projectPath);
      commands.push(...projectCommands);
    } catch (error) {
      console.warn(`Could not scan project commands from ${projectCommandsDir}:`, error.message);
    }
  }
  
  return commands;
}

/**
 * Scans a specific commands directory for .md files
 * 
 * @param {string} commandsDir - Directory to scan for command files
 * @param {string} scope - Scope of the commands ('user' or 'project')
 * @param {string} projectPath - Project path (for project-level commands)
 * @returns {Promise<Array>} Array of command objects
 */
async function scanCommandsDirectory(commandsDir, scope, projectPath = null) {
  const commands = [];
  
  try {
    // Check if commands directory exists
    await fs.access(commandsDir);
  } catch (error) {
    // Directory doesn't exist
    return commands;
  }
  
  try {
    // Use readdirp to recursively find all .md files in the commands directory
    const entries = await readdirpPromise(commandsDir, {
      fileFilter: (entry) => entry.basename.endsWith('.md'),
      type: 'files',
      depth: 10  // Allow nested namespaces
    });
    
    for (const entry of entries) {
      try {
        const commandInfo = await parseCommandFile(entry.fullPath, commandsDir, scope, projectPath);
        if (commandInfo) {
          commands.push(commandInfo);
        }
      } catch (error) {
        console.warn(`Failed to parse command file ${entry.fullPath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error scanning commands directory ${commandsDir}:`, error);
  }
  
  return commands;
}

/**
 * Parses a command .md file to extract command information
 * 
 * @param {string} filePath - Path to the command file
 * @param {string} commandsDir - Base commands directory
 * @param {string} scope - Command scope ('user' or 'project')
 * @param {string} projectPath - Project path (for project commands)
 * @returns {Promise<Object>} Command information object
 */
async function parseCommandFile(filePath, commandsDir, scope, projectPath = null) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    
    const relativePath = path.relative(commandsDir, filePath);
    const commandName = path.basename(filePath, '.md');
    const namespace = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
    
    // Parse YAML frontmatter if present
    let frontmatter = {};
    let commandContent = content;
    
    if (content.startsWith('---\n')) {
      const endIndex = content.indexOf('\n---\n', 4);
      if (endIndex !== -1) {
        const yamlContent = content.substring(4, endIndex);
        commandContent = content.substring(endIndex + 5);
        
        try {
          frontmatter = yaml.load(yamlContent) || {};
        } catch (yamlError) {
          console.warn(`Failed to parse YAML frontmatter in ${filePath}:`, yamlError.message);
        }
      }
    }
    
    // Extract allowed tools if specified
    let allowedTools = [];
    if (frontmatter['allowed-tools']) {
      if (typeof frontmatter['allowed-tools'] === 'string') {
        allowedTools = [frontmatter['allowed-tools']];
      } else if (Array.isArray(frontmatter['allowed-tools'])) {
        allowedTools = frontmatter['allowed-tools'];
      }
    }
    
    // Determine full command name including namespace
    const fullName = namespace ? `${namespace}/${commandName}` : commandName;
    
    return {
      id: `${scope}:${fullName}`,
      name: commandName,
      fullName: fullName,
      path: filePath,
      relativePath: relativePath,
      namespace: namespace,
      scope: scope,
      projectPath: projectPath,
      projectName: projectPath ? path.basename(projectPath) : null,
      description: frontmatter.description || extractDescriptionFromContent(commandContent),
      allowedTools: allowedTools,
      content: commandContent.trim(),
      frontmatter: frontmatter,
      lastModified: stats.mtime,
      size: stats.size,
      isCustom: true, // All file-based commands are custom
      hasArguments: commandContent.includes('$ARGUMENTS') || commandContent.includes('$ARG'),
      hasBashCommands: commandContent.includes('```bash') || commandContent.includes('$(') || commandContent.includes('`')
    };
  } catch (error) {
    console.error(`Error parsing command file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extracts a description from command content if not provided in frontmatter
 * 
 * @param {string} content - Command content
 * @returns {string} Extracted description
 */
function extractDescriptionFromContent(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Look for the first substantial line that could be a description
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed.length > 10 && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
      return trimmed.substring(0, 100) + (trimmed.length > 100 ? '...' : '');
    }
  }
  
  return 'Custom slash command';
}

/**
 * Creates a new slash command template
 * 
 * @param {string} name - Command name
 * @param {string} description - Command description
 * @param {Array} allowedTools - Array of allowed tools
 * @returns {Object} Command template
 */
export function createCommandTemplate(name = 'new-command', description = 'A new custom command', allowedTools = []) {
  const frontmatter = {
    description: description
  };
  
  if (allowedTools.length > 0) {
    frontmatter['allowed-tools'] = allowedTools;
  }
  
  const yamlFrontmatter = yaml.dump(frontmatter).trim();
  const content = `---
${yamlFrontmatter}
---

${description}

Use $ARGUMENTS to access command arguments if needed.`;
  
  return {
    name: name,
    description: description,
    allowedTools: allowedTools,
    content: content,
    isTemplate: true
  };
}

/**
 * Saves a slash command to the appropriate directory
 * 
 * @param {Object} command - Command object to save
 * @param {string} scope - Command scope ('user' or 'project')
 * @param {string} projectPath - Project path (for project commands)
 * @returns {Promise<string>} Path where the command was saved
 */
export async function saveSlashCommand(command, scope, projectPath = null) {
  let commandsDir;
  
  if (scope === 'user') {
    commandsDir = path.join(os.homedir(), '.claude', 'commands');
  } else if (scope === 'project' && projectPath) {
    commandsDir = path.join(projectPath, '.claude', 'commands');
  } else {
    throw new Error('Invalid scope or missing project path');
  }
  
  // Ensure commands directory exists
  await fs.mkdir(commandsDir, { recursive: true });
  
  // Handle namespace (subdirectory)
  let filePath;
  if (command.namespace) {
    const namespaceDir = path.join(commandsDir, command.namespace);
    await fs.mkdir(namespaceDir, { recursive: true });
    filePath = path.join(namespaceDir, `${command.name}.md`);
  } else {
    filePath = path.join(commandsDir, `${command.name}.md`);
  }
  
  // Create backup if file exists
  try {
    await fs.access(filePath);
    const backupPath = filePath + '.backup.' + Date.now();
    await fs.copyFile(filePath, backupPath);
  } catch (error) {
    // File doesn't exist, no backup needed
  }
  
  // Write the command file
  await fs.writeFile(filePath, command.content, 'utf-8');
  
  return filePath;
}

/**
 * Deletes a slash command file
 * 
 * @param {string} commandPath - Path to the command file
 * @returns {Promise<void>}
 */
export async function deleteSlashCommand(commandPath) {
  try {
    // Security check - ensure we're only deleting from .claude/commands directories
    if (!commandPath.includes('.claude/commands/')) {
      throw new Error('Can only delete commands from .claude/commands directories');
    }
    
    await fs.unlink(commandPath);
  } catch (error) {
    console.error(`Failed to delete command ${commandPath}:`, error);
    throw error;
  }
}

/**
 * Validates a slash command configuration
 * 
 * @param {Object} command - Command object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateSlashCommand(command) {
  const errors = [];
  
  if (!command) {
    errors.push('Command configuration is required');
    return { isValid: false, errors };
  }
  
  // Validate name
  if (!command.name) {
    errors.push('Command name is required');
  } else if (!/^[a-z0-9-_]+$/.test(command.name)) {
    errors.push('Command name must contain only lowercase letters, numbers, hyphens, and underscores');
  }
  
  // Validate content
  if (!command.content) {
    errors.push('Command content is required');
  }
  
  // Validate namespace if provided
  if (command.namespace && !/^[a-z0-9-_/]+$/.test(command.namespace)) {
    errors.push('Namespace must contain only lowercase letters, numbers, hyphens, underscores, and forward slashes');
  }
  
  // Validate allowed tools if provided
  if (command.allowedTools && !Array.isArray(command.allowedTools)) {
    errors.push('Allowed tools must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets the built-in slash commands (these are not file-based)
 * 
 * @returns {Array} Array of built-in command objects
 */
export function getBuiltInCommands() {
  return [
    {
      id: 'builtin:clear',
      name: 'clear',
      fullName: 'clear',
      description: 'Clear the conversation history',
      scope: 'builtin',
      isCustom: false,
      allowedTools: [],
      hasArguments: false
    },
    {
      id: 'builtin:help',
      name: 'help',
      fullName: 'help',
      description: 'Show available commands and help information',
      scope: 'builtin',
      isCustom: false,
      allowedTools: [],
      hasArguments: false
    },
    {
      id: 'builtin:model',
      name: 'model',
      fullName: 'model',
      description: 'Switch between different Claude models',
      scope: 'builtin',
      isCustom: false,
      allowedTools: [],
      hasArguments: true
    },
    {
      id: 'builtin:review',
      name: 'review',
      fullName: 'review',
      description: 'Review and analyze recent changes or code',
      scope: 'builtin',
      isCustom: false,
      allowedTools: ['Read', 'Grep', 'Bash'],
      hasArguments: true
    }
  ];
}