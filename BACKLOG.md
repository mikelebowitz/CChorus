# CChorus Development Backlog

Last Updated: August 2, 2025

This document tracks all planned work, ideas, and research items for CChorus. Items are automatically synchronized with GitHub Issues and updated during development sessions.

## 🔥 High Priority

### UI/UX Improvements
- **Redesign Users section** with user-level vs project-level resource distinction
- **Simplify crowded projects filter bar** - reduce clutter and improve layout  
- **Fix duplicate React keys** in project rendering causing console warnings
- **Dynamic content system** with context-aware header `[new-branch: feature/ui-polish]`

### Feature Migration to 3-Column Layout `[new-branch: feature/3-column-migration]`
- **Migrate Agent management** to 3-column layout Agents section
- **Migrate ResourceLibrary** to 3-column layout with dynamic middle column
- **Migrate AssignmentManager** to context-aware assignment workflows

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

## 💡 Ideas & Features

### Enhanced Resource Editing `[new-branch: feature/resource-editors]`
- Visual hook editor within 3-column layout
- Command editor with YAML validation
- Settings file management interface
- Resource templates and scaffolding

### Workflow Improvements
- `/sync` slash command for documentation synchronization
- Real-time collaboration features `[new-branch: feature/collaboration]`
- Resource versioning and history
- Bulk resource operations UI

### Integration & Automation
- GitHub Project integration for backlog tracking `[COMPLETED ✅]`
- Automated issue creation from backlog items `[COMPLETED ✅]`
- CI/CD pipeline for documentation validation `[new-branch: feature/ci-cd-pipeline]`
- Resource dependency tracking

## 🔬 Research & Investigation

### Performance Optimization `[new-branch: feature/performance]`
- Incremental sync API endpoints for changes since timestamp
- Cache management UI with clear cache and status indicators
- Skeleton screens and enhanced loading feedback
- Memory optimization for large resource sets

### Developer Experience `[new-branch: feature/dev-experience]`
- Hot reload for agent changes
- Resource debugging tools
- Development environment setup automation
- Error boundary improvements

### Project Review & Documentation `[new-branch: feature/project-review]`
- **Review README.md** for necessity and accuracy of content
- **Project file cleanup** - review root and docs directories for misleading/outdated information
- **Frontend shadcn/ui compliance audit** - identify any deviations from shadcn/ui standards
- **shadcn/ui component research** - analyze all available components for optimal frontend recommendations

### Community Features Research `[new-branch: feature/community]`
- **Resource sharing platform** - research adding feature for users to share resources with community, upvoting, and feedback system
- **News feed integration** - research adding news feed with GitHub, Reddit, and Anthropic links related to Claude Code resources and CChorus updates

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

### Code Quality
- Component prop validation improvements
- TypeScript strict mode compliance
- ESLint rule enforcement
- CSS organization and optimization

### Architecture
- Service layer abstraction improvements
- Error handling standardization
- Logging and monitoring integration
- Security audit and improvements

---

## 📋 Branch Creation Guide

Items marked with `[new-branch: branch-name]` trigger **automatic Git branch creation**:

**Branch Naming Convention:**
- `feature/` - New features and major enhancements
- `fix/` - Bug fixes and issue resolutions  
- `docs/` - Documentation-only changes
- `refactor/` - Code refactoring without feature changes
- `test/` - Testing improvements and additions

**Auto-Branch Creation System `[COMPLETED ✅]`:**
- **Real-time monitoring**: `.claude/start-auto-branch-creator.sh --watch`
- **On-demand scanning**: `.claude/start-auto-branch-creator.sh --once`
- **GitOps integration**: Auto-creates GitOps agent invocations for branch management
- **BACKLOG.md updates**: Marks branches as `[BRANCH-CREATED ✅]` when completed
- **Pre-compact analysis**: Session-end branch recommendations based on work scope
- **Priority intelligence**: High/medium/low priority branch creation timing

---

**Update Process**: This backlog is automatically maintained by the `documentation-manager` agent and synchronized with development sessions. Items move to CHANGELOG.md when completed.

**Branch Management**: Items with `[new-branch]` metadata trigger automatic branch creation via GitOps workflow.

**GitHub Integration**: Items are automatically created as GitHub Issues with appropriate labels and milestones.