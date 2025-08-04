#!/usr/bin/env node

/**
 * CChorus Development Dashboard Server
 * Real-time WebSocket server for development observability
 */

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import DatabaseService from './database-service.js';
import ConversationExtractor from './conversation-extractor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.DASHBOARD_PORT || 3002;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Database service
const dbService = new DatabaseService();

// Conversation extractor
const conversationExtractor = new ConversationExtractor(dbService);

// Dashboard state
let dashboardState = {
    agents: {},
    metrics: {
        activeAgents: 6,
        filesWatched: 0,
        recentChanges: 0,
        avgResponseTime: '0.0s',
        tokenUsage: {
            current: 0,
            baseline: 8000, // Estimated monolithic usage
            reduction: '0%'
        }
    },
    activity: [],
    infrastructure: {
        fileWatcher: 'unknown',
        githubSync: 'unknown',
        autoBranchCreator: 'unknown',
        vsCodeTasks: 'unknown',
        frontendServer: 'unknown',
        backendServer: 'unknown'
    }
};

// Token tracking
const TOKEN_TRACKING_FILE = path.join(PROJECT_ROOT, '.claude', 'token-usage.json');
const COMPACT_TRACKING_FILE = path.join(PROJECT_ROOT, '.claude', 'compact-tracking.json');
let tokenMetrics = {
    sessions: [],
    totalTokens: 0,
    averagePerSession: 0,
    reductionVsBaseline: 0
};
let compactTracking = {
    lastEvent: {
        type: null,
        timestamp: null,
        sessionId: null,
        totalTokensAtEvent: 0,
        trigger: null,
        formattedTime: null
    },
    eventHistory: [],
    currentSession: {
        sessionId: null,
        compactsThisSession: 0,
        sessionStartTime: null,
        tokensSinceLastEvent: 0
    }
};

// Serve static dashboard and public assets
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(PROJECT_ROOT, 'public')));

// Root route - serve the dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dev-dashboard.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json(dashboardState);
});

