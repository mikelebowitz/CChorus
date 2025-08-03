# /microagent Command

Intelligent micro-agent orchestration command that routes documentation work to specialized agents based on file changes and context.

## Usage

```bash
# Auto-route based on detected changes
claude /microagent

# Target specific agent with context
claude /microagent --agent readme-updater --context "Added new feature X"

# Analyze changes and recommend agents
claude /microagent --analyze

# Status of all micro-agents
claude /microagent --status
```

## Command Flow

1. **Change Analysis**: Uses `file-change-analyzer` to determine what changed
2. **Agent Routing**: Routes work to appropriate specialized agents
3. **Orchestration**: Coordinates multiple agents when needed
4. **Status Tracking**: Updates dashboard with agent activity

## Agent Routing Logic

- `README.md` changes → `readme-updater`
- `server.js` API changes → `api-documenter` 
- `src/components/` changes → `component-documenter`
- `BACKLOG.md` or TodoWrite → `backlog-manager`
- Major completions → `changelog-updater`

## Parameters

- `--agent <name>`: Target specific micro-agent directly
- `--context <description>`: Provide additional context for agent
- `--analyze`: Show change analysis without executing
- `--status`: Display all agent statuses and recent activity
- `--force`: Force execution even without detected changes

## Integration

- Automatically called by file watcher when changes detected
- Dashboard integration for real-time status updates
- Token-efficient alternative to monolithic documentation-manager
- Supports parallel agent execution for independent changes