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
let tokenMetrics = {
    sessions: [],
    totalTokens: 0,
    averagePerSession: 0,
    reductionVsBaseline: 0
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

async function checkServerStatus(port) {
    try {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                method: 'HEAD',
                timeout: 2000
            }, (res) => {
                resolve(res.statusCode >= 200 && res.statusCode < 500); // Accept 404 as "running"
            });
            
            req.on('error', (error) => {
                console.log(`Server check error for port ${port}:`, error.message);
                resolve(false);
            });
            
            req.on('timeout', () => {
                console.log(`Server check timeout for port ${port}`);
                req.destroy();
                resolve(false);
            });
            
            req.setTimeout(2000);
            req.end();
        });
    } catch (error) {
        console.log(`Server check exception for port ${port}:`, error);
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

function trackAgentInvocation(agent, estimatedTokens) {
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
    
    saveTokenMetrics();
    console.log(`📊 Token tracking: ${agent} used ~${estimatedTokens} tokens (avg: ${tokenMetrics.averagePerSession}, reduction: ${tokenMetrics.reductionVsBaseline}%)`);
}

function watchForAgentInvocations() {
    // Watch for pending agent invocations to track token usage
    const pendingFile = path.join(PROJECT_ROOT, '.claude', 'pending-agent-invocations.json');
    
    if (fs.existsSync(pendingFile)) {
        fs.watchFile(pendingFile, (curr, prev) => {
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
                        trackAgentInvocation(latest.agent, estimatedTokens);
                        
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
    const agentsDir = path.join(PROJECT_ROOT, '.claude', 'agents');
    dashboardState.agents = {};
    
    try {
        if (!fs.existsSync(agentsDir)) {
            console.log('⚠️  Agents directory not found');
            return;
        }
        
        const agentFiles = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md'));
        
        agentFiles.forEach(file => {
            try {
                const agentPath = path.join(agentsDir, file);
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
        
        console.log(`📋 Loaded ${Object.keys(dashboardState.agents).length} agent definitions`);
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
        
        // Initialize monitoring
        loadTokenMetrics();
        loadAgentDefinitions();
        
        // Update dashboard state with loaded token metrics
        if (tokenMetrics.sessions.length > 0) {
            dashboardState.metrics.tokenUsage = {
                current: tokenMetrics.averagePerSession,
                baseline: 8000,
                reduction: tokenMetrics.reductionVsBaseline > 0 ? `↓ ${tokenMetrics.reductionVsBaseline}%` : '0%'
            };
        }
        
        await updateInfrastructureStatus();
        watchFileChanges();
        watchForAgentInvocations();
        calculateMetrics();
        
        // Periodic updates
        setInterval(async () => {
            await updateInfrastructureStatus();
            calculateMetrics();
            broadcastUpdate('metrics', dashboardState.metrics);
            broadcastUpdate('infrastructure', dashboardState.infrastructure);
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