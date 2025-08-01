import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { scanAgentFilesArray } from './agentScanner.js';
import { scanClaudeProjects, scanClaudeProjectsArray, extractProjectInfo } from './projectScanner.js';
import { scanHookConfigurations, extractHookConfigurations, readSettingsFile, updateSettingsHooks, validateHookConfiguration, createHookTemplate } from './hooksScanner.js';
import { scanSlashCommands, saveSlashCommand, deleteSlashCommand, validateSlashCommand, createCommandTemplate, getBuiltInCommands } from './commandsScanner.js';
import { SettingsManager } from './settingsManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Enable CORS for development - allow all localhost origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow any localhost origin for development
  if (origin && origin.startsWith('http://localhost:')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Enhanced helper function to scan for agent files using the new scanner
async function scanAgentDirectory(dirPath) {
  try {
    // For a specific directory like /path/to/.claude/agents, we want to scan
    // from the parent of .claude to find all agent files, then filter to our specific dir
    const rootToScan = path.dirname(path.dirname(dirPath)); // Go up from .claude/agents to the root
    
    // Use the new scanner to find agent files
    const agentFiles = await scanAgentFilesArray([rootToScan]);
    
    // Filter to only files in our specific directory
    const relevantFiles = agentFiles.filter(result => 
      path.dirname(result.file) === dirPath
    );
    
    const agents = [];
    for (const { file: filePath } of relevantFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        agents.push({
          name: path.basename(filePath, '.md'),
          filePath,
          content
        });
      } catch (error) {
        console.warn(`Failed to read ${filePath}:`, error.message);
      }
    }
    
    return agents;
  } catch (error) {
    console.warn(`Failed to scan directory ${dirPath}:`, error.message);
    return [];
  }
}

// System-wide agent scanning function
async function scanSystemAgents() {
  try {
    // Define targeted scan roots for finding agent files
    // Use same targeted approach as project scanner to avoid performance issues
    const homeDir = os.homedir();
    const potentialRoots = [
      homeDir, // User's home directory for ~/.claude/agents
      process.cwd(), // Current directory (where CChorus is running from)
      path.join(homeDir, 'Desktop'),
      path.join(homeDir, 'Documents', 'Code'), // More specific - just Code directory
      path.join(homeDir, 'Projects'), // Common project directory
    ];
    
    // Filter to only existing directories
    const scanRoots = [];
    for (const dir of potentialRoots) {
      try {
        await fs.access(dir);
        scanRoots.push(dir);
      } catch {
        console.log(`Skipping non-existent directory: ${dir}`);
      }
    }
    
    console.log('Starting system-wide agent scan from roots:', scanRoots);
    
    // Use our powerful scanner to find all agent files across the system
    const agentFiles = await scanAgentFilesArray(scanRoots);
    
    console.log(`Found ${agentFiles.length} total agent files across the system`);
    
    const agents = [];
    
    for (const { file: filePath, origin } of agentFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extract project information from the agent file path
        const projectInfo = extractProjectInfoFromAgentPath(filePath, origin);
        
        agents.push({
          name: path.basename(filePath, '.md'),
          filePath,
          content,
          // Add project metadata
          projectName: projectInfo.projectName,
          projectPath: projectInfo.projectPath,
          sourceType: projectInfo.sourceType,
          relativePath: path.relative(origin, filePath)
        });
      } catch (error) {
        console.warn(`Failed to read agent file ${filePath}:`, error.message);
      }
    }
    
    console.log(`Successfully loaded ${agents.length} system agents`);
    
    // Sort by project name, then by agent name
    agents.sort((a, b) => {
      const projectCompare = a.projectName.localeCompare(b.projectName);
      return projectCompare !== 0 ? projectCompare : a.name.localeCompare(b.name);
    });
    
    return agents;
  } catch (error) {
    console.error('System agent scan failed:', error);
    return [];
  }
}

// Helper function to extract project information from agent file paths
function extractProjectInfoFromAgentPath(agentFilePath, origin) {
  // Agent files are typically located at: /some/path/project/.claude/agents/agent-name.md
  // We need to extract the project name and path from this structure
  
  const parts = agentFilePath.split(path.sep);
  const claudeIndex = parts.lastIndexOf('.claude');
  
  if (claudeIndex === -1) {
    // Not in a .claude directory structure, use parent directory
    const projectPath = path.dirname(agentFilePath);
    const projectName = path.basename(projectPath);
    return {
      projectName: projectName,
      projectPath: projectPath,
      sourceType: 'file'
    };
  }
  
  // Extract project directory (the directory containing .claude)
  const projectPath = parts.slice(0, claudeIndex).join(path.sep);
  const projectName = path.basename(projectPath);
  
  return {
    projectName: projectName,
    projectPath: projectPath,
    sourceType: 'project' // This is a proper .claude structure
  };
}

// API Routes