// Conversation search endpoint
app.get('/api/search/conversations', async (req, res) => {
    try {
        const { q: query, limit = 20, offset = 0 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }
        
        const results = await dbService.searchMessages(query, parseInt(limit), parseInt(offset));
        res.json({
            query,
            results,
            count: results.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('❌ Conversation search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get conversation history endpoint
app.get('/api/conversations', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const conversations = await dbService.getRecentConversations(parseInt(limit), parseInt(offset));
        res.json(conversations);
    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get specific conversation endpoint
app.get('/api/conversations/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;
        const { include_messages = 'true' } = req.query;
        
        const conversation = await dbService.getConversation(uuid, include_messages === 'true');
        
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        res.json(conversation);
    } catch (error) {
        console.error('❌ Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('📱 Dashboard client connected');
    
    // Send initial state
    ws.send(JSON.stringify({
        type: 'state',
        data: dashboardState
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(data, ws);
        } catch (error) {
            console.error('❌ Invalid WebSocket message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('📱 Dashboard client disconnected');
    });
});

function handleClientMessage(data, ws) {
    switch (data.type) {
        case 'refresh':
            updateInfrastructureStatus();
            broadcastUpdate('refresh', dashboardState);
            break;
        case 'agent-select':
            // Handle agent selection for detailed view
            console.log(`🎯 Selected agent: ${data.agent}`);
            break;
        default:
            console.log('❓ Unknown message type:', data.type);
    }
}

function broadcastUpdate(type, data) {
    const message = JSON.stringify({ type, data });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

async function addActivity(agent, description, files = []) {
    // Convert absolute paths to relative paths from project root
    const relativeFiles = files.map(file => {
        if (file.startsWith(PROJECT_ROOT)) {
            return file.substring(PROJECT_ROOT.length + 1);
        }
        return file;
    });
    
    const timestamp = new Date().toISOString();
    const activity = {
        id: Date.now(),
        agent,
        description,
        files: relativeFiles,
        timestamp,
        time: new Date().toLocaleTimeString()
    };
    
    // Persist to database
    try {
        const sessionId = getCurrentSessionId();
        
        // Ensure session exists before adding activity
        await dbService.upsertSession({
            session_id: sessionId,
            start_time: new Date().toISOString(),
            project_path: PROJECT_ROOT,
            branch_context: getBranchContext(),
            status: 'active'
        });
        
        const savedActivity = await dbService.addActivity({
            session_id: sessionId,
            agent,
            description,
            files: relativeFiles,
            timestamp
        });
        activity.db_id = savedActivity.id;
    } catch (error) {
        console.error('❌ Failed to save activity to database:', error);
    }
    
    // Update in-memory state for real-time display
    dashboardState.activity.unshift(activity);
    
    // Keep only last 20 activities in memory
    if (dashboardState.activity.length > 20) {
        dashboardState.activity = dashboardState.activity.slice(0, 20);
    }
    
    // Update agent status
    if (dashboardState.agents[agent]) {
        dashboardState.agents[agent].status = 'running';
        dashboardState.agents[agent].lastActivity = activity.timestamp;
        
        // Reset to idle after 30 seconds
        setTimeout(() => {
            if (dashboardState.agents[agent]) {
                dashboardState.agents[agent].status = 'idle';
                broadcastUpdate('agent-status', {
                    agent,
                    status: 'idle'
                });
            }
        }, 30000);
    }
    
    dashboardState.metrics.recentChanges++;
    
    broadcastUpdate('activity', activity);
    console.log(`📝 Activity: ${agent} - ${description}`);
}

async function checkServerStatus(port) {
    try {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                method: 'HEAD',
                timeout: 1000
            }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 500); // Accept 404 as "running"
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.setTimeout(1000);
            req.end();
        });
    } catch (error) {
        return false;
    }
}

async function updateInfrastructureStatus() {
    // Check file watcher process
    try {
        const processes = execSync('ps aux | grep file-watcher', { encoding: 'utf8' });
        dashboardState.infrastructure.fileWatcher = processes.includes('python') ? 'running' : 'stopped';
    } catch (error) {
        dashboardState.infrastructure.fileWatcher = 'error';
    }
    
    // Check GitHub sync status
    const githubSyncFile = path.join(PROJECT_ROOT, '.claude', 'github-sync-status.json');
    try {
        if (fs.existsSync(githubSyncFile)) {
            const status = JSON.parse(fs.readFileSync(githubSyncFile, 'utf8'));
            dashboardState.infrastructure.githubSync = status.connected ? 'connected' : 'disconnected';
        } else {
            dashboardState.infrastructure.githubSync = 'unknown';
        }
    } catch (error) {
        dashboardState.infrastructure.githubSync = 'error';
    }
    
    // Check VS Code tasks
    const vsCodeTasksFile = path.join(PROJECT_ROOT, '.vscode', 'tasks.json');
    dashboardState.infrastructure.vsCodeTasks = fs.existsSync(vsCodeTasksFile) ? 'configured' : 'missing';
    
    // Update auto-branch creator status
    try {
        const backlogFile = path.join(PROJECT_ROOT, 'BACKLOG.md');
        if (fs.existsSync(backlogFile)) {
            const backlogContent = fs.readFileSync(backlogFile, 'utf8');
            const branchMatches = backlogContent.match(/\[new-branch:/g);
            const pendingBranches = branchMatches ? branchMatches.length : 0;
            dashboardState.infrastructure.autoBranchCreator = pendingBranches > 0 ? `${pendingBranches} pending` : 'idle';
        }
    } catch (error) {
        dashboardState.infrastructure.autoBranchCreator = 'error';
    }
    
    // Check development servers
    const frontendRunning = await checkServerStatus(5173); // Vite default port
    const backendRunning = await checkServerStatus(3001); // Express API port
    
    dashboardState.infrastructure.frontendServer = frontendRunning ? 'running' : 'stopped';
    dashboardState.infrastructure.backendServer = backendRunning ? 'running' : 'stopped';
}

function watchFileChanges() {
    const triggerFile = path.join(PROJECT_ROOT, '.claude', 'doc-update-needed.trigger');
    const pendingFile = path.join(PROJECT_ROOT, '.claude', 'pending-agent-invocations.json');
    const syncLogFile = path.join(PROJECT_ROOT, '.claude', 'sync-command-log.json');
    const githubLogFile = path.join(PROJECT_ROOT, '.claude', 'github-sync-log.json');
    
    // Watch trigger file for changes
    if (fs.existsSync(triggerFile)) {
        fs.watchFile(triggerFile, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const trigger = JSON.parse(fs.readFileSync(triggerFile, 'utf8'));
                    
                    // Analyze file types for better description
                    const files = trigger.changes_detected || [];
                    const fileTypes = files.reduce((types, file) => {
                        if (file.includes('/.claude/agents/')) types.agents++;
                        else if (file.includes('/.claude/commands/')) types.commands++;
                        else if (file.includes('/src/')) types.source++;
                        else if (file.includes('/docs/')) types.docs++;
                        else if (file.endsWith('.md')) types.markdown++;
                        else types.other++;
                        return types;
                    }, { agents: 0, commands: 0, source: 0, docs: 0, markdown: 0, other: 0 });
                    
                    // Create descriptive summary
                    const parts = [];
                    if (fileTypes.agents > 0) parts.push(`${fileTypes.agents} agent${fileTypes.agents > 1 ? 's' : ''}`);
                    if (fileTypes.commands > 0) parts.push(`${fileTypes.commands} command${fileTypes.commands > 1 ? 's' : ''}`);
                    if (fileTypes.source > 0) parts.push(`${fileTypes.source} source file${fileTypes.source > 1 ? 's' : ''}`);
                    if (fileTypes.docs > 0) parts.push(`${fileTypes.docs} doc${fileTypes.docs > 1 ? 's' : ''}`);
                    if (fileTypes.markdown > 0) parts.push(`${fileTypes.markdown} markdown file${fileTypes.markdown > 1 ? 's' : ''}`);
                    if (fileTypes.other > 0) parts.push(`${fileTypes.other} other file${fileTypes.other > 1 ? 's' : ''}`);
                    
                    const description = parts.length > 0 
                        ? `Updated ${parts.join(', ')}` 
                        : `Detected ${trigger.change_count || files.length} file changes`;
                    
                    addActivity('file-change-analyzer', description, files);
                } catch (error) {
                    console.error('❌ Error reading trigger file:', error);
                }
            }
        });
    }
    
    // Watch pending agent invocations
    if (fs.existsSync(pendingFile)) {
        fs.watchFile(pendingFile, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
                    if (pending.length > 0) {
                        const latest = pending[pending.length - 1];
                        addActivity(latest.agent, 
                            `${latest.trigger}: ${latest.prompt.substring(0, 100)}...`,
                            latest.files_changed || []
                        );
                    }
                } catch (error) {
                    console.error('❌ Error reading pending file:', error);
                }
            }
        });
    }
    
    // Watch sync command log for hook activities
    if (fs.existsSync(syncLogFile)) {
        fs.watchFile(syncLogFile, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const logs = JSON.parse(fs.readFileSync(syncLogFile, 'utf8'));
                    if (logs.length > 0) {
                        const latest = logs[logs.length - 1];
                        const agentsList = latest.agents_invoked ? latest.agents_invoked.join(', ') : 'none';
                        addActivity('sync-command', 
                            `Processed ${latest.changes_processed} changes, invoked: ${agentsList}`,
                            []
                        );
                    }
                } catch (error) {
                    console.error('❌ Error reading sync log:', error);
                }
            }
        });
    }
    
    // Watch GitHub sync log for GitHub activities
    if (fs.existsSync(githubLogFile)) {
        fs.watchFile(githubLogFile, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const logs = JSON.parse(fs.readFileSync(githubLogFile, 'utf8'));
                    if (logs.length > 0) {
                        const latest = logs[logs.length - 1];
                        addActivity('github-sync', 
                            `${latest.operation || 'Sync'}: ${latest.message || 'GitHub synchronization completed'}`,
                            []
                        );
                    }
                } catch (error) {
                    console.error('❌ Error reading GitHub sync log:', error);
                }
            }
        });
    }
}

