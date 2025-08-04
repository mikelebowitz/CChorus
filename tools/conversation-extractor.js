#!/usr/bin/env node

/**
 * Claude Conversation Extractor Service
 * Based on claude-conversation-extractor by ZeroSumQuant
 * Extracts and processes Claude Code JSONL conversation files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ConversationExtractor {
    constructor(dbService = null) {
        this.dbService = dbService;
        this.claudeProjectsPath = path.join(os.homedir(), '.claude', 'projects');
    }

    /**
     * Find all JSONL conversation files for the current project
     */
    findConversationFiles(projectPath = null) {
        try {
            const targetProject = projectPath || process.cwd();
            const projectKey = this.pathToProjectKey(targetProject);
            
            if (!fs.existsSync(this.claudeProjectsPath)) {
                console.log('⚠️  Claude projects directory not found:', this.claudeProjectsPath);
                return [];
            }

            const projectDir = path.join(this.claudeProjectsPath, projectKey);
            if (!fs.existsSync(projectDir)) {
                console.log('⚠️  Project conversation directory not found:', projectDir);
                return [];
            }

            const files = fs.readdirSync(projectDir)
                .filter(file => file.endsWith('.jsonl'))
                .map(file => path.join(projectDir, file));

            console.log(`📂 Found ${files.length} conversation files for project`);
            return files;
        } catch (error) {
            console.error('❌ Error finding conversation files:', error);
            return [];
        }
    }

    /**
     * Convert file system path to Claude's project key format
     */
    pathToProjectKey(projectPath) {
        // Claude Code uses the full path with slashes replaced by dashes
        // e.g. /Users/user/project -> -Users-user-project
        return projectPath.replace(/\//g, '-');
    }

    /**
     * Extract conversation from a single JSONL file
     * Based on claude-conversation-extractor logic
     */
    async extractConversation(jsonlPath) {
        const conversation = {
            file_path: jsonlPath,
            session_id: null,
            messages: [],
            metadata: {
                project_path: null,
                git_branch: null,
                started_at: null,
                last_updated: null,
                message_count: 0
            }
        };

        try {
            const fileStream = fs.createReadStream(jsonlPath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            for await (const line of rl) {
                if (!line.trim()) continue;

                try {
                    const entry = JSON.parse(line.trim());
                    
                    // Extract session metadata from first entry
                    if (!conversation.session_id && entry.sessionId) {
                        conversation.session_id = entry.sessionId;
                        conversation.metadata.project_path = entry.cwd;
                        conversation.metadata.git_branch = entry.gitBranch;
                    }

                    // Extract user messages
                    if (entry.type === 'user' && entry.message) {
                        const msg = entry.message;
                        if (msg.role === 'user') {
                            const content = this.extractTextContent(msg.content);
                            if (content.trim()) {
                                const message = {
                                    uuid: entry.uuid,
                                    parent_uuid: entry.parentUuid,
                                    role: 'user',
                                    content: content,
                                    timestamp: entry.timestamp,
                                    is_meta: entry.isMeta || false,
                                    is_sidechain: entry.isSidechain || false,
                                    git_branch: entry.gitBranch,
                                    cwd: entry.cwd
                                };
                                conversation.messages.push(message);
                            }
                        }
                    }

                    // Extract assistant messages
                    else if (entry.type === 'assistant' && entry.message) {
                        const msg = entry.message;
                        if (msg.role === 'assistant') {
                            const content = this.extractTextContent(msg.content);
                            if (content.trim()) {
                                const message = {
                                    uuid: entry.uuid,
                                    parent_uuid: entry.parentUuid,
                                    role: 'assistant',
                                    content: content,
                                    timestamp: entry.timestamp,
                                    is_meta: false,
                                    is_sidechain: entry.isSidechain || false,
                                    git_branch: entry.gitBranch,
                                    cwd: entry.cwd
                                };
                                conversation.messages.push(message);
                            }
                        }
                    }
                } catch (parseError) {
                    console.warn('⚠️  Failed to parse JSONL line:', parseError.message);
                    continue;
                }
            }

            // Update conversation metadata
            if (conversation.messages.length > 0) {
                conversation.metadata.message_count = conversation.messages.length;
                conversation.metadata.started_at = conversation.messages[0].timestamp;
                conversation.metadata.last_updated = conversation.messages[conversation.messages.length - 1].timestamp;
            }

            console.log(`📝 Extracted ${conversation.messages.length} messages from ${path.basename(jsonlPath)}`);
            return conversation;

        } catch (error) {
            console.error(`❌ Error extracting conversation from ${jsonlPath}:`, error);
            return null;
        }
    }

    /**
     * Extract text content from Claude's message content structure
     * Handles both string and array formats
     */
    extractTextContent(content) {
        if (typeof content === 'string') {
            return content;
        }
        
        if (Array.isArray(content)) {
            return content
                .map(item => {
                    if (typeof item === 'string') {
                        return item;
                    }
                    if (item && typeof item === 'object') {
                        return item.text || item.content || '';
                    }
                    return '';
                })
                .join('');
        }

        if (content && typeof content === 'object') {
            return content.text || content.content || '';
        }

        return '';
    }

    /**
     * Process all conversation files and store in database
     */
    async processAllConversations(projectPath = null) {
        if (!this.dbService) {
            console.error('❌ Database service not provided');
            return [];
        }

        const jsonlFiles = this.findConversationFiles(projectPath);
        const processedConversations = [];

        for (const file of jsonlFiles) {
            console.log(`🔍 Processing ${path.basename(file)}...`);
            
            const conversation = await this.extractConversation(file);
            if (!conversation || conversation.messages.length === 0) {
                console.log(`⚠️  Skipping empty conversation: ${path.basename(file)}`);
                continue;
            }

            try {
                // Store conversation in database
                const conversationId = await this.dbService.upsertConversation({
                    session_id: conversation.session_id,
                    conversation_uuid: conversation.session_id, // Use session_id as conversation UUID
                    name: null, // Could be derived from first user message
                    project_path: conversation.metadata.project_path,
                    git_branch: conversation.metadata.git_branch,
                    started_at: conversation.metadata.started_at,
                    last_updated: conversation.metadata.last_updated,
                    message_count: conversation.metadata.message_count
                });

                // Store messages
                let messageCount = 0;
                for (const message of conversation.messages) {
                    await this.dbService.addMessage({
                        conversation_id: conversationId,
                        message_uuid: message.uuid,
                        parent_uuid: message.parent_uuid,
                        session_id: conversation.session_id,
                        message_type: message.role,
                        role: message.role,
                        content: message.content,
                        is_meta: message.is_meta,
                        is_sidechain: message.is_sidechain,
                        timestamp: message.timestamp,
                        git_branch: message.git_branch,
                        cwd: message.cwd
                    });
                    messageCount++;
                }

                // Update conversation analytics
                await this.dbService.updateConversationAnalytics(conversationId);

                processedConversations.push({
                    file: path.basename(file),
                    conversation_id: conversationId,
                    session_id: conversation.session_id,
                    message_count: messageCount
                });

                console.log(`✅ Processed conversation: ${messageCount} messages`);

            } catch (error) {
                console.error(`❌ Error storing conversation from ${file}:`, error);
            }
        }

        return processedConversations;
    }

    /**
     * Get conversation statistics
     */
    async getExtractionStats() {
        const files = this.findConversationFiles();
        const totalFiles = files.length;
        
        let totalMessages = 0;
        for (const file of files) {
            const conversation = await this.extractConversation(file);
            if (conversation) {
                totalMessages += conversation.messages.length;
            }
        }

        return {
            total_files: totalFiles,
            total_messages: totalMessages,
            projects_path: this.claudeProjectsPath
        };
    }

    /**
     * Watch for new JSONL files and process them automatically
     */
    startFileWatcher(callback = null) {
        const projectKey = this.pathToProjectKey(process.cwd());
        const watchDir = path.join(this.claudeProjectsPath, projectKey);

        if (!fs.existsSync(watchDir)) {
            console.log(`⚠️  Watch directory does not exist: ${watchDir}`);
            return null;
        }

        console.log(`👁️  Watching for new conversations in: ${watchDir}`);

        const watcher = fs.watch(watchDir, async (eventType, filename) => {
            if (eventType === 'change' && filename && filename.endsWith('.jsonl')) {
                const filePath = path.join(watchDir, filename);
                console.log(`📝 New conversation file detected: ${filename}`);
                
                if (this.dbService) {
                    try {
                        const conversation = await this.extractConversation(filePath);
                        if (conversation && conversation.messages.length > 0) {
                            // Process new conversation
                            await this.processAllConversations();
                            
                            if (callback) {
                                callback(conversation);
                            }
                        }
                    } catch (error) {
                        console.error('❌ Error processing new conversation:', error);
                    }
                }
            }
        });

        return watcher;
    }
}

export default ConversationExtractor;