// Get user-level agents
app.get('/api/agents/user', async (req, res) => {
  try {
    const userAgentsDir = path.join(os.homedir(), '.claude', 'agents');
    const agents = await scanAgentDirectory(userAgentsDir);
    res.json(agents);
  } catch (error) {
    console.error('Failed to load user agents:', error);
    res.status(500).json({ error: 'Failed to load user agents' });
  }
});

// Get system-wide agents from all projects
app.get('/api/agents/system', async (req, res) => {
  try {
    const agents = await scanSystemAgents();
    res.json(agents);
  } catch (error) {
    console.error('Failed to load system agents:', error);
    res.status(500).json({ error: 'Failed to load system agents' });
  }
});

// System-wide project scanning function
async function scanSystemProjects() {
  try {
    // Define targeted scan roots for finding Claude Code projects
    // Avoid scanning entire home directory due to performance and system directory issues
    const homeDir = os.homedir();
    const potentialRoots = [
      process.cwd(), // Current directory (where CChorus is running from)
      path.join(homeDir, 'Desktop'),
      path.join(homeDir, 'Documents', 'Code'), // More specific - just Code directory
      path.join(homeDir, 'Projects'), // Common project directory
    ];
    
    // Filter to only existing directories
    const scanRoots = [];
    for (const dir of potentialRoots) {
      try {
        await fs.access(dir);
        scanRoots.push(dir);
      } catch {
        console.log(`Skipping non-existent directory: ${dir}`);
      }
    }
    
    console.log('Starting system-wide project scan from roots:', scanRoots);
    
    // Use our scanner to find all CLAUDE.md files across the system
    const projectFiles = await scanClaudeProjectsArray(scanRoots);
    
    console.log(`Found ${projectFiles.length} Claude Code projects across the system`);
    
    const projects = [];
    
    for (const { file: claudeMdPath, origin, projectPath } of projectFiles) {
      try {
        // Extract comprehensive project information
        const projectInfo = await extractProjectInfo(projectPath, claudeMdPath);
        
        projects.push({
          ...projectInfo,
          origin: origin,
          relativePath: path.relative(origin, projectPath)
        });
      } catch (error) {
        console.warn(`Failed to extract project info for ${projectPath}:`, error.message);
      }
    }
    
    console.log(`Successfully loaded ${projects.length} system projects`);
    
    // Sort by project name
    projects.sort((a, b) => a.name.localeCompare(b.name));
    
    return projects;
  } catch (error) {
    console.error('System project scan failed:', error);
    return [];
  }
}

// Get system-wide Claude Code projects
app.get('/api/projects/system', async (req, res) => {
  try {
    const projects = await scanSystemProjects();
    res.json(projects);
  } catch (error) {
    console.error('Failed to load system projects:', error);
    res.status(500).json({ error: 'Failed to load system projects' });
  }
});

