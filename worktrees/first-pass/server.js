import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

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

// Helper function to scan directory for .md files
async function scanAgentDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const agents = [];
    for (const file of mdFiles) {
      try {
        const filePath = path.join(dirPath, file);
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
    
    return agents;
  } catch (error) {
    console.warn(`Failed to scan directory ${dirPath}:`, error.message);
    return [];
  }
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

// Get project-level agents  
app.get('/api/agents/project', async (req, res) => {
  try {
    const projectAgentsDir = path.join(process.cwd(), '.claude', 'agents');
    const agents = await scanAgentDirectory(projectAgentsDir);
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