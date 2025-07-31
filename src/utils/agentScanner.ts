import readdirp, { readdirpPromise, ReaddirpStream, EntryInfo } from 'readdirp';
import path from 'path';

/**
 * Result object for each agent file found
 */
export interface AgentFileResult {
  /** Absolute path to the agent file */
  file: string;
  /** The root directory where scanning started */
  origin: string;
}

/**
 * Options for scanning agent files
 */
export interface AgentScanOptions {
  /** Optional abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Async generator that yields agent files found in the given root directories.
 * Uses readdirp in stream mode for efficient memory usage.
 * 
 * @param roots Array of root directories to scan
 * @param options Optional scan options
 * @yields {AgentFileResult} Objects containing file path and origin
 * 
 * @example
 * ```typescript
 * for await (const result of scanAgentFiles(['/home/user', '/project'])) {
 *   console.log(`Found agent: ${result.file} from ${result.origin}`);
 * }
 * ```
 */
export async function* scanAgentFiles(
  roots: string[], 
  options?: AgentScanOptions
): AsyncIterable<AgentFileResult> {
  for (const root of roots) {
    let stream: ReaddirpStream | null = null;
    
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
 * @param roots Array of root directories to scan
 * @param options Optional scan options
 * @returns Promise resolving to array of agent file results
 * 
 * @example
 * ```typescript
 * const agents = await scanAgentFilesArray(['/home/user', '/project']);
 * console.log(`Found ${agents.length} agent files`);
 * ```
 */
export async function scanAgentFilesArray(
  roots: string[], 
  options?: AgentScanOptions
): Promise<AgentFileResult[]> {
  const results: AgentFileResult[] = [];
  
  for (const root of roots) {
    try {
      // Use readdirpPromise for array-based results (readdirp v4 API)
      const entries = await readdirpPromise(root, {
        fileFilter: (entry) => entry.basename.endsWith('.md'),
        directoryFilter: (entry) => !['node_modules', '.git'].includes(entry.basename),
        type: 'files',
        depth: 100  // Ensure we scan deep enough for nested .claude/agents directories
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
 * @returns AbortController instance
 * 
 * @example
 * ```typescript
 * const controller = createScanController();
 * 
 * // Start scanning
 * const scanPromise = scanAgentFilesArray(['/path'], { signal: controller.signal });
 * 
 * // Cancel after 5 seconds
 * setTimeout(() => controller.abort(), 5000);
 * ```
 */
export function createScanController(): AbortController {
  return new AbortController();
}