// Stream system-wide Claude Code projects as they're discovered
app.get('/api/projects/stream', async (req, res) => {
  try {
    // Set up Server-Sent Events headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Send initial connection confirmation
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Stream started' })}\n\n`);

    // Set up the same scan roots as the batch version
    const homeDir = os.homedir();
    const potentialRoots = [
      process.cwd(),
      path.join(homeDir, 'Desktop'),
      path.join(homeDir, 'Documents', 'Code'),
      path.join(homeDir, 'Projects'),
    ];
    
    const scanRoots = [];
    for (const dir of potentialRoots) {
      try {
        await fs.access(dir);
        scanRoots.push(dir);
      } catch {
        // Skip non-existent directories
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'scan_started', roots: scanRoots, message: 'Scanning for projects...' })}\n\n`);

    let projectCount = 0;

    // Use streaming scanner to send results as they're found
    for await (const { file: claudeMdPath, origin, projectPath } of scanClaudeProjects(scanRoots)) {
      try {
        // Extract project information
        const projectInfo = await extractProjectInfo(projectPath, claudeMdPath);
        
        const project = {
          ...projectInfo,
          origin: origin,
          relativePath: path.relative(origin, projectPath)
        };

        projectCount++;

        // Send individual project as it's discovered
        res.write(`data: ${JSON.stringify({ 
          type: 'project_found', 
          project: project,
          count: projectCount 
        })}\n\n`);

      } catch (error) {
        console.warn(`Failed to process project ${projectPath}:`, error.message);
        // Send error but continue scanning
        res.write(`data: ${JSON.stringify({ 
          type: 'project_error', 
          path: projectPath, 
          error: error.message 
        })}\n\n`);
      }
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({ 
      type: 'scan_complete', 
      total: projectCount,
      message: `Found ${projectCount} projects` 
    })}\n\n`);
    
    res.end();

  } catch (error) {
    console.error('Streaming project scan failed:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error.message 
    })}\n\n`);
    res.end();
  }
});

// Get detailed information about a specific project
app.get('/api/projects/:projectPath(*)/info', async (req, res) => {
  try {
    const projectPath = '/' + req.params.projectPath;
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    
    // Security check: ensure the project path is reasonable
    if (!projectPath.includes(os.homedir()) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Check if CLAUDE.md exists
    try {
      await fs.access(claudeMdPath);
    } catch (error) {
      return res.status(404).json({ error: 'CLAUDE.md not found in specified project' });
    }
    
    const projectInfo = await extractProjectInfo(projectPath, claudeMdPath);
    res.json(projectInfo);
  } catch (error) {
    console.error('Failed to get project info:', error);
    res.status(500).json({ error: 'Failed to get project info' });
  }
});

// Read CLAUDE.md content for a project
app.get('/api/projects/:projectPath(*)/claude-md', async (req, res) => {
  try {
    const projectPath = '/' + req.params.projectPath;
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    
    // Security check
    if (!projectPath.includes(os.homedir()) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const content = await fs.readFile(claudeMdPath, 'utf-8');
    res.json({ content, path: claudeMdPath });
  } catch (error) {
    console.error('Failed to read CLAUDE.md:', error);
    res.status(500).json({ error: 'Failed to read CLAUDE.md file' });
  }
});

// Update CLAUDE.md content for a project
app.put('/api/projects/:projectPath(*)/claude-md', async (req, res) => {
  try {
    const projectPath = '/' + req.params.projectPath;
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Security check
    if (!projectPath.includes(os.homedir()) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Create backup of existing file
    try {
      const existingContent = await fs.readFile(claudeMdPath, 'utf-8');
      const backupPath = claudeMdPath + '.backup.' + Date.now();
      await fs.writeFile(backupPath, existingContent, 'utf-8');
    } catch (error) {
      console.warn('Could not create backup:', error.message);
    }
    
    await fs.writeFile(claudeMdPath, content, 'utf-8');
    res.json({ success: true, path: claudeMdPath });
  } catch (error) {
    console.error('Failed to update CLAUDE.md:', error);
    res.status(500).json({ error: 'Failed to update CLAUDE.md file' });
  }
});

// Project Manager Component Endpoints
// Get CLAUDE.md content for ProjectManager component (without dash)
app.get('/api/projects/:projectPath(*)/claudemd', async (req, res) => {
  try {
    const projectPath = decodeURIComponent(req.params.projectPath);
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    
    // Security check
    if (!projectPath.includes(os.homedir()) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    try {
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      res.json({ content, path: claudeMdPath });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'CLAUDE.md not found' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to read CLAUDE.md:', error);
    res.status(500).json({ error: 'Failed to read CLAUDE.md file' });
  }
});

// Update CLAUDE.md content for ProjectManager component (without dash)
app.put('/api/projects/:projectPath(*)/claudemd', async (req, res) => {
  try {
    const projectPath = decodeURIComponent(req.params.projectPath);
    const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
    const { content } = req.body;
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Security check
    if (!projectPath.includes(os.homedir()) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Create backup of existing file if it exists
    try {
      const existingContent = await fs.readFile(claudeMdPath, 'utf-8');
      const backupPath = claudeMdPath + '.backup.' + Date.now();
      await fs.writeFile(backupPath, existingContent, 'utf-8');
    } catch (error) {
      // File doesn't exist, no backup needed
      if (error.code !== 'ENOENT') {
        console.warn('Could not create backup:', error.message);
      }
    }
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(claudeMdPath), { recursive: true });
    
    await fs.writeFile(claudeMdPath, content, 'utf-8');
    res.json({ success: true, path: claudeMdPath });
  } catch (error) {
    console.error('Failed to update CLAUDE.md:', error);
    res.status(500).json({ error: 'Failed to update CLAUDE.md file' });
  }
});

// Get system-wide hook configurations
app.get('/api/hooks/system', async (req, res) => {
  try {
    // First get all projects to scan their settings
    const projectFiles = await scanClaudeProjectsArray([os.homedir()]);
    const projectPaths = projectFiles.map(p => p.projectPath);
    
    // Scan for hook configurations in user and project settings
    const settingsFiles = await scanHookConfigurations(projectPaths);
    const hooks = extractHookConfigurations(settingsFiles);
    
    res.json({
      hooks: hooks,
      settingsFiles: settingsFiles.map(sf => ({
        path: sf.path,
        type: sf.type,
        exists: sf.exists,
        hasHooks: sf.hasHooks,
        lastModified: sf.lastModified,
        projectPath: sf.projectPath,
        projectName: sf.projectName,
        error: sf.error
      }))
    });
  } catch (error) {
    console.error('Failed to load system hooks:', error);
    res.status(500).json({ error: 'Failed to load system hooks' });
  }
});

// Get hooks for a specific settings file
app.get('/api/hooks/settings', async (req, res) => {
  try {
    const { path: settingsPath, type } = req.query;
    
    if (!settingsPath || !type) {
      return res.status(400).json({ error: 'Path and type are required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const settingsFile = await readSettingsFile(settingsPath, type);
    const hooks = settingsFile.hasHooks ? extractHookConfigurations([settingsFile]) : [];
    
    res.json({
      settingsFile,
      hooks
    });
  } catch (error) {
    console.error('Failed to get hooks for settings file:', error);
    res.status(500).json({ error: 'Failed to get hooks for settings file' });
  }
});

// Create a new hook configuration
app.post('/api/hooks/create', async (req, res) => {
  try {
    const { settingsPath, eventType, matcher, type } = req.body;
    
    if (!settingsPath) {
      return res.status(400).json({ error: 'Settings path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Create hook template
    const hookTemplate = createHookTemplate(eventType, matcher, type);
    
    // Validate the hook configuration
    const validation = validateHookConfiguration(hookTemplate);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid hook configuration', details: validation.errors });
    }
    
    res.json({ hook: hookTemplate });
  } catch (error) {
    console.error('Failed to create hook:', error);
    res.status(500).json({ error: 'Failed to create hook' });
  }
});

// Update hooks in a settings file
app.put('/api/hooks/settings', async (req, res) => {
  try {
    const { settingsPath, hooks } = req.body;
    
    if (!settingsPath || !Array.isArray(hooks)) {
      return res.status(400).json({ error: 'Settings path and hooks array are required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Validate all hook configurations
    for (const hook of hooks) {
      const validation = validateHookConfiguration(hook);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: `Invalid hook configuration for ${hook.eventType}:${hook.matcher}`, 
          details: validation.errors 
        });
      }
    }
    
    // Update the settings file
    await updateSettingsHooks(settingsPath, hooks);
    
    res.json({ success: true, path: settingsPath });
  } catch (error) {
    console.error('Failed to update hooks:', error);
    res.status(500).json({ error: 'Failed to update hooks' });
  }
});

// Validate a hook configuration
app.post('/api/hooks/validate', async (req, res) => {
  try {
    const { hookConfig } = req.body;
    
    if (!hookConfig) {
      return res.status(400).json({ error: 'Hook configuration is required' });
    }
    
    const validation = validateHookConfiguration(hookConfig);
    res.json(validation);
  } catch (error) {
    console.error('Failed to validate hook:', error);
    res.status(500).json({ error: 'Failed to validate hook' });
  }
});

// Assign a hook to a target scope (copy/move operation)
app.post('/api/hooks/assign', async (req, res) => {
  try {
    const { eventType, matcher, command, enabled, targetScope, operation, targetProjectPath } = req.body;
    
    if (!eventType || !matcher || !command || !targetScope) {
      return res.status(400).json({ error: 'Event type, matcher, command, and target scope are required' });
    }

    if (!['copy', 'move'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be copy or move' });
    }
    
    // Create the hook configuration
    const hookConfig = {
      eventType,
      matcher,
      command,
      enabled: enabled !== false // Default to enabled
    };
    
    // Determine target settings file path
    let targetSettingsPath;
    if (targetScope === 'user') {
      targetSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    } else if (targetScope === 'project') {
      const projectDir = targetProjectPath || process.cwd();
      targetSettingsPath = path.join(projectDir, '.claude', 'settings.json');
    } else {
      return res.status(400).json({ error: 'Target scope must be user or project' });
    }
    
    // Update the settings file with the new hook
    const result = await updateSettingsHooks(targetSettingsPath, hookConfig, 'add');
    
    if (result.success) {
      res.json({ 
        success: true, 
        targetPath: targetSettingsPath,
        operation,
        targetScope
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to assign hook' });
    }
  } catch (error) {
    console.error('Failed to assign hook:', error);
    res.status(500).json({ error: 'Failed to assign hook: ' + error.message });
  }
});

// Get system-wide slash commands
app.get('/api/commands/system', async (req, res) => {
  try {
    // First get all projects to scan their commands
    const projectFiles = await scanClaudeProjectsArray([os.homedir()]);
    const projectPaths = projectFiles.map(p => p.projectPath);
    
    // Scan for slash commands in user and project directories
    const customCommands = await scanSlashCommands(projectPaths);
    const builtInCommands = getBuiltInCommands();
    
    const allCommands = [...builtInCommands, ...customCommands];
    
    res.json({
      commands: allCommands,
      summary: {
        total: allCommands.length,
        builtin: builtInCommands.length,
        custom: customCommands.length,
        user: customCommands.filter(c => c.scope === 'user').length,
        project: customCommands.filter(c => c.scope === 'project').length
      }
    });
  } catch (error) {
    console.error('Failed to load system commands:', error);
    res.status(500).json({ error: 'Failed to load system commands' });
  }
});

// Get commands for a specific project or user
app.get('/api/commands/scope/:scope', async (req, res) => {
  try {
    const { scope } = req.params;
    const { projectPath } = req.query;
    
    if (!['user', 'project', 'builtin'].includes(scope)) {
      return res.status(400).json({ error: 'Invalid scope. Must be user, project, or builtin' });
    }
    
    let commands = [];
    
    if (scope === 'builtin') {
      commands = getBuiltInCommands();
    } else if (scope === 'user') {
      commands = await scanSlashCommands([]);
      commands = commands.filter(c => c.scope === 'user');
    } else if (scope === 'project') {
      if (!projectPath) {
        return res.status(400).json({ error: 'Project path is required for project scope' });
      }
      
      // Security check
      const userHome = os.homedir();
      if (!projectPath.startsWith(userHome) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
        return res.status(403).json({ error: 'Access denied to system directories' });
      }
      
      commands = await scanSlashCommands([projectPath]);
      commands = commands.filter(c => c.scope === 'project' && c.projectPath === projectPath);
    }
    
    res.json({ commands, scope, projectPath });
  } catch (error) {
    console.error('Failed to load commands for scope:', error);
    res.status(500).json({ error: 'Failed to load commands for scope' });
  }
});

// Create a new slash command template
app.post('/api/commands/template', async (req, res) => {
  try {
    const { name, description, allowedTools } = req.body;
    
    const template = createCommandTemplate(name, description, allowedTools || []);
    res.json({ template });
  } catch (error) {
    console.error('Failed to create command template:', error);
    res.status(500).json({ error: 'Failed to create command template' });
  }
});

// Save a slash command
app.post('/api/commands/save', async (req, res) => {
  try {
    const { command, scope, projectPath } = req.body;
    
    if (!command || !scope) {
      return res.status(400).json({ error: 'Command and scope are required' });
    }
    
    if (scope === 'project' && !projectPath) {
      return res.status(400).json({ error: 'Project path is required for project scope' });
    }
    
    // Security check for project path
    if (projectPath) {
      const userHome = os.homedir();
      if (!projectPath.startsWith(userHome) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
        return res.status(403).json({ error: 'Access denied to system directories' });
      }
    }
    
    // Validate the command
    const validation = validateSlashCommand(command);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid command configuration', details: validation.errors });
    }
    
    // Save the command
    const savedPath = await saveSlashCommand(command, scope, projectPath);
    
    res.json({ success: true, path: savedPath });
  } catch (error) {
    console.error('Failed to save command:', error);
    res.status(500).json({ error: 'Failed to save command' });
  }
});

// Delete a slash command
app.delete('/api/commands/:commandId', async (req, res) => {
  try {
    const { commandId } = req.params;
    const { commandPath } = req.query;
    
    if (!commandPath) {
      return res.status(400).json({ error: 'Command path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!commandPath.startsWith(userHome) && !commandPath.startsWith('/Users/') && !commandPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    await deleteSlashCommand(commandPath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete command:', error);
    res.status(500).json({ error: 'Failed to delete command' });
  }
});

// Read a specific command file
app.get('/api/commands/file', async (req, res) => {
  try {
    const { path: commandPath } = req.query;
    
    if (!commandPath) {
      return res.status(400).json({ error: 'Command path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!commandPath.startsWith(userHome) && !commandPath.startsWith('/Users/') && !commandPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const content = await fs.readFile(commandPath, 'utf-8');
    res.json({ content, path: commandPath });
  } catch (error) {
    console.error('Failed to read command file:', error);
    res.status(500).json({ error: 'Failed to read command file' });
  }
});

// Validate a slash command
app.post('/api/commands/validate', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    const validation = validateSlashCommand(command);
    res.json(validation);
  } catch (error) {
    console.error('Failed to validate command:', error);
    res.status(500).json({ error: 'Failed to validate command' });
  }
});

// Assign a command to a target scope (copy/move operation)
app.post('/api/commands/assign', async (req, res) => {
  try {
    const { id, name, description, command, scope, operation, sourcePath, targetProjectPath } = req.body;
    
    if (!id || !name || !command || !scope) {
      return res.status(400).json({ error: 'ID, name, command, and scope are required' });
    }

    if (!['copy', 'move'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be copy or move' });
    }
    
    // Create the command object
    const commandData = {
      id,
      name,
      description: description || '',
      command
    };
    
    // Save the command using the existing saveSlashCommand function
    const result = await saveSlashCommand(commandData, scope, targetProjectPath);
    
    // If operation is 'move', delete the source file
    if (operation === 'move' && sourcePath && result.success) {
      try {
        await fs.unlink(sourcePath);
      } catch (error) {
        console.warn(`Failed to delete source command file ${sourcePath}:`, error.message);
        // Don't fail the entire operation if we can't delete the source
      }
    }
    
    if (result.success) {
      res.json({ 
        success: true, 
        targetPath: result.filePath,
        operation,
        targetScope: scope
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to assign command' });
    }
  } catch (error) {
    console.error('Failed to assign command:', error);
    res.status(500).json({ error: 'Failed to assign command: ' + error.message });
  }
});

// Get effective settings for a project or user
app.get('/api/settings/effective', async (req, res) => {
  try {
    const { projectPath } = req.query;
    
    // Security check for project path
    if (projectPath) {
      const userHome = os.homedir();
      if (!projectPath.startsWith(userHome) && !projectPath.startsWith('/Users/') && !projectPath.startsWith('/home/')) {
        return res.status(403).json({ error: 'Access denied to system directories' });
      }
    }
    
    const effectiveSettings = await SettingsManager.getEffectiveSettings(projectPath);
    res.json(effectiveSettings);
  } catch (error) {
    console.error('Failed to get effective settings:', error);
    res.status(500).json({ error: 'Failed to get effective settings' });
  }
});

// Get settings for a specific file
app.get('/api/settings/file', async (req, res) => {
  try {
    const { path: settingsPath } = req.query;
    
    if (!settingsPath) {
      return res.status(400).json({ error: 'Settings path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const settings = await SettingsManager.readSettings(settingsPath);
    res.json(settings);
  } catch (error) {
    console.error('Failed to read settings file:', error);
    res.status(500).json({ error: 'Failed to read settings file' });
  }
});

// Update settings file
app.put('/api/settings/file', async (req, res) => {
  try {
    const { path: settingsPath, settings, options = {} } = req.body;
    
    if (!settingsPath || !settings) {
      return res.status(400).json({ error: 'Settings path and settings object are required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Validate settings
    const validation = SettingsManager.validateSettings(settings);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid settings configuration', 
        details: validation.errors,
        warnings: validation.warnings
      });
    }
    
    // Write settings
    const result = await SettingsManager.writeSettings(settingsPath, settings, options);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Create new settings file from template
app.post('/api/settings/template', async (req, res) => {
  try {
    const { type = 'project', settingsPath, customTemplate } = req.body;
    
    if (!settingsPath) {
      return res.status(400).json({ error: 'Settings path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    // Check if file already exists
    const exists = await SettingsManager.fileExists(settingsPath);
    if (exists) {
      return res.status(409).json({ error: 'Settings file already exists' });
    }
    
    // Create template
    const template = customTemplate || SettingsManager.createSettingsTemplate(type);
    
    // Write template to file
    const result = await SettingsManager.writeSettings(settingsPath, template, {
      createBackup: false, // No backup needed for new file
      createDirectories: true
    });
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({ ...result, template });
  } catch (error) {
    console.error('Failed to create settings template:', error);
    res.status(500).json({ error: 'Failed to create settings template' });
  }
});

// Validate settings object
app.post('/api/settings/validate', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    
    const validation = SettingsManager.validateSettings(settings);
    res.json(validation);
  } catch (error) {
    console.error('Failed to validate settings:', error);
    res.status(500).json({ error: 'Failed to validate settings' });
  }
});

// Merge settings objects
app.post('/api/settings/merge', async (req, res) => {
  try {
    const { baseSettings, overrideSettings, options = {} } = req.body;
    
    if (!baseSettings || !overrideSettings) {
      return res.status(400).json({ error: 'Base settings and override settings are required' });
    }
    
    const merged = SettingsManager.mergeSettings(baseSettings, overrideSettings, options);
    res.json({ merged });
  } catch (error) {
    console.error('Failed to merge settings:', error);
    res.status(500).json({ error: 'Failed to merge settings' });
  }
});

// List backup files for a settings file
app.get('/api/settings/backups', async (req, res) => {
  try {
    const { path: settingsPath } = req.query;
    
    if (!settingsPath) {
      return res.status(400).json({ error: 'Settings path is required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const backups = await SettingsManager.listBackups(settingsPath);
    res.json({ backups, settingsPath });
  } catch (error) {
    console.error('Failed to list backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Restore settings from backup
app.post('/api/settings/restore', async (req, res) => {
  try {
    const { backupPath, settingsPath } = req.body;
    
    if (!backupPath || !settingsPath) {
      return res.status(400).json({ error: 'Backup path and settings path are required' });
    }
    
    // Security check
    const userHome = os.homedir();
    if ((!backupPath.startsWith(userHome) && !backupPath.startsWith('/Users/') && !backupPath.startsWith('/home/')) ||
        (!settingsPath.startsWith(userHome) && !settingsPath.startsWith('/Users/') && !settingsPath.startsWith('/home/'))) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const result = await SettingsManager.restoreFromBackup(backupPath, settingsPath);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    res.status(500).json({ error: 'Failed to restore from backup' });
  }
});

// Assign settings to a target scope (copy/move operation)
app.post('/api/settings/assign', async (req, res) => {
  try {
    const { sourceType, sourceProjectPath, targetScope, targetProjectPath, operation, settings } = req.body;
    
    if (!sourceType || !targetScope || !settings) {
      return res.status(400).json({ error: 'Source type, target scope, and settings are required' });
    }

    if (!['copy', 'move'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be copy or move' });
    }
    
    // Determine target settings file path
    let targetSettingsPath;
    if (targetScope === 'user') {
      targetSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    } else if (targetScope === 'project') {
      const projectDir = targetProjectPath || process.cwd();
      targetSettingsPath = path.join(projectDir, '.claude', 'settings.json');
    } else {
      return res.status(400).json({ error: 'Target scope must be user or project' });
    }
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetSettingsPath), { recursive: true });
    
    // Read existing target settings or create empty object
    let targetSettings = {};
    try {
      const existingContent = await fs.readFile(targetSettingsPath, 'utf-8');
      targetSettings = JSON.parse(existingContent);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty object
    }
    
    // Merge the source settings into target settings
    // For simplicity, we'll do a shallow merge. In practice, you might want deep merge
    const mergedSettings = { ...targetSettings, ...settings };
    
    // Write the merged settings to target file
    await fs.writeFile(targetSettingsPath, JSON.stringify(mergedSettings, null, 2), 'utf-8');
    
    // If operation is 'move', we would need to remove from source, but settings are often shared
    // so we'll just treat move as copy for settings
    
    res.json({ 
      success: true, 
      targetPath: targetSettingsPath,
      operation,
      targetScope
    });
  } catch (error) {
    console.error('Failed to assign settings:', error);
    res.status(500).json({ error: 'Failed to assign settings: ' + error.message });
  }
});

// Save an agent
app.post('/api/agents/save', async (req, res) => {
  try {
    const { name, content, level } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    
    const agentsDir = level === 'user' 
      ? path.join(os.homedir(), '.claude', 'agents')
      : path.join(process.cwd(), '.claude', 'agents');
    
    // Ensure directory exists
    await fs.mkdir(agentsDir, { recursive: true });
    
    const filePath = path.join(agentsDir, `${name}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ success: true, filePath });
  } catch (error) {
    console.error('Failed to save agent:', error);
    res.status(500).json({ error: 'Failed to save agent' });
  }
});

