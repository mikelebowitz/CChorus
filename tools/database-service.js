#!/usr/bin/env node

/**
 * CChorus Database Service
 * SQLite-based persistence layer for dashboard observability data
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseService {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, '..', '.claude', 'cchorus.db');
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize database connection and create tables if needed
     */
    async initialize() {
        try {
            // Ensure .claude directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Open database connection
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            // Enable foreign keys and WAL mode for performance
            await this.db.exec('PRAGMA foreign_keys = ON');
            await this.db.exec('PRAGMA journal_mode = WAL');

            // Create tables
            await this.createTables();
            
            this.isInitialized = true;
            console.log(`📊 Database initialized: ${this.dbPath}`);
            
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create database schema based on observability data types
     */
    async createTables() {
        // Sessions table - tracks user sessions and context
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                start_time TEXT NOT NULL,
                end_time TEXT,
                project_path TEXT,
                branch_context TEXT,
                total_prompts INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Activities table - core dashboard activity feed
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                agent TEXT NOT NULL,
                description TEXT NOT NULL,
                files TEXT, -- JSON array of file paths
                timestamp TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        `);

        // Metrics table - performance and system metrics
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                metric_unit TEXT,
                agent TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        `);

        // Agent usage tracking - for effectiveness analysis
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS agent_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                agent_name TEXT NOT NULL,
                invocation_count INTEGER DEFAULT 1,
                total_tokens INTEGER DEFAULT 0,
                success_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                avg_response_time REAL DEFAULT 0,
                last_used TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        `);

        // Infrastructure status tracking
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS infrastructure_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_name TEXT NOT NULL,
                status TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Conversations table - Claude Code chat sessions
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                conversation_uuid TEXT UNIQUE NOT NULL,
                name TEXT,
                project_path TEXT,
                git_branch TEXT,
                started_at TEXT NOT NULL,
                last_updated TEXT NOT NULL,
                message_count INTEGER DEFAULT 0,
                token_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, conversation_uuid)
            )
        `);

        // Messages table - individual chat messages
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                message_uuid TEXT UNIQUE NOT NULL,
                parent_uuid TEXT,
                session_id TEXT NOT NULL,
                message_type TEXT NOT NULL, -- 'user' or 'assistant'
                role TEXT NOT NULL, -- 'user', 'assistant', 'system'
                content TEXT NOT NULL,
                is_meta BOOLEAN DEFAULT FALSE,
                is_sidechain BOOLEAN DEFAULT FALSE,
                timestamp TEXT NOT NULL,
                git_branch TEXT,
                cwd TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )
        `);

        // Message search index - full-text search capability
        await this.db.exec(`
            CREATE VIRTUAL TABLE IF NOT EXISTS message_search USING fts5(
                message_uuid,
                content,
                role,
                session_id,
                git_branch
            )
        `);

        // Conversation analytics table - derived insights
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS conversation_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                total_messages INTEGER DEFAULT 0,
                user_messages INTEGER DEFAULT 0,
                assistant_messages INTEGER DEFAULT 0,
                avg_message_length REAL DEFAULT 0,
                topics TEXT, -- JSON array of extracted topics
                outcome TEXT, -- success/failure/incomplete
                duration_minutes REAL DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id)
            )
        `);

        // Processed files table - tracks JSONL files that have been processed
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS processed_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_modified TEXT NOT NULL,
                processed_at TEXT DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0,
                session_id TEXT
            )
        `);

        // Create indexes for performance
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_activities_agent ON activities(agent)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_activities_session ON activities(session_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time)');
        
        // Conversation indexes
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)');
        
        // Processed files indexes
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_processed_files_path ON processed_files(file_path)');
        await this.db.exec('CREATE INDEX IF NOT EXISTS idx_processed_files_modified ON processed_files(file_modified)');
        
        console.log('📋 Database schema created successfully');
    }

    /**
     * Ensure database is initialized before operations
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Create or update a session record
     */
    async upsertSession(sessionData) {
        await this.ensureInitialized();
        
        const {
            session_id,
            start_time,
            end_time = null,
            project_path = null,
            branch_context = null,
            total_prompts = 0,
            total_tokens = 0,
            status = 'active'
        } = sessionData;

        await this.db.run(`
            INSERT OR REPLACE INTO sessions 
            (session_id, start_time, end_time, project_path, branch_context, total_prompts, total_tokens, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [session_id, start_time, end_time, project_path, branch_context, total_prompts, total_tokens, status]);
    }

    /**
     * Add activity record
     */
    async addActivity(activityData) {
        await this.ensureInitialized();
        
        const {
            session_id = null,
            agent,
            description,
            files = [],
            timestamp = new Date().toISOString()
        } = activityData;

        const filesJson = JSON.stringify(files);

        const result = await this.db.run(`
            INSERT INTO activities (session_id, agent, description, files, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `, [session_id, agent, description, filesJson, timestamp]);

        // Return the created activity with ID
        return {
            id: result.lastID,
            session_id,
            agent,
            description,
            files,
            timestamp
        };
    }

    /**
     * Get recent activities with pagination
     */
    async getActivities(limit = 20, offset = 0, sessionId = null) {
        await this.ensureInitialized();
        
        let query = `
            SELECT * FROM activities 
            ${sessionId ? 'WHERE session_id = ?' : ''}
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        `;
        
        const params = sessionId ? [sessionId, limit, offset] : [limit, offset];
        const rows = await this.db.all(query, params);
        
        // Parse files JSON for each activity
        return rows.map(row => ({
            ...row,
            files: JSON.parse(row.files || '[]')
        }));
    }

    /**
     * Record metric data
     */
    async recordMetric(metricData) {
        await this.ensureInitialized();
        
        const {
            session_id = null,
            metric_name,
            metric_value,
            metric_unit = null,
            agent = null,
            timestamp = new Date().toISOString()
        } = metricData;

        await this.db.run(`
            INSERT INTO metrics (session_id, metric_name, metric_value, metric_unit, agent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [session_id, metric_name, metric_value, metric_unit, agent, timestamp]);
    }

    /**
     * Update agent usage statistics
     */
    async updateAgentUsage(usageData) {
        await this.ensureInitialized();
        
        const {
            session_id = null,
            agent_name,
            tokens_used = 0,
            success = true,
            response_time = 0
        } = usageData;

        const timestamp = new Date().toISOString();

        // Try to update existing record, or insert new one
        await this.db.run(`
            INSERT OR REPLACE INTO agent_usage 
            (session_id, agent_name, invocation_count, total_tokens, success_count, error_count, avg_response_time, last_used)
            VALUES (
                ?, ?, 
                COALESCE((SELECT invocation_count FROM agent_usage WHERE session_id = ? AND agent_name = ?), 0) + 1,
                COALESCE((SELECT total_tokens FROM agent_usage WHERE session_id = ? AND agent_name = ?), 0) + ?,
                COALESCE((SELECT success_count FROM agent_usage WHERE session_id = ? AND agent_name = ?), 0) + ?,
                COALESCE((SELECT error_count FROM agent_usage WHERE session_id = ? AND agent_name = ?), 0) + ?,
                ((COALESCE((SELECT avg_response_time FROM agent_usage WHERE session_id = ? AND agent_name = ?), 0) + ?) / 2),
                ?
            )
        `, [
            session_id, agent_name,
            session_id, agent_name,
            session_id, agent_name, tokens_used,
            session_id, agent_name, success ? 1 : 0,
            session_id, agent_name, success ? 0 : 1,
            session_id, agent_name, response_time,
            timestamp
        ]);
    }

    /**
     * Get session statistics
     */
    async getSessionStats(sessionId) {
        await this.ensureInitialized();
        
        const sessionInfo = await this.db.get(
            'SELECT * FROM sessions WHERE session_id = ?',
            [sessionId]
        );

        const activityCount = await this.db.get(
            'SELECT COUNT(*) as count FROM activities WHERE session_id = ?',
            [sessionId]
        );

        const agentStats = await this.db.all(
            'SELECT agent_name, invocation_count, total_tokens, success_count, error_count FROM agent_usage WHERE session_id = ?',
            [sessionId]
        );

        return {
            session: sessionInfo,
            total_activities: activityCount.count,
            agent_stats: agentStats
        };
    }

    /**
     * Clean up old data (retention policy)
     */
    async cleanup(retentionDays = 30) {
        await this.ensureInitialized();
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const cutoffISO = cutoffDate.toISOString();

        // Clean up old activities
        const activitiesDeleted = await this.db.run(
            'DELETE FROM activities WHERE timestamp < ?',
            [cutoffISO]
        );

        // Clean up old metrics
        const metricsDeleted = await this.db.run(
            'DELETE FROM metrics WHERE timestamp < ?',
            [cutoffISO]
        );

        // Clean up old sessions (keep recent ones)
        const sessionsDeleted = await this.db.run(
            'DELETE FROM sessions WHERE start_time < ? AND status != "active"',
            [cutoffISO]
        );

        console.log(`🧹 Cleanup completed: ${activitiesDeleted.changes} activities, ${metricsDeleted.changes} metrics, ${sessionsDeleted.changes} sessions removed`);
        
        return {
            activities_deleted: activitiesDeleted.changes,
            metrics_deleted: metricsDeleted.changes,
            sessions_deleted: sessionsDeleted.changes
        };
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
            this.isInitialized = false;
            console.log('📊 Database connection closed');
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        await this.ensureInitialized();
        
        const sessions = await this.db.get('SELECT COUNT(*) as count FROM sessions');
        const activities = await this.db.get('SELECT COUNT(*) as count FROM activities');
        const metrics = await this.db.get('SELECT COUNT(*) as count FROM metrics');
        
        return {
            total_sessions: sessions.count,
            total_activities: activities.count,
            total_metrics: metrics.count,
            database_path: this.dbPath
        };
    }

    /**
     * Create or update a conversation record
     */
    async upsertConversation(conversationData) {
        await this.ensureInitialized();
        
        const {
            session_id,
            conversation_uuid,
            name = null,
            project_path = null,
            git_branch = null,
            started_at,
            last_updated,
            message_count = 0,
            token_count = 0
        } = conversationData;

        // Check if conversation already exists
        const existing = await this.db.get(
            'SELECT id FROM conversations WHERE conversation_uuid = ?',
            [conversation_uuid]
        );

        if (existing) {
            // Update existing conversation
            await this.db.run(`
                UPDATE conversations 
                SET name = ?, project_path = ?, git_branch = ?, last_updated = ?, 
                    message_count = ?, token_count = ?
                WHERE id = ?
            `, [name, project_path, git_branch, last_updated, message_count, token_count, existing.id]);
            return existing.id;
        } else {
            // Insert new conversation
            const result = await this.db.run(`
                INSERT INTO conversations 
                (session_id, conversation_uuid, name, project_path, git_branch, started_at, last_updated, message_count, token_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [session_id, conversation_uuid, name, project_path, git_branch, started_at, last_updated, message_count, token_count]);
            return result.lastID;
        }
    }

    /**
     * Add a message to the database
     */
    async addMessage(messageData) {
        await this.ensureInitialized();
        
        const {
            conversation_id,
            message_uuid,
            parent_uuid = null,
            session_id,
            message_type,
            role,
            content,
            is_meta = false,
            is_sidechain = false,
            timestamp,
            git_branch = null,
            cwd = null
        } = messageData;

        // Insert message - use INSERT OR IGNORE to prevent foreign key constraint errors
        const result = await this.db.run(`
            INSERT OR IGNORE INTO messages 
            (conversation_id, message_uuid, parent_uuid, session_id, message_type, role, content, 
             is_meta, is_sidechain, timestamp, git_branch, cwd)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [conversation_id, message_uuid, parent_uuid, session_id, message_type, role, content, 
            is_meta, is_sidechain, timestamp, git_branch, cwd]);

        // Add to full-text search index (skip meta messages for cleaner search)
        if (!is_meta && content.trim().length > 0 && result.changes > 0) {
            await this.db.run(`
                INSERT OR IGNORE INTO message_search 
                (message_uuid, content, role, session_id, git_branch)
                VALUES (?, ?, ?, ?, ?)
            `, [message_uuid, content, role, session_id, git_branch]);
        }

        return result.lastID;
    }

    /**
     * Search messages using full-text search
     */
    async searchMessages(query, limit = 20, offset = 0) {
        await this.ensureInitialized();
        
        const searchResults = await this.db.all(`
            SELECT 
                ms.message_uuid,
                ms.content,
                ms.role,
                ms.session_id,
                ms.git_branch,
                m.timestamp,
                m.conversation_id,
                c.name as conversation_name,
                c.project_path
            FROM message_search ms
            JOIN messages m ON ms.message_uuid = m.message_uuid
            JOIN conversations c ON m.conversation_id = c.id
            WHERE message_search MATCH ?
            ORDER BY rank
            LIMIT ? OFFSET ?
        `, [query, limit, offset]);

        return searchResults;
    }

    /**
     * Get conversation with messages
     */
    async getConversation(conversationUuid, includeMessages = true) {
        await this.ensureInitialized();
        
        const conversation = await this.db.get(
            'SELECT * FROM conversations WHERE conversation_uuid = ?',
            [conversationUuid]
        );

        if (!conversation) {
            return null;
        }

        if (includeMessages) {
            const messages = await this.db.all(
                'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
                [conversation.id]
            );
            conversation.messages = messages;
        }

        return conversation;
    }

    /**
     * Get recent conversations
     */
    async getRecentConversations(limit = 10, offset = 0) {
        await this.ensureInitialized();
        
        return await this.db.all(`
            SELECT 
                c.*,
                COUNT(m.id) as actual_message_count,
                MAX(m.timestamp) as last_message_time
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            GROUP BY c.id
            ORDER BY c.last_updated DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
    }

    /**
     * Update conversation analytics
     */
    async updateConversationAnalytics(conversationId) {
        await this.ensureInitialized();
        
        // Calculate analytics from messages
        const stats = await this.db.get(`
            SELECT 
                COUNT(*) as total_messages,
                SUM(CASE WHEN message_type = 'user' THEN 1 ELSE 0 END) as user_messages,
                SUM(CASE WHEN message_type = 'assistant' THEN 1 ELSE 0 END) as assistant_messages,
                AVG(LENGTH(content)) as avg_message_length,
                MIN(timestamp) as first_message,
                MAX(timestamp) as last_message
            FROM messages 
            WHERE conversation_id = ? AND is_meta = FALSE
        `, [conversationId]);

        // Calculate duration in minutes
        let duration = 0;
        if (stats.first_message && stats.last_message) {
            const start = new Date(stats.first_message);
            const end = new Date(stats.last_message);
            duration = (end - start) / (1000 * 60); // Convert to minutes
        }

        // Update or insert analytics
        await this.db.run(`
            INSERT OR REPLACE INTO conversation_analytics 
            (conversation_id, session_id, total_messages, user_messages, assistant_messages, 
             avg_message_length, duration_minutes, updated_at)
            SELECT ?, c.session_id, ?, ?, ?, ?, ?, ?
            FROM conversations c WHERE c.id = ?
        `, [conversationId, stats.total_messages, stats.user_messages, stats.assistant_messages,
            stats.avg_message_length, duration, new Date().toISOString(), conversationId]);
    }

    /**
     * Get conversation statistics
     */
    async getConversationStats() {
        await this.ensureInitialized();
        
        const conversations = await this.db.get('SELECT COUNT(*) as count FROM conversations');
        const messages = await this.db.get('SELECT COUNT(*) as count FROM messages');
        const searchEntries = await this.db.get('SELECT COUNT(*) as count FROM message_search');

        return {
            total_conversations: conversations.count,
            total_messages: messages.count,
            searchable_messages: searchEntries.count
        };
    }

    /**
     * Check if a JSONL file has already been processed
     */
    async isFileProcessed(filePath, stats) {
        await this.ensureInitialized();
        
        const processed = await this.db.get(`
            SELECT * FROM processed_files 
            WHERE file_path = ? AND file_size = ? AND file_modified = ?
        `, [filePath, stats.size, stats.mtime.toISOString()]);
        
        return !!processed;
    }

    /**
     * Mark a file as processed
     */
    async markFileProcessed(filePath, stats, messageCount, sessionId) {
        await this.ensureInitialized();
        
        const fileName = filePath.split('/').pop();
        
        await this.db.run(`
            INSERT OR REPLACE INTO processed_files 
            (file_path, file_name, file_size, file_modified, message_count, session_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [filePath, fileName, stats.size, stats.mtime.toISOString(), messageCount, sessionId]);
    }

    /**
     * Get list of processed files
     */
    async getProcessedFiles(limit = 100) {
        await this.ensureInitialized();
        
        return await this.db.all(`
            SELECT * FROM processed_files 
            ORDER BY processed_at DESC 
            LIMIT ?
        `, [limit]);
    }
}

export default DatabaseService;