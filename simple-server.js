import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Get user agents from ~/.claude/agents/
app.get('/api/agents/user', async (req, res) => {
  try {
    const userAgentsDir = path.join(os.homedir(), '.claude', 'agents');
    console.log('Reading user agents from:', userAgentsDir);
    
    const files = await fs.readdir(userAgentsDir);
    const agents = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        try {
          const filePath = path.join(userAgentsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          agents.push({
            name: path.basename(file, '.md'),
            filePath,
            content
          });
        } catch (error) {
          console.warn(`Failed to read ${file}:`, error.message);
        }
      }
    }
    
    console.log(`Found ${agents.length} user agents`);
    res.json(agents);
  } catch (error) {
    console.error('Failed to load user agents:', error);
    res.status(500).json({ error: 'Failed to load user agents' });
  }
});

// Get project agents from .claude/agents/
app.get('/api/agents/project', async (req, res) => {
  try {
    const projectAgentsDir = path.join(process.cwd(), '.claude', 'agents');
    console.log('Reading project agents from:', projectAgentsDir);
    
    const files = await fs.readdir(projectAgentsDir);
    const agents = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        try {
          const filePath = path.join(projectAgentsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          agents.push({
            name: path.basename(file, '.md'),
            filePath,
            content
          });
        } catch (error) {
          console.warn(`Failed to read ${file}:`, error.message);
        }
      }
    }
    
    console.log(`Found ${agents.length} project agents`);
    res.json(agents);
  } catch (error) {
    console.error('Failed to load project agents:', error);
    res.status(500).json({ error: 'Failed to load project agents' });
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
    
    console.log(`Agent saved: ${filePath}`);
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
    
    console.log(`Agent deleted: ${filePath}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Read a specific file
app.post('/api/files/read', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    console.error('Failed to read file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Browse files (simplified)
app.post('/api/files/browse', async (req, res) => {
  try {
    const { dirPath } = req.body;
    const targetPath = dirPath || os.homedir();
    
    const entries = await fs.readdir(targetPath, { withFileTypes: true });
    
    const items = [];
    
    // Add parent directory if not at root
    if (targetPath !== '/' && path.dirname(targetPath) !== targetPath) {
      items.push({
        name: '..',
        type: 'directory',
        path: path.dirname(targetPath)
      });
    }
    
    // Add directories and files
    const directories = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        type: 'directory',
        path: path.join(targetPath, entry.name)
      }));
    
    const files = entries.filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => ({
        name: entry.name,
        type: 'file',
        path: path.join(targetPath, entry.name),
        relativePath: path.relative(process.cwd(), path.join(targetPath, entry.name))
      }));
    
    items.push(...directories, ...files);
    
    res.json({
      currentPath: targetPath,
      relativePath: targetPath.replace(os.homedir(), '~'),
      items
    });
  } catch (error) {
    console.error('Failed to browse directory:', error);
    res.status(500).json({ error: 'Failed to browse directory' });
  }
});

// Get MCP servers from Claude config
app.get('/api/mcp-servers', async (req, res) => {
  try {
    const claudeSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    let mcpServers = [];
    
    try {
      const settingsContent = await fs.readFile(claudeSettingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);
      
      if (settings.permissions && settings.permissions.allow) {
        mcpServers = settings.permissions.allow
          .filter(permission => permission.startsWith('mcp__'))
          .map(permission => {
            const parts = permission.split('__');
            if (parts.length >= 3) {
              const fullToolName = parts[2];
              const serverName = parts[1];
              
              let toolName = fullToolName;
              if (fullToolName.includes('-')) {
                const toolParts = fullToolName.split('-');
                if (toolParts.length >= 2 && toolParts[0] === toolParts[toolParts.length - 1]) {
                  toolName = toolParts.slice(0, -1).join('-');
                }
              }
              
              return {
                id: permission,
                name: toolName,
                displayName: toolName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                server: serverName
              };
            }
            return {
              id: permission,
              name: permission.replace('mcp__', ''),
              displayName: permission.replace('mcp__', '').replace(/[-_]/g, ' '),
              server: 'unknown'
            };
          });
      }
    } catch (error) {
      console.warn('Could not read Claude settings:', error.message);
    }
    
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/test`);
  console.log(`  GET  /api/agents/user`);
  console.log(`  GET  /api/agents/project`);
  console.log(`  POST /api/agents/save`);
  console.log(`  DELETE /api/agents/:name`);
  console.log(`  POST /api/files/read`);
  console.log(`  POST /api/files/browse`);
  console.log(`  GET  /api/mcp-servers`);
});