function loadTokenMetrics() {
    try {
        if (fs.existsSync(TOKEN_TRACKING_FILE)) {
            const data = fs.readFileSync(TOKEN_TRACKING_FILE, 'utf8');
            tokenMetrics = JSON.parse(data);
        }
    } catch (error) {
        console.log('⚠️  Could not load token metrics:', error.message);
    }
}

function saveTokenMetrics() {
    try {
        fs.writeFileSync(TOKEN_TRACKING_FILE, JSON.stringify(tokenMetrics, null, 2));
    } catch (error) {
        console.error('❌ Error saving token metrics:', error);
    }
}

function loadCompactTracking() {
    try {
        if (fs.existsSync(COMPACT_TRACKING_FILE)) {
            const data = fs.readFileSync(COMPACT_TRACKING_FILE, 'utf8');
            compactTracking = JSON.parse(data);
        }
    } catch (error) {
        console.log('⚠️  Could not load compact tracking:', error.message);
    }
}

function calculateTokensSinceLastEvent() {
    if (!compactTracking.lastEvent.timestamp) {
        // No event recorded yet, use all tokens
        return tokenMetrics.totalTokens;
    }
    
    const tokensAtEvent = compactTracking.lastEvent.totalTokensAtEvent || 0;
    const currentTokens = tokenMetrics.totalTokens || 0;
    return Math.max(0, currentTokens - tokensAtEvent);
}