// Delete an agent
app.delete('/api/agents/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { level } = req.query;
    
    const agentsDir = level === 'user'
      ? path.join(os.homedir(), '.claude', 'agents')
      : path.join(process.cwd(), '.claude', 'agents');
    
    const filePath = path.join(agentsDir, `${name}.md`);
    await fs.unlink(filePath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Assign an agent to a target scope (copy/move operation)
app.post('/api/agents/assign', async (req, res) => {
  try {
    const { name, description, tools, color, prompt, level, operation, sourcePath, targetProjectPath } = req.body;
    
    if (!name || !prompt || !level) {
      return res.status(400).json({ error: 'Name, prompt, and level are required' });
    }

    if (!['copy', 'move'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be copy or move' });
    }
    
    // Determine target directory
    let targetDir;
    if (level === 'user') {
      targetDir = path.join(os.homedir(), '.claude', 'agents');
    } else if (level === 'project') {
      if (!targetProjectPath) {
        // Use current working directory for project-level assignments
        targetDir = path.join(process.cwd(), '.claude', 'agents');
      } else {
        targetDir = path.join(targetProjectPath, '.claude', 'agents');
      }
    } else {
      return res.status(400).json({ error: 'Level must be user or project' });
    }
    
    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });
    
    // Create the agent content with YAML frontmatter
    const frontmatter = {
      name,
      description,
      ...(tools && tools.length > 0 && { tools: tools.join(', ') }),
      ...(color && { color })
    };
    
    const yamlLines = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${typeof value === 'string' && value.includes(',') ? `"${value}"` : value}`)
      .join('\n');
    
    const content = `---\n${yamlLines}\n---\n\n${prompt}`;
    
    // Write to target location
    const targetPath = path.join(targetDir, `${name}.md`);
    await fs.writeFile(targetPath, content, 'utf-8');
    
    // If operation is 'move', delete the source file
    if (operation === 'move' && sourcePath && sourcePath !== targetPath) {
      try {
        await fs.unlink(sourcePath);
      } catch (error) {
        console.warn(`Failed to delete source file ${sourcePath}:`, error.message);
        // Don't fail the entire operation if we can't delete the source
      }
    }
    
    res.json({ 
      success: true, 
      targetPath,
      operation,
      targetScope: level
    });
  } catch (error) {
    console.error('Failed to assign agent:', error);
    res.status(500).json({ error: 'Failed to assign agent: ' + error.message });
  }
});

// Search for files
app.post('/api/files/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Search in current directory and subdirectories for .md files
    const searchResults = [];
    
    async function searchDirectory(dir, depth = 0) {
      if (depth > 3) return; // Limit search depth
      
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(process.cwd(), fullPath);
          
          if (entry.isFile() && entry.name.endsWith('.md')) {
            if (entry.name.toLowerCase().includes(query.toLowerCase()) ||
                relativePath.toLowerCase().includes(query.toLowerCase())) {
              searchResults.push({
                name: entry.name,
                path: relativePath,
                fullPath
              });
            }
          } else if (entry.isDirectory() && !entry.name.startsWith('.') && 
                     entry.name !== 'node_modules') {
            await searchDirectory(fullPath, depth + 1);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    await searchDirectory(process.cwd());
    
    res.json(searchResults);
  } catch (error) {
    console.error('Failed to search files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
});

// Read a specific file
app.post('/api/files/read', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Resolve the full path and ensure it's within allowed directories
    const fullPath = path.resolve(filePath);
    const cwd = process.cwd();
    const userHome = os.homedir();
    
    // Security check: only allow reading files within project or user .claude directory
    if (!fullPath.startsWith(cwd) && 
        !fullPath.startsWith(path.join(userHome, '.claude'))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Failed to read file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Browse directories and files
app.post('/api/files/browse', async (req, res) => {
  try {
    const { dirPath } = req.body;
    const targetPath = dirPath || os.homedir(); // Start from user home directory
    
    // Resolve the full path
    const fullPath = path.resolve(targetPath);
    
    // Basic security: prevent going above root and accessing system directories
    const userHome = os.homedir();
    const isInUserArea = fullPath.startsWith(userHome) || fullPath.startsWith('/Users/') || fullPath.startsWith('/home/');
    const isSafeSystemPath = ['/Applications', '/System/Applications'].some(p => fullPath.startsWith(p));
    
    if (!isInUserArea && !isSafeSystemPath && fullPath !== '/' && !fullPath.startsWith('/Volumes')) {
      return res.status(403).json({ error: 'Access denied to system directories' });
    }
    
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const items = [];
    
    // Add parent directory option if not at root
    if (fullPath !== '/' && path.dirname(fullPath) !== fullPath) {
      items.push({
        name: '..',
        type: 'directory',
        path: path.dirname(fullPath)
      });
    }
    
    // Add directories first, then files (include dot directories)
    const directories = entries.filter(entry => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry => ({
        name: entry.name,
        type: 'directory',
        path: path.join(fullPath, entry.name)
      }));
    
    const files = entries.filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(entry => ({
        name: entry.name,
        type: 'file',
        path: path.join(fullPath, entry.name),
        relativePath: path.relative(process.cwd(), path.join(fullPath, entry.name))
      }));
    
    items.push(...directories, ...files);
    
    res.json({
      currentPath: fullPath,
      relativePath: fullPath.replace(userHome, '~'),
      items
    });
  } catch (error) {
    console.error('Failed to browse directory:', error);
    res.status(500).json({ error: 'Failed to browse directory' });
  }
});

// Get available MCP servers from Claude config
app.get('/api/mcp-servers', async (req, res) => {
  try {
    // Load Claude Desktop MCP configuration
    const claudeConfigPath = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
    const claudeSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    
    let mcpServers = [];
    let permissions = [];
    
    // Read permissions from Claude settings
    try {
      const settingsContent = await fs.readFile(claudeSettingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);
      
      if (settings.permissions && settings.permissions.allow) {
        permissions = settings.permissions.allow.filter(permission => permission.startsWith('mcp__'));
      }
    } catch (error) {
      console.warn('Could not read Claude settings:', error.message);
    }

    // Query actual MCP servers for their tools
    try {
      const configContent = await fs.readFile(claudeConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      if (config.mcpServers) {
        for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
          try {
            // Only include tools that are actually in the permissions
            if (serverName === 'mcphub') {
              // Only show tools that the user has explicitly granted permissions for
              const mcpToolPermissions = permissions.filter(permission => 
                permission.startsWith('mcp__mcphub__')
              );
              
              mcpToolPermissions.forEach(permission => {
                const toolName = permission.replace('mcp__mcphub__', '');
                
                mcpServers.push({
                  id: permission,
                  name: toolName,
                  displayName: toolName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  server: serverName,
                  permitted: true,
                  description: `${toolName} tool from MCPHub`
                });
              });
            }
          } catch (serverError) {
            console.warn(`Failed to query MCP server ${serverName}:`, serverError.message);
          }
        }
      }
    } catch (error) {
      console.warn('Could not read Claude Desktop config:', error.message);
      
      // Fallback to permissions-only approach
      permissions.forEach(permission => {
        const parts = permission.split('__');
        if (parts.length >= 3) {
          const toolName = parts[2];
          const serverName = parts[1];
          
          mcpServers.push({
            id: permission,
            name: toolName,
            displayName: toolName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            server: serverName,
            permitted: true,
            description: `${toolName} tool from ${serverName}`
          });
        }
      });
    }
    
    // Add default Claude Code tools
    const defaultTools = [
      'Task', 'Bash', 'Glob', 'Grep', 'LS', 'ExitPlanMode',
      'Read', 'Edit', 'MultiEdit', 'Write', 'NotebookRead', 
      'NotebookEdit', 'WebFetch', 'TodoWrite', 'WebSearch'
    ];
    
    res.json({
      mcpServers,
      defaultTools
    });
  } catch (error) {
    console.error('Failed to get MCP servers:', error);
    res.status(500).json({ error: 'Failed to get MCP servers' });
  }
});

// Handle any other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;