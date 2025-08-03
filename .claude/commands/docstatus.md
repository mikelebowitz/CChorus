# /docstatus Command

Comprehensive documentation status overview showing agent activity, file changes, and infrastructure health.

## Usage

```bash
# Full documentation status dashboard
claude /docstatus

# Show only agent statuses
claude /docstatus --agents

# Show recent file changes and triggers
claude /docstatus --changes

# Infrastructure health check
claude /docstatus --infrastructure

# Export status to JSON for dashboard
claude /docstatus --json
```

## Status Overview

- **Agent Activity**: Current status of all 6 micro-agents
- **File Changes**: Recent modifications and trigger history
- **Infrastructure**: File watcher, GitHub sync, dashboard server status
- **Performance**: Token usage, response times, efficiency metrics
- **Pending Work**: Queued agent invocations and priorities

## Output Sections

### Agent Status
```
🤖 Micro-Agent Status
├── file-change-analyzer  [RUNNING] - Analyzing 3 changes
├── readme-updater        [IDLE]    - Last: 5min ago
├── api-documenter        [IDLE]    - Last: never
├── component-documenter  [IDLE]    - Last: never  
├── backlog-manager       [IDLE]    - Last: 12min ago
└── changelog-updater     [IDLE]    - Last: 8min ago
```

### Recent Activity
```
📋 Recent Activity (last 10)
01:59:52 file-change-analyzer: Detected 3 file changes
01:54:45 changelog-updater: Created micro-agent specification
01:54:09 component-documenter: Added color coding system
```

### Infrastructure Health
```
🏗️ Infrastructure Status
├── File Watcher     [RUNNING] PID: 40616
├── GitHub Sync      [CONNECTED] Last: 15min ago
├── Dashboard Server [RUNNING] Port: 3002
└── Auto-Branch      [14 PENDING] Branches awaiting creation
```

## Integration

- Real-time updates from dashboard WebSocket server
- File watcher integration for change detection
- GitHub API status checking
- Agent invocation queue monitoring