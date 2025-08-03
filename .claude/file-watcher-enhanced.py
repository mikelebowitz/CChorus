#!/usr/bin/env python3
"""
CChorus Enhanced File Watcher with Smart Change Detection
Monitors source files and intelligently routes documentation work to micro-agents based on file analysis.
"""

import os
import sys
import time
import json
import hashlib
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Set, Dict, List, Optional
from dataclasses import dataclass, asdict
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

@dataclass
class FileChange:
    """Represents a detected file change with metadata."""
    path: str
    change_type: str  # 'created', 'modified', 'deleted'
    timestamp: str
    file_type: str    # 'component', 'api', 'agent', 'command', 'config', 'doc'
    priority: str     # 'high', 'medium', 'low'
    content_hash: Optional[str] = None
    suggested_agents: List[str] = None

    def __post_init__(self):
        if self.suggested_agents is None:
            self.suggested_agents = []

class SmartChangeAnalyzer:
    """Analyzes file changes and determines appropriate micro-agent routing."""
    
    def __init__(self):
        self.file_hashes: Dict[str, str] = {}
        self.agent_routing = {
            'component': ['component-documenter', 'readme-updater'],
            'api': ['api-documenter', 'readme-updater'],
            'agent': ['file-change-analyzer'],
            'command': ['file-change-analyzer'],
            'config': ['readme-updater'],
            'doc': ['readme-updater'],
            'backlog': ['backlog-manager'],
            'changelog': ['changelog-updater']
        }
    
    def analyze_change(self, file_path: str, change_type: str) -> Optional[FileChange]:
        """Analyze a file change and return structured metadata."""
        path = Path(file_path)
        
        # Calculate content hash for change detection
        content_hash = None
        if path.exists() and path.is_file():
            try:
                content = path.read_bytes()
                content_hash = hashlib.md5(content).hexdigest()
                
                # Skip if content unchanged
                if file_path in self.file_hashes and self.file_hashes[file_path] == content_hash:
                    return None
                
                self.file_hashes[file_path] = content_hash
            except Exception:
                pass
        
        # Determine file type and routing
        file_type = self._classify_file(path)
        if not file_type:
            return None
        
        priority = self._determine_priority(path, file_type)
        suggested_agents = self.agent_routing.get(file_type, [])
        
        return FileChange(
            path=file_path,
            change_type=change_type,
            timestamp=datetime.now().isoformat(),
            file_type=file_type,
            priority=priority,
            content_hash=content_hash,
            suggested_agents=suggested_agents
        )
    
    def _classify_file(self, path: Path) -> Optional[str]:
        """Classify file type for routing purposes."""
        path_str = str(path)
        
        # Component files
        if ('src/components/' in path_str and 
            (path.suffix in ['.tsx', '.ts', '.jsx', '.js'])):
            return 'component'
        
        # API files
        if (path.name == 'server.js' or 
            ('src/api/' in path_str and path.suffix in ['.js', '.ts'])):
            return 'api'
        
        # Agent files
        if '.claude/agents/' in path_str and path.suffix == '.md':
            return 'agent'
        
        # Command files
        if '.claude/commands/' in path_str and path.suffix == '.md':
            return 'command'
        
        # Special documentation files
        if path.name == 'BACKLOG.md':
            return 'backlog'
        elif path.name == 'CHANGELOG.md':
            return 'changelog'
        elif path.name in ['README.md', 'CLAUDE.md', 'PROCESS.md']:
            return 'doc'
        
        # Configuration files
        if path.name in ['package.json', 'tsconfig.json', '.vscode/tasks.json']:
            return 'config'
        
        return None
    
    def _determine_priority(self, path: Path, file_type: str) -> str:
        """Determine change priority based on file type and content."""
        path_str = str(path)
        
        # High priority files
        if (path.name in ['server.js', 'CLAUDE.md', 'package.json'] or
            'src/components/' in path_str):
            return 'high'
        
        # Medium priority files
        if (file_type in ['agent', 'command'] or
            path.name in ['README.md', 'BACKLOG.md']):
            return 'medium'
        
        return 'low'

