# CChorus Development Backlog

Last Updated: August 3, 2025

This document tracks all planned work, ideas, and research items for CChorus. Items are automatically synchronized with GitHub Issues and updated during development sessions.

## 🔥 High Priority

### Development Infrastructure `[COMPLETED ✅]`
- **VS Code-first development workflow** - Complete migration from tmux to VS Code visible terminals ✅
- **Auto-start development servers** - Frontend and backend auto-start when opening project in VS Code ✅
- **VS Code Tasks integration** - Servers run in grouped terminal tabs via .vscode/tasks.json ✅
- **Manual control via Command Palette** - Use Cmd+Shift+P → "Tasks: Run Task" for server management ✅
- **Updated CLAUDE.md workflow** - Complete documentation update for new VS Code-based approach ✅

### Branch Strategy Enhancement `[planned-branch: feature/branch-strategy]`
- **Implement intelligent branch grouping** - Auto-detect bug fixes vs features for branch assignment
- **Smart branch metadata system** - Support `[branch: existing]` vs `[planned-branch: branch-name]` tags
- **Auto-branch creator enhancement** - Detect patterns (Fix/Bug → individual branches, Features → grouped)
- **Branch naming conventions** - Enforce fix/, feature/, hotfix/, docs/, refactor/, chore/, test/ prefixes
- **Bug fixes get individual branches** - Automatic fix/ prefix detection and branch creation
- **Features group child tasks** - Parent branch with multiple related items under single feature/

### BACKLOG.md Structure Fixes `[planned-branch: fix/backlog-structure]`
- **Merge duplicate high priority sections** - Consolidate into single priority section
- **Remove invalid branch-name entry** - Clean up example/template text from branch metadata
- **Apply consistent branch metadata** - Update all items with proper `[branch:]` or `[new-branch:]` tags
- **Organize by branch grouping** - Group related items visually under parent branches

### Dashboard Observability Foundation `[BRANCH-CREATED ✅: feature/sqlite-dashboard-persistence]`
- **SQLite database integration for persistent dashboard storage** - ✅ Complete: SQLite database at `.claude/cchorus.db` with proper schema
- **Historical activity data loading on startup** - ✅ Complete: Dashboard loads and displays historical activity data
- **Enhanced session tracking and correlation** - ✅ Complete: Session tracking with proper Claude session ID integration
- **Database schema design for activities and sessions** - ✅ Complete: Comprehensive schema for activities, sessions, conversations, and metrics
- **Dashboard session time fix** - ✅ Complete: Fixed session time display to show time since last compaction instead of server start
- **Agent loading enhancement** - ✅ Complete: Dashboard now loads agents from both project-level and user-level directories (shows all 10 agents)
- **Activity feed UI improvement** - ✅ Complete: Unified activity item styling to match grouped summary format

### SQLite Conversation Extraction Bug Fixes `[COMPLETED ✅]`
- **Fix conversation extractor duplicate processing** - Added processed_files table to track JSONL files that have been processed ✅
- **Optimize conversation loading performance** - Modified processAllConversations() to check if files were already processed ✅
- **Add conversation file modification tracking** - Fixed upsertConversation() to update existing conversations instead of replacing them ✅
- **Reduce dashboard startup log spam** - Changed message insertion to use INSERT OR IGNORE to prevent foreign key constraint errors ✅
- **Database integrity validation** - Database now correctly handles file processing state with processed_files table ✅

### UI/UX Bug Fixes `[COMPLETED ✅]`
- **Fixed Badge component implementation** - Proper minimal version with correct variant support ✅
- **Complete shadcn/ui compliance** - All components now follow shadcn/ui + Radix UI patterns ✅
- **Enhanced component architecture** - Improved TypeScript interfaces and prop validation ✅

### UI/UX Features `[COMPLETED ✅]`
- **Redesigned Users section** - Clear user-level vs project-level resource distinction ✅
- **Enhanced resource displays** - Professional alternating row colors and improved layouts ✅
- **Dynamic content system** - Context-aware header with breadcrumb navigation ✅
- **Complete shadcn/ui migration** - All raw HTML elements replaced with shadcn/ui components ✅

### Professional 3-Column Layout Implementation `[COMPLETED ✅]`
- **PropertiesPanel component** - Persistent right column with context-aware metadata display and intelligent type detection ✅
- **Enhanced ThreeColumnLayout architecture** - Professional interface with real resource data integration and navigation state management ✅
- **Intelligent navigation patterns** - Context-aware middle column with breadcrumb support and dynamic resource lists ✅
- **Real-time resource counts** - Dynamic sidebar with live resource statistics and performance optimization ✅
- **Enhanced project integration** - Seamless ProjectManager embedding with streaming discovery and caching ✅
- **Navigation stack state management** - Complete implementation for Column 2 with persistent state ✅
- **Context-aware properties display** - Dynamic right panel with type-specific actions and metadata ✅
- **Resource assignment integration** - Cross-project assignment with ResourceAssignmentPanel and visual tracking ✅

