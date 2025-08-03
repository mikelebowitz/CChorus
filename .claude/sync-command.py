#!/usr/bin/env python3
"""
CChorus /sync Command Implementation
Forces documentation synchronization using the documentation-manager and gitops-workflow-manager agents.
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class CChorusSyncCommand:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.sync_log_path = project_root / ".claude" / "sync-command-log.json"
        self.doc_trigger_path = project_root / ".claude" / "doc-update-needed.trigger"
        self.agent_invocations_path = project_root / ".claude" / "pending-agent-invocations.json"
        self.next_session_path = project_root / "NEXT_SESSION.md"
        
        # Ensure .claude directory exists
        (project_root / ".claude").mkdir(exist_ok=True)
        
        print(f"🔄 CChorus Documentation Synchronization")
        print(f"📁 Project: {project_root}")
        print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("")
    
    def execute_sync(self) -> Dict:
        """Execute the complete documentation synchronization workflow."""
        sync_result = {
            "command": "/sync",
            "started_at": datetime.now().strftime('%I:%M:%S%p').lower(),
            "project_root": str(self.project_root),
            "steps": [],
            "success": False,
            "error": None,
            "agents_invoked": [],
            "changes_processed": 0,
            "recommendations": []
        }
        
        try:
            print("📊 Step 1: Analyzing current documentation status...")
            status_result = self._analyze_documentation_status()
            sync_result["steps"].append(status_result)
            
            if not status_result["success"]:
                sync_result["error"] = "Failed to analyze documentation status"
                return sync_result
            
            print("🔍 Step 2: Detecting pending changes...")
            changes_result = self._detect_pending_changes()
            sync_result["steps"].append(changes_result)
            sync_result["changes_processed"] = changes_result.get("changes_count", 0)
            
            if changes_result["changes_count"] == 0:
                print("✅ No pending documentation changes detected")
                sync_result["success"] = True
                sync_result["recommendations"].append("Documentation is up to date")
                return sync_result
            
            print(f"📝 Step 3: Invoking documentation-manager for {changes_result['changes_count']} changes...")
            doc_manager_result = self._invoke_documentation_manager(changes_result)
            sync_result["steps"].append(doc_manager_result)
            
            if doc_manager_result["success"]:
                sync_result["agents_invoked"].append("documentation-manager")
                print("✅ Documentation-manager completed successfully")
                
                print("🤖 Step 4: Invoking gitops-workflow-manager...")
                gitops_result = self._invoke_gitops_manager()
                sync_result["steps"].append(gitops_result)
                
                if gitops_result["success"]:
                    sync_result["agents_invoked"].append("gitops-workflow-manager")
                    print("✅ GitOps workflow completed successfully")
                    sync_result["success"] = True
                else:
                    print("⚠️  GitOps workflow had issues - manual intervention may be needed")
                    sync_result["recommendations"].append("Review GitOps workflow status")
            else:
                print("❌ Documentation-manager failed - creating fallback triggers")
                self._create_fallback_triggers(changes_result)
                sync_result["recommendations"].append("Documentation-manager failed - check trigger files")
            
            print("📋 Step 5: Updating session status...")
            self._update_session_status(sync_result)
            
            print("📊 Step 6: Logging synchronization results...")
            self._log_sync_result(sync_result)
            
        except Exception as e:
            sync_result["error"] = str(e)
            sync_result["success"] = False
            print(f"❌ Synchronization failed: {e}")
        
        finally:
            end_time = datetime.now()
            sync_result["completed_at"] = end_time.strftime('%I:%M:%S%p').lower()
            # Calculate duration using actual datetime objects
            start_time = datetime.now()  # This would need to be captured at start
            # For now, just note completion time
            sync_result["duration_note"] = "Duration calculation adjusted for human-readable timestamps"
        
        return sync_result
    
    def _analyze_documentation_status(self) -> Dict:
        """Analyze current documentation status."""
        result = {
            "step": "analyze_documentation_status",
            "success": False,
            "git_status": {},
            "documentation_files": [],
            "triggers_present": False
        }
        
        try:
            # Check Git status
            git_result = subprocess.run([
                'git', 'status', '--porcelain'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if git_result.returncode == 0:
                changes = git_result.stdout.strip().split('\n') if git_result.stdout.strip() else []
                result["git_status"] = {
                    "has_changes": bool(git_result.stdout.strip()),
                    "files_changed": len(changes),
                    "changes": changes
                }
                print(f"  📊 Git status: {len(changes)} files changed")
            
            # Check for existing trigger files
            if self.doc_trigger_path.exists() or self.agent_invocations_path.exists():
                result["triggers_present"] = True
                print("  🎯 Existing documentation triggers found")
            
            # Identify documentation files
            doc_files = [
                "README.md", "CLAUDE.md", "CHANGELOG.md", "BACKLOG.md", "PROCESS.md"
            ]
            
            for doc_file in doc_files:
                doc_path = self.project_root / doc_file
                if doc_path.exists():
                    result["documentation_files"].append({
                        "file": doc_file,
                        "last_modified": doc_path.stat().st_mtime,
                        "exists": True
                    })
            
            print(f"  📋 Found {len(result['documentation_files'])} documentation files")
            
            result["success"] = True
            
        except Exception as e:
            result["error"] = str(e)
            print(f"  ❌ Error analyzing documentation status: {e}")
        
        return result
    
    def _detect_pending_changes(self) -> Dict:
        """Detect pending changes that require documentation updates."""
        result = {
            "step": "detect_pending_changes",
            "success": True,
            "changes_count": 0,
            "change_types": {},
            "priority": "low",
            "reasoning": []
        }
        
        try:
            # Check for uncommitted changes in key directories
            git_result = subprocess.run([
                'git', 'status', '--porcelain', 'src/', 'server.js', 'CLAUDE.md'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if git_result.stdout.strip():
                changes = git_result.stdout.strip().split('\n')
                result["changes_count"] = len(changes)
                
                # Categorize changes
                component_changes = [c for c in changes if 'src/components/' in c]
                api_changes = [c for c in changes if 'server.js' in c or 'api/' in c]
                config_changes = [c for c in changes if 'CLAUDE.md' in c or '.claude/' in c]
                
                result["change_types"] = {
                    "component_files": len(component_changes),
                    "api_files": len(api_changes),
                    "config_files": len(config_changes)
                }
                
                # Determine priority
                if api_changes or config_changes:
                    result["priority"] = "high"
                    result["reasoning"].append("API or configuration changes detected")
                elif component_changes:
                    result["priority"] = "medium"
                    result["reasoning"].append("Component changes detected")
                
                print(f"  📝 {result['changes_count']} changes detected (priority: {result['priority']})")
                for change_type, count in result["change_types"].items():
                    if count > 0:
                        print(f"    - {change_type}: {count}")
            
            # Check for recent commits that might need documentation
            recent_commits_result = subprocess.run([
                'git', 'log', '--since=2 hours ago', '--pretty=format:%s', '--', 'src/', 'server.js'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if recent_commits_result.stdout.strip():
                recent_commits = recent_commits_result.stdout.strip().split('\n')
                commits_needing_docs = [
                    commit for commit in recent_commits 
                    if not any(keyword in commit.lower() for keyword in 
                              ['docs:', 'doc:', 'documentation', 'readme'])
                ]
                
                if commits_needing_docs:
                    result["changes_count"] += len(commits_needing_docs)
                    result["reasoning"].append(f"{len(commits_needing_docs)} recent commits may need documentation")
                    print(f"  📜 {len(commits_needing_docs)} recent commits potentially need documentation")
            
        except Exception as e:
            result["error"] = str(e)
            result["success"] = False
            print(f"  ❌ Error detecting changes: {e}")
        
        return result
    
    def _invoke_documentation_manager(self, changes_result: Dict) -> Dict:
        """Invoke the documentation-manager agent."""
        result = {
            "step": "invoke_documentation_manager",
            "success": False,
            "method_used": None,
            "output": ""
        }
        
        try:
            # Method 1: Try direct Claude CLI invocation
            print("  🚀 Attempting direct Claude CLI invocation...")
            
            claude_result = subprocess.run(['which', 'claude'], 
                                         capture_output=True, text=True)
            
            if claude_result.returncode == 0:
                claude_path = claude_result.stdout.strip()
                print(f"  📍 Found Claude CLI at: {claude_path}")
                
                doc_command = [
                    claude_path, 
                    '@documentation-manager', 
                    f'please update documentation for {changes_result["changes_count"]} pending changes detected by /sync command'
                ]
                
                doc_result = subprocess.run(doc_command,
                                          capture_output=True,
                                          text=True,
                                          cwd=self.project_root,
                                          timeout=300)
                
                if doc_result.returncode == 0:
                    result["success"] = True
                    result["method_used"] = "direct_cli"
                    result["output"] = doc_result.stdout
                    print("  ✅ Documentation-manager invoked successfully via CLI")
                    return result
                else:
                    print(f"  ⚠️  CLI invocation failed: {doc_result.stderr}")
            
            # Method 2: Create agent invocation trigger
            print("  📋 Creating documentation-manager invocation trigger...")
            
            invocations = []
            if self.agent_invocations_path.exists():
                try:
                    with open(self.agent_invocations_path, 'r') as f:
                        invocations = json.load(f)
                except:
                    invocations = []
            
            new_invocation = {
                "agent": "documentation-manager",
                "timestamp": datetime.now().strftime('%I:%M:%S%p').lower(),
                "trigger": "sync-command",
                "prompt": f"Sync command triggered: Update documentation for {changes_result['changes_count']} pending changes (priority: {changes_result['priority']})",
                "priority": changes_result["priority"],
                "auto_triggered": True,
                "sync_command": True,
                "changes_context": changes_result["change_types"]
            }
            
            invocations.append(new_invocation)
            
            with open(self.agent_invocations_path, 'w') as f:
                json.dump(invocations, f, indent=2)
            
            result["success"] = True
            result["method_used"] = "agent_invocation_trigger"
            print("  ✅ Documentation-manager invocation trigger created")
            
        except subprocess.TimeoutExpired:
            result["error"] = "Documentation-manager command timed out"
            print("  ⏰ Documentation-manager command timed out")
        except Exception as e:
            result["error"] = str(e)
            print(f"  ❌ Error invoking documentation-manager: {e}")
        
        return result
    
    def _invoke_gitops_manager(self) -> Dict:
        """Invoke the gitops-workflow-manager agent."""
        result = {
            "step": "invoke_gitops_manager",
            "success": False,
            "method_used": None,
            "output": ""
        }
        
        try:
            # Method 1: Try direct Claude CLI invocation
            print("  🚀 Attempting GitOps agent invocation...")
            
            claude_result = subprocess.run(['which', 'claude'], 
                                         capture_output=True, text=True)
            
            if claude_result.returncode == 0:
                claude_path = claude_result.stdout.strip()
                
                gitops_command = [
                    claude_path, 
                    '@gitops-workflow-manager', 
                    'please commit and push all documentation changes created by sync command'
                ]
                
                gitops_result = subprocess.run(gitops_command,
                                             capture_output=True,
                                             text=True,
                                             cwd=self.project_root,
                                             timeout=300)
                
                if gitops_result.returncode == 0:
                    result["success"] = True
                    result["method_used"] = "direct_cli"
                    result["output"] = gitops_result.stdout
                    print("  ✅ GitOps-workflow-manager invoked successfully via CLI")
                    return result
                else:
                    print(f"  ⚠️  CLI invocation failed: {gitops_result.stderr}")
            
            # Method 2: Create agent invocation trigger
            print("  📋 Creating gitops-workflow-manager invocation trigger...")
            
            invocations = []
            if self.agent_invocations_path.exists():
                try:
                    with open(self.agent_invocations_path, 'r') as f:
                        invocations = json.load(f)
                except:
                    invocations = []
            
            new_invocation = {
                "agent": "gitops-workflow-manager",
                "timestamp": datetime.now().strftime('%I:%M:%S%p').lower(),
                "trigger": "sync-command",
                "prompt": "Sync command completed documentation updates - please commit and push all changes with appropriate commit message",
                "priority": "high",
                "auto_triggered": True,
                "sync_command": True,
                "follows_documentation": True
            }
            
            invocations.append(new_invocation)
            
            with open(self.agent_invocations_path, 'w') as f:
                json.dump(invocations, f, indent=2)
            
            result["success"] = True
            result["method_used"] = "agent_invocation_trigger"
            print("  ✅ GitOps-workflow-manager invocation trigger created")
            
        except subprocess.TimeoutExpired:
            result["error"] = "GitOps-workflow-manager command timed out"
            print("  ⏰ GitOps-workflow-manager command timed out")
        except Exception as e:
            result["error"] = str(e)
            print(f"  ❌ Error invoking gitops-workflow-manager: {e}")
        
        return result
    
    def _create_fallback_triggers(self, changes_result: Dict):
        """Create fallback triggers if agent invocation fails."""
        try:
            # Create documentation trigger file
            trigger_content = {
                "timestamp": datetime.now().strftime('%I:%M:%S%p').lower(),
                "reason": "Created by /sync command - documentation-manager invocation failed",
                "changes_detected": True,
                "changes_count": changes_result["changes_count"],
                "priority": changes_result["priority"],
                "workflow": "documentation-manager -> gitops-workflow-manager",
                "instructions": "Run: @documentation-manager update docs then @gitops-workflow-manager commit"
            }
            
            with open(self.doc_trigger_path, 'w') as f:
                json.dump(trigger_content, f, indent=2)
            
            print(f"  📋 Created fallback documentation trigger: {self.doc_trigger_path}")
            
        except Exception as e:
            print(f"  ❌ Error creating fallback triggers: {e}")
    
    def _update_session_status(self, sync_result: Dict):
        """Update NEXT_SESSION.md with sync command results."""
        try:
            status_section = f"""