async function detectSessionChange(currentSessionId) {
    const previousSessionId = compactTracking.currentSession.sessionId;
    
    if (previousSessionId && currentSessionId !== previousSessionId) {
        // Session changed - this indicates a /clear command
        await handleClearEvent(currentSessionId);
        return true;
    }
    
    // Update session ID if it's new
    if (!previousSessionId && currentSessionId) {
        compactTracking.currentSession.sessionId = currentSessionId;
        compactTracking.currentSession.sessionStartTime = new Date().toISOString();
    }
    
    return false;
}

async function detectCompactionEvent() {
    // Check for compaction by monitoring compact-tracking.json updates
    // Look for new compaction events that aren't session changes
    const now = Date.now();
    const lastCheck = compactTracking.lastCompactionCheck || 0;
    
    // Only check every 30 seconds to avoid spam
    if (now - lastCheck < 30000) {
        return false;
    }
    
    compactTracking.lastCompactionCheck = now;
    
    // Check if we have a recent compaction that's not a session change
    if (compactTracking.lastEvent.type === 'compact' && 
        compactTracking.lastEvent.timestamp) {
        
        const eventTime = new Date(compactTracking.lastEvent.timestamp).getTime();
        const timeSinceEvent = now - eventTime;
        
        // If the compaction event is recent (within 2 minutes) and we haven't processed it
        if (timeSinceEvent < 120000 && !compactTracking.lastEvent.processed) {
            await handleCompactionEvent();
            compactTracking.lastEvent.processed = true;
            return true;
        }
    }
    
    return false;
}

async function handleCompactionEvent() {
    console.log('🔄 Compaction event detected - context reset');
    
    // Record the compaction event
    const compactionEvent = {
        type: 'compact',
        timestamp: new Date().toISOString(),
        sessionId: compactTracking.currentSession.sessionId,
        totalTokensAtEvent: tokenMetrics.totalTokens,
        trigger: 'compaction',
        processed: false,
        formattedTime: new Date().toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        }).toLowerCase()
    };
    
    // Update tracking but keep same session
    compactTracking.lastEvent = compactionEvent;
    compactTracking.currentSession.compactsThisSession = 
        (compactTracking.currentSession.compactsThisSession || 0) + 1;
    
    // Reset session start time to show "session" (really context) restart
    compactTracking.currentSession.sessionStartTime = new Date().toISOString();
    
    // Save the updated tracking
    try {
        fs.writeFileSync(COMPACT_TRACKING_FILE, JSON.stringify(compactTracking, null, 2));
    } catch (error) {
        console.error('❌ Error saving compaction event:', error);
    }
    
    // Add to activity feed
    await addActivity('system', 'Context compacted - conversation reset');
}

