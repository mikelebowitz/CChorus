#!/usr/bin/env python3
"""
Pre-UI-Change Hook for CChorus
Automatically triggers Playwright testing when UI-related files are modified.

This hook detects changes to React components, CSS files, and other UI-related files,
then automatically invokes the frontend-tester agent for comprehensive UI testing.
"""

import sys
import os
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path

# UI file patterns that trigger testing
UI_FILE_PATTERNS = [
    r'src/components/.*\.(tsx|ts|jsx|js)$',
    r'src/.*\.css$',
    r'src/.*\.scss$',
    r'src/styles/.*$',
    r'tailwind\.config\.(js|ts)$',
    r'src/components/ui/.*$',
    r'.*\.(css|scss|less|sass)$',
    r'index\.html$',
    r'src/App\.(tsx|ts|jsx|js)$',
]

# Component patterns that require extensive testing
CRITICAL_COMPONENT_PATTERNS = [
    r'src/components/ThreeColumnLayout\.tsx$',
    r'src/components/ResourceEditor\.tsx$',
    r'src/components/PropertiesPanel\.tsx$',
    r'src/components/ResourceAssignmentPanel\.tsx$',
    r'src/components/.*Panel\.tsx$',
]

def is_ui_file(file_path):
    """Check if a file is UI-related and should trigger testing."""
    for pattern in UI_FILE_PATTERNS:
        if re.match(pattern, file_path):
            return True
    return False

def is_critical_component(file_path):
    """Check if a file is a critical component requiring extensive testing."""
    for pattern in CRITICAL_COMPONENT_PATTERNS:
        if re.match(pattern, file_path):
            return True
    return False

def get_changed_files():
    """Get list of changed files from git."""
    try:
        # Get staged files
        result = subprocess.run(
            ['git', 'diff', '--cached', '--name-only'],
            capture_output=True,
            text=True,
            check=True
        )
        staged_files = result.stdout.strip().split('\n') if result.stdout.strip() else []
        
        # Get unstaged files
        result = subprocess.run(
            ['git', 'diff', '--name-only'],
            capture_output=True,
            text=True,
            check=True
        )
        unstaged_files = result.stdout.strip().split('\n') if result.stdout.strip() else []
        
        return list(set(staged_files + unstaged_files))
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed files: {e}")
        return []

def create_playwright_test_prompt(ui_files, critical_files):
    """Create a detailed prompt for the frontend-tester agent."""
    prompt_parts = [
        "Automated UI Testing Trigger - Comprehensive Frontend Validation",
        "",
        "The following UI-related files have been modified and require testing:",
    ]
    
    if critical_files:
        prompt_parts.extend([
            "",
            "🔴 CRITICAL COMPONENTS (Require Extensive Testing):",
            *[f"  - {file}" for file in critical_files],
        ])
    
    regular_files = [f for f in ui_files if f not in critical_files]
    if regular_files:
        prompt_parts.extend([
            "",
            "📄 UI FILES (Standard Testing):",
            *[f"  - {file}" for file in regular_files],
        ])
    
    prompt_parts.extend([
        "",
        "🧪 REQUIRED TESTS:",
        "1. **Visual Regression Testing**: Compare UI appearance with previous version",
        "2. **Functional Testing**: Verify all interactive elements work correctly",
        "3. **Responsive Design**: Test layout at different screen sizes",
        "4. **Cross-browser Compatibility**: Check rendering consistency",
        "5. **Accessibility Validation**: Ensure proper keyboard navigation and screen reader support",
    ])
    
    if critical_files:
        prompt_parts.extend([
            "",
            "🎯 CRITICAL COMPONENT TESTING:",
            "- Test all major user workflows (resource selection, editing, saving)",
            "- Verify 3-column layout integrity and resizable panels",
            "- Test resource editor functionality (MDX Editor integration)",
            "- Validate properties panel with real data integration",
            "- Check project assignment functionality and Toast notifications",
        ])
    
    prompt_parts.extend([
        "",
        "📋 TESTING APPROACH:",
        "1. Take initial screenshot for baseline comparison",
        "2. Test each modified component thoroughly", 
        "3. Verify integration with other system components",
        "4. Check for console errors or warnings",
        "5. Test user workflows end-to-end",
        "6. Document any regressions or issues found",
        "",
        "🎯 SUCCESS CRITERIA:",
        "- All UI components render correctly without errors",
        "- Interactive elements respond appropriately",
        "- No visual regressions from previous version",
        "- User workflows complete successfully",
        "- No accessibility violations detected",
        "",
        "Please provide a comprehensive testing report with screenshots and specific findings."
    ])
    
    return '\n'.join(prompt_parts)

