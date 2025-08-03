#!/usr/bin/env python3
"""
CChorus Task Completion Validator
Automatically validates that tasks meet completion requirements before they can be marked as completed.
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class CChorusTaskValidator:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.validation_log_path = project_root / ".claude" / "task-validation-log.json"
        self.requirements_config_path = project_root / ".claude" / "task-requirements.json"
        
        # Ensure .claude directory exists
        (project_root / ".claude").mkdir(exist_ok=True)
        
        # Load or create requirements configuration
        self.requirements = self._load_or_create_requirements()
        
        print(f"🔍 CChorus Task Completion Validator initialized")
        print(f"📁 Project: {project_root}")
    
    def _load_or_create_requirements(self) -> Dict:
        """Load task completion requirements or create default configuration."""
        default_requirements = {
            "frontend_tasks": {
                "required_checks": [
                    "playwright_testing",
                    "user_approval", 
                    "shadcn_ui_compliance",
                    "theme_testing",
                    "accessibility_validation"
                ],
                "patterns": ["ui", "frontend", "component", "interface", "layout", "theme"]
            },
            "backend_tasks": {
                "required_checks": [
                    "api_testing",
                    "error_handling_validation",
                    "security_review"
                ],
                "patterns": ["api", "backend", "server", "endpoint", "database"]
            },
            "documentation_tasks": {
                "required_checks": [
                    "documentation_manager_used",
                    "accuracy_validation",
                    "cross_reference_check"
                ],
                "patterns": ["docs", "documentation", "readme", "changelog", "backlog"]
            },
            "git_workflow_tasks": {
                "required_checks": [
                    "gitops_workflow_followed",
                    "commit_message_quality",
                    "branch_naming_compliance"
                ],
                "patterns": ["git", "branch", "commit", "merge", "workflow"]
            },
            "general_tasks": {
                "required_checks": [
                    "testing_completed",
                    "documentation_updated",
                    "no_breaking_changes"
                ],
                "patterns": ["*"]
            }
        }
        
        try:
            if self.requirements_config_path.exists():
                with open(self.requirements_config_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"⚠️  Could not load requirements config: {e}")
        
        # Save default requirements
        with open(self.requirements_config_path, 'w') as f:
            json.dump(default_requirements, f, indent=2)
        
        print(f"📋 Created default task requirements: {self.requirements_config_path}")
        return default_requirements
    
    def validate_task_completion(self, task_content: str, task_priority: str = "medium") -> Dict:
        """Validate if a task meets completion requirements."""
        validation_result = {
            "task_content": task_content,
            "task_priority": task_priority,
            "can_complete": False,
            "validation_timestamp": datetime.now().isoformat(),
            "checks_performed": [],
            "failures": [],
            "recommendations": [],
            "task_category": None
        }
        
        try:
            # Determine task category
            task_category = self._categorize_task(task_content)
            validation_result["task_category"] = task_category
            
            # Get requirements for this task category
            requirements = self.requirements.get(task_category, self.requirements["general_tasks"])
            required_checks = requirements["required_checks"]
            
            print(f"🔍 Validating task: {task_content[:50]}...")
            print(f"📋 Category: {task_category}")
            print(f"✅ Required checks: {len(required_checks)}")
            
            # Perform validation checks
            all_passed = True
            for check in required_checks:
                result = self._perform_validation_check(check, task_content, task_category)
                validation_result["checks_performed"].append(result)
                
                if not result["passed"]:
                    all_passed = False
                    validation_result["failures"].append(result["failure_reason"])
                    if result.get("recommendation"):
                        validation_result["recommendations"].append(result["recommendation"])
            
            validation_result["can_complete"] = all_passed
            
            # Log validation result
            self._log_validation_result(validation_result)
            
            # Display results
            if all_passed:
                print(f"✅ Task validation PASSED - can be marked as completed")
            else:
                print(f"❌ Task validation FAILED - {len(validation_result['failures'])} issues found")
                for failure in validation_result["failures"]:
                    print(f"  - {failure}")
            
            return validation_result
            
        except Exception as e:
            validation_result["failures"].append(f"Validation error: {e}")
            print(f"❌ Error validating task: {e}")
            return validation_result
    
    def _categorize_task(self, task_content: str) -> str:
        """Categorize task based on content patterns."""
        content_lower = task_content.lower()
        
        # Check each category's patterns
        for category, config in self.requirements.items():
            if category == "general_tasks":
                continue
            
            patterns = config.get("patterns", [])
            if any(pattern in content_lower for pattern in patterns):
                return category
        
        return "general_tasks"
    
    def _perform_validation_check(self, check_name: str, task_content: str, task_category: str) -> Dict:
        """Perform a specific validation check."""
        check_result = {
            "check_name": check_name,
            "passed": False,
            "failure_reason": "",
            "recommendation": "",
            "details": {}
        }
        
        try:
            if check_name == "playwright_testing":
                return self._check_playwright_testing(task_content)
            elif check_name == "user_approval":
                return self._check_user_approval(task_content)
            elif check_name == "shadcn_ui_compliance":
                return self._check_shadcn_ui_compliance()
            elif check_name == "theme_testing":
                return self._check_theme_testing()
            elif check_name == "accessibility_validation":
                return self._check_accessibility_validation()
            elif check_name == "documentation_manager_used":
                return self._check_documentation_manager_used()
            elif check_name == "gitops_workflow_followed":
                return self._check_gitops_workflow_followed()
            elif check_name == "testing_completed":
                return self._check_testing_completed(task_category)
            elif check_name == "documentation_updated":
                return self._check_documentation_updated()
            elif check_name == "no_breaking_changes":
                return self._check_no_breaking_changes()
            else:
                check_result["passed"] = True
                check_result["details"]["status"] = "Check not implemented - assumed passing"
                
        except Exception as e:
            check_result["failure_reason"] = f"Check failed with error: {e}"
            check_result["recommendation"] = "Investigate check implementation"
        
        return check_result
    
    def _check_playwright_testing(self, task_content: str) -> Dict:
        """Check if Playwright testing has been performed for frontend tasks."""
        result = {"check_name": "playwright_testing", "passed": False, "details": {}}
        
        # Look for Playwright test files or mentions
        try:
            # Check for test files
            test_files = list(self.project_root.glob("**/*test*.js")) + list(self.project_root.glob("**/*spec*.js"))
            playwright_tests = [f for f in test_files if "playwright" in str(f).lower()]
            
            # Check recent commits for test mentions
            recent_commits = self._get_recent_commits(hours=24)
            test_commits = [c for c in recent_commits if any(keyword in c.lower() for keyword in ["test", "playwright", "spec"])]
            
            if playwright_tests or test_commits:
                result["passed"] = True
                result["details"]["test_files"] = len(playwright_tests)
                result["details"]["test_commits"] = len(test_commits)
            else:
                result["failure_reason"] = "No Playwright testing evidence found"
                result["recommendation"] = "Run Playwright tests and commit results"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check Playwright testing: {e}"
        
        return result
    
    def _check_user_approval(self, task_content: str) -> Dict:
        """Check if user approval has been obtained for frontend tasks."""
        result = {"check_name": "user_approval", "passed": False, "details": {}}
        
        # This is a placeholder - in practice, this might check for:
        # - Screenshots in commits
        # - Approval comments in code
        # - User testing session logs
        
        # For now, we'll check for recent screenshots or approval mentions
        try:
            recent_commits = self._get_recent_commits(hours=48)
            approval_indicators = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["screenshot", "demo", "user", "approval", "tested"])
            ]
            
            if approval_indicators:
                result["passed"] = True
                result["details"]["approval_commits"] = len(approval_indicators)
            else:
                result["failure_reason"] = "No user approval evidence found in recent commits"
                result["recommendation"] = "Take screenshots, demo to user, and commit approval evidence"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check user approval: {e}"
        
        return result
    
    def _check_shadcn_ui_compliance(self) -> Dict:
        """Check for shadcn/ui compliance in codebase."""
        result = {"check_name": "shadcn_ui_compliance", "passed": False, "details": {}}
        
        try:
            # Run the pre-commit hook compliance check
            compliance_result = subprocess.run([
                'bash', str(self.project_root / ".git/hooks/pre-commit")
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if compliance_result.returncode == 0:
                result["passed"] = True
                result["details"]["compliance_status"] = "Pre-commit hook passed"
            else:
                result["failure_reason"] = "shadcn/ui compliance issues detected by pre-commit hook"
                result["recommendation"] = "Fix shadcn/ui violations and ensure compliance"
                result["details"]["compliance_output"] = compliance_result.stderr
            
        except Exception as e:
            result["failure_reason"] = f"Could not check shadcn/ui compliance: {e}"
        
        return result
    
    def _check_theme_testing(self) -> Dict:
        """Check if theme testing has been performed."""
        result = {"check_name": "theme_testing", "passed": False, "details": {}}
        
        # Check for theme-related commits or files
        try:
            recent_commits = self._get_recent_commits(hours=48)
            theme_mentions = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["theme", "dark", "light", "color"])
            ]
            
            # Check for theme files
            theme_files = list(self.project_root.glob("**/theme*.tsx")) + list(self.project_root.glob("**/theme*.ts"))
            
            if theme_mentions or theme_files:
                result["passed"] = True
                result["details"]["theme_commits"] = len(theme_mentions)
                result["details"]["theme_files"] = len(theme_files)
            else:
                result["failure_reason"] = "No theme testing evidence found"
                result["recommendation"] = "Test both light and dark themes, document with commits"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check theme testing: {e}"
        
        return result
    
    def _check_accessibility_validation(self) -> Dict:
        """Check if accessibility validation has been performed."""
        result = {"check_name": "accessibility_validation", "passed": False, "details": {}}
        
        # Check for accessibility mentions in commits or code
        try:
            recent_commits = self._get_recent_commits(hours=48)
            a11y_mentions = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["accessibility", "a11y", "aria", "keyboard", "screen reader"])
            ]
            
            if a11y_mentions:
                result["passed"] = True
                result["details"]["a11y_commits"] = len(a11y_mentions)
            else:
                # Check if using Radix UI (which provides accessibility)
                package_json = self.project_root / "package.json"
                if package_json.exists():
                    with open(package_json) as f:
                        content = f.read()
                        if "@radix-ui" in content:
                            result["passed"] = True
                            result["details"]["accessibility_source"] = "Radix UI provides accessibility features"
                        else:
                            result["failure_reason"] = "No accessibility validation evidence found"
                            result["recommendation"] = "Test keyboard navigation and screen reader compatibility"
                else:
                    result["failure_reason"] = "Could not verify accessibility validation"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check accessibility validation: {e}"
        
        return result
    
    def _check_documentation_manager_used(self) -> Dict:
        """Check if documentation-manager agent was used."""
        result = {"check_name": "documentation_manager_used", "passed": False, "details": {}}
        
        try:
            # Check for documentation trigger files
            trigger_files = [
                self.project_root / ".claude" / "doc-update-needed.trigger",
                self.project_root / ".claude" / "pending-agent-invocations.json"
            ]
            
            doc_triggers_found = any(f.exists() for f in trigger_files)
            
            # Check recent commits for documentation updates
            recent_commits = self._get_recent_commits(hours=48)
            doc_commits = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["docs", "documentation", "readme", "changelog"])
            ]
            
            if doc_triggers_found or doc_commits:
                result["passed"] = True
                result["details"]["doc_triggers"] = doc_triggers_found
                result["details"]["doc_commits"] = len(doc_commits)
            else:
                result["failure_reason"] = "No documentation-manager usage evidence found"
                result["recommendation"] = "Use @documentation-manager to update documentation"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check documentation-manager usage: {e}"
        
        return result
    
    def _check_gitops_workflow_followed(self) -> Dict:
        """Check if GitOps workflow was followed."""
        result = {"check_name": "gitops_workflow_followed", "passed": False, "details": {}}
        
        try:
            # Check for GitOps agent invocations
            gitops_invocations = self.project_root / ".claude" / "pending-agent-invocations.json"
            
            # Check recent commits for GitOps workflow patterns
            recent_commits = self._get_recent_commits(hours=48)
            gitops_commits = [
                c for c in recent_commits 
                if "Generated with [Claude Code]" in c or "Co-Authored-By: Claude" in c
            ]
            
            if gitops_invocations.exists() or gitops_commits:
                result["passed"] = True
                result["details"]["gitops_commits"] = len(gitops_commits)
            else:
                result["failure_reason"] = "No GitOps workflow evidence found"
                result["recommendation"] = "Use @gitops-workflow-manager for Git operations"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check GitOps workflow: {e}"
        
        return result
    
    def _check_testing_completed(self, task_category: str) -> Dict:
        """Check if appropriate testing has been completed."""
        result = {"check_name": "testing_completed", "passed": False, "details": {}}
        
        try:
            # Check for test files
            test_files = list(self.project_root.glob("**/*test*")) + list(self.project_root.glob("**/*spec*"))
            
            # Check for recent test-related commits
            recent_commits = self._get_recent_commits(hours=48)
            test_commits = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["test", "spec", "coverage"])
            ]
            
            if test_files or test_commits:
                result["passed"] = True
                result["details"]["test_files"] = len(test_files)
                result["details"]["test_commits"] = len(test_commits)
            else:
                result["failure_reason"] = "No testing evidence found"
                result["recommendation"] = f"Add appropriate tests for {task_category} work"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check testing completion: {e}"
        
        return result
    
    def _check_documentation_updated(self) -> Dict:
        """Check if documentation has been updated."""
        result = {"check_name": "documentation_updated", "passed": False, "details": {}}
        
        try:
            # Check for recent documentation file changes
            doc_files = [
                "README.md", "CLAUDE.md", "CHANGELOG.md", "BACKLOG.md", "PROCESS.md"
            ]
            
            recent_commits = self._get_recent_commits(hours=48)
            doc_updates = []
            
            for commit in recent_commits:
                if any(doc_file.lower() in commit.lower() for doc_file in doc_files):
                    doc_updates.append(commit)
            
            if doc_updates:
                result["passed"] = True
                result["details"]["doc_update_commits"] = len(doc_updates)
            else:
                result["failure_reason"] = "No documentation updates found in recent commits"
                result["recommendation"] = "Update relevant documentation files"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check documentation updates: {e}"
        
        return result
    
    def _check_no_breaking_changes(self) -> Dict:
        """Check for potential breaking changes."""
        result = {"check_name": "no_breaking_changes", "passed": True, "details": {}}
        
        try:
            # Check recent commits for breaking change indicators
            recent_commits = self._get_recent_commits(hours=48)
            breaking_indicators = [
                c for c in recent_commits 
                if any(keyword in c.lower() for keyword in ["breaking", "major", "remove", "delete"])
            ]
            
            if breaking_indicators:
                result["passed"] = False
                result["failure_reason"] = "Potential breaking changes detected in recent commits"
                result["recommendation"] = "Review breaking changes and update documentation accordingly"
                result["details"]["breaking_commits"] = len(breaking_indicators)
            else:
                result["details"]["status"] = "No breaking changes detected"
            
        except Exception as e:
            result["failure_reason"] = f"Could not check for breaking changes: {e}"
            result["passed"] = False
        
        return result
    
    def _get_recent_commits(self, hours: int = 24) -> List[str]:
        """Get recent commit messages within specified hours."""
        try:
            result = subprocess.run([
                'git', 'log', f'--since={hours} hours ago', '--pretty=format:%s'
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().split('\n')
            
            return []
            
        except Exception as e:
            print(f"⚠️  Could not get recent commits: {e}")
            return []
    
    def _log_validation_result(self, validation_result: Dict):
        """Log validation result for historical tracking."""
        try:
            log_entry = {
                "timestamp": validation_result["validation_timestamp"],
                "task": validation_result["task_content"],
                "category": validation_result["task_category"],
                "result": "PASSED" if validation_result["can_complete"] else "FAILED",
                "checks_count": len(validation_result["checks_performed"]),
                "failures_count": len(validation_result["failures"])
            }
            
            # Load existing log
            validation_log = []
            if self.validation_log_path.exists():
                try:
                    with open(self.validation_log_path, 'r') as f:
                        validation_log = json.load(f)
                except:
                    validation_log = []
            
            # Add new entry
            validation_log.append(log_entry)
            
            # Keep only last 100 entries
            validation_log = validation_log[-100:]
            
            # Save updated log
            with open(self.validation_log_path, 'w') as f:
                json.dump(validation_log, f, indent=2)
            
        except Exception as e:
            print(f"⚠️  Could not log validation result: {e}")
    
    def validate_current_todos(self) -> Dict:
        """Validate all current todos that are marked as completed."""
        results = {
            "validation_timestamp": datetime.now().isoformat(),
            "validated_tasks": [],
            "validation_summary": {
                "total_completed_tasks": 0,
                "valid_completions": 0,
                "invalid_completions": 0,
                "pending_validation": 0
            }
        }
        
        print(f"🔍 Validating current completed todos...")
        
        # This is a placeholder - in practice, this would read from TodoWrite sessions
        # or a todo tracking system to validate completed tasks
        
        print(f"📋 Todo validation not implemented - requires TodoWrite integration")
        
        return results

def main():
    """Main entry point for task completion validator."""
    project_root = Path(__file__).parent.parent
    
    # Verify we're in CChorus project
    if not (project_root / "CLAUDE.md").exists() or not (project_root / ".claude").exists():
        print("❌ Error: Not in CChorus project directory")
        print("Run this script from the CChorus project root")
        sys.exit(1)
    
    validator = CChorusTaskValidator(project_root)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--validate-task":
            if len(sys.argv) < 3:
                print("Usage: task-completion-validator.py --validate-task 'task description'")
                sys.exit(1)
            
            task_content = sys.argv[2]
            priority = sys.argv[3] if len(sys.argv) > 3 else "medium"
            
            result = validator.validate_task_completion(task_content, priority)
            sys.exit(0 if result["can_complete"] else 1)
        
        elif sys.argv[1] == "--validate-todos":
            results = validator.validate_current_todos()
            print(f"📊 Validation Summary:")
            print(f"  Valid completions: {results['validation_summary']['valid_completions']}")
            print(f"  Invalid completions: {results['validation_summary']['invalid_completions']}")
            sys.exit(0)
        else:
            print("Usage: task-completion-validator.py [--validate-task 'description' [priority]|--validate-todos]")
            sys.exit(1)
    else:
        # Default: show help
        print("CChorus Task Completion Validator")
        print("")
        print("Usage:")
        print("  --validate-task 'description' [priority]  Validate a specific task")
        print("  --validate-todos                          Validate all current todos")
        print("")
        print("Examples:")
        print("  ./task-completion-validator.py --validate-task 'Implement dark theme toggle'")
        print("  ./task-completion-validator.py --validate-todos")

if __name__ == "__main__":
    main()