async function handleClearEvent(newSessionId) {
    console.log('🔄 Session change detected - /clear command executed');
    
    // Record the clear event
    if (compactTracking.lastEvent.timestamp) {
        compactTracking.eventHistory.push({...compactTracking.lastEvent});
        // Keep only last 20 events
        compactTracking.eventHistory = compactTracking.eventHistory.slice(-20);
    }
    
    // Create clear event record
    const clearEvent = {
        type: 'clear',
        timestamp: new Date().toISOString(),
        sessionId: newSessionId,
        totalTokensAtEvent: tokenMetrics.totalTokens,
        trigger: 'session-change',
        formattedTime: new Date().toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        }).toLowerCase()
    };
    
    // Update tracking
    compactTracking.lastEvent = clearEvent;
    compactTracking.currentSession = {
        sessionId: newSessionId,
        compactsThisSession: 0,
        sessionStartTime: new Date().toISOString(),
        tokensSinceLastEvent: 0
    };
    
    // Save the updated tracking
    try {
        fs.writeFileSync(COMPACT_TRACKING_FILE, JSON.stringify(compactTracking, null, 2));
    } catch (error) {
        console.error('❌ Error saving clear event:', error);
    }
    
    // Add to activity feed
    await addActivity('system', 'Context cleared - new session started');
}

/**
 * Get current session ID for database operations
 */
function getCurrentSessionId() {
    // Use actual Claude session ID from compact tracking if available
    if (compactTracking.currentSession && compactTracking.currentSession.sessionId) {
        return compactTracking.currentSession.sessionId;
    }
    
    // Fallback to process uptime as session identifier
    return `session-${Math.floor(process.uptime())}`;
}

/**
 * Load recent activities from database into dashboard state
 */
async function loadRecentActivities() {
    try {
        const activities = await dbService.getActivities(20, 0);
        
        // Convert database activities to dashboard format
        dashboardState.activity = activities.map(dbActivity => ({
            id: dbActivity.id,
            db_id: dbActivity.id,
            agent: dbActivity.agent,
            description: dbActivity.description,
            files: dbActivity.files,
            timestamp: dbActivity.timestamp,
            time: new Date(dbActivity.timestamp).toLocaleTimeString()
        }));
        
        console.log(`📊 Loaded ${activities.length} activities from database`);
    } catch (error) {
        console.error('❌ Failed to load activities from database:', error);
        // Fallback to empty activity array
        dashboardState.activity = [];
    }
}

/**
 * Initialize or update current session in database
 */
async function initializeSession() {
    try {
        const sessionId = getCurrentSessionId();
        
        // Use session start time from compact tracking if available
        let startTime = new Date().toISOString();
        if (compactTracking.currentSession && compactTracking.currentSession.sessionStartTime) {
            startTime = compactTracking.currentSession.sessionStartTime;
            console.log(`📊 Using session start time from compaction tracking: ${startTime}`);
        }
        
        await dbService.upsertSession({
            session_id: sessionId,
            start_time: startTime,
            project_path: PROJECT_ROOT,
            branch_context: getBranchContext(),
            status: 'active'
        });
        
        console.log(`📊 Session initialized: ${sessionId}`);
    } catch (error) {
        console.error('❌ Failed to initialize session:', error);
    }
}

/**
 * Get current git branch context
 */
function getBranchContext() {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
            cwd: PROJECT_ROOT, 
            encoding: 'utf8' 
        }).trim();
        return branch;
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Load and process all conversation history
 */
async function loadConversationHistory() {
    try {
        console.log('💬 Loading conversation history...');
        
        // Process all conversation files
        const processedConversations = await conversationExtractor.processAllConversations(PROJECT_ROOT);
        
        // Get conversation statistics
        const conversationStats = await dbService.getConversationStats();
        
        // Update dashboard state with conversation metrics
        dashboardState.metrics.conversations = {
            total_conversations: conversationStats.total_conversations,
            total_messages: conversationStats.total_messages,
            searchable_messages: conversationStats.searchable_messages,
            processed_files: processedConversations.length
        };
        
        console.log(`💬 Loaded ${conversationStats.total_conversations} conversations with ${conversationStats.total_messages} total messages`);
        
        return processedConversations;
    } catch (error) {
        console.error('❌ Failed to load conversation history:', error);
        // Initialize empty conversation metrics
        dashboardState.metrics.conversations = {
            total_conversations: 0,
            total_messages: 0,
            searchable_messages: 0,
            processed_files: 0
        };
        return [];
    }
}

