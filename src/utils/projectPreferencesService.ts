/**
 * Service for managing user preferences for projects (archive, hide, etc.)
 * Uses localStorage for persistence and integrates with CacheService
 */

export interface ProjectPreferences {
  archived: boolean;
  hidden: boolean;
  favorited: boolean;
  lastViewed?: Date;
  customName?: string;
  tags?: string[];
}

export interface ProjectPreferencesMap {
  [projectPath: string]: ProjectPreferences;
}

export class ProjectPreferencesService {
  private static readonly PREFERENCES_KEY = 'project_preferences';
  private static readonly VERSION = '1.0';

  /**
   * Get preferences for a specific project
   */
  static getProjectPreferences(projectPath: string): ProjectPreferences {
    const allPreferences = this.getAllPreferences();
    return allPreferences[projectPath] || {
      archived: false,
      hidden: false,
      favorited: false,
    };
  }

  /**
   * Update preferences for a specific project
   */
  static updateProjectPreferences(projectPath: string, preferences: Partial<ProjectPreferences>): void {
    const allPreferences = this.getAllPreferences();
    const currentPreferences = allPreferences[projectPath] || {
      archived: false,
      hidden: false,
      favorited: false,
    };

    allPreferences[projectPath] = {
      ...currentPreferences,
      ...preferences,
    };

    this.saveAllPreferences(allPreferences);
  }

  /**
   * Archive a project
   */
  static archiveProject(projectPath: string): void {
    this.updateProjectPreferences(projectPath, { archived: true });
  }

  /**
   * Unarchive a project
   */
  static unarchiveProject(projectPath: string): void {
    this.updateProjectPreferences(projectPath, { archived: false });
  }

  /**
   * Hide a project
   */
  static hideProject(projectPath: string): void {
    this.updateProjectPreferences(projectPath, { hidden: true });
  }

  /**
   * Show a project
   */
  static showProject(projectPath: string): void {
    this.updateProjectPreferences(projectPath, { hidden: false });
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(projectPath: string): boolean {
    const preferences = this.getProjectPreferences(projectPath);
    const newFavoriteStatus = !preferences.favorited;
    this.updateProjectPreferences(projectPath, { favorited: newFavoriteStatus });
    return newFavoriteStatus;
  }

  /**
   * Mark project as viewed (updates lastViewed timestamp)
   */
  static markAsViewed(projectPath: string): void {
    this.updateProjectPreferences(projectPath, { lastViewed: new Date() });
  }

  /**
   * Get all archived projects
   */
  static getArchivedProjects(): string[] {
    const allPreferences = this.getAllPreferences();
    return Object.keys(allPreferences).filter(path => allPreferences[path].archived);
  }

  /**
   * Get all hidden projects
   */
  static getHiddenProjects(): string[] {
    const allPreferences = this.getAllPreferences();
    return Object.keys(allPreferences).filter(path => allPreferences[path].hidden);
  }

  /**
   * Get all favorited projects
   */
  static getFavoritedProjects(): string[] {
    const allPreferences = this.getAllPreferences();
    return Object.keys(allPreferences).filter(path => allPreferences[path].favorited);
  }

  /**
   * Bulk archive multiple projects
   */
  static archiveMultipleProjects(projectPaths: string[]): void {
    const allPreferences = this.getAllPreferences();
    
    for (const projectPath of projectPaths) {
      const currentPreferences = allPreferences[projectPath] || {
        archived: false,
        hidden: false,
        favorited: false,
      };
      allPreferences[projectPath] = {
        ...currentPreferences,
        archived: true,
      };
    }

    this.saveAllPreferences(allPreferences);
  }

  /**
   * Bulk unarchive multiple projects
   */
  static unarchiveMultipleProjects(projectPaths: string[]): void {
    const allPreferences = this.getAllPreferences();
    
    for (const projectPath of projectPaths) {
      if (allPreferences[projectPath]) {
        allPreferences[projectPath].archived = false;
      }
    }

    this.saveAllPreferences(allPreferences);
  }

  /**
   * Clean up preferences for projects that no longer exist
   */
  static cleanupPreferences(existingProjectPaths: string[]): void {
    const allPreferences = this.getAllPreferences();
    const existingPathsSet = new Set(existingProjectPaths);
    
    // Remove preferences for projects that no longer exist
    const cleanedPreferences: ProjectPreferencesMap = {};
    for (const [path, prefs] of Object.entries(allPreferences)) {
      if (existingPathsSet.has(path)) {
        cleanedPreferences[path] = prefs;
      }
    }

    this.saveAllPreferences(cleanedPreferences);
  }

  /**
   * Export preferences for backup
   */
  static exportPreferences(): string {
    const allPreferences = this.getAllPreferences();
    return JSON.stringify({
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      preferences: allPreferences,
    }, null, 2);
  }

  /**
   * Import preferences from backup
   */
  static importPreferences(jsonString: string): boolean {
    try {
      const importData = JSON.parse(jsonString);
      
      if (importData.version !== this.VERSION) {
        console.warn('Preferences version mismatch, attempting import anyway');
      }

      if (importData.preferences && typeof importData.preferences === 'object') {
        this.saveAllPreferences(importData.preferences);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  /**
   * Clear all preferences
   */
  static clearAllPreferences(): void {
    localStorage.removeItem(this.PREFERENCES_KEY);
  }

  /**
   * Get usage statistics
   */
  static getUsageStats(): {
    totalProjects: number;
    archivedCount: number;
    hiddenCount: number;
    favoritedCount: number;
  } {
    const allPreferences = this.getAllPreferences();
    const totalProjects = Object.keys(allPreferences).length;
    
    let archivedCount = 0;
    let hiddenCount = 0;
    let favoritedCount = 0;

    for (const preferences of Object.values(allPreferences)) {
      if (preferences.archived) archivedCount++;
      if (preferences.hidden) hiddenCount++;
      if (preferences.favorited) favoritedCount++;
    }

    return {
      totalProjects,
      archivedCount,
      hiddenCount,
      favoritedCount,
    };
  }

  /**
   * Private method to get all preferences from localStorage
   */
  private static getAllPreferences(): ProjectPreferencesMap {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      return parsed || {};
    } catch (error) {
      console.error('Failed to load project preferences:', error);
      return {};
    }
  }

  /**
   * Private method to save all preferences to localStorage
   */
  private static saveAllPreferences(preferences: ProjectPreferencesMap): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save project preferences:', error);
    }
  }
}