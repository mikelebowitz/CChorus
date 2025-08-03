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
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.DASHBOARD_PORT || 3002;
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Dashboard state
let dashboardState = {
    agents: {
        'file-change-analyzer': { status: 'idle', lastActivity: null, color: '#06B6D4' },
        'readme-updater': { status: 'idle', lastActivity: null, color: '#3B82F6' },
        'api-documenter': { status: 'idle', lastActivity: null, color: '#10B981' },
        'component-documenter': { status: 'idle', lastActivity: null, color: '#F59E0B' },
        'backlog-manager': { status: 'idle', lastActivity: null, color: '#EF4444' },
        'changelog-updater': { status: 'idle', lastActivity: null, color: '#8B5CF6' }
    },
    metrics: {
        activeAgents: 6,
        filesWatched: 0,
        recentChanges: 0,
        avgResponseTime: '0.0s'
    },
    activity: [],
    infrastructure: {
        fileWatcher: 'unknown',
        githubSync: 'unknown',
        autoBranchCreator: 'unknown',
        vsCodeTasks: 'unknown'
    }
};

// Serve static dashboard
app.use(express.static(path.join(__dirname)));

// Root route - serve the dashboard HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dev-dashboard.html'));
});

// API endpoints
app.get('/api/status', (req, res) => {
    res.json(dashboardState);
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

function addActivity(agent, description, files = []) {
    const activity = {
        id: Date.now(),
        agent,
        description,
        files,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString()
    };
    
    dashboardState.activity.unshift(activity);
    
    // Keep only last 20 activities
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

function updateInfrastructureStatus() {
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
}

function watchFileChanges() {
    const triggerFile = path.join(PROJECT_ROOT, '.claude', 'doc-update-needed.trigger');
    const pendingFile = path.join(PROJECT_ROOT, '.claude', 'pending-agent-invocations.json');
    
    // Watch trigger file for changes
    if (fs.existsSync(triggerFile)) {
        fs.watchFile(triggerFile, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                try {
                    const trigger = JSON.parse(fs.readFileSync(triggerFile, 'utf8'));
                    addActivity('file-change-analyzer', 
                        `Detected ${trigger.change_count || 'multiple'} file changes`,
                        trigger.changes_detected || []
                    );
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
function startServer() {
    server.listen(PORT, () => {
        console.log(`🚀 CChorus Development Dashboard running on http://localhost:${PORT}`);
        console.log(`📊 WebSocket server ready for real-time updates`);
        
        // Initialize monitoring
        updateInfrastructureStatus();
        watchFileChanges();
        calculateMetrics();
        
        // Periodic updates
        setInterval(() => {
            updateInfrastructureStatus();
            calculateMetrics();
            broadcastUpdate('metrics', dashboardState.metrics);
        }, 10000);
        
        // Add initial activity
        setTimeout(() => {
            addActivity('file-change-analyzer', 'Dashboard server initialized, monitoring project changes');
        }, 1000);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down dashboard server...');
    server.close(() => {
        console.log('✅ Dashboard server stopped');
        process.exit(0);
    });
});

// Start the server
startServer();