#!/usr/bin/env python3
"""
CChorus Project-Level Pre-Compact Hook
Integrates with documentation manager and GitOps agents for seamless workflow.
Enhanced to actively invoke /docgit workflow when changes are detected.
"""

import sys
import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class CChorusPreCompactHook:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.config_path = self.project_root / "config" / "gitops-config.json"
        self.session_docs_dir = self.project_root / "docs" / "sessions"
        self.session_file = Path("/tmp/claude-gitops-session.json")
        self.debug = os.environ.get('CLAUDE_HOOKS_DEBUG', '').lower() == 'true'
        
        # Load GitOps configuration
        self.config = self._load_config()
        
        # Ensure session docs directory exists
        self.session_docs_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_config(self) -> dict:
        """Load CChorus GitOps configuration."""
        try:
            with open(self.config_path) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.log(f"Could not load GitOps config: {e}")
            return {"gitops": {"enabled": True}}
    
    def log(self, message: str):
        """Log debug messages."""
        if self.debug:
            print(f"[CCHORUS-PRECOMPACT] {message}", file=sys.stderr)
    
    def process(self, input_data: Dict) -> Dict:
        """Process pre-compact event with CChorus-specific workflow."""
        try:
            session_id = input_data.get('session_id', 'unknown')
            trigger = input_data.get('trigger', 'unknown')
            custom_instructions = input_data.get('custom_instructions', '')
            
            self.log(f"Processing CChorus {trigger} compaction for session {session_id}")
            
            # Step 1: Coordinate with documentation manager agent
            doc_agent_status = self._coordinate_with_doc_agent()
            
            # Step 2: Generate CChorus-specific session documentation
            session_doc_path = self._generate_cchorus_session_doc(
                session_id, trigger, custom_instructions, doc_agent_status
            )
            
            # Step 3: Create CChorus-specific next session brief
            self._create_cchorus_next_session_brief()
            
            # Step 4: Prepare for GitOps agent coordination
            gitops_ready = self._prepare_for_gitops(session_id, trigger)
            
            # Step 5: Clean up session data
            if self.session_file.exists():
                # Preserve session data for GitOps agent, just mark as ready
                self._mark_session_ready_for_gitops()
                self.log("Marked session ready for GitOps agent")
            
            return {
                "success": True,
                "session_documented": True,
                "doc_path": str(session_doc_path),
                "doc_agent_coordinated": doc_agent_status,
                "gitops_ready": gitops_ready,
                "workflow": "Documentation → GitOps sequence followed"
            }
            
        except Exception as e:
            self.log(f"Error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _coordinate_with_doc_agent(self) -> bool:
        """Coordinate with documentation manager agent before session end."""
        self.log("Coordinating with documentation manager agent")
        
        # Check if there are pending documentation updates needed
        pending_changes = self._detect_pending_doc_changes()
        
        if pending_changes:
            self.log("Detected pending documentation changes - attempting to invoke /docgit workflow")
            # Try to actively invoke the /docgit workflow
            if self._invoke_docgit_workflow():
                self.log("Successfully executed /docgit workflow")
                return True
            else:
                self.log("Failed to execute /docgit workflow - documentation agent should be invoked manually")
                return False
        else:
            self.log("No pending documentation changes detected")
            return True
    
    def _detect_pending_doc_changes(self) -> bool:
        """Detect if there are changes that require documentation updates."""
        try:
            # Check for uncommitted changes in key directories
            result = subprocess.run(
                ['git', 'status', '--porcelain', 'src/', 'server.js', 'CLAUDE.md'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            changes = result.stdout.strip()
            if changes:
                self.log(f"Detected changes requiring documentation: {changes[:100]}...")
                return True
            
            return False
            
        except Exception as e:
            self.log(f"Could not detect pending changes: {e}")
            return False
    
    def _invoke_docgit_workflow(self) -> bool:
        """Invoke the /docgit slash command to execute documentation and GitOps workflow."""
        self.log("Attempting to invoke /docgit workflow")
        
        try:
            # Check if claude command is available
            result = subprocess.run(['which', 'claude'], 
                                  capture_output=True, 
                                  text=True)
            
            if result.returncode != 0:
                self.log("Claude CLI command not found in PATH - cannot invoke /docgit")
                return False
            
            claude_path = result.stdout.strip()
            self.log(f"Found Claude CLI at: {claude_path}")
            
            # Execute the /docgit command
            self.log("Executing: claude /docgit")
            result = subprocess.run([claude_path, '/docgit'],
                                  capture_output=True,
                                  text=True,
                                  cwd=self.project_root,
                                  timeout=300)  # 5 minute timeout
            
            # Log the command output
            if result.stdout:
                self.log(f"Command stdout: {result.stdout[:500]}...")
            if result.stderr:
                self.log(f"Command stderr: {result.stderr[:500]}...")
            
            if result.returncode == 0:
                self.log("Successfully completed /docgit workflow")
                return True
            else:
                self.log(f"Command failed with return code: {result.returncode}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log("Command timed out after 5 minutes")
            return False
        except FileNotFoundError:
            self.log("Claude CLI command not found - cannot invoke /docgit")
            return False
        except Exception as e:
            self.log(f"Error invoking /docgit workflow: {e}")
            return False
    
    def _generate_cchorus_session_doc(self, session_id: str, trigger: str, 
                                    custom_instructions: str, doc_agent_status: bool) -> Path:
        """Generate CChorus-specific session documentation."""
        timestamp = datetime.now()
        doc_filename = f"SESSION_{timestamp.strftime('%Y-%m-%d_%H-%M')}_CCHORUS.md"
        doc_path = self.session_docs_dir / doc_filename
        
        # Load session operations
        session_operations = self._load_session_operations()
        
        # Analyze CChorus-specific changes
        changes_analysis = self._analyze_cchorus_changes()
        
        # Generate CChorus-focused content
        content = f"""# CChorus Development Session Summary

**Session ID**: {session_id}
**Date**: {timestamp.strftime('%B %d, %Y %H:%M')}
**Trigger**: {trigger.capitalize()} compaction
**Project**: CChorus - Claude Code Resource Management Platform
{f'**Instructions**: {custom_instructions}' if custom_instructions else ''}

## 🎯 Session Focus

**Development Area**: {self._identify_development_focus(changes_analysis)}
**Component Work**: {self._identify_component_work(changes_analysis)}
**Agent Workflow**: Documentation → GitOps sequence {'✅ Followed' if doc_agent_status else '🤖 Auto-invoked via /docgit' if doc_agent_status is None else '⚠️ Pending doc updates'}

## 📊 Session Metrics

- **Duration**: {self._calculate_session_duration(session_operations)}
- **Operations**: {len(session_operations)} tool uses
- **Files Changed**: {changes_analysis.get('files_changed', 0)}
- **Component Files**: {changes_analysis.get('component_files', 0)}
- **API Endpoints**: {changes_analysis.get('api_changes', 0)}
- **Documentation Files**: {changes_analysis.get('doc_files', 0)}

## 🚀 CChorus Achievements

{self._generate_cchorus_achievements(session_operations, changes_analysis)}

## 🔧 Code Changes Analysis

{self._generate_cchorus_code_changes(changes_analysis)}

## 🛠️ Key Operations Timeline

{self._generate_operations_timeline(session_operations)}

## 📋 CChorus-Specific Context

**Resource Library Development**: {changes_analysis.get('resource_library_work', 'No changes')}
**Assignment Manager Work**: {changes_analysis.get('assignment_manager_work', 'No changes')}
**Agent System Changes**: {changes_analysis.get('agent_system_work', 'No changes')}
**UI Components Modified**: {changes_analysis.get('ui_components', [])}

## 🔄 Agent Workflow Status

**Documentation Agent**: {'✅ Coordinated' if doc_agent_status else '🤖 Auto-invoked via /docgit workflow'}
**GitOps Agent**: {'✅ Completed via /docgit' if doc_agent_status else '🕐 Ready to handle commits after session end'}
**Workflow Sequence**: Code → Documentation → GitOps ({'✅ Completed' if doc_agent_status else '🤖 Auto-executed via /docgit'})

## 📂 Git Status

```bash
# Current branch
{self._get_current_branch()}

# Working directory status
{self._get_git_status()}
```

## 🎯 Next Session TODOs

{self._generate_cchorus_todos(session_operations, changes_analysis, doc_agent_status)}

## 🔄 Development Context for Next Session

- **Working Directory**: `{self.project_root}`
- **Active Feature**: {self._identify_active_feature(changes_analysis)}
- **Key Files to Review**: {self._list_key_cchorus_files(changes_analysis)}
- **Server Management**: Use `/tmux-dev` for all development servers
- **Agent Workflow**: Remember Documentation → GitOps sequence

---

*Generated by CChorus pre-compact hook - Optimized for Resource Management Platform development*
"""
        
        # Write documentation
        doc_path.write_text(content)
        self.log(f"Created CChorus session documentation: {doc_path}")
        
        return doc_path
    
    def _create_cchorus_next_session_brief(self):
        """Create CChorus-specific next session brief with proper commands."""
        brief_path = self.project_root / "NEXT_SESSION.md"
        
        content = f"""# CChorus Next Session Brief

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Project**: CChorus - Claude Code Resource Management Platform

## 🚀 Quick Resume

**Branch**: {self._get_current_branch()}
**Last Activity**: {datetime.now().strftime('%B %d, %Y')}

## 🖥️ MANDATORY: Development Server Commands

```bash
# Navigate to CChorus project
cd {self.project_root}

# REQUIRED: Start development servers using tmux-dev
/tmux-dev start frontend server in session cchorus-frontend
/tmux-dev start backend server in session cchorus-backend

# Monitor servers (non-blocking)
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend

# List running sessions
/tmux-dev list all running sessions
```

## 🚫 PROHIBITED Commands

```bash
# These are FORBIDDEN - use /tmux-dev instead:
# npm run dev                 ❌
# npm run dev:server          ❌
# npm run dev:full            ❌
```

## 📚 Agent Workflow Reminder

**MANDATORY SEQUENCE**: Code Changes → Documentation Agent → GitOps Agent

```bash
# When making changes, follow this workflow:
# 1. Complete your code changes
# 2. Invoke: @documentation-manager please update documentation for [changes]
# 3. Verify documentation agent completion
# 4. Let GitOps agent handle commits and pushes
```

## 🎯 Active Development Context

Check `docs/sessions/` for the latest session summary with detailed context.

## 📂 Git Status Summary

```
{self._get_git_status()}
```

## 🔧 CChorus Development Reminders

- **Resource Library**: Unified browser for all Claude Code resources
- **Assignment Manager**: Deploy and manage resource assignments  
- **Agent Architecture**: Documentation manager handles docs, GitOps handles Git
- **Server Management**: Always use `/tmux-dev` for development servers
- **Component System**: shadcn/ui + Radix UI with accessibility features
- **Automated Workflow**: Pre-compact hook now auto-invokes `/docgit` when changes detected

---

*This brief helps you resume CChorus development following all mandatory workflows.*
"""
        
        brief_path.write_text(content)
        self.log("Created CChorus-specific NEXT_SESSION.md")
    
    def _prepare_for_gitops(self, session_id: str, trigger: str) -> bool:
        """Prepare session data for GitOps agent coordination."""
        try:
            if self.session_file.exists():
                # Add coordination metadata for GitOps agent
                with open(self.session_file, 'r') as f:
                    session_data = json.load(f)
                
                session_data['precompact_complete'] = True
                session_data['documentation_coordinated'] = True
                session_data['cchorus_session'] = True
                session_data['ready_for_gitops'] = True
                session_data['session_id'] = session_id
                session_data['trigger'] = trigger
                
                with open(self.session_file, 'w') as f:
                    json.dump(session_data, f, indent=2)
                
                self.log("Prepared session data for GitOps agent")
                return True
            
            return False
            
        except Exception as e:
            self.log(f"Could not prepare for GitOps: {e}")
            return False
    
    def _mark_session_ready_for_gitops(self):
        """Mark session as ready for GitOps agent processing."""
        try:
            if self.session_file.exists():
                with open(self.session_file, 'r') as f:
                    session_data = json.load(f)
                
                session_data['precompact_ready'] = True
                session_data['cchorus_documented'] = True
                
                with open(self.session_file, 'w') as f:
                    json.dump(session_data, f, indent=2)
                
        except Exception as e:
            self.log(f"Could not mark session ready: {e}")
    
    def _load_session_operations(self) -> List[Dict]:
        """Load operations from session file."""
        try:
            if self.session_file.exists():
                with open(self.session_file) as f:
                    data = json.load(f)
                    return data.get('operations', [])
        except Exception as e:
            self.log(f"Could not load session operations: {e}")
        
        return []
    
    def _analyze_cchorus_changes(self) -> Dict:
        """Analyze changes with CChorus-specific context."""
        try:
            # Get changed files
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            
            changes = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            analysis = {
                'files_changed': len(changes),
                'component_files': 0,
                'api_changes': 0,
                'doc_files': 0,
                'ui_components': [],
                'resource_library_work': 'No changes',
                'assignment_manager_work': 'No changes',
                'agent_system_work': 'No changes'
            }
            
            for change in changes:
                if len(change) < 3:
                    continue
                
                filepath = change[3:]  # Remove status prefix
                
                # Analyze CChorus-specific patterns
                if 'src/components/' in filepath:
                    analysis['component_files'] += 1
                    component_name = Path(filepath).stem
                    analysis['ui_components'].append(component_name)
                    
                    if 'ResourceLibrary' in filepath:
                        analysis['resource_library_work'] = 'Modified'
                    elif 'AssignmentManager' in filepath:
                        analysis['assignment_manager_work'] = 'Modified'
                
                elif 'server.js' in filepath:
                    analysis['api_changes'] += 1
                
                elif filepath.endswith('.md') or 'docs/' in filepath:
                    analysis['doc_files'] += 1
                
                elif '.claude/agents/' in filepath:
                    analysis['agent_system_work'] = 'Agent files modified'
            
            return analysis
            
        except Exception as e:
            self.log(f"Could not analyze CChorus changes: {e}")
            return {'files_changed': 0}
    
    def _identify_development_focus(self, changes_analysis: Dict) -> str:
        """Identify the main development focus of the session."""
        if changes_analysis.get('resource_library_work') != 'No changes':
            return "Resource Library Development"
        elif changes_analysis.get('assignment_manager_work') != 'No changes':
            return "Assignment Manager Development"
        elif changes_analysis.get('component_files', 0) > 0:
            return "UI Component Development"
        elif changes_analysis.get('api_changes', 0) > 0:
            return "Backend API Development"
        elif changes_analysis.get('agent_system_work') != 'No changes':
            return "Agent System Development"
        else:
            return "General CChorus Development"
    
    def _identify_component_work(self, changes_analysis: Dict) -> str:
        """Identify specific component work."""
        components = changes_analysis.get('ui_components', [])
        if components:
            return f"Modified: {', '.join(components[:3])}" + ("..." if len(components) > 3 else "")
        return "No component changes"
    
    def _calculate_session_duration(self, operations: List[Dict]) -> str:
        """Calculate session duration from operations."""
        if not operations:
            return "Unknown"
        
        try:
            first_op = operations[0].get('timestamp', 0)
            last_op = operations[-1].get('timestamp', 0)
            
            if isinstance(first_op, str):
                first_op = datetime.fromisoformat(first_op).timestamp()
            if isinstance(last_op, str):
                last_op = datetime.fromisoformat(last_op).timestamp()
            
            duration_seconds = int(last_op - first_op)
            hours = duration_seconds // 3600
            minutes = (duration_seconds % 3600) // 60
            
            if hours > 0:
                return f"{hours}h {minutes}m"
            else:
                return f"{minutes}m"
        except Exception:
            return "Unknown"
    
    def _generate_cchorus_achievements(self, operations: List[Dict], changes_analysis: Dict) -> str:
        """Generate CChorus-specific achievements."""
        achievements = []
        
        # Component-specific achievements
        if changes_analysis.get('resource_library_work') != 'No changes':
            achievements.append("🎯 Enhanced Resource Library functionality")
        
        if changes_analysis.get('assignment_manager_work') != 'No changes':
            achievements.append("📋 Improved Assignment Manager capabilities")
        
        if changes_analysis.get('component_files', 0) > 0:
            achievements.append(f"🧩 Modified {changes_analysis['component_files']} UI components")
        
        if changes_analysis.get('api_changes', 0) > 0:
            achievements.append("🔌 Updated backend API endpoints")
        
        if changes_analysis.get('agent_system_work') != 'No changes':
            achievements.append("🤖 Enhanced agent system configuration")
        
        # Operation-based achievements
        tools_used = {}
        for op in operations:
            tool = op.get('tool', 'Unknown')
            tools_used[tool] = tools_used.get(tool, 0) + 1
        
        if tools_used.get('Write', 0) > 0:
            achievements.append(f"📝 Created {tools_used['Write']} new files")
        
        if tools_used.get('Edit', 0) > 0:
            achievements.append(f"✏️ Modified {tools_used['Edit']} files")
        
        if not achievements:
            achievements.append("🔄 Session in progress - preparing for next development phase")
        
        return "\n".join(achievements)
    
    def _generate_cchorus_code_changes(self, changes_analysis: Dict) -> str:
        """Generate CChorus-specific code changes analysis."""
        if changes_analysis.get('files_changed', 0) == 0:
            return "No uncommitted changes detected"
        
        sections = []
        
        if changes_analysis.get('component_files', 0) > 0:
            sections.append(f"### UI Components ({changes_analysis['component_files']} files)")
            ui_components = changes_analysis.get('ui_components', [])
            for component in ui_components:
                sections.append(f"- `{component}.tsx`")
        
        if changes_analysis.get('api_changes', 0) > 0:
            sections.append(f"\n### Backend API ({changes_analysis['api_changes']} changes)")
            sections.append("- `server.js`")
        
        if changes_analysis.get('doc_files', 0) > 0:
            sections.append(f"\n### Documentation ({changes_analysis['doc_files']} files)")
            sections.append("- Documentation files updated")
        
        return "\n".join(sections) if sections else "Changes detected but not categorized"
    
    def _generate_operations_timeline(self, operations: List[Dict]) -> str:
        """Generate timeline of key operations with CChorus context."""
        if not operations:
            return "No operations recorded in this session"
        
        timeline = []
        for i, op in enumerate(operations[-10:]):  # Last 10 operations
            tool = op.get('tool', 'Unknown')
            tool_input = op.get('tool_input', {})
            
            # Extract CChorus-relevant info
            if tool == 'Edit':
                file_path = tool_input.get('file_path', 'unknown')
                if 'ResourceLibrary' in file_path:
                    timeline.append(f"{i+1}. 🎯 **Resource Library**: Modified `{Path(file_path).name}`")
                elif 'AssignmentManager' in file_path:
                    timeline.append(f"{i+1}. 📋 **Assignment Manager**: Modified `{Path(file_path).name}`")
                elif 'server.js' in file_path:
                    timeline.append(f"{i+1}. 🔌 **Backend API**: Modified `{Path(file_path).name}`")
                else:
                    timeline.append(f"{i+1}. ✏️ **Edit**: `{Path(file_path).name}`")
            elif tool == 'Write':
                file_path = tool_input.get('file_path', 'unknown')
                timeline.append(f"{i+1}. 📝 **Create**: `{Path(file_path).name}`")
            elif tool == 'Bash':
                command = tool_input.get('command', 'unknown')[:50]
                timeline.append(f"{i+1}. 🖥️ **Command**: `{command}...`")
            else:
                timeline.append(f"{i+1}. 🔧 **{tool}**: Operation performed")
        
        return "\n".join(timeline)
    
    def _get_current_branch(self) -> str:
        """Get current git branch."""
        try:
            result = subprocess.run(
                ['git', 'branch', '--show-current'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            return result.stdout.strip() or "unknown"
        except Exception:
            return "unknown"
    
    def _get_git_status(self) -> str:
        """Get git status output."""
        try:
            result = subprocess.run(
                ['git', 'status', '--short'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            return result.stdout or "Working tree clean"
        except Exception:
            return "Unable to get git status"
    
    def _generate_cchorus_todos(self, operations: List[Dict], changes_analysis: Dict, doc_agent_status: bool) -> str:
        """Generate CChorus-specific TODOs for next session."""
        todos = []
        
        # Documentation workflow TODOs
        if not doc_agent_status:
            todos.append("- [ ] **INFO**: /docgit workflow was auto-invoked for pending changes")
        else:
            todos.append("- [x] **COMPLETED**: Documentation and GitOps workflow handled automatically")
        
        # Component-specific TODOs
        if changes_analysis.get('resource_library_work') != 'No changes':
            todos.append("- [ ] Test Resource Library functionality with various resource types")
        
        if changes_analysis.get('assignment_manager_work') != 'No changes':
            todos.append("- [ ] Verify Assignment Manager deployment workflows")
        
        if changes_analysis.get('api_changes', 0) > 0:
            todos.append("- [ ] Test API endpoints with frontend integration")
        
        # Standard CChorus TODOs
        todos.extend([
            "- [ ] Verify tmux-dev server management works correctly",
            "- [ ] Test complete Resource Library → Assignment workflow",
            "- [ ] Check all three navigation tabs (Library, Assignments, Agents)",
            "- [ ] Ensure agent workflow sequence is followed: Code → Documentation → GitOps"
        ])
        
        return "\n".join(todos)
    
    def _identify_active_feature(self, changes_analysis: Dict) -> str:
        """Identify the active feature being developed."""
        if changes_analysis.get('resource_library_work') != 'No changes':
            return "Resource Library Enhancement"
        elif changes_analysis.get('assignment_manager_work') != 'No changes':
            return "Assignment Manager Development"
        elif changes_analysis.get('component_files', 0) > 0:
            return "UI Component Development"
        else:
            return "General CChorus Development"
    
    def _list_key_cchorus_files(self, changes_analysis: Dict) -> List[str]:
        """List key CChorus files that were modified."""
        key_files = []
        
        if changes_analysis.get('resource_library_work') != 'No changes':
            key_files.append("src/components/ResourceLibrary.tsx")
        
        if changes_analysis.get('assignment_manager_work') != 'No changes':
            key_files.append("src/components/AssignmentManager.tsx")
        
        if changes_analysis.get('api_changes', 0) > 0:
            key_files.append("server.js")
        
        key_files.append("CLAUDE.md")  # Always check project documentation
        
        return key_files[:5]  # Top 5 most relevant

def main():
    """Main entry point for CChorus pre-compact hook."""
    try:
        # Read input from Claude Code
        input_data = json.load(sys.stdin)
        
        # Process with CChorus-specific hook
        hook = CChorusPreCompactHook()
        result = hook.process(input_data)
        
        # Output result for debugging
        print(json.dumps(result), file=sys.stderr)
        
        # Exit with appropriate code
        sys.exit(0 if result.get('success', False) else 1)
        
    except Exception as e:
        print(f"Fatal error in CChorus pre-compact hook: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()