import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Manages Claude Code settings files with safe read/write operations
 */
export class SettingsManager {
  
  /**
   * Gets the standard settings file paths for a project or user
   * 
   * @param {string} projectPath - Project path (optional, if null returns user settings)
   * @returns {Object} Object with paths to different settings files
   */
  static getSettingsPaths(projectPath = null) {
    const userSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
    
    if (!projectPath) {
      return {
        user: userSettingsPath,
        project: null,
        local: null
      };
    }
    
    const projectSettingsPath = path.join(projectPath, '.claude', 'settings.json');
    const localSettingsPath = path.join(projectPath, '.claude', 'settings.local.json');
    
    return {
      user: userSettingsPath,
      project: projectSettingsPath,
      local: localSettingsPath
    };
  }
  
  /**
   * Reads a settings file safely with error handling
   * 
   * @param {string} settingsPath - Path to the settings file
   * @returns {Promise<Object>} Settings object with metadata
   */
  static async readSettings(settingsPath) {
    try {
      // Check if file exists
      const exists = await this.fileExists(settingsPath);
      if (!exists) {
        return {
          path: settingsPath,
          content: {},
          exists: false,
          lastModified: new Date(),
          error: null
        };
      }
      
      // Read and parse the file
      const content = await fs.readFile(settingsPath, 'utf-8');
      const stats = await fs.stat(settingsPath);
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        return {
          path: settingsPath,
          content: {},
          exists: true,
          lastModified: stats.mtime,
          error: `JSON parse error: ${parseError.message}`,
          rawContent: content
        };
      }
      
      return {
        path: settingsPath,
        content: parsedContent,
        exists: true,
        lastModified: stats.mtime,
        size: stats.size,
        error: null
      };
      
    } catch (error) {
      return {
        path: settingsPath,
        content: {},
        exists: false,
        lastModified: new Date(),
        error: error.message
      };
    }
  }
  
  /**
   * Writes settings to a file safely with backup and validation
   * 
   * @param {string} settingsPath - Path to the settings file
   * @param {Object} settings - Settings object to write
   * @param {Object} options - Options for writing
   * @returns {Promise<Object>} Result of the write operation
   */
  static async writeSettings(settingsPath, settings, options = {}) {
    const {
      createBackup = true,
      validateJson = true,
      createDirectories = true
    } = options;
    
    try {
      // Validate that settings is a valid object
      if (typeof settings !== 'object' || settings === null) {
        throw new Error('Settings must be a valid object');
      }
      
      // Validate JSON serializability
      let jsonContent;
      try {
        jsonContent = JSON.stringify(settings, null, 2);
      } catch (jsonError) {
        throw new Error(`Settings object is not JSON serializable: ${jsonError.message}`);
      }
      
      // Validate JSON if requested
      if (validateJson) {
        try {
          JSON.parse(jsonContent);
        } catch (validateError) {
          throw new Error(`Generated JSON is invalid: ${validateError.message}`);
        }
      }
      
      // Create directories if needed
      if (createDirectories) {
        const dir = path.dirname(settingsPath);
        await fs.mkdir(dir, { recursive: true });
      }
      
      // Create backup if file exists and backup is requested
      let backupPath = null;
      if (createBackup && await this.fileExists(settingsPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        backupPath = `${settingsPath}.backup.${timestamp}`;
        
        try {
          await fs.copyFile(settingsPath, backupPath);
        } catch (backupError) {
          console.warn(`Could not create backup: ${backupError.message}`);
          // Continue with write operation even if backup fails
        }
      }
      
      // Write the file
      await fs.writeFile(settingsPath, jsonContent, 'utf-8');
      
      // Verify the write by reading back
      const verification = await this.readSettings(settingsPath);
      if (verification.error) {
        throw new Error(`Write verification failed: ${verification.error}`);
      }
      
      return {
        success: true,
        path: settingsPath,
        backupPath: backupPath,
        size: jsonContent.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        path: settingsPath,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Merges settings objects with proper conflict resolution
   * 
   * @param {Object} baseSettings - Base settings object
   * @param {Object} overrideSettings - Settings to merge in
   * @param {Object} options - Merge options
   * @returns {Object} Merged settings object
   */
  static mergeSettings(baseSettings, overrideSettings, options = {}) {
    const {
      deepMerge = true,
      arrayMergeStrategy = 'replace' // 'replace', 'concat', 'unique'
    } = options;
    
    if (!deepMerge) {
      return { ...baseSettings, ...overrideSettings };
    }
    
    const result = JSON.parse(JSON.stringify(baseSettings)); // Deep clone
    
    function deepMergeObjects(target, source) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] === null || source[key] === undefined) {
            target[key] = source[key];
          } else if (Array.isArray(source[key])) {
            if (arrayMergeStrategy === 'replace') {
              target[key] = [...source[key]];
            } else if (arrayMergeStrategy === 'concat') {
              target[key] = [...(target[key] || []), ...source[key]];
            } else if (arrayMergeStrategy === 'unique') {
              const combined = [...(target[key] || []), ...source[key]];
              target[key] = [...new Set(combined)];
            }
          } else if (typeof source[key] === 'object') {
            target[key] = target[key] || {};
            deepMergeObjects(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    }
    
    deepMergeObjects(result, overrideSettings);
    return result;
  }
  
  /**
   * Gets the effective settings by merging user, project, and local settings
   * 
   * @param {string} projectPath - Project path (optional)
   * @returns {Promise<Object>} Effective settings with source information
   */
  static async getEffectiveSettings(projectPath = null) {
    const paths = this.getSettingsPaths(projectPath);
    
    // Read all settings files
    const userSettings = await this.readSettings(paths.user);
    let projectSettings = { content: {}, exists: false };
    let localSettings = { content: {}, exists: false };
    
    if (paths.project) {
      projectSettings = await this.readSettings(paths.project);
    }
    
    if (paths.local) {
      localSettings = await this.readSettings(paths.local);
    }
    
    // Merge settings in priority order: user < project < local
    let effectiveSettings = {};
    
    if (userSettings.exists && !userSettings.error) {
      effectiveSettings = this.mergeSettings(effectiveSettings, userSettings.content);
    }
    
    if (projectSettings.exists && !projectSettings.error) {
      effectiveSettings = this.mergeSettings(effectiveSettings, projectSettings.content);
    }
    
    if (localSettings.exists && !localSettings.error) {
      effectiveSettings = this.mergeSettings(effectiveSettings, localSettings.content);
    }
    
    return {
      effective: effectiveSettings,
      sources: {
        user: userSettings,
        project: projectSettings,
        local: localSettings
      },
      projectPath: projectPath
    };
  }
  
  /**
   * Validates a settings object against common patterns
   * 
   * @param {Object} settings - Settings object to validate
   * @returns {Object} Validation result
   */
  static validateSettings(settings) {
    const errors = [];
    const warnings = [];
    
    if (typeof settings !== 'object' || settings === null) {
      errors.push('Settings must be an object');
      return { isValid: false, errors, warnings };
    }
    
    // Validate permissions structure
    if (settings.permissions) {
      if (typeof settings.permissions !== 'object') {
        errors.push('permissions must be an object');
      } else {
        if (settings.permissions.allow && !Array.isArray(settings.permissions.allow)) {
          errors.push('permissions.allow must be an array');
        }
        
        if (settings.permissions.deny && !Array.isArray(settings.permissions.deny)) {
          errors.push('permissions.deny must be an array');
        }
        
        if (settings.permissions.default_mode && 
            !['allow', 'deny'].includes(settings.permissions.default_mode)) {
          errors.push('permissions.default_mode must be "allow" or "deny"');
        }
      }
    }
    
    // Validate hooks structure
    if (settings.hooks) {
      if (typeof settings.hooks !== 'object') {
        errors.push('hooks must be an object');
      } else {
        for (const [eventType, matchers] of Object.entries(settings.hooks)) {
          if (!Array.isArray(matchers)) {
            errors.push(`hooks.${eventType} must be an array`);
            continue;
          }
          
          for (let i = 0; i < matchers.length; i++) {
            const matcher = matchers[i];
            if (!matcher.matcher) {
              errors.push(`hooks.${eventType}[${i}].matcher is required`);
            }
            
            if (!Array.isArray(matcher.hooks)) {
              errors.push(`hooks.${eventType}[${i}].hooks must be an array`);
            }
          }
        }
      }
    }
    
    // Validate environment variables
    if (settings.environment) {
      if (typeof settings.environment !== 'object') {
        errors.push('environment must be an object');
      } else {
        for (const [key, value] of Object.entries(settings.environment)) {
          if (typeof value !== 'string') {
            warnings.push(`environment.${key} should be a string`);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Creates a settings template for a new project or user
   * 
   * @param {string} type - Type of template ('user', 'project', 'local')
   * @returns {Object} Settings template
   */
  static createSettingsTemplate(type = 'project') {
    const baseTemplate = {
      permissions: {
        allow: ["*"],
        deny: [],
        default_mode: "allow"
      },
      environment: {}
    };
    
    if (type === 'project') {
      return {
        ...baseTemplate,
        hooks: {},
        // Project-specific settings can go here
      };
    }
    
    if (type === 'user') {
      return {
        ...baseTemplate,
        // User-specific global settings
      };
    }
    
    if (type === 'local') {
      return {
        // Local overrides only - usually minimal
        environment: {}
      };
    }
    
    return baseTemplate;
  }
  
  /**
   * Utility method to check if a file exists
   * 
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Lists all backup files for a settings file
   * 
   * @param {string} settingsPath - Original settings file path
   * @returns {Promise<Array>} Array of backup file information
   */
  static async listBackups(settingsPath) {
    try {
      const dir = path.dirname(settingsPath);
      const filename = path.basename(settingsPath);
      const files = await fs.readdir(dir);
      
      const backups = [];
      
      for (const file of files) {
        if (file.startsWith(`${filename}.backup.`)) {
          const backupPath = path.join(dir, file);
          const stats = await fs.stat(backupPath);
          
          backups.push({
            path: backupPath,
            filename: file,
            created: stats.mtime,
            size: stats.size
          });
        }
      }
      
      // Sort by creation time, newest first
      backups.sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }
  
  /**
   * Restores a settings file from a backup
   * 
   * @param {string} backupPath - Path to the backup file
   * @param {string} settingsPath - Target settings file path
   * @returns {Promise<Object>} Result of the restore operation
   */
  static async restoreFromBackup(backupPath, settingsPath) {
    try {
      // Verify backup exists
      if (!await this.fileExists(backupPath)) {
        throw new Error('Backup file does not exist');
      }
      
      // Read and validate backup
      const backupSettings = await this.readSettings(backupPath);
      if (backupSettings.error) {
        throw new Error(`Backup file is invalid: ${backupSettings.error}`);
      }
      
      // Create backup of current file before restoring
      let currentBackupPath = null;
      if (await this.fileExists(settingsPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        currentBackupPath = `${settingsPath}.backup.pre-restore.${timestamp}`;
        await fs.copyFile(settingsPath, currentBackupPath);
      }
      
      // Restore from backup
      await fs.copyFile(backupPath, settingsPath);
      
      return {
        success: true,
        restoredFrom: backupPath,
        restoredTo: settingsPath,
        currentBackup: currentBackupPath,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}