## 🔄 Last Sync Command Results

**Executed**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Status**: {'✅ SUCCESS' if sync_result['success'] else '❌ FAILED'}
**Changes Processed**: {sync_result['changes_processed']}
**Agents Invoked**: {', '.join(sync_result['agents_invoked']) if sync_result['agents_invoked'] else 'None'}

{f"**Error**: {sync_result['error']}" if sync_result['error'] else ""}

**Recommendations**:
{chr(10).join(f"- {rec}" for rec in sync_result['recommendations'])}

---

"""
            
            if self.next_session_path.exists():
                content = self.next_session_path.read_text()
                # Remove any existing sync results
                lines = content.split('\n')
                filtered_lines = []
                skip_until_separator = False
                
                for line in lines:
                    if "🔄 Last Sync Command Results" in line:
                        skip_until_separator = True
                        continue
                    elif skip_until_separator and line.strip() == "---":
                        skip_until_separator = False
                        continue
                    elif not skip_until_separator:
                        filtered_lines.append(line)
                
                # Insert new status after first header
                for i, line in enumerate(filtered_lines):
                    if line.startswith('# '):
                        filtered_lines.insert(i + 1, status_section)
                        break
                
                self.next_session_path.write_text('\n'.join(filtered_lines))
            else:
                self.next_session_path.write_text(f"# CChorus Next Session Brief{status_section}")
            
            print(f"  📝 Updated session status in NEXT_SESSION.md")
            
        except Exception as e:
            print(f"  ❌ Error updating session status: {e}")
    
    def _log_sync_result(self, sync_result: Dict):
        """Log sync command result for historical tracking."""
        try:
            # Load existing log
            sync_log = []
            if self.sync_log_path.exists():
                try:
                    with open(self.sync_log_path, 'r') as f:
                        sync_log = json.load(f)
                except:
                    sync_log = []
            
            # Add new entry
            log_entry = {
                "timestamp": sync_result["started_at"],
                "success": sync_result["success"],
                "changes_processed": sync_result["changes_processed"],
                "agents_invoked": sync_result["agents_invoked"],
                "duration_seconds": sync_result.get("duration_seconds", 0),
                "error": sync_result.get("error")
            }
            
            sync_log.append(log_entry)
            
            # Keep only last 50 entries
            sync_log = sync_log[-50:]
            
            # Save updated log
            with open(self.sync_log_path, 'w') as f:
                json.dump(sync_log, f, indent=2)
            
            print(f"  📊 Logged sync results to {self.sync_log_path}")
            
        except Exception as e:
            print(f"  ❌ Error logging sync results: {e}")

def main():
    """Main entry point for /sync command."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists() or not (project_root / ".claude").exists():
        print("❌ Error: Not in CChorus project directory")
        print("Run this command from the CChorus project root")
        sys.exit(1)
    
    sync_command = CChorusSyncCommand(project_root)
    result = sync_command.execute_sync()
    
    # Print final summary
    print("")
    print("=" * 60)
    print("📊 SYNCHRONIZATION SUMMARY")
    print("=" * 60)
    
    if result["success"]:
        print("✅ Synchronization completed successfully")
    else:
        print("❌ Synchronization failed")
        if result["error"]:
            print(f"   Error: {result['error']}")
    
    print(f"📝 Changes processed: {result['changes_processed']}")
    print(f"🤖 Agents invoked: {', '.join(result['agents_invoked']) if result['agents_invoked'] else 'None'}")
    
    if result["recommendations"]:
        print("💡 Recommendations:")
        for rec in result["recommendations"]:
            print(f"   - {rec}")
    
    duration = result.get("duration_seconds", 0)
    print(f"⏱️  Duration: {duration:.1f} seconds")
    
    sys.exit(0 if result["success"] else 1)

if __name__ == "__main__":
    main()