# Comprehensive Data Types for CChorus Observability Dashboard

## 7-Category Data Architecture (Complete with Conversation Extraction)

### **1. Event Data** (High Volume, Time-series)
**Hook Events** (Claude Code lifecycle):
- **PreToolUse**: tool_name, tool_input, validation_status, security_checks
- **PostToolUse**: tool_name, tool_output, success/failure, duration_ms, errors
- **UserPromptSubmit**: user_prompt, prompt_length, timestamp, session_context
- **Notification**: notification_type, message, user_response, interaction_duration
- **Stop**: session_end_reason, total_duration, summary, final_state
- **SubagentStop**: subagent_name, task_completed, results, parent_session
- **PreCompact**: context_size_before, context_size_after, compaction_reason

**MCP & Command Usage**:
- **MCP Tool Usage**: mcp_server_name, tool_name, parameters, success/failure, response_time
- **MCP Server Stats**: server_startup, connection_status, available_tools, usage_frequency
- **Custom Command Usage**: command_name, parameters, execution_time, user_defined_vs_builtin
- **Slash Command Tracking**: /command_name, usage_frequency, success_rate, user_adoption

**Agent Activity Events** (CChorus-specific):
- **file-change-analyzer**: files_detected, changes_routed, agents_triggered
- **documentation-manager**: docs_updated, files_processed, sync_status
- **api-documenter**: endpoints_tracked, changes_detected, documentation_status
- **component-documenter**: components_analyzed, props_documented, usage_patterns
- **backlog-manager**: items_added, priorities_changed, branch_metadata_updates
- **changelog-updater**: entries_added, version_updates, milestone_tracking
- **gitops-workflow-manager**: commits_made, branches_created, merge_status

### **2. Session & Context Data** (Medium Volume, Long-lived)
**Session Management**:
- session_id, session_start_time, session_end_time, session_duration
- project_path, branch_context, user_prompts_count, agent_invocations
- context_compactions, session_status (active/completed/interrupted/error)
- mcp_servers_used, custom_resources_accessed