### Documentation Automation `[COMPLETED ✅]`
- **Enhanced pre-compact hook** with automatic CHANGELOG.md updates and `/docgit` workflow triggers
- **Real-time file watcher** with automatic documentation-manager invocation on code changes  
- **SessionStart hook integration** with automatic file watcher startup on session launch
- **Multiple trigger mechanisms** including fallback methods and session notices
- **Documentation-manager agent** enhanced to maintain BACKLOG.md from todo items
- **Environment controls** for optional session-end file watcher cleanup

### GitHub Integration & Project Board `[COMPLETED ✅]`
- **Bi-directional BACKLOG.md ↔ GitHub Issues synchronization** with automatic issue creation and status updates
- **GitHub Actions workflow** for automated project board management with status-based column movement
- **Status label management** with automatic `status: pending/in_progress/completed` labels on all Issues
- **One-time project setup script** for bulk-adding existing Issues to project board with proper configuration
- **Rate limiting and error handling** for reliable synchronization with comprehensive logging
- **Environment template** and setup validation for GitHub integration configuration
- **Human-friendly logging timestamps** for all automation systems (8:46:32am format) `[COMPLETED ✅]`

## 💡 Ideas & Features

### Comprehensive Dashboard Hook System `[planned-branch: feature/comprehensive-hooks]`
- **UserPromptSubmit hook tracking** - Track user prompts for intent monitoring and conversation flow analysis
- **PreCompact hook integration** - Monitor context compaction events for session management
- **Chat transcript storage for debugging** - Store complete conversation transcripts for debugging and analysis
- **Tool usage analytics and patterns** - Analyze tool usage patterns and frequency for optimization insights
- **Session-based activity filtering** - Add dashboard filtering by session, time range, and activity type

### Enhanced Resource Management `[COMPLETED ✅]`
- **Resource Library implementation** - Unified resource browser with filtering, search, and multi-selection capabilities ✅
- **Resource assignment system** - Cross-project deployment with copy/move/activate/deactivate operations ✅
- **Project preferences management** - Archiving, favoriting, and visibility controls with persistent storage ✅
- **Enhanced resource discovery** - System-wide scanning with intelligent deduplication and performance optimization ✅
- **Resource assignment operations** - Comprehensive deployment management with status tracking and error handling ✅
- **Project streaming discovery** - Real-time project discovery with Server-Sent Events and caching ✅

### Advanced Resource Editing `[planned-branch: feature/resource-editors]`
- Visual hook editor within 3-column layout
- Command editor with YAML validation
- Settings file management interface
- Resource templates and scaffolding
- In-place resource editing capabilities

### Workflow Improvements
- `/sync` slash command for documentation synchronization
- Real-time collaboration features `[planned-branch: feature/collaboration]`
- Resource versioning and history
- Bulk resource operations UI

## 🧪 Testing & Validation
- **Browser testing and validation** for all new features
- **Component library compliance** testing (shadcn/ui patterns)
- **Animation performance** testing and optimization
- **Cross-browser compatibility** testing for 3-column layout

### Integration & Automation
- GitHub Project integration for backlog tracking `[COMPLETED ✅]`
- Automated issue creation from backlog items `[COMPLETED ✅]`
- CI/CD pipeline for documentation validation `[planned-branch: feature/ci-cd-pipeline]`
- Resource dependency tracking

## 🔬 Research & Investigation

### Advanced Dashboard Analytics `[planned-branch: feature/advanced-analytics]`
- **Token usage and performance tracking** - Track token consumption and response times per session/tool
- **Advanced error handling with retry strategies** - Implement retry logic and better error categorization for failed operations
- **Response time analytics** - Monitor and analyze Claude response times and performance bottlenecks
- **Session context preservation** - Maintain session context across dashboard restarts and tool invocations

### Performance Optimization `[ENHANCED ✅]`
- **Streaming resource discovery** - Server-Sent Events for real-time updates and improved performance ✅
- **Enhanced caching system** - Intelligent cache management with automatic invalidation and status tracking ✅
- **Resource deduplication** - Advanced deduplication system with conflict resolution ✅
- **Concurrent API calls** - Optimized resource loading with parallel requests ✅
- **Memory optimization** - Efficient resource management for large datasets ✅
- Incremental sync API endpoints for changes since timestamp `[planned-branch: feature/incremental-sync]`
- Cache management UI with clear cache and status indicators `[planned-branch: feature/cache-ui]`
- Skeleton screens and enhanced loading feedback `[planned-branch: feature/loading-states]`

### Developer Experience `[planned-branch: feature/dev-experience]`
- Hot reload for agent changes
- Resource debugging tools
- Development environment setup automation
- Error boundary improvements

