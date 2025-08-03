# /agentstat Command

Detailed micro-agent statistics and performance monitoring command for development observability.

## Usage

```bash
# Overview of all agent statistics
claude /agentstat

# Detailed stats for specific agent
claude /agentstat readme-updater
claude /agentstat file-change-analyzer

# Performance metrics over time
claude /agentstat --performance

# Token usage analysis
claude /agentstat --tokens

# Agent efficiency report
claude /agentstat --efficiency
```

## Agent Statistics

### Individual Agent Metrics
```
📊 readme-updater Statistics
├── Status: IDLE (last active: 5min ago)
├── Total Invocations: 3
├── Success Rate: 100% (3/3)
├── Avg Response Time: 1.8s
├── Token Usage: 1,247 / 2,000 (62% of limit)
├── Files Updated: 1 (README.md)
└── Last Activity: Feature status update
```

### System-wide Performance
```
🏆 Micro-Agent Performance Summary
├── Total Agents: 6
├── Active Agents: 1
├── Combined Token Usage: 4,521 tokens
├── vs Monolithic: ↓ 67% token reduction
├── Avg Response Time: 2.1s
├── Success Rate: 94%
└── Uptime: 2h 15min
```

## Performance Analysis

### Token Efficiency
- **Per-agent limits**: 1,500-2,000 tokens (vs 8,000 monolithic)
- **Actual usage tracking**: Real token consumption per agent
- **Efficiency metrics**: Work completed per token spent
- **Optimization opportunities**: Underutilized agents, optimization suggestions

### Response Time Tracking
- **Agent-specific latency**: Individual response time patterns
- **System bottlenecks**: Slowest agents and causes
- **Parallel efficiency**: Coordination overhead analysis
- **Trend analysis**: Performance over time

### Success Rate Monitoring
- **Completion rates**: Successfully finished tasks per agent
- **Error patterns**: Common failure modes and causes
- **Retry statistics**: Failed task recovery rates
- **Quality metrics**: Documentation accuracy scores

## Integration

- Real-time data from dashboard WebSocket server
- Historical data tracking in agent log files
- Performance trend analysis over development sessions
- Automated optimization recommendations based on usage patterns