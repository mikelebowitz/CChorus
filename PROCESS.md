# CChorus Development Process

This document defines the mandatory workflows, tools, and enforcement mechanisms for CChorus development.

## 🚨 MANDATORY Workflow Sequence

All development MUST follow this exact sequence:

```
1. Code Changes
2. @documentation-manager [update docs for changes]
3. @gitops-workflow-manager [commit and push]
```

**NO EXCEPTIONS**. Manual documentation updates or Git operations are PROHIBITED.

## Server Management

### Required Commands
```bash
# Start servers (MANDATORY)
/tmux-dev start both frontend and backend in separate sessions

# Monitor (as needed)
/tmux-dev check logs from cchorus-frontend
/tmux-dev show last 50 lines from cchorus-backend

# Management
/tmux-dev list all running sessions
/tmux-dev stop cchorus-frontend session
```

### PROHIBITED Commands
```bash
# NEVER use these:
npm run dev
npm run dev:server
npm start
```

## Agent Responsibilities

### @documentation-manager
**Purpose**: Maintains all documentation consistency and accuracy

**Triggers**:
- Component modifications in `src/components/`
- API endpoint changes in `server.js`
- Feature completion
- Branch merging

**Actions**:
- Updates BACKLOG.md with new items from todo lists
- Updates CHANGELOG.md with completed work
- Maintains README.md accuracy
- Synchronizes status across all documents

### @gitops-workflow-manager
**Purpose**: Handles all Git operations with proper commit messages

**Usage**:
```bash
@gitops-workflow-manager please commit and push [description]
```

**Responsibilities**:
- Conventional commit formatting
- GitHub integration
- Branch management
- Release tagging

## Documentation Standards

### Document Hierarchy
1. **CLAUDE.md** - Strategic guidance (minimal, <100 lines)
2. **BACKLOG.md** - All future work (auto-updated)
3. **CHANGELOG.md** - Historical record (time-stamped)
4. **PROCESS.md** - This workflow guide

### Update Rules
- CLAUDE.md: Manual strategic updates only
- BACKLOG.md: Auto-maintained by documentation-manager
- CHANGELOG.md: Auto-updated from session summaries
- PROCESS.md: Manual updates when workflow changes

## Enforcement Mechanisms

### Pre-Commit Hooks
Located in `.claude/hooks/pre-compact.py`:
- Creates session summaries
- Triggers documentation updates
- Validates workflow compliance
- Prevents commits without proper documentation

### Task Completion Requirements

**Frontend Work**:
- ✅ Playwright testing with MCP tools
- ✅ User demonstration via screenshots
- ✅ Explicit user approval
- ✅ shadcn/ui compliance verification
- ✅ Documentation agent workflow completion

**All Work**:
- ✅ Agent workflow sequence followed
- ✅ Documentation updates completed
- ✅ No manual Git operations
- ✅ Testing validation where applicable
- ✅ Code quality standards met

## Slash Commands

### /sync
**Purpose**: Force documentation synchronization
**Usage**: `/sync` - Updates all documentation from current state

### /docgit
**Purpose**: Complete documentation + GitOps workflow
**Usage**: `/docgit` - Runs documentation-manager then gitops-workflow-manager

### /tmux-dev
**Purpose**: Server management (MANDATORY for all server operations)
**Usage**: Various commands for session management

## Code Quality Standards

### shadcn/ui Compliance (MANDATORY)
**Required for all UI development:**
- ✅ Import only from `@/components/ui/`
- ✅ Use `cn()` utility for className merging
- ✅ Follow muted color scheme patterns
- ✅ Use Radix UI primitives through shadcn/ui

**Prohibited UI Libraries:**
- ❌ Material-UI (@mui/*)
- ❌ Ant Design (antd)
- ❌ React Bootstrap
- ❌ Custom CSS components outside shadcn/ui
- ❌ Inline styles or styled-components

### Validation Methods
- Pre-commit hooks check for prohibited imports
- ESLint rules prevent non-compliant patterns
- Manual code review includes UI compliance check

## Quality Gates

### Automated Checks
- [ ] Agent workflow sequence completed
- [ ] Documentation consistency validated
- [ ] No prohibited commands used
- [ ] Session summaries generated
- [ ] shadcn/ui compliance verified

### Manual Validation
- [ ] User approval for frontend changes
- [ ] Testing completion verified
- [ ] Cross-document references validated
- [ ] GitHub integration working
- [ ] UI follows shadcn/ui patterns exclusively

## GitHub Integration

### Issue Creation
- BACKLOG.md items automatically become GitHub Issues
- Labels applied based on category (ideas, bugs, features)
- Milestones linked to development phases

### Project Management
- GitHub Projects dashboard linked to BACKLOG.md
- Automatic progress tracking
- Release milestone management

### Commit Standards
```
type(scope): description

feat(ui): add 3-column layout with resource assignment
fix(api): resolve CLAUDE.md file discovery bug
docs(process): update workflow enforcement guide
```

## Troubleshooting

### Common Violations
**Direct Git operations**:
- Solution: Use @gitops-workflow-manager agent
- Prevention: Pre-commit hook validation

**Manual documentation updates**:
- Solution: Use @documentation-manager agent
- Prevention: Process education and enforcement

**Direct server commands**:
- Solution: Use /tmux-dev commands
- Prevention: Shell alias restrictions

### Recovery Procedures
1. **Workflow violation detected**: Stop work, use proper agent sequence
2. **Documentation inconsistency**: Run @documentation-manager
3. **Git conflicts**: Use @gitops-workflow-manager for resolution
4. **Server issues**: Use /tmux-dev troubleshooting commands

## Process Evolution

This document is updated when:
- New agents are added
- Workflow requirements change
- Enforcement mechanisms are modified
- GitHub integration evolves

All changes require user approval and agent workflow compliance.

---
**Last Updated**: August 2, 2025
**Process Version**: 2.0
**Enforcement**: MANDATORY for all CChorus development