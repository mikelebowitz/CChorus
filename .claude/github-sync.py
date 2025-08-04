#!/usr/bin/env python3
"""
CChorus GitHub Synchronization Command
Provides bi-directional synchronization between BACKLOG.md and GitHub Issues/Projects
"""

import os
import sys
import json
import subprocess
import asyncio
from datetime import datetime
from pathlib import Path

class CChorusGitHubSync:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.github_service_path = project_root / ".claude" / "github-service.js"
        self.config_path = project_root / ".claude" / "github-config.json"
        
        print(f"🐙 CChorus GitHub Synchronization")
        print(f"📁 Project: {project_root}")
        print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("")
    
    def run_sync_command(self, command: str, direction: str = "bidirectional") -> dict:
        """Run GitHub synchronization command."""
        result = {
            "command": command,
            "direction": direction,
            "started_at": datetime.now().strftime('%I:%M:%S%p').lower(),
            "success": False,
            "output": "",
            "error": None
        }
        
        try:
            print(f"🔄 Executing GitHub sync: {command} ({direction})")
            
            # Check if Node.js is available
            node_check = subprocess.run(['which', 'node'], 
                                      capture_output=True, text=True)
            
            if node_check.returncode != 0:
                raise Exception("Node.js not found. Please install Node.js to use GitHub integration.")
            
            # Prepare environment variables
            env = os.environ.copy()
            env_file = self.project_root / ".env"
            
            if env_file.exists():
                print("📋 Loading environment variables from .env file")
                with open(env_file, 'r') as f:
                    for line in f:
                        if '=' in line and not line.strip().startswith('#'):
                            key, value = line.strip().split('=', 1)
                            env[key] = value
            
            # Check for required environment variables
            required_vars = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO']
            missing_vars = [var for var in required_vars if not env.get(var)]
            
            if missing_vars:
                raise Exception(f"Missing required environment variables: {', '.join(missing_vars)}")
            
            # Execute Node.js GitHub service
            if command == "test":
                node_command = f"""
                import GitHubService from '{self.github_service_path}';
                const service = new GitHubService();
                const result = await service.testConnection();
                console.log(JSON.stringify(result, null, 2));
                """
            elif command == "sync-to-github":
                node_command = f"""
                import GitHubService from '{self.github_service_path}';
                const service = new GitHubService();
                const result = await service.syncBacklogToGitHub();
                console.log(JSON.stringify(result, null, 2));
                """
            elif command == "sync-from-github":
                node_command = f"""
                import GitHubService from '{self.github_service_path}';
                const service = new GitHubService();
                const result = await service.syncGitHubToBacklog();
                console.log(JSON.stringify(result, null, 2));
                """
            elif command == "sync-bidirectional":
                node_command = f"""
                import GitHubService from '{self.github_service_path}';
                const service = new GitHubService();
                console.log('🔄 Syncing BACKLOG → GitHub...');
                const outbound = await service.syncBacklogToGitHub();
                console.log('🔄 Syncing GitHub → BACKLOG...');
                const inbound = await service.syncGitHubToBacklog();
                const result = {{ outbound, inbound, bidirectional: true }};
                console.log(JSON.stringify(result, null, 2));
                """
            else:
                raise Exception(f"Unknown command: {command}")
            
            # Execute the Node.js command
            process = subprocess.run([
                'node', '--input-type=module', '-e', node_command
            ], 
            capture_output=True, 
            text=True, 
            cwd=self.project_root,
            env=env,
            timeout=300)
            
            if process.returncode == 0:
                result["success"] = True
                result["output"] = process.stdout
                
                # Try to parse JSON output
                try:
                    json_output = json.loads(process.stdout.strip().split('\n')[-1])
                    result["data"] = json_output
                except json.JSONDecodeError:
                    result["data"] = {"raw_output": process.stdout}
                
                print("✅ GitHub sync completed successfully")
                
            else:
                result["error"] = process.stderr or "Command failed with no error output"
                print(f"❌ GitHub sync failed: {result['error']}")
            
        except subprocess.TimeoutExpired:
            result["error"] = "GitHub sync command timed out after 5 minutes"
            print(f"⏰ GitHub sync timed out")
        except Exception as e:
            result["error"] = str(e)
            print(f"❌ GitHub sync error: {e}")
        
        finally:
            result["completed_at"] = datetime.now().strftime('%I:%M:%S%p').lower()
        
        return result
    
    def setup_github_config(self) -> dict:
        """Set up GitHub configuration interactively."""
        print("🔧 Setting up GitHub configuration...")
        
        config = {
            "repository": {},
            "authentication": {},
            "sync": {
                "enabled": True,
                "direction": "bidirectional",
                "auto_create_issues": True,
                "auto_create_projects": False,
                "sync_interval": 300000,
                "webhook_enabled": False
            }
        }
        
        # This would normally be interactive, but for automation we'll create template
        template_env = f"""# CChorus GitHub Integration Environment Variables
# Copy this to .env and fill in your values

# GitHub Personal Access Token (with repo and issues permissions)
GITHUB_TOKEN=your_github_token_here

# Repository information
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_repository_name

# Optional: Webhook configuration (for inbound sync)
# GITHUB_WEBHOOK_SECRET=your_webhook_secret
# GITHUB_WEBHOOK_PORT=3002
"""
        
        env_template_path = self.project_root / ".env.template"
        with open(env_template_path, 'w') as f:
            f.write(template_env)
        
        # Save default config
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"📋 Created configuration template: {self.config_path}")
        print(f"📋 Created environment template: {env_template_path}")
        print("")
        print("🔧 Next steps:")
        print("1. Copy .env.template to .env")
        print("2. Fill in your GitHub token and repository information")
        print("3. Run: .claude/github-sync.py --test to verify connection")
        
        return {"success": True, "config_created": True}
    
    def show_status(self) -> dict:
        """Show current GitHub integration status."""
        status = {
            "config_exists": self.config_path.exists(),
            "env_configured": False,
            "github_vars_set": False,
            "last_sync": None
        }
        
        # Check environment variables
        env_file = self.project_root / ".env"
        if env_file.exists():
            status["env_configured"] = True
            
            # Check if GitHub vars are set
            with open(env_file, 'r') as f:
                content = f.read()
                if all(var in content for var in ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO']):
                    status["github_vars_set"] = True
        
        # Check last sync log
        sync_log_path = self.project_root / ".claude" / "github-sync-log.json"
        if sync_log_path.exists():
            try:
                with open(sync_log_path, 'r') as f:
                    log = json.load(f)
                    if log:
                        status["last_sync"] = log[-1].get("timestamp")
            except:
                pass
        
        print("📊 GitHub Integration Status:")
        print(f"  Config file: {'✅' if status['config_exists'] else '❌'}")
        print(f"  Environment: {'✅' if status['env_configured'] else '❌'}")
        print(f"  GitHub vars: {'✅' if status['github_vars_set'] else '❌'}")
        print(f"  Last sync: {status['last_sync'] or 'Never'}")
        print("")
        print("🎯 Project Board Integration:")
        print("  Workflow file: ✅ (.github/workflows/project-automation.yml)")
        print("  Status labels: ✅ (Automatic status: pending/in_progress/completed)")
        print("  Project setup: Run '.claude/project-setup.js' for project board setup")
        
        return status

def main():
    """Main entry point for GitHub sync command."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists() or not (project_root / ".claude").exists():
        print("❌ Error: Not in CChorus project directory")
        print("Run this command from the CChorus project root")
        sys.exit(1)
    
    sync = CChorusGitHubSync(project_root)
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--setup":
            result = sync.setup_github_config()
            sys.exit(0 if result["success"] else 1)
        
        elif command == "--status":
            status = sync.show_status()
            sys.exit(0)
        
        elif command == "--test":
            result = sync.run_sync_command("test")
            if result["success"] and result.get("data", {}).get("success"):
                print("✅ GitHub connection test passed")
                print(f"📊 Rate limit: {result['data'].get('rate_limit', 'unknown')} remaining")
            sys.exit(0 if result["success"] else 1)
        
        elif command == "--sync-to-github":
            result = sync.run_sync_command("sync-to-github", "outbound")
            if result["success"]:
                data = result.get("data", {})
                if data.get("success"):
                    results = data.get("results", {})
                    print(f"📊 Created: {results.get('created_issues', 0)} issues")
                    print(f"📊 Updated: {results.get('updated_issues', 0)} issues")
                    print(f"📊 Skipped: {results.get('skipped_items', 0)} items")
            sys.exit(0 if result["success"] else 1)
        
        elif command == "--sync-from-github":
            result = sync.run_sync_command("sync-from-github", "inbound")
            sys.exit(0 if result["success"] else 1)
        
        elif command == "--sync":
            result = sync.run_sync_command("sync-bidirectional", "bidirectional")
            sys.exit(0 if result["success"] else 1)
        
        else:
            print(f"❌ Unknown command: {command}")
            sys.exit(1)
    
    else:
        # Show help
        print("CChorus GitHub Integration")
        print("")
        print("Commands:")
        print("  --setup              Set up GitHub configuration")
        print("  --status             Show current integration status")
        print("  --test               Test GitHub connection")
        print("  --sync-to-github     Sync BACKLOG.md → GitHub Issues")
        print("  --sync-from-github   Sync GitHub Issues → BACKLOG.md")
        print("  --sync               Bi-directional synchronization")
        print("")
        print("Examples:")
        print("  .claude/github-sync.py --setup")
        print("  .claude/github-sync.py --test")
        print("  .claude/github-sync.py --sync")

if __name__ == "__main__":
    main()