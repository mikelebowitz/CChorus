/**
 * Client-side caching service using localStorage
 * Provides instant loading with background refresh capabilities
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export interface CacheOptions {
  ttlMs?: number; // Time to live in milliseconds
  version?: string;
  key: string;
}

export class CacheService {
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly VERSION = '1.0.0';

  /**
   * Store data in cache
   */
  static set<T>(key: string, data: T, options?: Partial<CacheOptions>): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: options?.version || this.VERSION
      };

      localStorage.setItem(`cchorus_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Get data from cache
   */
  static get<T>(key: string, options?: Partial<CacheOptions>): T | null {
    try {
      const cached = localStorage.getItem(`cchorus_cache_${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check version compatibility
      if (entry.version !== (options?.version || this.VERSION)) {
        this.remove(key);
        return null;
      }

      // Check TTL
      const ttl = options?.ttlMs || this.DEFAULT_TTL;
      if (Date.now() - entry.timestamp > ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      this.remove(key);
      return null;
    }
  }

  /**
   * Check if cache is stale (exists but should be refreshed)
   */
  static isStale(key: string, refreshThresholdMs: number = 5 * 60 * 1000): boolean {
    try {
      const cached = localStorage.getItem(`cchorus_cache_${key}`);
      if (!cached) return false;

      const entry: CacheEntry<any> = JSON.parse(cached);
      return (Date.now() - entry.timestamp) > refreshThresholdMs;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove specific cache entry
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(`cchorus_cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache entry:', error);
    }
  }

  /**
   * Clear all CChorus cache entries
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cchorus_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): { totalEntries: number; totalSize: number; entries: { key: string; age: number; size: number }[] } {
    const stats = {
      totalEntries: 0,
      totalSize: 0,
      entries: [] as { key: string; age: number; size: number }[]
    };

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cchorus_cache_')) {
          const value = localStorage.getItem(key);
          if (value) {
            const size = new Blob([value]).size;
            stats.totalSize += size;
            stats.totalEntries++;
            
            try {
              const entry: CacheEntry<any> = JSON.parse(value);
              stats.entries.push({
                key: key.replace('cchorus_cache_', ''),
                age: Date.now() - entry.timestamp,
                size
              });
            } catch (e) {
              // Skip malformed entries
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return stats;
  }
}