/**
 * Start conversation file watcher
 */
function startConversationWatcher() {
    try {
        const watcher = conversationExtractor.startFileWatcher(async (newConversation) => {
            console.log(`💬 New conversation detected: ${newConversation.session_id}`);
            
            // Update conversation metrics
            const conversationStats = await dbService.getConversationStats();
            dashboardState.metrics.conversations = {
                ...dashboardState.metrics.conversations,
                total_conversations: conversationStats.total_conversations,
                total_messages: conversationStats.total_messages,
                searchable_messages: conversationStats.searchable_messages
            };
            
            // Broadcast update to dashboard clients
            broadcastUpdate('conversations', dashboardState.metrics.conversations);
            
            // Add activity for new conversation
            await addActivity('conversation-extractor', 
                `New conversation imported: ${newConversation.metadata.message_count} messages`);
        });
        
        if (watcher) {
            console.log('👁️  Conversation file watcher started');
        }
        
        return watcher;
    } catch (error) {
        console.error('❌ Failed to start conversation watcher:', error);
        return null;
    }
}

async function trackAgentInvocation(agent, estimatedTokens) {
    // Use process start time as session identifier (stable until process restart)
    const currentSessionId = `session-${process.uptime()}`;
    
    // Check for session changes (indicates /clear)
    // Note: Real session detection will be improved when we can access actual Claude session IDs
    await detectSessionChange(currentSessionId);
    
    const session = {
        timestamp: new Date().toISOString(),
        agent,
        tokens: estimatedTokens
    };
    
    tokenMetrics.sessions.push(session);
    
    // Keep only last 50 sessions
    if (tokenMetrics.sessions.length > 50) {
        tokenMetrics.sessions = tokenMetrics.sessions.slice(-50);
    }
    
    // Recalculate metrics
    tokenMetrics.totalTokens = tokenMetrics.sessions.reduce((sum, s) => sum + s.tokens, 0);
    tokenMetrics.averagePerSession = tokenMetrics.sessions.length > 0 
        ? Math.round(tokenMetrics.totalTokens / tokenMetrics.sessions.length)
        : 0;
    
    // Calculate reduction vs baseline (8000 tokens for monolithic)
    const baseline = 8000;
    if (tokenMetrics.averagePerSession > 0) {
        const reduction = Math.round(((baseline - tokenMetrics.averagePerSession) / baseline) * 100);
        tokenMetrics.reductionVsBaseline = Math.max(0, reduction);
    }
    
    // Update dashboard state
    dashboardState.metrics.tokenUsage = {
        current: tokenMetrics.averagePerSession,
        baseline: baseline,
        reduction: tokenMetrics.reductionVsBaseline > 0 ? `↓ ${tokenMetrics.reductionVsBaseline}%` : '0%'
    };
    
    // Update tokens since last event and session stats
    dashboardState.metrics.tokensSinceCompact = {
        tokens: calculateTokensSinceLastEvent(),
        lastEventTime: compactTracking.lastEvent.timestamp,
        lastEventType: compactTracking.lastEvent.type,
        formattedTime: compactTracking.lastEvent.formattedTime || null
    };
    
    dashboardState.metrics.sessionStats = {
        compactsThisSession: compactTracking.currentSession.compactsThisSession,
        sessionStartTime: compactTracking.currentSession.sessionStartTime
    };
    
    saveTokenMetrics();
    console.log(`📊 Token tracking: ${agent} used ~${estimatedTokens} tokens (avg: ${tokenMetrics.averagePerSession}, reduction: ${tokenMetrics.reductionVsBaseline}%)`);
}

