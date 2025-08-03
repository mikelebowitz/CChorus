#!/usr/bin/env python3
"""
CChorus Auto-Branch Creation System
Monitors BACKLOG.md for [new-branch] metadata and automatically creates branches when triggered.
"""

import os
import sys
import json
import time
import subprocess
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

class CChorusAutoBranchCreator:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.backlog_path = project_root / "BACKLOG.md"
        self.branch_log_path = project_root / ".claude" / "auto-branch-log.json"
        self.session_trigger_path = project_root / ".claude" / "pending-agent-invocations.json"
        
        # Ensure .claude directory exists
        (project_root / ".claude").mkdir(exist_ok=True)
        
        # Load previous branch creation log
        self.branch_log = self._load_branch_log()
        
        print(f"🌟 CChorus Auto-Branch Creator initialized")
        print(f"📁 Project: {project_root}")
        print(f"📋 Monitoring: {self.backlog_path}")
    
    def _load_branch_log(self) -> Dict:
        """Load previous branch creation log to avoid duplicates."""
        try:
            if self.branch_log_path.exists():
                with open(self.branch_log_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️  Could not load branch log: {e}")
        
        return {
            "created_branches": [],
            "last_scan": None,
            "statistics": {
                "total_branches_created": 0,
                "last_creation_date": None
            }
        }
    
    def _save_branch_log(self):
        """Save branch creation log."""
        try:
            with open(self.branch_log_path, 'w') as f:
                json.dump(self.branch_log, f, indent=2)
        except Exception as e:
            print(f"❌ Error saving branch log: {e}")
    
    def scan_for_branch_metadata(self) -> List[Dict]:
        """Scan BACKLOG.md for [new-branch] metadata that hasn't been processed."""
        try:
            if not self.backlog_path.exists():
                print(f"⚠️  BACKLOG.md not found at {self.backlog_path}")
                return []
            
            content = self.backlog_path.read_text()
            
            # Find all [new-branch: branch-name] patterns
            pattern = r'(.+?)\s*`\[new-branch:\s*([^\]]+)\]`'
            matches = re.findall(pattern, content, re.MULTILINE)
            
            new_triggers = []
            for description, branch_name in matches:
                branch_name = branch_name.strip()
                description = description.strip('- ').strip('*').strip()
                
                # Check if we've already processed this branch
                already_created = any(
                    log_entry['branch_name'] == branch_name 
                    for log_entry in self.branch_log.get('created_branches', [])
                )
                
                if not already_created:
                    new_triggers.append({
                        'branch_name': branch_name,
                        'description': description,
                        'source': 'BACKLOG.md metadata',
                        'timestamp': datetime.now().isoformat(),
                        'priority': self._determine_priority(description)
                    })
            
            if new_triggers:
                print(f"🎯 Found {len(new_triggers)} new branch creation triggers")
                for trigger in new_triggers:
                    print(f"  📝 {trigger['branch_name']}: {trigger['description'][:60]}...")
            
            return new_triggers
            
        except Exception as e:
            print(f"❌ Error scanning BACKLOG.md: {e}")
            return []
    
    def _determine_priority(self, description: str) -> str:
        """Determine branch priority based on description keywords."""
        description_lower = description.lower()
        
        # High priority keywords
        if any(keyword in description_lower for keyword in [
            'critical', 'urgent', 'blocker', 'breaking', 'security', 'bug', 'fix'
        ]):
            return 'high'
        
        # Medium priority keywords
        elif any(keyword in description_lower for keyword in [
            'feature', 'enhancement', 'improvement', 'api', 'component'
        ]):
            return 'medium'
        
        # Default to low priority
        return 'low'
    
    def create_branch(self, trigger: Dict) -> bool:
        """Create a new Git branch based on trigger metadata."""
        branch_name = trigger['branch_name']
        
        try:
            print(f"🚀 Creating branch: {branch_name}")
            
            # Check current Git status
            current_status = self._get_git_status()
            if current_status['has_changes']:
                print(f"⚠️  Uncommitted changes detected. Please commit or stash changes before branch creation.")
                return False
            
            # Ensure we're on main/master branch for new branch creation
            if not self._ensure_main_branch():
                return False
            
            # Pull latest changes
            if not self._pull_latest_changes():
                return False
            
            # Create the new branch
            result = subprocess.run([
                'git', 'checkout', '-b', branch_name
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode != 0:
                print(f"❌ Failed to create branch {branch_name}: {result.stderr}")
                return False
            
            print(f"✅ Successfully created branch: {branch_name}")
            
            # Push the new branch to remote
            if self._push_branch_to_remote(branch_name):
                print(f"📤 Branch pushed to remote successfully")
            
            # Log the branch creation
            self._log_branch_creation(trigger)
            
            # Create GitOps agent invocation for branch management
            self._create_gitops_invocation(trigger)
            
            # Create GitHub Issue if integration is enabled
            self._create_github_issue(trigger)
            
            # Update BACKLOG.md to mark branch as created
            self._update_backlog_branch_status(trigger)
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating branch {branch_name}: {e}")
            return False
    
    def _get_git_status(self) -> Dict:
        """Get current Git repository status."""
        try:
            result = subprocess.run([
                'git', 'status', '--porcelain'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            status = {
                'has_changes': bool(result.stdout.strip()),
                'current_branch': self._get_current_branch(),
                'changes': result.stdout.strip().split('\n') if result.stdout.strip() else []
            }
            
            return status
            
        except Exception as e:
            print(f"❌ Error getting Git status: {e}")
            return {'has_changes': True, 'current_branch': 'unknown'}
    
    def _get_current_branch(self) -> str:
        """Get the current Git branch name."""
        try:
            result = subprocess.run([
                'git', 'branch', '--show-current'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            return result.stdout.strip() or 'unknown'
            
        except Exception as e:
            print(f"❌ Error getting current branch: {e}")
            return 'unknown'
    
    def _ensure_main_branch(self) -> bool:
        """Ensure we're on the main branch for new branch creation."""
        current_branch = self._get_current_branch()
        
        if current_branch in ['main', 'master']:
            return True
        
        print(f"📍 Switching from {current_branch} to main branch")
        
        try:
            # Try main first, then master
            for main_branch in ['main', 'master']:
                result = subprocess.run([
                    'git', 'checkout', main_branch
                ], capture_output=True, text=True, cwd=self.project_root)
                
                if result.returncode == 0:
                    print(f"✅ Switched to {main_branch} branch")
                    return True
            
            print(f"❌ Could not switch to main/master branch")
            return False
            
        except Exception as e:
            print(f"❌ Error switching to main branch: {e}")
            return False
    
    def _pull_latest_changes(self) -> bool:
        """Pull latest changes from remote."""
        try:
            print("📥 Pulling latest changes from remote...")
            
            result = subprocess.run([
                'git', 'pull'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode != 0:
                print(f"⚠️  Git pull had issues: {result.stderr}")
                # Continue anyway - might be no remote or other non-critical issues
            
            return True
            
        except Exception as e:
            print(f"⚠️  Error pulling latest changes: {e}")
            return True  # Continue anyway
    
    def _push_branch_to_remote(self, branch_name: str) -> bool:
        """Push the new branch to remote repository."""
        try:
            result = subprocess.run([
                'git', 'push', '-u', 'origin', branch_name
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode != 0:
                print(f"⚠️  Could not push branch to remote: {result.stderr}")
                return False
            
            return True
            
        except Exception as e:
            print(f"⚠️  Error pushing branch to remote: {e}")
            return False
    
    def _log_branch_creation(self, trigger: Dict):
        """Log the branch creation for future reference."""
        creation_log = {
            'branch_name': trigger['branch_name'],
            'description': trigger['description'],
            'created_at': datetime.now().isoformat(),
            'priority': trigger['priority'],
            'source': trigger['source']
        }
        
        self.branch_log['created_branches'].append(creation_log)
        self.branch_log['statistics']['total_branches_created'] += 1
        self.branch_log['statistics']['last_creation_date'] = creation_log['created_at']
        self.branch_log['last_scan'] = datetime.now().isoformat()
        
        self._save_branch_log()
        print(f"📝 Logged branch creation: {trigger['branch_name']}")
    
    def _create_gitops_invocation(self, trigger: Dict):
        """Create a GitOps agent invocation for the new branch."""
        try:
            invocations = []
            if self.session_trigger_path.exists():
                try:
                    with open(self.session_trigger_path, 'r') as f:
                        invocations = json.load(f)
                except:
                    invocations = []
            
            new_invocation = {
                "agent": "gitops-workflow-manager",
                "timestamp": datetime.now().isoformat(),
                "trigger": "auto-branch-creation",
                "prompt": f"Auto-created branch '{trigger['branch_name']}' for: {trigger['description']}. Please manage branch workflow and coordinate with development.",
                "priority": trigger['priority'],
                "auto_triggered": True,
                "branch_context": {
                    "branch_name": trigger['branch_name'],
                    "description": trigger['description'],
                    "auto_created": True
                }
            }
            
            invocations.append(new_invocation)
            
            with open(self.session_trigger_path, 'w') as f:
                json.dump(invocations, f, indent=2)
            
            print(f"🤖 Created GitOps agent invocation for branch management")
            
        except Exception as e:
            print(f"⚠️  Error creating GitOps invocation: {e}")
    
    def _update_backlog_branch_status(self, trigger: Dict):
        """Update BACKLOG.md to mark branch as created."""
        try:
            if not self.backlog_path.exists():
                return
            
            content = self.backlog_path.read_text()
            branch_name = trigger['branch_name']
            
            # Replace [new-branch: branch-name] with [BRANCH-CREATED ✅: branch-name]
            pattern = rf'`\[new-branch:\s*{re.escape(branch_name)}\]`'
            replacement = f'`[BRANCH-CREATED ✅: {branch_name}]`'
            
            updated_content = re.sub(pattern, replacement, content)
            
            if updated_content != content:
                self.backlog_path.write_text(updated_content)
                print(f"📋 Updated BACKLOG.md to mark branch as created")
            
        except Exception as e:
            print(f"⚠️  Error updating BACKLOG.md: {e}")
    
    def _create_github_issue(self, trigger: Dict):
        """Create a GitHub Issue for the new branch if GitHub integration is enabled."""
        try:
            github_config_path = self.project_root / ".claude" / "github-config.json"
            
            if not github_config_path.exists():
                print(f"📋 No GitHub config found - skipping GitHub Issue creation")
                return
            
            # Check if GitHub sync is enabled
            with open(github_config_path, 'r') as f:
                config = json.load(f)
            
            if not config.get("sync", {}).get("enabled", False):
                print(f"📋 GitHub sync disabled - skipping Issue creation")
                return
            
            if not config.get("sync", {}).get("auto_create_issues", False):
                print(f"📋 Auto-create issues disabled - skipping Issue creation")
                return
            
            # Create GitHub sync command for this specific item
            github_sync_script = self.project_root / ".claude" / "github-sync.py"
            
            if not github_sync_script.exists():
                print(f"⚠️  GitHub sync script not found - skipping Issue creation")
                return
            
            print(f"🐙 Creating GitHub Issue for branch: {trigger['branch_name']}")
            
            # Execute GitHub sync for this specific item
            # Note: This is a simplified approach - in practice, you might want
            # to extend the GitHub service to handle single-item sync
            result = subprocess.run([
                'python3', str(github_sync_script), '--sync-to-github'
            ], capture_output=True, text=True, cwd=self.project_root, timeout=60)
            
            if result.returncode == 0:
                print(f"✅ GitHub Issue creation triggered successfully")
            else:
                print(f"⚠️  GitHub Issue creation failed: {result.stderr}")
            
        except subprocess.TimeoutExpired:
            print(f"⏰ GitHub Issue creation timed out")
        except Exception as e:
            print(f"⚠️  Error creating GitHub Issue: {e}")
    
    def run_once(self) -> int:
        """Run a single scan and branch creation cycle."""
        print(f"🔍 Scanning for branch creation triggers...")
        
        triggers = self.scan_for_branch_metadata()
        
        if not triggers:
            print("✅ No new branch creation triggers found")
            return 0
        
        created_count = 0
        for trigger in triggers:
            if self.create_branch(trigger):
                created_count += 1
                # Brief pause between branch creations
                time.sleep(2)
        
        print(f"🎉 Auto-branch creation complete: {created_count}/{len(triggers)} branches created")
        return created_count
    
    def watch_mode(self, check_interval: int = 60):
        """Run in watch mode, continuously monitoring for branch triggers."""
        print(f"👀 Starting watch mode (checking every {check_interval} seconds)")
        print("📋 Press Ctrl+C to stop")
        
        try:
            while True:
                created_count = self.run_once()
                
                if created_count > 0:
                    print(f"✨ Created {created_count} branches - continuing monitoring...")
                
                time.sleep(check_interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Watch mode stopped by user")
        except Exception as e:
            print(f"\n❌ Watch mode error: {e}")

def main():
    """Main entry point for auto-branch creator."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists() or not (project_root / ".claude").exists():
        print("❌ Error: Not in CChorus project directory")
        print("Run this script from the CChorus project root")
        sys.exit(1)
    
    creator = CChorusAutoBranchCreator(project_root)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--watch":
            # Watch mode with optional interval
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
            creator.watch_mode(interval)
        elif sys.argv[1] == "--once":
            # Single run mode
            created_count = creator.run_once()
            sys.exit(0 if created_count >= 0 else 1)
        else:
            print("Usage: auto-branch-creator.py [--once|--watch [interval]]")
            sys.exit(1)
    else:
        # Default: single run
        created_count = creator.run_once()
        sys.exit(0 if created_count >= 0 else 1)

if __name__ == "__main__":
    main()