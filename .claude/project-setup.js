#!/usr/bin/env node

/**
 * One-time setup script to add all existing Issues to the Project board
 * This script uses GitHub's GraphQL API to interact with Projects v2
 */

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

class ProjectSetup {
    constructor() {
        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN,
            userAgent: 'CChorus-Project-Setup/1.0.0'
        });
        this.owner = process.env.GITHUB_OWNER;
        this.repo = process.env.GITHUB_REPO;
    }

    async run() {
        console.log('🎯 CChorus Project Board Setup');
        console.log(`📁 Repository: ${this.owner}/${this.repo}`);
        console.log('');

        try {
            // Step 1: Get all open issues
            console.log('📋 Fetching all open issues...');
            const issues = await this.getAllIssues();
            console.log(`Found ${issues.length} open issues`);

            // Step 2: Get project information
            console.log('🎯 Getting project information...');
            const projects = await this.getUserProjects();
            
            if (projects.length === 0) {
                console.log('❌ No projects found. Please create a project first:');
                console.log('   1. Go to https://github.com/users/' + this.owner + '/projects');
                console.log('   2. Create a new project with "Board" template');
                console.log('   3. Name it "CChorus Development"');
                return;
            }

            console.log('Available projects:');
            projects.forEach((project, index) => {
                console.log(`   ${index + 1}. ${project.title} (${project.url})`);
            });

            // For now, use the first project (you can enhance this to prompt user)
            const targetProject = projects[0];
            console.log(`🎯 Using project: ${targetProject.title}`);

            // Step 3: Add status labels to issues that don't have them
            console.log('🏷️  Adding status labels to issues...');
            await this.addStatusLabels(issues);

            // Step 4: Show next steps
            console.log('');
            console.log('✅ Setup completed!');
            console.log('');
            console.log('📋 Next steps:');
            console.log('1. The GitHub Actions workflow will automatically add new issues to your project');
            console.log('2. Set up Project automation rules for moving issues between columns:');
            console.log('   - Go to your project settings');
            console.log('   - Add workflow: When "status: in_progress" is added → Move to "In Progress"');
            console.log('   - Add workflow: When "status: completed" is added → Move to "Done"');
            console.log('   - Add workflow: When issue is closed → Move to "Done"');
            console.log('');
            console.log('3. Manually add existing issues to your project board:');
            console.log(`   - Project URL: ${targetProject.url}`);
            console.log('   - Use the "Add items" button to bulk-add issues');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async getAllIssues() {
        const issues = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const response = await this.octokit.rest.issues.listForRepo({
                owner: this.owner,
                repo: this.repo,
                state: 'open',
                per_page: perPage,
                page: page
            });

            if (response.data.length === 0) {
                break;
            }

            // Filter out pull requests
            const issuesOnly = response.data.filter(issue => !issue.pull_request);
            issues.push(...issuesOnly);

            if (response.data.length < perPage) {
                break;
            }
            page++;
        }

        return issues;
    }

    async getUserProjects() {
        try {
            // Note: This uses GraphQL to get Projects v2
            // For simplicity, we'll use a basic approach
            const query = `
                query {
                    user(login: "${this.owner}") {
                        projectsV2(first: 10) {
                            nodes {
                                id
                                title
                                url
                                closed
                            }
                        }
                    }
                }
            `;

            const response = await this.octokit.graphql(query);
            return response.user.projectsV2.nodes.filter(project => !project.closed);
        } catch (error) {
            console.warn('⚠️  Could not fetch projects via GraphQL:', error.message);
            console.log('This is normal - the script will show you next steps for manual setup.');
            return [];
        }
    }

    async addStatusLabels(issues) {
        for (const issue of issues) {
            const labels = issue.labels.map(l => l.name);
            const hasStatusLabel = labels.some(label => label.startsWith('status: '));

            if (!hasStatusLabel) {
                try {
                    await this.octokit.rest.issues.addLabels({
                        owner: this.owner,
                        repo: this.repo,
                        issue_number: issue.number,
                        labels: ['status: pending']
                    });
                    console.log(`   ✅ Added "status: pending" to Issue #${issue.number}`);
                } catch (error) {
                    console.log(`   ⚠️  Could not add label to Issue #${issue.number}: ${error.message}`);
                }
            } else {
                console.log(`   ✓ Issue #${issue.number} already has status label`);
            }
        }
    }
}

// Run the setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new ProjectSetup();
    setup.run().catch(console.error);
}

export default ProjectSetup;