function watchCompactTracking() {
    // Watch for compact tracking updates
    if (fs.existsSync(COMPACT_TRACKING_FILE)) {
        fs.watchFile(COMPACT_TRACKING_FILE, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                loadCompactTracking();
                
                // Update dashboard state with new event data
                dashboardState.metrics.tokensSinceCompact = {
                    tokens: calculateTokensSinceLastEvent(),
                    lastEventTime: compactTracking.lastEvent.timestamp,
                    lastEventType: compactTracking.lastEvent.type,
                    formattedTime: compactTracking.lastEvent.formattedTime || null
                };
                
                dashboardState.metrics.sessionStats = {
                    compactsThisSession: compactTracking.currentSession.compactsThisSession,
                    sessionStartTime: compactTracking.currentSession.sessionStartTime
                };
                
                // Broadcast update
                broadcast({
                    type: 'metrics',
                    data: dashboardState.metrics
                });
                
                console.log('📊 Event tracking updated - tokens since last event:', calculateTokensSinceLastEvent());
            }
        });
    }
}

function watchForAgentInvocations() {
    // Watch for pending agent invocations to track token usage
    const pendingFile = path.join(PROJECT_ROOT, '.claude', 'pending-agent-invocations.json');
    
    if (fs.existsSync(pendingFile)) {
        fs.watchFile(pendingFile, async (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
                    if (pending.length > 0) {
                        const latest = pending[pending.length - 1];
                        
                        // Estimate tokens based on agent type
                        const tokenEstimates = {
                            'readme-updater': 1500,
                            'api-documenter': 1800,
                            'component-documenter': 1600,
                            'backlog-manager': 1200,
                            'changelog-updater': 1000,
                            'file-change-analyzer': 800,
                            'documentation-manager': 8000 // Legacy monolithic
                        };
                        
                        const estimatedTokens = tokenEstimates[latest.agent] || 2000;
                        await trackAgentInvocation(latest.agent, estimatedTokens);
                        
                        // Broadcast updated metrics
                        broadcastUpdate('metrics', dashboardState.metrics);
                    }
                } catch (error) {
                    console.error('❌ Error processing agent invocations:', error);
                }
            }
        });
    }
}

function loadAgentDefinitions() {
    const projectAgentsDir = path.join(PROJECT_ROOT, '.claude', 'agents');
    const userAgentsDir = path.join(os.homedir(), '.claude', 'agents');
    dashboardState.agents = {};
    
    // Helper function to load agents from a directory
    const loadFromDirectory = (agentsDir, dirType) => {
        if (!fs.existsSync(agentsDir)) {
            console.log(`⚠️  ${dirType} agents directory not found: ${agentsDir}`);
            return [];
        }
        
        return fs.readdirSync(agentsDir).filter(file => file.endsWith('.md'));
    };
    
    try {
        // Load project-level agents
        const projectAgentFiles = loadFromDirectory(projectAgentsDir, 'Project');
        // Load user-level agents  
        const userAgentFiles = loadFromDirectory(userAgentsDir, 'User');
        
        // Combine all agent files with their source directories
        const allAgentFiles = [
            ...projectAgentFiles.map(file => ({ file, dir: projectAgentsDir, type: 'project' })),
            ...userAgentFiles.map(file => ({ file, dir: userAgentsDir, type: 'user' }))
        ];
        
        allAgentFiles.forEach(({ file, dir, type }) => {
            try {
                const agentPath = path.join(dir, file);
                const content = fs.readFileSync(agentPath, 'utf8');
                
                // Parse frontmatter
                const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
                if (!frontmatterMatch) {
                    console.log(`⚠️  No frontmatter found in ${file}`);
                    return;
                }
                
                const frontmatter = {};
                const frontmatterContent = frontmatterMatch[1];
                const prompt = frontmatterMatch[2].trim();
                
                frontmatterContent.split('\n').forEach(line => {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex > 0) {
                        const key = line.substring(0, colonIndex).trim();
                        const value = line.substring(colonIndex + 1).trim();
                        frontmatter[key] = value;
                    }
                });
                
                const agentName = frontmatter.name;
                if (agentName) {
                    dashboardState.agents[agentName] = {
                        name: agentName,
                        description: frontmatter.description || '',
                        tools: frontmatter.tools || '',
                        color: frontmatter.color || '#6B7280',
                        model: frontmatter.model || 'claude-3-haiku',
                        maxTokens: frontmatter.max_tokens || '2000',
                        priority: frontmatter.priority || 'medium',
                        prompt: prompt,
                        status: 'idle',
                        lastActivity: null
                    };
                }
            } catch (error) {
                console.error(`❌ Error loading agent ${file}:`, error);
            }
        });
        
        const projectCount = projectAgentFiles.length;
        const userCount = userAgentFiles.length;
        const totalCount = Object.keys(dashboardState.agents).length;
        
        // Update metrics with actual agent count
        dashboardState.metrics.activeAgents = totalCount;
        
        console.log(`📋 Loaded ${totalCount} agent definitions (${projectCount} project, ${userCount} user)`);
    } catch (error) {
        console.error('❌ Error loading agent definitions:', error);
    }
}

