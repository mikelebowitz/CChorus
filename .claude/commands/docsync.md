# /docsync Command

Intelligent documentation synchronization command that coordinates all micro-agents and infrastructure for comprehensive updates.

## Usage

```bash
# Full documentation synchronization
claude /docsync

# Sync specific documentation type
claude /docsync --type readme
claude /docsync --type api
claude /docsync --type components

# Force sync without change detection
claude /docsync --force

# Dry run to see what would be updated
claude /docsync --dry-run

# Sync and commit changes
claude /docsync --commit
```

## Sync Process

1. **Change Detection**: File change analyzer identifies modifications
2. **Agent Coordination**: Routes work to appropriate micro-agents in parallel
3. **Dependency Resolution**: Ensures proper order for dependent updates
4. **Quality Validation**: Verifies documentation consistency and completeness
5. **GitOps Integration**: Optionally commits changes via workflow manager

## Sync Types

### --type readme
- Uses `readme-updater` agent
- Updates main README.md with current project state
- Syncs installation steps and feature status

### --type api
- Uses `api-documenter` agent  
- Scans server.js for endpoint changes
- Updates API reference documentation

### --type components
- Uses `component-documenter` agent
- Monitors src/components/ for React changes
- Updates component documentation and props

### --type backlog
- Uses `backlog-manager` agent
- Updates BACKLOG.md from TodoWrite sessions
- Manages GitHub Issues synchronization

### --type changelog
- Uses `changelog-updater` agent
- Documents completed features and milestones
- Maintains chronological project history

## Coordination Features

- **Parallel Execution**: Independent agents run simultaneously
- **Smart Dependencies**: README updates after component/API changes
- **Conflict Resolution**: Prevents duplicate work between agents
- **Progress Tracking**: Real-time status via dashboard integration
- **Rollback Safety**: Validates changes before applying

## Integration

- File watcher auto-triggers via `/microagent` routing
- Dashboard visualization of sync progress
- GitHub workflow integration for automated commits
- Token-efficient alternative to monolithic documentation workflows