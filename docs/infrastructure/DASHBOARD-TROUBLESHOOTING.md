# CChorus Dashboard Troubleshooting Guide

## Overview

The CChorus development dashboard provides real-time monitoring of development activities with SQLite persistence. This guide covers recent enhancements, known issues, and troubleshooting procedures.

## Recent Enhancements (August 2025)

### 1. Dashboard Session Tracking Fix

**Issue**: Dashboard displayed server uptime instead of actual Claude session time.

**Solution**: Integrated with `.claude/compact-tracking.json` to use actual Claude session IDs.

**Technical Implementation**:
```javascript
function getCurrentSessionId() {
    // Extract session ID from compact tracking instead of process uptime
    if (compactTracking.currentSession?.sessionId) {
        return compactTracking.currentSession.sessionId;
    }
    return `session-${Math.floor(process.uptime())}`;
}
```

**Result**: Dashboard now shows "time since last compaction" instead of meaningless server uptime.

### 2. Dashboard Activity Feed UI Enhancement

**Issue**: Complex nested card layout caused visual inconsistency.

**Solution**: Unified activity item styling to match grouped summary format.

**Changes**:
- Simplified from complex nested cards to clean single-line entries
- Consistent agent name, description, and timestamp display
- Improved visual hierarchy and readability

**Result**: Professional, consistent activity feed display.

### 3. Agent Loading Enhancement

**Issue**: Dashboard only showed 6 agents instead of all available agents.

**Solution**: Enhanced agent discovery to load from both directories.

**Technical Details**:
- **Project-level**: `.claude/agents/` (8 agents)
- **User-level**: `~/.claude/agents/` (2 agents)
- **Total**: 10 agents correctly displayed

**Implementation**:
```javascript
async function loadAgents() {
    const projectAgents = await loadAgentsFromDirectory(path.join(PROJECT_ROOT, '.claude', 'agents'));
    const userAgents = await loadAgentsFromDirectory(path.join(os.homedir(), '.claude', 'agents'));
    return [...projectAgents, ...userAgents];
}
```

### 4. SQLite Conversation Extraction Integration

**Feature**: Integration with Claude conversation JSONL files for historical analysis.

**Components**:
- `tools/conversation-extractor.js`: JSONL file processing
- `tools/database-service.js`: SQLite persistence layer
- Database schema for conversations, messages, and search indexing

**Current Status**: 
- ✅ Data storage: 18 conversations, 4,805 messages, 186 activities
- ⚠️ Known issue: Foreign key constraint errors during startup

## Known Issues

### 1. SQLite Conversation Extraction Duplicates

**Problem**: Foreign key constraint errors during dashboard startup due to duplicate processing of JSONL files.

**Root Cause**: Conversation extractor reprocesses all JSONL files on every startup instead of detecting changes.

**Impact**: 
- Log spam with foreign key constraint error messages
- Data is stored correctly despite the errors
- No functional impact on dashboard operation

**Symptoms**:
```
❌ Failed to save conversation: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
❌ Failed to save message: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
```

**Temporary Workaround**: Errors can be safely ignored - data is being stored correctly.

**Planned Fix**: Implement file modification tracking to skip already-processed files.

### 2. Agent Count Display Issues

**Problem**: Dashboard might not show all available agents.

**Diagnosis**:
1. Check if both directories exist and are accessible:
   - Project-level: `.claude/agents/`
   - User-level: `~/.claude/agents/`
2. Verify agent files have proper YAML frontmatter
3. Check file permissions on agent directories

**Resolution**: Recent enhancement should resolve this - dashboard now loads from both directories.

## Troubleshooting Procedures

### Dashboard Won't Start

**Check Port Availability**:
```bash
# Check if port 3002 is in use
lsof -i :3002

# Kill process if needed
kill -9 <PID>
```

**Verify File Permissions**:
```bash
# Check SQLite database permissions
ls -la .claude/cchorus.db*

# Check agent directory permissions
ls -la .claude/agents/
ls -la ~/.claude/agents/
```

### WebSocket Connection Issues

**Symptoms**: Dashboard loads but doesn't show real-time updates.

**Diagnosis**:
1. Check browser console for WebSocket errors
2. Verify dashboard server is running on port 3002
3. Check firewall settings

**Resolution**:
```bash
# Restart dashboard server
./tools/start-dashboard.sh

# Check server logs for errors
```

### Database Corruption

**Symptoms**: Dashboard fails to start with SQLite errors.

**Resolution**:
```bash
# Backup existing database (if needed)
cp .claude/cchorus.db .claude/cchorus.db.backup

# Remove corrupted database (will rebuild automatically)
rm .claude/cchorus.db*

# Restart dashboard
./tools/start-dashboard.sh
```

**Note**: This will lose historical activity data but dashboard will rebuild with new activities.

### Session Time Incorrect

**Symptoms**: Dashboard shows incorrect session duration.

**Diagnosis**: Check if compact tracking file exists and is updated.

**Resolution**:
```bash
# Check compact tracking file
cat .claude/compact-tracking.json

# If missing, session time will fall back to server uptime
# File is created automatically during Claude compaction events
```

## Development Workflow Integration

### Automatic Startup

Dashboard starts automatically when opening project in VS Code via SessionStart hooks in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "/path/to/CChorus/tools/start-dashboard.sh --background"
      }
    ]
  }
}
```

### Real-time Monitoring

Dashboard provides live monitoring of:
- Agent activity and status
- File changes and processing
- Infrastructure health (file watcher, GitHub sync)
- Session metrics and timing
- Historical conversation data

### Database Schema

**Core Tables**:
```sql
sessions: session_id, start_time, end_time, project_path, branch_context, status
activities: session_id, agent, description, files, timestamp
conversations: uuid, name, summary, created_at, updated_at, project_path
messages: conversation_id, content, sender, timestamp, tokens
metrics: session_id, metric_name, metric_value, metric_unit, agent, timestamp
```

## Future Enhancements

### Planned Fixes
- **File Modification Tracking**: Prevent reprocessing of unchanged JSONL files ✅ COMPLETED
- **Conversation Search**: Full-text search across historical conversations
- **Performance Optimization**: Reduce database queries during startup ✅ COMPLETED (via processed_files table)
- **Better Error Handling**: Graceful handling of SQLite constraint errors ✅ COMPLETED (INSERT OR IGNORE pattern)

### Potential Features
- **Conversation Analytics**: AI-generated insights from conversation patterns
- **Export Capabilities**: Markdown export for conversation archival
- **Multi-project Support**: Dashboard for multiple CChorus projects
- **Mobile Responsive**: Dashboard access from mobile devices

## Support

For dashboard-related issues:
1. Check this troubleshooting guide first
2. Review browser console for JavaScript errors
3. Check dashboard server logs
4. Verify file permissions and directory structure
5. Consider database rebuild if corruption is suspected

The dashboard is designed to be resilient - most issues can be resolved by restarting the server or rebuilding the database without losing critical functionality.