---
name: sync
description: Force documentation synchronization using the documentation-manager and gitops-workflow-manager agents
---

# CChorus Documentation Synchronization Command

This command forces a complete documentation synchronization cycle using the CChorus agent workflow system.

## Usage

```bash
/sync
```

## What it does

1. **Documentation Analysis**: Scans for pending documentation updates
2. **Documentation Manager Invocation**: Automatically invokes @documentation-manager
3. **GitOps Workflow**: Follows up with @gitops-workflow-manager for commits
4. **Status Reporting**: Provides detailed status of the synchronization process

## Workflow Sequence

The /sync command executes the mandatory CChorus workflow:

```
Code Changes → Documentation Agent → GitOps Agent
```

## Use Cases

- **After major development sessions** - Ensure all documentation is up to date
- **Before important commits** - Synchronize documentation with code changes
- **Manual trigger when auto-system fails** - Fallback for automatic documentation triggers
- **Pre-release documentation review** - Ensure all changes are properly documented

## Implementation

This command integrates with:
- Pre-compact hook auto-trigger system
- File watcher real-time monitoring
- Documentation-manager agent
- GitOps-workflow-manager agent
- Task completion validation system

## Output

The command provides:
- Current documentation status
- Changes detected and processed
- Agent invocation results
- Final synchronization status
- Next steps or recommendations

## Safety Features

- Validates current Git status before proceeding
- Checks for uncommitted changes
- Ensures proper agent workflow sequence
- Provides rollback information if needed

## Examples

**Basic synchronization:**
```bash
/sync
```

**Expected output:**
```
🔄 CChorus Documentation Synchronization
📊 Scanning for documentation updates...
✅ Found 3 files requiring documentation updates
🤖 Invoking @documentation-manager...
📝 Documentation updates completed
🤖 Invoking @gitops-workflow-manager...
📤 Changes committed and pushed
✅ Documentation synchronization complete
```

## Integration Points

- **Auto-trigger system**: Can be invoked automatically by pre-compact hook
- **File watcher**: Can be triggered by real-time file monitoring
- **Task validation**: Integrates with task completion requirements
- **Agent workflow**: Follows mandatory documentation → GitOps sequence

## Error Handling

If synchronization fails:
1. Provides detailed error information
2. Suggests manual intervention steps
3. Creates trigger files for next session
4. Updates NEXT_SESSION.md with required actions

## Related Commands

- Use with other CChorus automation systems
- Integrates with branch creation workflows
- Works with task completion validation