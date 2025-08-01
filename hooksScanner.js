import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Scans for Claude settings files containing hooks configuration
 * Looks for settings.json files in user and project directories
 * 
 * @param {string[]} projectPaths - Array of project paths to scan for project-level settings
 * @returns {Promise<Array>} Array of settings files with hook configurations
 */
export async function scanHookConfigurations(projectPaths = []) {
  const settingsFiles = [];
  
  // User-level settings
  const userSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  try {
    const userSettings = await readSettingsFile(userSettingsPath, 'user');
    if (userSettings) {
      settingsFiles.push(userSettings);
    }
  } catch (error) {
    console.warn(`Could not read user settings from ${userSettingsPath}:`, error.message);
  }
  
  // Project-level settings for each discovered project
  for (const projectPath of projectPaths) {
    // Project shared settings
    const projectSettingsPath = path.join(projectPath, '.claude', 'settings.json');
    try {
      const projectSettings = await readSettingsFile(projectSettingsPath, 'project');
      if (projectSettings) {
        projectSettings.projectPath = projectPath;
        projectSettings.projectName = path.basename(projectPath);
        settingsFiles.push(projectSettings);
      }
    } catch (error) {
      console.warn(`Could not read project settings from ${projectSettingsPath}:`, error.message);
    }
    
    // Project local settings
    const localSettingsPath = path.join(projectPath, '.claude', 'settings.local.json');
    try {
      const localSettings = await readSettingsFile(localSettingsPath, 'local');
      if (localSettings) {
        localSettings.projectPath = projectPath;
        localSettings.projectName = path.basename(projectPath);
        settingsFiles.push(localSettings);
      }
    } catch (error) {
      // Local settings are optional, so don't warn
      console.debug(`No local settings found at ${localSettingsPath}`);
    }
  }
  
  return settingsFiles;
}

/**
 * Reads and parses a Claude settings file
 * 
 * @param {string} filePath - Path to the settings file
 * @param {string} type - Type of settings file ('user', 'project', 'local')
 * @returns {Promise<Object|null>} Parsed settings file object or null if doesn't exist
 */
export async function readSettingsFile(filePath, type) {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const settings = JSON.parse(content);
    const stats = await fs.stat(filePath);
    
    return {
      path: filePath,
      type: type,
      content: settings,
      lastModified: stats.mtime,
      exists: true,
      hasHooks: !!(settings.hooks && Object.keys(settings.hooks).length > 0)
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist
      return {
        path: filePath,
        type: type,
        content: {},
        lastModified: new Date(),
        exists: false,
        hasHooks: false
      };
    }
    
    // Other error (parse error, permission error, etc.)
    console.error(`Error reading settings file ${filePath}:`, error);
    return {
      path: filePath,
      type: type,
      content: {},
      lastModified: new Date(),
      exists: true,
      hasHooks: false,
      error: error.message
    };
  }
}

/**
 * Extracts hook configurations from all settings files
 * 
 * @param {Array} settingsFiles - Array of settings file objects
 * @returns {Array} Array of hook configurations with metadata
 */
export function extractHookConfigurations(settingsFiles) {
  const hooks = [];
  
  for (const settingsFile of settingsFiles) {
    if (!settingsFile.hasHooks || !settingsFile.content.hooks) {
      continue;
    }
    
    const hooksConfig = settingsFile.content.hooks;
    
    // Process each hook event type (PreToolUse, PostToolUse, etc.)
    for (const [eventType, matchers] of Object.entries(hooksConfig)) {
      if (!Array.isArray(matchers)) {
        continue;
      }
      
      for (let i = 0; i < matchers.length; i++) {
        const matcher = matchers[i];
        
        if (!Array.isArray(matcher.hooks)) {
          continue;
        }
        
        // Handle both old format (with matcher field) and new format (without matcher)
        const matcherPattern = matcher.matcher || `hook-${i}`;
        
        hooks.push({
          id: `${settingsFile.path}:${eventType}:${matcherPattern}`,
          eventType: eventType,
          matcher: matcherPattern,
          hooks: matcher.hooks,
          sourceFile: settingsFile.path,
          sourceType: settingsFile.type,
          projectPath: settingsFile.projectPath,
          projectName: settingsFile.projectName,
          lastModified: settingsFile.lastModified,
          enabled: true // Could be configurable in the future
        });
      }
    }
  }
  
  return hooks;
}

