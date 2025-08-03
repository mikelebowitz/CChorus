#!/usr/bin/env python3
"""
CChorus File Watcher for Real-time Documentation Triggers
Monitors source files and automatically triggers documentation updates when changes are detected.
"""

import os
import sys
import time
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Set, Dict, List
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class CChorusDocumentationWatcher(FileSystemEventHandler):
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.trigger_file = project_root / ".claude" / "doc-update-needed.trigger"
        self.pending_invocations_file = project_root / ".claude" / "pending-agent-invocations.json"
        self.last_trigger_time = 0
        self.debounce_seconds = 30  # Wait 30 seconds between triggers
        self.pending_changes: Set[str] = set()
        
        # Ensure .claude directory exists
        (project_root / ".claude").mkdir(exist_ok=True)
        
        print(f"📁 Watching CChorus files in: {project_root}")
        print(f"🔍 Monitoring: src/, server.js, CLAUDE.md")
        print(f"⏱️  Debounce time: {self.debounce_seconds} seconds")
    
    def should_trigger_docs(self, file_path: str) -> bool:
        """Determine if a file change should trigger documentation updates."""
        path = Path(file_path)
        
        # Monitor key source directories and files
        return (
            'src/components/' in str(path) or
            'src/services/' in str(path) or
            'src/utils/' in str(path) or
            path.name == 'server.js' or
            path.name == 'CLAUDE.md' or
            '.claude/agents/' in str(path) or
            '.claude/commands/' in str(path)
        )
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        file_path = event.src_path
        
        if self.should_trigger_docs(file_path):
            self.pending_changes.add(file_path)
            print(f"📝 Change detected: {Path(file_path).name}")
            
            # Trigger with debounce
            current_time = time.time()
            if current_time - self.last_trigger_time > self.debounce_seconds:
                self.trigger_documentation_update()
                self.last_trigger_time = current_time
    
    def on_created(self, event):
        self.on_modified(event)  # Treat creation as modification
    
    def trigger_documentation_update(self):
        """Trigger documentation update through various methods."""
        if not self.pending_changes:
            return
        
        print(f"🚀 Triggering documentation update for {len(self.pending_changes)} changes")
        
        try:
            # Method 1: Try direct Claude CLI invocation
            if self.try_claude_cli_trigger():
                print("✅ Successfully triggered via Claude CLI")
                self.pending_changes.clear()
                return
            
            # Method 2: Create trigger files for next session
            self.create_trigger_files()
            
            # Method 3: Update NEXT_SESSION.md with immediate notice
            self.update_next_session_notice()
            
            print("✅ Documentation trigger files created")
            self.pending_changes.clear()
            
        except Exception as e:
            print(f"❌ Error triggering documentation update: {e}")
    
    def try_claude_cli_trigger(self) -> bool:
        """Try to trigger documentation update via Claude CLI."""
        try:
            # Check if claude command is available
            result = subprocess.run(['which', 'claude'], 
                                  capture_output=True, 
                                  text=True)
            
            if result.returncode != 0:
                print("⚠️  Claude CLI not found in PATH")
                return False
            
            claude_path = result.stdout.strip()
            print(f"🔍 Found Claude CLI at: {claude_path}")
            
            # Check if there's an active Claude session
            session_check = subprocess.run([claude_path, '--version'],
                                         capture_output=True,
                                         text=True,
                                         timeout=5)
            
            if session_check.returncode != 0:
                print("⚠️  Claude CLI not responding")
                return False
            
            # Try to execute documentation workflow
            print("🚀 Executing: claude '@documentation-manager update docs for recent changes'")
            result = subprocess.run([
                claude_path, 
                '@documentation-manager', 
                'update docs for recent changes detected by file watcher'
            ], capture_output=True, text=True, cwd=self.project_root, timeout=60)
            
            if result.returncode == 0:
                print("✅ Documentation agent invoked successfully")
                return True
            else:
                print(f"⚠️  Documentation agent invocation failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("⏰ Claude CLI command timed out")
            return False
        except Exception as e:
            print(f"❌ Error with Claude CLI trigger: {e}")
            return False
    
    def create_trigger_files(self):
        """Create trigger files for documentation updates."""
        # Create main trigger file
        trigger_content = {
            "timestamp": datetime.now().strftime('%I:%M:%S%p').lower(),
            "reason": "Auto-triggered by file watcher",
            "changes_detected": list(self.pending_changes),
            "change_count": len(self.pending_changes),
            "workflow": "documentation-manager -> gitops-workflow-manager",
            "instructions": "Run: @documentation-manager update docs then @gitops-workflow-manager commit",
            "priority": self.determine_priority()
        }
        
        with open(self.trigger_file, 'w') as f:
            json.dump(trigger_content, f, indent=2)
        
        print(f"📋 Created trigger file: {self.trigger_file}")
        
        # Create agent invocation file
        self.create_agent_invocation()
    
    def create_agent_invocation(self):
        """Create agent invocation trigger."""
        invocations = []
        if self.pending_invocations_file.exists():
            try:
                with open(self.pending_invocations_file, 'r') as f:
                    invocations = json.load(f)
            except:
                invocations = []
        
        new_invocation = {
            "agent": "documentation-manager",
            "timestamp": datetime.now().strftime('%I:%M:%S%p').lower(),
            "trigger": "file-watcher-auto",
            "prompt": f"Auto-triggered: Update documentation for {len(self.pending_changes)} file changes detected by real-time watcher",
            "priority": self.determine_priority(),
            "auto_triggered": True,
            "files_changed": list(self.pending_changes)
        }
        
        invocations.append(new_invocation)
        
        with open(self.pending_invocations_file, 'w') as f:
            json.dump(invocations, f, indent=2)
        
        print(f"🤖 Created agent invocation: {self.pending_invocations_file}")
    
    def determine_priority(self) -> str:
        """Determine priority based on changed files."""
        for change in self.pending_changes:
            if 'server.js' in change or 'CLAUDE.md' in change:
                return "high"
            elif 'src/components/' in change:
                return "medium"
        return "low"
    
    def update_next_session_notice(self):
        """Update NEXT_SESSION.md with immediate documentation notice."""
        next_session_path = self.project_root / "NEXT_SESSION.md"
        
        notice = f"""
## 🔔 REAL-TIME: Documentation Update Needed

**Auto-detected by file watcher at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}**

**Files Changed**: {len(self.pending_changes)} files
**Priority**: {self.determine_priority().upper()}

```bash
# IMMEDIATE ACTION REQUIRED:
@documentation-manager please update documentation for recent file changes
# After completion:
@gitops-workflow-manager please commit and push changes
```

**Changed Files**:
{chr(10).join(f"- {Path(f).name}" for f in list(self.pending_changes)[:5])}
{f"... and {len(self.pending_changes) - 5} more" if len(self.pending_changes) > 5 else ""}

**Trigger Files**: 
- `.claude/doc-update-needed.trigger`
- `.claude/pending-agent-invocations.json`

---

"""
        
        try:
            if next_session_path.exists():
                content = next_session_path.read_text()
                lines = content.split('\n')
                
                # Remove any existing real-time notices
                filtered_lines = []
                skip_until_separator = False
                for line in lines:
                    if "🔔 REAL-TIME: Documentation Update Needed" in line:
                        skip_until_separator = True
                        continue
                    elif skip_until_separator and line.strip() == "---":
                        skip_until_separator = False
                        continue
                    elif not skip_until_separator:
                        filtered_lines.append(line)
                
                # Insert new notice after first header
                for i, line in enumerate(filtered_lines):
                    if line.startswith('# '):
                        filtered_lines.insert(i + 1, notice)
                        break
                
                next_session_path.write_text('\n'.join(filtered_lines))
            else:
                next_session_path.write_text(f"# CChorus Next Session Brief{notice}")
            
            print(f"📝 Updated NEXT_SESSION.md with real-time notice")
            
        except Exception as e:
            print(f"❌ Error updating NEXT_SESSION.md: {e}")

def main():
    """Main entry point for CChorus file watcher."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists() or not (project_root / ".claude").exists():
        print("❌ Error: Not in CChorus project directory")
        print("Run this script from the CChorus project root")
        sys.exit(1)
    
    print("🚀 Starting CChorus Documentation File Watcher")
    print(f"📁 Project: {project_root}")
    
    # Create event handler and observer
    event_handler = CChorusDocumentationWatcher(project_root)
    observer = Observer()
    
    # Watch src directory
    observer.schedule(event_handler, str(project_root / "src"), recursive=True)
    # Watch root for server.js and CLAUDE.md
    observer.schedule(event_handler, str(project_root), recursive=False)
    # Watch .claude directory for agent/command changes
    observer.schedule(event_handler, str(project_root / ".claude"), recursive=True)
    
    try:
        observer.start()
        print("👀 File watcher is active...")
        print("📋 Press Ctrl+C to stop")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping file watcher...")
        observer.stop()
    
    observer.join()
    print("✅ File watcher stopped")

if __name__ == "__main__":
    main()