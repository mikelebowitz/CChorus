# Documentation Management Strategy

## Overview

CChorus maintains comprehensive documentation that evolves with the codebase through an agent-based management system.

## Documentation Agent Requirement

**ALL DOCUMENTATION WORK MUST be performed through the dedicated documentation management agent** (`documentation-manager.md`). Manual documentation updates are **STRICTLY PROHIBITED** to ensure consistency, completeness, and proper maintenance.

## When Documentation Agent MUST Be Used

### Component Changes
- Any modification to files in `src/components/` 
- New component creation or major refactoring
- Props interface changes or feature additions
- Integration point modifications

### API Changes
- Any endpoint additions, modifications, or removals in `server.js`
- Service layer changes in `src/utils/resourceLibraryService.ts`
- Request/response format modifications
- Error handling or status code changes

### Feature Completion
- Before marking any feature branch as complete
- When user workflows are modified or added
- After UI/UX changes that affect user experience
- Upon completion of architectural changes

### Ongoing Maintenance
- Status tracking marker updates
- Cross-reference validation between documents
- Screenshot updates after UI changes
- Template synchronization with active documentation

## How to Use the Documentation Agent

### 1. Invoke the Agent
```
@documentation-manager please update documentation for [specific change/feature]
```

### 2. Provide Context
- Specify which components/files were modified
- Describe the scope of changes made
- Identify affected user workflows
- Note any API endpoint changes

### 3. Required Information
- Branch name and completion status
- List of modified files with brief change description
- User-facing feature changes
- Technical implementation details that need documentation

### 4. Validation Requirements
- Agent must confirm all placeholder sections are updated
- Status markers must be moved from [PENDING] to [COMPLETED]
- Cross-references must be validated and updated
- Code examples must be tested for accuracy

## Consequences of Manual Documentation Updates

Manual documentation updates are prohibited because they lead to:
- **Inconsistent formatting and structure**
- **Missed cross-references and broken links**
- **Outdated status tracking markers**
- **Incomplete template synchronization**
- **Documentation that doesn't match actual implementation**

## Documentation Organization

```
docs/
├── user/                           # End-user documentation
│   ├── README.md                   # Complete user guide
│   ├── workflows/                  # Step-by-step user workflows
│   │   ├── resource-discovery.md   # Finding and browsing resources
│   │   ├── resource-assignment.md  # Deploying resources
│   │   └── project-management.md   # Managing projects
│   ├── troubleshooting.md          # Common issues and solutions
│   └── screenshots/                # UI screenshots for documentation
├── developer/                      # Technical documentation
│   ├── README.md                   # Architecture and development guide
│   ├── components/                 # Component-specific documentation
│   ├── api-reference.md            # Complete API documentation
│   └── testing.md                  # Testing strategies and examples
├── processes/                      # Process documentation
│   ├── agent-workflows.md          # Agent workflow requirements
│   └── documentation-management.md # This file
├── templates/                      # Documentation templates for subagent management
│   ├── user-documentation-template.md
│   ├── developer-documentation-template.md
│   └── subagent-instructions.md    # Instructions for automated documentation updates
└── sessions/                       # Development session documentation
```

## Documentation Management Strategy

### Mandatory Agent-Based System
ALL documentation work MUST be performed through the dedicated documentation management agent. Manual updates are strictly prohibited.

### Incremental Updates
Documentation is updated as features are implemented, not as an afterthought, using the documentation agent for all changes.

### Template-Based System
Templates with placeholder markers enable automated documentation management through the agent system.

### Comprehensive Agent Integration
The documentation management subagent is the ONLY authorized method for maintaining documentation throughout development.

### Enforced Cross-Reference Maintenance
User and developer documentation consistency is enforced through the agent's validation system.

## Documentation Update Triggers

- Component modifications trigger immediate documentation updates
- API endpoint changes require immediate reference updates  
- Branch completions trigger comprehensive section updates
- New features require both user workflow and technical documentation

## Quality Assurance

- All code examples are tested before inclusion
- Screenshots are updated with UI changes
- Cross-references are validated regularly
- Documentation completeness is tracked with status markers

## Files Maintained by Documentation Agent

- `README.md` - **Main project README** - primary entry point and project overview
- `Project Vision.md` - **Master project roadmap** - single source of truth for planning and status
- `CLAUDE.md` - **Development guidelines** - must reference Project Vision.md for current roadmap
- `docs/user/README.md` - Primary user guide
- `docs/developer/README.md` - Technical architecture documentation
- `docs/user/workflows/*.md` - Step-by-step user procedures
- `docs/developer/components/*.md` - Component-specific technical docs

## Update Triggers and Actions

### Component Modifications
**When**: Files in `src/components/` are modified
**Action**:
1. Update component-specific documentation immediately
2. Document request/response formats with examples
3. Update API reference sections immediately
4. Add troubleshooting for common endpoint issues

### Branch Completion Triggers
**When**: Major development branches are completed
**Action**:
- `feature/resource-managers`: Update manager component sections, Project Vision.md status, and main README.md
- `feature/assignment-engine`: Update deployment documentation, Project Vision.md, and main README.md
- `feature/integration-polish`: Update UX documentation, Project Vision.md, and main README.md
- **All major releases**: Update Project Vision.md status, main README.md with new features, and sync CLAUDE.md references