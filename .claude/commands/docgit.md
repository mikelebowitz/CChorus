---
description: Run documentation and GitOps agents in sequence with automatic change detection
allowed-tools: ["*"]
---

# Document and GitOps Workflow

Executes the complete development completion workflow with automatic change detection and processing.

## Usage
Simply type: `/docgit`

No arguments needed - the agents will automatically analyze your changes and handle everything.

## Process
The command automatically executes the mandatory workflow sequence:

1. **Analyze Changes**: Documentation agent examines git status, diffs, and recent commits to understand what has been modified
2. **Update Documentation**: Agent updates all relevant documentation based on discovered changes, following established templates and standards
3. **Verify Completion**: Ensure documentation agent has finished all required updates and status markers are current
4. **Execute GitOps**: GitOps agent handles commits, pushes, and Git workflow management with appropriate commit messages
5. **Provide Feedback**: Status updates and confirmation throughout each phase

## Agent Instructions

**Phase 1 - Documentation:**
@documentation-manager: Please analyze the current project state including:
- Git status and recent changes (staged, unstaged, untracked files)
- Git diff output to understand modifications
- Recent commit history to identify development scope
- Modified components, APIs, or features that need documentation updates
- Status tracking markers that need updates
- Cross-references that may need validation

Provide comprehensive documentation updates without requiring user input for change descriptions. Use your established templates and follow all documentation standards from the project guidelines.

**Phase 2 - GitOps (ONLY after documentation completion):**
@gitops-workflow-manager: After documentation agent has completed ALL updates and confirmed completion:
- Handle all Git operations following the established workflow
- Create appropriate commit messages based on the documentation updates
- Follow the project's Git workflow patterns
- Provide confirmation of successful Git operations

## Workflow Compliance
This command enforces the mandatory sequence specified in CLAUDE.md:
**Code → Documentation → GitOps → User Approval → Complete**

## Benefits
- **Zero Manual Input**: Just type `/docgit` when your code work is complete
- **Automatic Analysis**: Agents discover and analyze changes automatically
- **Enforces Standards**: Maintains proper workflow sequence and documentation standards
- **Complete Automation**: No manual description, context, or Git operations needed
- **Status Feedback**: Clear progress indication throughout the entire process

## Usage Example
```
/docgit
```

That's it! The agents handle everything else automatically.