**Full Conversation Logs** (NEW - Using claude-conversation-extractor):
- **Conversation Extraction**: Integration with `claude-conversation-extractor` tool
- **JSONL Processing**: Parse ~/.claude/projects/*/chat_*.jsonl files automatically
- **Complete Chat History**: Full user prompts and Claude responses with timestamps
- **Conversation Metadata**: Session IDs, conversation names, creation dates
- **Search Integration**: Full-text search across all historical conversations
- **Export Capabilities**: Markdown export for conversation archival
- **Real-time Indexing**: Automatic detection of new conversation files
- **Content Analysis**: Message length, response times, conversation patterns

**Conversation Context**:
- chat_transcripts (full JSONL data), prompt_response_pairs, conversation_flow
- context_switches, user_intent_analysis
- **conversation_topics**: AI-generated topic extraction from chat history
- **conversation_outcomes**: success/failure classification of conversation goals

### **3. Performance & Metrics Data** (Time-series, Analytics)
**Token & Cost Tracking**:
- token_usage_per_session/agent/tool, estimated_costs
- token_efficiency_metrics, cost_trends

**Performance Metrics**:
- response_times, tool_execution_times, agent_processing_times
- dashboard_load_times, file_watcher_responsiveness, database_query_performance
- mcp_server_response_times, command_execution_performance

**System Health Indicators**:
- server_uptime, database_health, memory_usage
- error_rates, webhook_success_rates, mcp_server_health

### **4. File System & Code Data** (Structured, Context-rich)
**File Change Tracking**:
- file_modifications (path, timestamp, change_type)
- file_size_changes, file_types_affected, directory_structure_changes
- file_content_analysis (lines added/removed, complexity changes)

**Code Quality & Structure**:
- code_patterns, dependency_changes, configuration_updates
- documentation_coverage, test_coverage_impact

**Build & Development Artifacts**:
- build_outputs, asset_generation, deployment_artifacts

### **5. Git & Version Control Data** (Historical, Structured)
**Git Operations**:
- commits (hash, author, timestamp, message, files_changed, additions/deletions)
- branch_operations, merge_conflicts, push_operations, pull_operations

**Version Control Context**:
- repository_state, collaboration_data, release_tracking, code_review_data

**Project Management Integration**:
- github_issues, project_board_updates, milestone_progress

### **6. Error & Security Data** (Critical, Audit Trail)
**Error Tracking**:
- tool_failures, agent_errors, system_errors, user_errors, recovery_actions
- mcp_connection_failures

**Security & Safety Events**:
- blocked_commands, sensitive_file_access, permission_violations
- security_audit_trail, suspicious_patterns

**Validation & Quality Gates**:
- code_quality_checks, test_execution_results, build_validation

### **7. User Behavior & Analytics Data** (Insights, Patterns)
**User Interaction Patterns**:
- command_frequency, session_patterns, productivity_metrics
- learning_curves, feature_adoption

**Resource Usage Analytics** (Key Business Value):
- **Agent Necessity Scoring**: usage frequency, success rate, user satisfaction per agent
- **MCP Server Value Assessment**: tool usage patterns, productivity impact, cost/benefit
- **Custom Resource ROI**: time investment vs usage frequency for user-defined tools
- **Feature Abandonment Detection**: resources that were tried but not adopted
- **Optimization Recommendations**: underused agents, redundant MCP servers, workflow improvements

**Workflow Analytics**:
- task_completion_paths, common_failure_points, optimization_opportunities
- user_preferences, help_seeking_behavior

**Dashboard Usage**:
- widget_interaction, filter_usage, navigation_patterns, real_time_engagement

## Implementation Strategy

### **SQLite Schema Design**
**Core Tables**:
- events, sessions, metrics, files, git_operations, errors, user_analytics
- **NEW**: mcp_usage, command_usage, resource_analytics, agent_effectiveness
- **NEW**: conversation_logs, conversation_metadata, conversation_search_index

**Conversation Integration**:
- **Auto-discovery**: Monitor ~/.claude/projects for new JSONL files
- **Parsing Pipeline**: Use claude-conversation-extractor patterns to parse JSONL
- **Indexing**: Full-text search index for conversation content
- **Retention**: Configurable retention policy for conversation data

### **Dashboard Visualization**
**Real-time Widgets**: Live activity feed, system health indicators, MCP server status
**Historical Analysis**: Trend charts, usage patterns, performance metrics
**Conversation Analytics**: Most discussed topics, conversation success rates, response time trends
**Resource Analytics Dashboard**: Agent necessity scores, MCP server value metrics
**Interactive Filtering**: Session-based, time range, event type, agent-specific, MCP server, conversation topics
**Conversation Search**: Full-text search across all historical Claude conversations

### **Data Collection Points**
- **Enhanced hook system**: Comprehensive Claude Code lifecycle tracking
- **MCP monitoring**: Server connections, tool usage, performance metrics
- **Command tracking**: All custom and builtin command usage
- **Conversation extraction**: Automated JSONL parsing using claude-conversation-extractor patterns
- **File watcher integration**: Real-time file system monitoring
- **Dashboard telemetry**: User interaction and performance tracking
- **Git integration**: Version control operation monitoring
- **System monitoring**: Health checks and error tracking

### **Integration with claude-conversation-extractor**
**Library Integration**:
- Import core parsing functions from claude-conversation-extractor
- Adapt JSONL parsing logic for continuous monitoring
- Use conversation search algorithms for dashboard search features
- Leverage markdown export capabilities for conversation archival

**Data Pipeline**:
1. **File Monitoring**: Watch ~/.claude/projects for new JSONL files
2. **Parsing**: Extract conversations using proven extraction algorithms
3. **Storage**: Store in SQLite with full-text search indexing
4. **Analytics**: Generate conversation insights and patterns
5. **Search**: Provide real-time conversation search in dashboard

### **Key Business Value**
- **Agent ROI Analysis**: Determine which subagents provide real value vs complexity
- **MCP Server Optimization**: Identify which servers are essential vs optional
- **Conversation Intelligence**: Analyze communication patterns and effectiveness
- **Workflow Efficiency**: Track user productivity and identify bottlenecks
- **Historical Context**: Access complete conversation history for debugging and learning
- **Resource Allocation**: Data-driven decisions about which features to enhance/remove
- **User Experience**: Optimize based on actual usage patterns and conversation outcomes

This comprehensive data model transforms CChorus into a complete observability platform with intelligent resource usage analytics AND full conversation intelligence, providing unprecedented insights into Claude Code usage patterns and development workflows.