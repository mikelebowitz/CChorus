# CChorus Enhanced Command System

## Core Documentation Commands

### /microagent
**Intelligent micro-agent orchestration**
- Auto-routes documentation work to specialized agents
- Analyzes file changes and coordinates parallel execution
- Token-efficient alternative to monolithic workflows

```bash
claude /microagent                              # Auto-route based on changes
claude /microagent --agent readme-updater      # Target specific agent
claude /microagent --analyze                   # Show analysis without execution
```

### /docstatus  
**Comprehensive documentation status overview**
- Real-time agent activity monitoring
- Infrastructure health checking
- Performance metrics and efficiency tracking

```bash
claude /docstatus                     # Full status dashboard
claude /docstatus --agents            # Agent statuses only
claude /docstatus --infrastructure    # Infrastructure health
```

### /docsync
**Multi-agent documentation synchronization**
- Coordinates all micro-agents for comprehensive updates
- Parallel execution with dependency resolution
- GitOps integration for automated commits

```bash
claude /docsync                       # Full synchronization
claude /docsync --type readme         # Sync specific type
claude /docsync --commit              # Sync and commit
```

### /agentstat
**Detailed micro-agent performance analytics**
- Token usage analysis and optimization
- Response time tracking and trends
- Success rate monitoring and efficiency metrics

```bash
claude /agentstat                     # Overview statistics
claude /agentstat readme-updater      # Specific agent details
claude /agentstat --performance       # Performance trends
```

## Legacy Commands

### /docgit
**Monolithic documentation workflow (legacy)**
- Single-agent documentation updates
- Higher token usage, slower execution
- Maintained for backward compatibility

```bash
claude /docgit                        # Full documentation update
```

## Command Integration

- **File Watcher**: Auto-triggers `/microagent` on changes
- **Dashboard**: Real-time visualization of command execution
- **GitHub Sync**: Coordinates with GitOps workflows
- **Agent Routing**: Intelligent work distribution based on change analysis

## Performance Comparison

| Command | Token Usage | Response Time | Parallelization |
|---------|-------------|---------------|-----------------|
| /microagent | ~2K per agent | 1.5-3s | ✅ Full parallel |
| /docsync | ~4-8K total | 2-5s | ✅ Smart coordination |  
| /docgit | ~12K tokens | 8-15s | ❌ Sequential only |

## Usage Recommendations

- **Development**: Use `/microagent` for focused updates
- **Major Changes**: Use `/docsync` for comprehensive coordination
- **Monitoring**: Use `/docstatus` and `/agentstat` for observability
- **Legacy**: Use `/docgit` only when micro-agents unavailable