class CChorusEnhancedWatcher(FileSystemEventHandler):
    """Enhanced file watcher with smart change detection and micro-agent routing."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.analyzer = SmartChangeAnalyzer()
        self.trigger_file = project_root / ".claude" / "doc-update-needed.trigger"
        self.pending_invocations_file = project_root / ".claude" / "pending-agent-invocations.json"
        self.changes_log_file = project_root / ".claude" / "file-changes.log"
        
        self.last_trigger_time = 0
        self.debounce_seconds = 15  # Reduced from 30s for faster response
        self.pending_changes: List[FileChange] = []
        self.change_batch_size = 5  # Process in batches for efficiency
        
        # Ensure .claude directory exists
        (project_root / ".claude").mkdir(exist_ok=True)
        
        print(f"🧠 Smart File Watcher initialized")
        print(f"📁 Project: {project_root}")
        print(f"🔍 Monitoring: Components, APIs, Agents, Commands, Docs")
        print(f"⏱️  Debounce: {self.debounce_seconds}s | Batch size: {self.change_batch_size}")
        print(f"🤖 Micro-agent routing enabled")
    
    def on_modified(self, event):
        if event.is_directory:
            return
        self._handle_change(event.src_path, 'modified')
    
    def on_created(self, event):
        if not event.is_directory:
            self._handle_change(event.src_path, 'created')
    
    def on_deleted(self, event):
        if not event.is_directory:
            self._handle_change(event.src_path, 'deleted')
    
    def _handle_change(self, file_path: str, change_type: str):
        """Handle file changes with smart analysis."""
        change = self.analyzer.analyze_change(file_path, change_type)
        if not change:
            return
        
        self.pending_changes.append(change)
        print(f"📝 {change.change_type.title()}: {Path(file_path).name} -> {change.file_type} ({change.priority})")
        
        # Log change for debugging
        self._log_change(change)
        
        # Trigger processing with debounce
        current_time = time.time()
        if (current_time - self.last_trigger_time > self.debounce_seconds or
            len(self.pending_changes) >= self.change_batch_size):
            self.process_changes()
            self.last_trigger_time = current_time
    
    def _log_change(self, change: FileChange):
        """Log change details for debugging and analytics."""
        try:
            log_entry = {
                "timestamp": change.timestamp,
                "file": Path(change.path).name,
                "type": change.file_type,
                "priority": change.priority,
                "agents": change.suggested_agents,
                "change": change.change_type
            }
            
            with open(self.changes_log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            print(f"⚠️  Could not log change: {e}")
    
    def process_changes(self):
        """Process pending changes with smart micro-agent routing."""
        if not self.pending_changes:
            return
        
        print(f"🚀 Processing {len(self.pending_changes)} changes with smart routing")
        
        try:
            # Group changes by suggested agents
            agent_work = self._group_changes_by_agents()
            
            # Try enhanced micro-agent workflow first
            if self._try_microagent_workflow(agent_work):
                print("✅ Successfully triggered /microagent workflow")
                self.pending_changes.clear()
                return
            
            # Fallback to legacy trigger files
            self._create_enhanced_trigger_files(agent_work)
            self._update_dashboard_status()
            
            print("✅ Enhanced trigger files created with agent routing")
            self.pending_changes.clear()
            
        except Exception as e:
            print(f"❌ Error processing changes: {e}")
    
    def _group_changes_by_agents(self) -> Dict[str, List[FileChange]]:
        """Group changes by suggested micro-agents."""
        agent_work = {}
        
        for change in self.pending_changes:
            for agent in change.suggested_agents:
                if agent not in agent_work:
                    agent_work[agent] = []
                agent_work[agent].append(change)
        
        return agent_work
    
    def _try_microagent_workflow(self, agent_work: Dict[str, List[FileChange]]) -> bool:
        """Try to trigger enhanced /microagent workflow."""
        try:
            # Check if claude command is available
            result = subprocess.run(['which', 'claude'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                return False
            
            claude_path = result.stdout.strip()
            
            # Build microagent command with context
            context_summary = self._build_context_summary(agent_work)
            
            print(f"🚀 Executing: claude /microagent --context '{context_summary}'")
            result = subprocess.run([
                claude_path, 
                '/microagent',
                '--context', context_summary
            ], capture_output=True, text=True, cwd=self.project_root, timeout=180)
            
            if result.returncode == 0:
                print("✅ /microagent workflow executed successfully")
                print("📋 Smart agent routing completed")
                return True
            else:
                print(f"⚠️  /microagent workflow failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("⏰ /microagent command timed out")
            return False
        except Exception as e:
            print(f"❌ Error with /microagent trigger: {e}")
            return False
    
    def _build_context_summary(self, agent_work: Dict[str, List[FileChange]]) -> str:
        """Build context summary for micro-agent routing."""
        summary_parts = []
        
        for agent, changes in agent_work.items():
            file_types = set(change.file_type for change in changes)
            file_count = len(changes)
            priority = max((change.priority for change in changes), 
                          key=lambda p: {'high': 3, 'medium': 2, 'low': 1}[p])
            
            summary_parts.append(f"{agent}: {file_count} {'/'.join(file_types)} files ({priority})")
        
        return "; ".join(summary_parts)
    
    def _create_enhanced_trigger_files(self, agent_work: Dict[str, List[FileChange]]):
        """Create enhanced trigger files with micro-agent routing."""
        # Enhanced main trigger file
        trigger_content = {
            "timestamp": datetime.now().isoformat(),
            "reason": "Auto-triggered by enhanced file watcher",
            "changes_detected": [change.path for change in self.pending_changes],
            "change_count": len(self.pending_changes),
            "workflow": "micro-agent routing -> parallel execution",
            "agent_routing": agent_work,
            "smart_analysis": {
                "file_types": list(set(change.file_type for change in self.pending_changes)),
                "priorities": list(set(change.priority for change in self.pending_changes)),
                "suggested_workflow": "/microagent for smart routing"
            },
            "instructions": "Run: claude /microagent for intelligent agent routing",
            "priority": self._determine_batch_priority()
        }
        
        with open(self.trigger_file, 'w') as f:
            json.dump(trigger_content, f, indent=2)
        
        # Enhanced agent invocations with routing
        self._create_enhanced_agent_invocations(agent_work)
    
    def _create_enhanced_agent_invocations(self, agent_work: Dict[str, List[FileChange]]):
        """Create enhanced agent invocations with smart routing."""
        invocations = []
        if self.pending_invocations_file.exists():
            try:
                with open(self.pending_invocations_file, 'r') as f:
                    invocations = json.load(f)
            except:
                invocations = []
        
        # Create invocation for file-change-analyzer to coordinate
        coordinator_invocation = {
            "agent": "file-change-analyzer",
            "timestamp": datetime.now().isoformat(),
            "trigger": "enhanced-file-watcher",
            "prompt": f"Smart routing: Analyze {len(self.pending_changes)} changes and coordinate micro-agents",
            "priority": self._determine_batch_priority(),
            "auto_triggered": True,
            "agent_routing": {agent: [asdict(change) for change in changes] 
                           for agent, changes in agent_work.items()},
            "workflow_type": "micro-agent-coordination"
        }
        
        invocations.append(coordinator_invocation)
        
        with open(self.pending_invocations_file, 'w') as f:
            json.dump(invocations, f, indent=2)
    
    def _determine_batch_priority(self) -> str:
        """Determine overall priority for change batch."""
        priorities = [change.priority for change in self.pending_changes]
        if 'high' in priorities:
            return 'high'
        elif 'medium' in priorities:
            return 'medium'
        return 'low'
    
    def _update_dashboard_status(self):
        """Update dashboard status file for real-time monitoring."""
        dashboard_status_file = self.project_root / ".claude" / "dashboard-status.json"
        
        status = {
            "timestamp": datetime.now().isoformat(),
            "watcher_active": True,
            "changes_processed": len(self.pending_changes),
            "agent_routing_enabled": True,
            "last_analysis": {
                "file_types": list(set(change.file_type for change in self.pending_changes)),
                "priorities": list(set(change.priority for change in self.pending_changes)),
                "suggested_agents": list(set(agent for change in self.pending_changes 
                                           for agent in change.suggested_agents))
            }
        }
        
        try:
            with open(dashboard_status_file, 'w') as f:
                json.dump(status, f, indent=2)
        except Exception as e:
            print(f"⚠️  Could not update dashboard status: {e}")

def main():
    """Main entry point for enhanced CChorus file watcher."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists():
        print("❌ Error: Not in CChorus project directory")
        sys.exit(1)
    
    print("🚀 Starting CChorus Enhanced File Watcher")
    print(f"📁 Project: {project_root}")
    print("🧠 Smart change detection enabled")
    print("🤖 Micro-agent routing active")
    
    # Create event handler and observer
    event_handler = CChorusEnhancedWatcher(project_root)
    observer = Observer()
    
    # Watch directories with intelligent filtering
    observer.schedule(event_handler, str(project_root / "src"), recursive=True)
    observer.schedule(event_handler, str(project_root), recursive=False)
    observer.schedule(event_handler, str(project_root / ".claude"), recursive=True)
    
    try:
        observer.start()
        print("👀 Enhanced file watcher is active...")
        print("📋 Press Ctrl+C to stop")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping enhanced file watcher...")
        observer.stop()
    
    observer.join()
    print("✅ Enhanced file watcher stopped")

if __name__ == "__main__":
    main()