def queue_playwright_test(ui_files, critical_files):
    """Queue a frontend-tester agent invocation."""
    try:
        # Read existing pending invocations
        pending_file = Path('.claude/pending-agent-invocations.json')
        if pending_file.exists():
            with open(pending_file, 'r') as f:
                pending = json.load(f)
        else:
            pending = []
        
        # Create test invocation
        invocation = {
            'agent': 'frontend-tester',
            'timestamp': datetime.now().strftime('%I:%M:%S%p').lower(),
            'trigger': 'pre-ui-change-hook',
            'prompt': create_playwright_test_prompt(ui_files, critical_files),
            'priority': 'high' if critical_files else 'medium',
            'auto_triggered': True,
            'ui_files_changed': ui_files,
            'critical_components': critical_files,
            'test_type': 'comprehensive_ui_validation'
        }
        
        # Add to pending queue
        pending.append(invocation)
        
        # Write back to file
        with open(pending_file, 'w') as f:
            json.dump(pending, f, indent=2)
        
        # Update trigger file
        trigger_file = Path('.claude/ui-test-needed.trigger')
        trigger_data = {
            'timestamp': datetime.now().strftime('%I:%M:%S%p').lower(),
            'reason': 'UI files modified - automated testing required',
            'ui_files': ui_files,
            'critical_files': critical_files,
            'file_count': len(ui_files),
            'workflow': 'frontend-tester -> validation-report',
            'instructions': 'Run: Automated UI testing triggered by file changes',
            'priority': 'high' if critical_files else 'medium'
        }
        
        with open(trigger_file, 'w') as f:
            json.dump(trigger_data, f, indent=2)
        
        return True
        
    except Exception as e:
        print(f"Error queuing Playwright test: {e}")
        return False

def main():
    """Main hook execution."""
    print("🧪 CChorus Pre-UI-Change Hook - Checking for UI modifications...")
    
    # Get changed files
    changed_files = get_changed_files()
    if not changed_files:
        print("   No files changed - skipping UI testing")
        return 0
    
    # Filter for UI files
    ui_files = [f for f in changed_files if is_ui_file(f)]
    if not ui_files:
        print("   No UI files changed - skipping UI testing")
        return 0
    
    # Identify critical components
    critical_files = [f for f in ui_files if is_critical_component(f)]
    
    print(f"   📄 UI files detected: {len(ui_files)}")
    if critical_files:
        print(f"   🔴 Critical components: {len(critical_files)}")
    
    # Queue Playwright testing
    success = queue_playwright_test(ui_files, critical_files)
    
    if success:
        priority = "HIGH" if critical_files else "MEDIUM"
        print(f"   ✅ Playwright testing queued [{priority} PRIORITY]")
        print(f"   🎯 Testing will cover {len(ui_files)} UI files")
        if critical_files:
            print("   ⚠️  Critical components detected - extensive testing required")
        print("   📋 Check .claude/pending-agent-invocations.json for details")
        return 0
    else:
        print("   ❌ Failed to queue Playwright testing")
        return 1

if __name__ == '__main__':
    sys.exit(main())