function calculateMetrics() {
    // Update files watched count
    try {
        const srcDir = path.join(PROJECT_ROOT, 'src');
        const agentsDir = path.join(PROJECT_ROOT, '.claude', 'agents');
        const docsDir = path.join(PROJECT_ROOT, 'docs');
        
        let fileCount = 0;
        
        [srcDir, agentsDir, docsDir].forEach(dir => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir, { recursive: true });
                fileCount += files.filter(file => 
                    typeof file === 'string' && 
                    (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || 
                     file.endsWith('.md') || file.endsWith('.json'))
                ).length;
            }
        });
        
        dashboardState.metrics.filesWatched = fileCount;
    } catch (error) {
        console.error('❌ Error calculating metrics:', error);
    }
    
    // Calculate average response time (mock for now)
    const responseTime = (Math.random() * 2 + 0.5).toFixed(1);
    dashboardState.metrics.avgResponseTime = `${responseTime}s`;
}

// Initialize server
async function startServer() {
    server.listen(PORT, async () => {
        console.log(`🚀 CChorus Development Dashboard running on http://localhost:${PORT}`);
        console.log(`📊 WebSocket server ready for real-time updates`);
        
        // Initialize database and session
        await dbService.initialize();
        
        // Initialize monitoring (load compact tracking first)
        loadTokenMetrics();
        loadCompactTracking();
        loadAgentDefinitions();
        
        // Now initialize session with proper start time from compact tracking
        await initializeSession();
        await loadRecentActivities();
        
        // Load conversation history
        await loadConversationHistory();
        
        // Update dashboard state with loaded token metrics
        if (tokenMetrics.sessions.length > 0) {
            dashboardState.metrics.tokenUsage = {
                current: tokenMetrics.averagePerSession,
                baseline: 8000,
                reduction: tokenMetrics.reductionVsBaseline > 0 ? `↓ ${tokenMetrics.reductionVsBaseline}%` : '0%'
            };
        }
        
        // Initialize tokens since last event and session stats
        dashboardState.metrics.tokensSinceCompact = {
            tokens: calculateTokensSinceLastEvent(),
            lastEventTime: compactTracking.lastEvent.timestamp,
            lastEventType: compactTracking.lastEvent.type,
            formattedTime: compactTracking.lastEvent.formattedTime || null
        };
        
        dashboardState.metrics.sessionStats = {
            compactsThisSession: compactTracking.currentSession.compactsThisSession,
            sessionStartTime: compactTracking.currentSession.sessionStartTime
        };
        
        await updateInfrastructureStatus();
        watchFileChanges();
        watchForAgentInvocations();
        watchCompactTracking();
        startConversationWatcher();
        calculateMetrics();
        
        // Periodic updates - reduced frequency to avoid spam
        setInterval(async () => {
            await updateInfrastructureStatus();
            await detectCompactionEvent(); // Check for compaction events
            calculateMetrics();
            broadcastUpdate('metrics', dashboardState.metrics);
            broadcastUpdate('infrastructure', dashboardState.infrastructure);
        }, 30000);
        
        // Add initial activity
        setTimeout(() => {
            addActivity('file-change-analyzer', 'Dashboard server initialized, monitoring project changes');
        }, 1000);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down dashboard server...');
    
    // Close database connection
    await dbService.close();
    
    server.close(() => {
        console.log('✅ Dashboard server stopped');
        process.exit(0);
    });
});

// Start the server
startServer();