### Project Review & Documentation `[planned-branch: feature/project-review]`
- **Review README.md** for necessity and accuracy of content
- **Project file cleanup** - review root and docs directories for misleading/outdated information
- **Frontend shadcn/ui compliance audit** - identify any deviations from shadcn/ui standards
- **shadcn/ui component research** - analyze all available components for optimal frontend recommendations

### Community Features Research `[planned-branch: feature/community]`
- **Resource sharing platform** - research adding feature for users to share resources with community, upvoting, and feedback system
- **News feed integration** - research adding news feed with GitHub, Reddit, and Anthropic links related to Claude Code resources and CChorus updates

## 🐛 Bug Fixes (Individual Branches)

### Backend Issues
- **Add missing /api/health endpoint** `[planned-branch: fix/health-endpoint]` - Backend returns 404 on health checks
- **Fix readdirp v4 glob pattern matching issue** `[planned-branch: fix/readdirp-glob]` - String filters only match exact filenames instead of glob patterns (#69)
- **Improve session detection in development dashboard** `[planned-branch: fix/session-detection]` - Real session detection needs improvement when Claude session IDs become accessible (#70)

### Bundle Optimization
- **Fix 1.5MB production bundle size** `[planned-branch: fix/bundle-size]` - Implement code-splitting and dynamic imports

## 🧪 Testing & Quality

### Test Coverage
- Playwright testing for feature parity and responsive design
- Unit tests for ResourceDataService
- Integration tests for assignment workflows
- Performance testing with large datasets

### Quality Assurance
- Hook validation to prevent commits without proper documentation
- Automated code review workflows
- Documentation accuracy validation
- Cross-browser compatibility testing

## 📋 Technical Debt

### Enterprise Dashboard Features `[planned-branch: feature/enterprise-observability]`
- **Optional Prometheus integration** - Add optional Prometheus metrics export for enterprise monitoring
- **Multi-project/team support** - Support multiple projects and team collaboration features
- **Security audit features** - Add security monitoring and audit trails for sensitive operations
- **Cost tracking and billing analytics** - Monitor and analyze API costs (note: low priority per user specification)

### Code Quality
- Component prop validation improvements
- TypeScript strict mode compliance
- ESLint rule enforcement
- CSS organization and optimization
- **Remove "revolutionary" from commit messages** `[planned-branch: chore/commit-message-cleanup]` - Update commit message templates and documentation to use more professional language, removing the word "revolutionary" from templates and any existing documentation
- **Clean up documentation Note references** `[planned-branch: docs/cleanup-notes]` - Review and standardize Note references throughout documentation (#72)
- **Review and update Notebook tool references** `[planned-branch: chore/notebook-tools]` - Verify NotebookRead/NotebookEdit tools in simple-server.js (#73)

### Architecture
- Service layer abstraction improvements
- Error handling standardization
- Logging and monitoring integration
- Security audit and improvements

---

## 📋 Branch Creation Guide

**Branch Metadata Workflow:**
- `[planned-branch: branch-name]` - Branch is planned but not ready for creation
- `[ready-for-branch: branch-name]` - Branch is ready to be created (triggers auto-creation)
- `[BRANCH-CREATED ✅: branch-name]` - Branch has been created successfully

**Branch Naming Convention:**
- `feature/` - New features and major enhancements (groups multiple related tasks)
- `fix/` - Bug fixes and issue resolutions (individual branches per bug)
- `hotfix/` - Critical production fixes requiring immediate attention
- `docs/` - Documentation-only changes
- `refactor/` - Code refactoring without feature changes
- `chore/` - Maintenance tasks, dependency updates, tooling
- `test/` - Testing improvements and additions

**Intelligent Branch Assignment:**
- Items starting with "Fix" or marked as bugs → Automatic `fix/` branches
- Feature sections with multiple items → Grouped under single `feature/` branch
- Use `[branch: existing-name]` to assign to existing branch
- Use `[planned-branch: name]` for future work planning
- Update to `[ready-for-branch: name]` when ready to begin work

**Auto-Branch Creation System `[ENHANCED ✅]`:**
- **Smart detection**: Only creates branches marked as `[ready-for-branch:]`
- **Real-time monitoring**: `.claude/start-auto-branch-creator.sh --watch`
- **On-demand scanning**: `.claude/start-auto-branch-creator.sh --once`
- **GitOps integration**: Auto-creates GitOps agent invocations for branch management
- **BACKLOG.md updates**: Marks branches as `[BRANCH-CREATED ✅]` when completed
- **Pre-compact analysis**: Session-end branch recommendations based on work scope
- **Priority intelligence**: High/medium/low priority branch creation timing

---

**Update Process**: This backlog is automatically maintained by the `documentation-manager` agent and synchronized with development sessions. Items move to CHANGELOG.md when completed.

**Branch Management**: Branches are only created when items are marked with `[ready-for-branch:]` metadata, ensuring branches exist only when work is ready to begin.

**GitHub Integration**: Items are automatically created as GitHub Issues with appropriate labels and milestones.