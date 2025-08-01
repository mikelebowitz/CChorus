import readdirp, { readdirpPromise } from 'readdirp';
import path from 'path';

/**
 * Async generator that yields agent files found in the given root directories.
 * Uses readdirp in stream mode for efficient memory usage.
 * 
 * @param {string[]} roots - Array of root directories to scan
 * @param {Object} [options] - Optional scan options
 * @param {AbortSignal} [options.signal] - Optional abort signal for cancellation
 * @yields {{file: string, origin: string}} Objects containing file path and origin
 */
export async function* scanAgentFiles(roots, options) {
  for (const root of roots) {
    let stream = null;
    
    try {
      // Create readdirp stream with filters
      // Note: In readdirp v4, string filters only match exact filenames, not globs
      stream = readdirp(root, {
        fileFilter: (entry) => entry.basename.endsWith('.md'),
        directoryFilter: (entry) => !['node_modules', '.git'].includes(entry.basename),
        type: 'files',
        depth: 100  // Ensure we scan deep enough for nested .claude/agents directories
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
        // Check if the file is under a .claude/agents/ path
        const relativePath = entry.path;
        const fullPath = entry.fullPath;
        
        // Check if the path contains .claude/agents/
        if (relativePath.includes('.claude/agents/') || 
            relativePath.includes('.claude\\agents\\')) {
          yield {
            file: fullPath,
            origin: root
          };
        }
      }
    } catch (error) {
      // Log error but continue with other roots
      console.error(`Error scanning directory ${root}:`, error);
      
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
 * Promise-based variant that returns an array of all agent files found.
 * Useful when you need all results at once rather than streaming.
 * 
 * @param {string[]} roots - Array of root directories to scan
 * @param {Object} [options] - Optional scan options
 * @param {AbortSignal} [options.signal] - Optional abort signal for cancellation
 * @returns {Promise<{file: string, origin: string}[]>} Promise resolving to array of agent file results
 */
export async function scanAgentFilesArray(roots, options) {
  const results = [];
  
  for (const root of roots) {
    try {
      // Use readdirpPromise for array-based results (readdirp v4 API)
      const entries = await readdirpPromise(root, {
        fileFilter: (entry) => entry.basename.endsWith('.md'),
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

      // Filter entries that are under .claude/agents/
      for (const entry of entries) {
        const relativePath = entry.path;
        const fullPath = entry.fullPath;
        
        if (relativePath.includes('.claude/agents/') || 
            relativePath.includes('.claude\\agents\\')) {
          results.push({
            file: fullPath,
            origin: root
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${root}:`, error);
      
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
 * Utility function to create an AbortController for cancelling scans
 * 
 * @returns {AbortController} AbortController instance
 */
export function createScanController() {
  return new AbortController();
}