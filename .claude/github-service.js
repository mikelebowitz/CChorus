/**
 * CChorus GitHub Integration Service
 * Provides bi-directional synchronization between BACKLOG.md and GitHub Issues/Projects
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

class CChorusGitHubService {
    constructor() {
        this.projectRoot = projectRoot;
        this.configPath = path.join(this.projectRoot, '.claude', 'github-config.json');
        this.syncLogPath = path.join(this.projectRoot, '.claude', 'github-sync-log.json');
        this.backlogPath = path.join(this.projectRoot, 'BACKLOG.md');
        
        // Initialize GitHub API
        this.octokit = null;
        this.config = this.loadConfig();
        
        // Rate limiting
        this.rateLimitRemaining = 5000;
        this.rateLimitReset = Date.now();
        
        console.log('🐙 CChorus GitHub Service initialized');
    }
    
    /**
     * Load GitHub configuration
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                return config;
            }
        } catch (error) {
            console.warn('⚠️  Could not load GitHub config:', error.message);
        }
        
        // Create default configuration
        const defaultConfig = {
            repository: {
                owner: process.env.GITHUB_OWNER || '',
                repo: process.env.GITHUB_REPO || '',
            },
            authentication: {
                token: process.env.GITHUB_TOKEN || '',
                type: 'token'
            },
            sync: {
                enabled: false,
                direction: 'bidirectional', // 'outbound', 'inbound', 'bidirectional'
                auto_create_issues: true,
                auto_create_projects: true,
                sync_interval: 300000, // 5 minutes
                webhook_enabled: false
            },
            mapping: {
                priority_labels: {
                    high: 'priority: high',
                    medium: 'priority: medium',
                    low: 'priority: low'
                },
                category_labels: {
                    'UI/UX Improvements': 'type: ui',
                    'Feature Migration': 'type: feature',
                    'Documentation Automation': 'type: docs',
                    'Performance Optimization': 'type: performance',
                    'Developer Experience': 'type: dev-experience',
                    'Testing & Quality': 'type: testing',
                    'Technical Debt': 'type: tech-debt'
                },
                status_mapping: {
                    'pending': 'open',
                    'in_progress': 'open',
                    'completed': 'closed'
                }
            }
        };
        
        // Save default config
        this.saveConfig(defaultConfig);
        return defaultConfig;
    }
    
    /**
     * Save GitHub configuration
     */
    saveConfig(config) {
        try {
            const claudeDir = path.dirname(this.configPath);
            if (!fs.existsSync(claudeDir)) {
                fs.mkdirSync(claudeDir, { recursive: true });
            }
            
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            console.log('📝 GitHub configuration saved');
        } catch (error) {
            console.error('❌ Error saving GitHub config:', error.message);
        }
    }
    
    /**
     * Initialize GitHub API connection
     */
    async initialize() {
        if (!this.config.authentication.token) {
            throw new Error('GitHub token not configured. Set GITHUB_TOKEN environment variable or update config.');
        }
        
        if (!this.config.repository.owner || !this.config.repository.repo) {
            throw new Error('GitHub repository not configured. Set GITHUB_OWNER and GITHUB_REPO environment variables or update config.');
        }
        
        this.octokit = new Octokit({
            auth: this.config.authentication.token,
            userAgent: 'CChorus-GitHub-Integration/1.0.0'
        });
        
        // Test authentication
        try {
            const { data: user } = await this.octokit.rest.users.getAuthenticated();
            console.log(`✅ Authenticated as: ${user.login}`);
            
            // Test repository access
            const { data: repo } = await this.octokit.rest.repos.get({
                owner: this.config.repository.owner,
                repo: this.config.repository.repo
            });
            console.log(`✅ Repository access confirmed: ${repo.full_name}`);
            
            return true;
        } catch (error) {
            console.error('❌ GitHub authentication failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Check and update rate limit status
     */
    async checkRateLimit() {
        try {
            const { data: rateLimit } = await this.octokit.rest.rateLimit.get();
            this.rateLimitRemaining = rateLimit.rate.remaining;
            this.rateLimitReset = new Date(rateLimit.rate.reset * 1000);
            
            if (this.rateLimitRemaining < 100) {
                console.warn(`⚠️  GitHub rate limit low: ${this.rateLimitRemaining} remaining`);
                console.warn(`   Resets at: ${this.rateLimitReset.toISOString()}`);
            }
            
            return this.rateLimitRemaining > 0;
        } catch (error) {
            console.error('❌ Error checking rate limit:', error.message);
            return false;
        }
    }
    
    /**
     * Parse BACKLOG.md and extract items
     */
    parseBacklogItems() {
        try {
            if (!fs.existsSync(this.backlogPath)) {
                console.warn('⚠️  BACKLOG.md not found');
                return [];
            }
            
            const content = fs.readFileSync(this.backlogPath, 'utf8');
            const items = [];
            
            const lines = content.split('\n');
            let currentCategory = null;
            let currentSection = null;
            
            for (const line of lines) {
                // Detect section headers
                if (line.startsWith('## ')) {
                    currentSection = line.replace('## ', '').trim();
                    continue;
                }
                
                // Detect category headers
                if (line.startsWith('### ')) {
                    currentCategory = line.replace('### ', '').trim();
                    continue;
                }
                
                // Parse items
                if (line.trim().startsWith('- **') && currentCategory && currentSection) {
                    const match = line.match(/- \*\*(.*?)\*\*\s*(?:`\[([^\]]+)\]`)?\s*-?\s*(.*)/);
                    if (match) {
                        const [, title, metadata, description] = match;
                        
                        // Extract branch metadata
                        let branchName = null;
                        let status = 'pending';
                        
                        if (metadata) {
                            const branchMatch = metadata.match(/new-branch:\s*([^,\]]+)/);
                            if (branchMatch) {
                                branchName = branchMatch[1].trim();
                            }
                            
                            if (metadata.includes('COMPLETED ✅')) {
                                status = 'completed';
                            } else if (metadata.includes('BRANCH-CREATED ✅')) {
                                status = 'in_progress';
                            }
                        }
                        
                        items.push({
                            title: title.trim(),
                            description: description.trim(),
                            category: currentCategory,
                            section: currentSection,
                            branchName,
                            status,
                            metadata,
                            priority: this.determinePriority(currentSection, title, description)
                        });
                    }
                }
            }
            
            console.log(`📋 Parsed ${items.length} items from BACKLOG.md`);
            return items;
            
        } catch (error) {
            console.error('❌ Error parsing BACKLOG.md:', error.message);
            return [];
        }
    }
    
    /**
     * Determine priority based on section and content
     */
    determinePriority(section, title, description) {
        const content = `${section} ${title} ${description}`.toLowerCase();
        
        if (content.includes('high priority') || content.includes('urgent') || content.includes('critical')) {
            return 'high';
        } else if (content.includes('research') || content.includes('investigation') || content.includes('technical debt')) {
            return 'low';
        } else {
            return 'medium';
        }
    }
    
    /**
     * Create GitHub Issue from BACKLOG item
     */
    async createIssueFromBacklogItem(item) {
        if (!this.octokit) {
            throw new Error('GitHub service not initialized');
        }
        
        try {
            // Check rate limit
            if (!(await this.checkRateLimit())) {
                throw new Error('GitHub rate limit exceeded');
            }
            
            // Prepare issue data
            const labels = [];
            
            // Add priority label
            const priorityLabel = this.config.mapping.priority_labels[item.priority];
            if (priorityLabel) labels.push(priorityLabel);
            
            // Add category label
            const categoryLabel = this.config.mapping.category_labels[item.category];
            if (categoryLabel) labels.push(categoryLabel);
            
            // Add section-based labels
            if (item.section.includes('High Priority')) labels.push('high-priority');
            if (item.branchName) labels.push('has-branch');
            
            // Create issue
            const issueData = {
                owner: this.config.repository.owner,
                repo: this.config.repository.repo,
                title: item.title,
                body: this.generateIssueBody(item),
                labels: labels
            };
            
            const { data: issue } = await this.octokit.rest.issues.create(issueData);
            
            console.log(`✅ Created GitHub Issue #${issue.number}: ${item.title}`);
            
            // Log the creation
            this.logSyncAction('create_issue', {
                issue_number: issue.number,
                title: item.title,
                category: item.category,
                priority: item.priority
            });
            
            return issue;
            
        } catch (error) {
            console.error(`❌ Error creating issue for "${item.title}":`, error.message);
            throw error;
        }
    }
    
    /**
     * Generate GitHub Issue body from BACKLOG item
     */
    generateIssueBody(item) {
        let body = `## Description\n\n${item.description}\n\n`;
        
        body += `## Details\n\n`;
        body += `- **Category**: ${item.category}\n`;
        body += `- **Section**: ${item.section}\n`;
        body += `- **Priority**: ${item.priority}\n`;
        body += `- **Status**: ${item.status}\n`;
        
        if (item.branchName) {
            body += `- **Branch**: \`${item.branchName}\`\n`;
        }
        
        body += `\n## CChorus Integration\n\n`;
        body += `This issue was automatically created from CChorus BACKLOG.md.\n`;
        body += `- **Source**: BACKLOG.md\n`;
        body += `- **Auto-sync**: Enabled\n`;
        
        if (item.metadata) {
            body += `- **Metadata**: \`${item.metadata}\`\n`;
        }
        
        body += `\n---\n*🤖 Auto-generated by CChorus GitHub Integration*`;
        
        return body;
    }
    
    /**
     * Sync all BACKLOG items to GitHub Issues
     */
    async syncBacklogToGitHub() {
        try {
            console.log('🔄 Starting BACKLOG → GitHub synchronization...');
            
            if (!this.config.sync.enabled) {
                console.log('⏸️  GitHub sync disabled in configuration');
                return { success: false, reason: 'sync_disabled' };
            }
            
            await this.initialize();
            
            const backlogItems = this.parseBacklogItems();
            const results = {
                total_items: backlogItems.length,
                created_issues: 0,
                updated_issues: 0,
                skipped_items: 0,
                errors: []
            };
            
            // Get existing issues to avoid duplicates
            const existingIssues = await this.getExistingIssues();
            
            for (const item of backlogItems) {
                try {
                    // Skip completed items
                    if (item.status === 'completed') {
                        results.skipped_items++;
                        continue;
                    }
                    
                    // Check if issue already exists
                    const existingIssue = existingIssues.find(issue => 
                        issue.title === item.title || 
                        issue.body.includes(`**Source**: BACKLOG.md`) && issue.body.includes(item.title)
                    );
                    
                    if (existingIssue) {
                        // Update existing issue if needed
                        const updated = await this.updateIssueFromBacklogItem(existingIssue, item);
                        if (updated) results.updated_issues++;
                        else results.skipped_items++;
                    } else {
                        // Create new issue
                        await this.createIssueFromBacklogItem(item);
                        results.created_issues++;
                    }
                    
                    // Rate limiting delay
                    await this.sleep(100);
                    
                } catch (error) {
                    console.error(`❌ Error processing item "${item.title}":`, error.message);
                    results.errors.push({ item: item.title, error: error.message });
                }
            }
            
            console.log('✅ BACKLOG → GitHub sync completed');
            console.log(`📊 Results: ${results.created_issues} created, ${results.updated_issues} updated, ${results.skipped_items} skipped`);
            
            return { success: true, results };
            
        } catch (error) {
            console.error('❌ BACKLOG → GitHub sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get existing GitHub Issues
     */
    async getExistingIssues() {
        try {
            const { data: issues } = await this.octokit.rest.issues.listForRepo({
                owner: this.config.repository.owner,
                repo: this.config.repository.repo,
                state: 'all',
                per_page: 100
            });
            
            return issues;
        } catch (error) {
            console.error('❌ Error fetching existing issues:', error.message);
            return [];
        }
    }
    
    /**
     * Update GitHub Issue from BACKLOG item
     */
    async updateIssueFromBacklogItem(issue, item) {
        try {
            // Check if update is needed
            const needsUpdate = 
                issue.state !== this.config.mapping.status_mapping[item.status] ||
                !issue.body.includes(item.description);
            
            if (!needsUpdate) {
                return false;
            }
            
            const updateData = {
                owner: this.config.repository.owner,
                repo: this.config.repository.repo,
                issue_number: issue.number,
                body: this.generateIssueBody(item),
                state: this.config.mapping.status_mapping[item.status]
            };
            
            await this.octokit.rest.issues.update(updateData);
            
            console.log(`✅ Updated GitHub Issue #${issue.number}: ${item.title}`);
            
            this.logSyncAction('update_issue', {
                issue_number: issue.number,
                title: item.title,
                old_state: issue.state,
                new_state: updateData.state
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error updating issue #${issue.number}:`, error.message);
            return false;
        }
    }
    
    /**
     * Sync GitHub Issues back to BACKLOG.md
     */
    async syncGitHubToBacklog() {
        try {
            console.log('🔄 Starting GitHub → BACKLOG synchronization...');
            
            await this.initialize();
            
            const issues = await this.getExistingIssues();
            const cChorusIssues = issues.filter(issue => 
                issue.body && issue.body.includes('CChorus GitHub Integration')
            );
            
            console.log(`📋 Found ${cChorusIssues.length} CChorus-related issues`);
            
            // This would update BACKLOG.md based on issue states
            // Implementation depends on desired behavior for inbound sync
            
            return { success: true, issues_processed: cChorusIssues.length };
            
        } catch (error) {
            console.error('❌ GitHub → BACKLOG sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Log synchronization actions
     */
    logSyncAction(action, data) {
        try {
            let log = [];
            if (fs.existsSync(this.syncLogPath)) {
                log = JSON.parse(fs.readFileSync(this.syncLogPath, 'utf8'));
            }
            
            const entry = {
                timestamp: new Date().toISOString(),
                action,
                data
            };
            
            log.push(entry);
            
            // Keep only last 1000 entries
            if (log.length > 1000) {
                log = log.slice(-1000);
            }
            
            fs.writeFileSync(this.syncLogPath, JSON.stringify(log, null, 2));
            
        } catch (error) {
            console.error('❌ Error logging sync action:', error.message);
        }
    }
    
    /**
     * Utility function for rate limiting delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Test GitHub connection and configuration
     */
    async testConnection() {
        try {
            console.log('🧪 Testing GitHub connection...');
            
            await this.initialize();
            await this.checkRateLimit();
            
            console.log('✅ GitHub connection test successful');
            return { success: true, authenticated: true, rate_limit: this.rateLimitRemaining };
            
        } catch (error) {
            console.error('❌ GitHub connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export default CChorusGitHubService;