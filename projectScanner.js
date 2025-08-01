import readdirp, { readdirpPromise } from 'readdirp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Async generator that yields Claude Code projects (directories with CLAUDE.md files) found in the given root directories.
 * Uses readdirp in stream mode for efficient memory usage.
 * 
 * @param {string[]} roots - Array of root directories to scan
 * @param {Object} [options] - Optional scan options
 * @param {AbortSignal} [options.signal] - Optional abort signal for cancellation
 * @yields {{file: string, origin: string, projectPath: string}} Objects containing CLAUDE.md file path, scan origin, and project directory
 */
export async function* scanClaudeProjects(roots, options) {
  for (const root of roots) {
    let stream = null;
    
    try {
      // Create readdirp stream with filters for CLAUDE.md files
      stream = readdirp(root, {
        fileFilter: (entry) => entry.basename === 'CLAUDE.md',
        directoryFilter: (entry) => !['node_modules', '.git', 'dist', 'build'].includes(entry.basename),
        type: 'files',
        depth: 5  // Limit depth to avoid performance issues
      });

      // Handle abort signal if provided
      if (options?.signal) {
        const abortHandler = () => {
          if (stream) {
            stream.destroy();
          }
        };
        options.signal.addEventListener('abort', abortHandler, { once: true });
      }

      // Process entries from the stream
      for await (const entry of stream) {
        const claudeMdPath = entry.fullPath;
        const projectPath = path.dirname(claudeMdPath);
        
        yield {
          file: claudeMdPath,
          origin: root,
          projectPath: projectPath
        };
      }
    } catch (error) {
      // Log error but continue with other roots
      console.error(`Error scanning directory ${root} for Claude projects:`, error);
      
      // Re-throw if it's an abort error
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
    } finally {
      // Ensure stream is destroyed
      if (stream && !stream.destroyed) {
        stream.destroy();
      }
    }
  }
}

/**
 * Promise-based variant that returns an array of all Claude Code projects found.
 * Useful when you need all results at once rather than streaming.
 * 
 * @param {string[]} roots - Array of root directories to scan
 * @param {Object} [options] - Optional scan options
 * @param {AbortSignal} [options.signal] - Optional abort signal for cancellation
 * @returns {Promise<{file: string, origin: string, projectPath: string}[]>} Promise resolving to array of project results
 */
export async function scanClaudeProjectsArray(roots, options) {
  const results = [];
  
  for (const root of roots) {
    try {
      // Use readdirpPromise for array-based results (readdirp v4 API)
      const entries = await readdirpPromise(root, {
        fileFilter: (entry) => entry.basename === 'CLAUDE.md',
        directoryFilter: (entry) => {
          const excluded = [
            'node_modules', '.git', 'dist', 'build',
            // System directories that often cause issues
            'Library', '.Trash', 'Applications', 'System',
            // Common problematic directories
            '.npm', '.cache', '.local', '.config',
            'target', 'bin', 'obj', '.vs', '.vscode',
            // Temp and log directories
            'tmp', 'temp', 'logs', 'log'
          ];
          
          return !excluded.includes(entry.basename);
        },
        type: 'files',
        depth: 5  // Limit depth to avoid performance issues
      });

      // Check abort signal
      if (options?.signal?.aborted) {
        throw new Error('Scan aborted');
      }

      // Process entries
      for (const entry of entries) {
        const claudeMdPath = entry.fullPath;
        const projectPath = path.dirname(claudeMdPath);
        
        results.push({
          file: claudeMdPath,
          origin: root,
          projectPath: projectPath
        });
      }
    } catch (error) {
      console.error(`Error scanning directory ${root} for Claude projects:`, error);
      
      // Re-throw abort errors
      if (error instanceof Error && 
          (error.name === 'AbortError' || error.message === 'Scan aborted')) {
        throw error;
      }
      // Continue with other roots for non-abort errors
    }
  }
  
  return results;
}

/**
 * Extract project information from a Claude Code project directory
 * 
 * @param {string} projectPath - Path to the project directory
 * @param {string} claudeMdPath - Path to the CLAUDE.md file
 * @returns {Promise<Object>} Project information object
 */
export async function extractProjectInfo(projectPath, claudeMdPath) {
  try {
    const projectName = path.basename(projectPath);
    const stats = await fs.stat(claudeMdPath);
    
    // Read CLAUDE.md content to extract description/summary
    let content = '';
    let description = '';
    try {
      content = await fs.readFile(claudeMdPath, 'utf-8');
      
      // Try to extract a description from the first few lines
      const lines = content.split('\n').filter(line => line.trim());
      for (const line of lines.slice(0, 10)) { // Check first 10 non-empty lines
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
          continue; // Skip headers
        }
        if (trimmed.length > 20 && !trimmed.startsWith('```')) {
          description = trimmed.substring(0, 200); // First good description line, max 200 chars
          if (description.length === 200) {
            description += '...';
          }
          break;
        }
      }
    } catch (readError) {
      console.warn(`Could not read CLAUDE.md content from ${claudeMdPath}:`, readError.message);
    }
    
    // Check if project has .claude directory structure
    const claudeDir = path.join(projectPath, '.claude');
    const agentsDir = path.join(claudeDir, 'agents');
    const commandsDir = path.join(claudeDir, 'commands');
    
    let hasAgents = false;
    let hasCommands = false;
    let agentCount = 0;
    let commandCount = 0;
    
    try {
      const agentStats = await fs.stat(agentsDir);
      if (agentStats.isDirectory()) {
        hasAgents = true;
        const agentFiles = await fs.readdir(agentsDir);
        agentCount = agentFiles.filter(file => file.endsWith('.md')).length;
      }
    } catch (e) {
      // Directory doesn't exist, which is fine
    }
    
    try {
      const commandStats = await fs.stat(commandsDir);
      if (commandStats.isDirectory()) {
        hasCommands = true;
        const commandFiles = await fs.readdir(commandsDir);
        commandCount = commandFiles.filter(file => file.endsWith('.md')).length;
      }
    } catch (e) {
      // Directory doesn't exist, which is fine
    }
    
    // Check if it's a git repository
    let isGitRepo = false;
    try {
      const gitDir = path.join(projectPath, '.git');
      const gitStats = await fs.stat(gitDir);
      isGitRepo = gitStats.isDirectory();
    } catch (e) {
      // Not a git repo, which is fine
    }
    
    return {
      name: projectName,
      path: projectPath,
      claudeMdPath: claudeMdPath,
      description: description || `Claude Code project: ${projectName}`,
      lastModified: stats.mtime,
      hasAgents,
      hasCommands,
      agentCount,
      commandCount,
      isGitRepo,
      contentPreview: content.substring(0, 500), // First 500 chars for preview
      size: stats.size
    };
  } catch (error) {
    console.error(`Error extracting project info for ${projectPath}:`, error);
    
    // Return minimal info even on error
    return {
      name: path.basename(projectPath),
      path: projectPath,
      claudeMdPath: claudeMdPath,
      description: `Claude Code project: ${path.basename(projectPath)}`,
      lastModified: new Date(),
      hasAgents: false,
      hasCommands: false,
      agentCount: 0,
      commandCount: 0,
      isGitRepo: false,
      contentPreview: '',
      size: 0,
      error: error.message
    };
  }
}

/**
 * Utility function to create an AbortController for cancelling scans
 * 
 * @returns {AbortController} AbortController instance
 */
export function createProjectScanController() {
  return new AbortController();
}