/**
 * Validates a hook configuration object
 * 
 * @param {Object} hookConfig - Hook configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateHookConfiguration(hookConfig) {
  const errors = [];
  
  if (!hookConfig) {
    errors.push('Hook configuration is required');
    return { isValid: false, errors };
  }
  
  // Validate event type
  const validEventTypes = ['PreToolUse', 'PostToolUse', 'UserPromptSubmit'];
  if (!hookConfig.eventType || !validEventTypes.includes(hookConfig.eventType)) {
    errors.push(`Invalid event type: ${hookConfig.eventType}. Must be one of: ${validEventTypes.join(', ')}`);
  }
  
  // Validate matcher
  if (!hookConfig.matcher) {
    errors.push('Matcher is required');
  }
  
  // Validate hooks array
  if (!Array.isArray(hookConfig.hooks) || hookConfig.hooks.length === 0) {
    errors.push('At least one hook is required');
  } else {
    // Validate each hook
    for (let i = 0; i < hookConfig.hooks.length; i++) {
      const hook = hookConfig.hooks[i];
      const hookErrors = validateSingleHook(hook, i);
      errors.push(...hookErrors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a single hook object
 * 
 * @param {Object} hook - Single hook to validate
 * @param {number} index - Index of the hook for error reporting
 * @returns {Array} Array of validation errors
 */
function validateSingleHook(hook, index) {
  const errors = [];
  const prefix = `Hook ${index + 1}`;
  
  if (!hook.type) {
    errors.push(`${prefix}: type is required`);
  } else if (!['command', 'script'].includes(hook.type)) {
    errors.push(`${prefix}: type must be 'command' or 'script'`);
  }
  
  if (hook.type === 'command' && !hook.command) {
    errors.push(`${prefix}: command is required when type is 'command'`);
  }
  
  if (hook.type === 'script' && !hook.script) {
    errors.push(`${prefix}: script is required when type is 'script'`);
  }
  
  // Validate args if provided
  if (hook.args && !Array.isArray(hook.args)) {
    errors.push(`${prefix}: args must be an array`);
  }
  
  // Validate env if provided
  if (hook.env && typeof hook.env !== 'object') {
    errors.push(`${prefix}: env must be an object`);
  }
  
  return errors;
}

/**
 * Creates a new hook configuration template
 * 
 * @param {string} eventType - Event type for the hook
 * @param {string} matcher - Matcher pattern
 * @param {string} type - Hook type ('command' or 'script')
 * @returns {Object} New hook configuration template
 */
export function createHookTemplate(eventType = 'PreToolUse', matcher = '*', type = 'command') {
  return {
    eventType,
    matcher,
    hooks: [{
      type,
      command: type === 'command' ? 'echo "Hook executed"' : undefined,
      script: type === 'script' ? '#!/bin/bash\necho "Hook executed"' : undefined,
      args: [],
      env: {}
    }],
    enabled: true
  };
}

/**
 * Updates hooks in a settings file
 * 
 * @param {string} settingsPath - Path to the settings file
 * @param {Array} hookConfigurations - Array of hook configurations to save
 * @returns {Promise<void>}
 */
export async function updateSettingsHooks(settingsPath, hookConfigurations) {
  try {
    // Read existing settings or create empty object
    let settings = {};
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error; // Re-throw non-file-not-found errors
      }
    }
    
    // Convert hook configurations to settings format
    const hooksConfig = {};
    
    for (const hookConfig of hookConfigurations) {
      const eventType = hookConfig.eventType;
      
      if (!hooksConfig[eventType]) {
        hooksConfig[eventType] = [];
      }
      
      hooksConfig[eventType].push({
        matcher: hookConfig.matcher,
        hooks: hookConfig.hooks
      });
    }
    
    // Update settings
    settings.hooks = hooksConfig;
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    
    // Create backup if file exists
    try {
      await fs.access(settingsPath);
      const backupPath = settingsPath + '.backup.' + Date.now();
      await fs.copyFile(settingsPath, backupPath);
    } catch (error) {
      // File doesn't exist, no backup needed
    }
    
    // Write updated settings
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    
  } catch (error) {
    console.error(`Failed to update hooks in ${settingsPath}:`, error);
    throw error;
  }
}