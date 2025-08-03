# Agent Workflow Processes

## Mandatory Agent Workflow Sequence

**MANDATORY SEQUENCE**: All development workflows must follow this strict agent sequence for efficiency and consistency:

1. **Code Changes First**: Complete all code modifications and feature implementation
2. **Documentation Updates**: **MUST** invoke documentation manager agent (`@documentation-manager`) for ALL documentation updates
3. **Documentation Completion**: **MUST** verify documentation agent has completed all required updates, status markers, and cross-references
4. **GitOps Operations**: **ONLY THEN** allow GitOps agent to handle commits, pushes, and Git workflow management

**AUTOMATED WORKFLOW**: Use `/docgit` command for streamlined automation:
- **Purpose**: Executes complete documentation and GitOps sequence automatically
- **Usage**: Simply type `/docgit` when code work is complete
- **Benefits**: Zero manual input, automatic change detection, enforces proper workflow sequence
- **Integration**: Auto-triggered by pre-compact hooks when changes are detected

## Agent Separation of Concerns

### Documentation Agent (`@documentation-manager`)
- Handles content updates, status tracking, template management
- Maintains all documentation files and cross-references
- Updates status markers from [PENDING] to [COMPLETED]
- Validates code examples and workflow accuracy

### GitOps Agent (`@gitops-workflow-manager`)
- Handles Git operations (commits, pushes, branch management) after documentation is complete
- Creates conventional commit messages
- Manages branch workflows and pull requests
- Handles automated Git workflow management

## Efficiency Requirement

GitOps must always wait for documentation completion to avoid duplicate commits, merge conflicts, and inconsistent state.

## Task Completion Standards

### Frontend Work Completion Requirements
1. **Playwright Testing**: MUST use MCP Playwright tools for comprehensive testing
2. **User Demonstration**: MUST show functioning work to user via screenshots/demo  
3. **User Approval**: MUST receive explicit user approval before marking complete

### All Development Work Completion Requirements
1. **Documentation Agent**: MUST use `@documentation-manager` for ALL documentation updates
2. **GitOps Agent**: MUST use `@gitops-workflow-manager` for ALL Git operations
3. **Agent Sequence**: Code → Documentation → GitOps → User Approval → Complete

## Violation Consequences

- **Immediate Correction**: Revert improperly completed tasks to pending
- **Mandatory Re-work**: Complete proper workflow for all violated tasks
- **Session Documentation**: All violations logged in session documentation

## Completion Validation Checklist

Before marking ANY task "completed", verify:
- [ ] Testing completed (Playwright for frontend, appropriate testing for backend)
- [ ] Documentation agent used for all doc updates  
- [ ] GitOps agent used for all Git operations
- [ ] User demonstration provided (for user-facing work)
- [ ] User approval received (explicit confirmation)

## Developer Responsibilities

### Development Setup
1. **MUST** use VS Code automatic server startup (servers auto-start when folder opens via .vscode/tasks.json)
2. **MUST** verify servers are running in VS Code terminal tabs before beginning development work
3. **FALLBACK** use VS Code Tasks (`Cmd+Shift+P` → "Tasks: Run Task") if auto-start fails
4. **DEPRECATED** `/tmux-dev` commands (replaced with VS Code integration in v2.0.0)
5. **PROHIBITED** from using direct npm server commands without proper task configuration

### Agent Workflow Sequence
1. **MUST** follow the mandatory agent sequence: Code → Documentation → GitOps
2. **MUST** complete documentation updates before any Git operations
3. **MUST** verify agent workflow completion before feature sign-off

### Before Feature Completion
1. **MUST** invoke documentation agent for all code changes
2. **MUST** provide comprehensive change context to the agent
3. **MUST** verify agent has updated all relevant documentation sections
4. **MUST** confirm status markers reflect actual implementation state
5. **MUST** ensure GitOps operations happen only after documentation completion

### During Development
1. **MUST** monitor server status in VS Code terminal tabs (grouped as "cchorus")
2. **SHOULD** invoke documentation agent for significant interim changes
3. **MUST** coordinate with agent for API endpoint modifications
4. **SHOULD** request documentation review for complex features
5. **SHOULD** use VS Code Tasks for server management and health monitoring

### Quality Assurance
1. **MUST** verify documentation agent has completed all required updates
2. **MUST** confirm all code examples in documentation are functional
3. **MUST** validate that user workflows match actual UI behavior
4. **MUST** ensure cross-references between documents are accurate
5. **MUST** verify proper server management using VS Code terminal integration throughout development

## GitOps Integration

CChorus includes GitOps configuration in `config/gitops-config.json` for automated Git workflow management with session tracking and documentation updates.

**IMPORTANT**: GitOps agent operations MUST follow the mandatory agent sequence - GitOps handles Git operations ONLY after documentation agent has completed all updates. This ensures efficiency and prevents duplicate commits or merge conflicts.