# CChorus Development Backlog

Last Updated: August 6, 2025

This document tracks all planned work, ideas, and research items for CChorus. Items are automatically synchronized with GitHub Issues and updated during development sessions.

## 🔥 High Priority

### UX Specification Implementation `[ready-for-branch: feature/ux-spec-implementation]`
Based on `docs/ux.md` specification - VS Code-style interface enhancements

#### High Priority UX Tasks
- **Resizable panels** (#74) - Implement react-resizable-panels for VS Code-style layout
- **Recursive tree navigation** (#75) - Build collapsible tree structure for Explorer Panel
- **Dynamic Properties Panel** (#76) - Adapt content based on User vs Project resource scope
- **Switch components for assignments** (#77) - Replace Checkbox with Switch for project toggles
- **Enhanced Toast notifications** (#78) - Comprehensive feedback for all user actions

#### Medium Priority UX Tasks
- **Hover actions** (#79) - Add PlusCircle & RefreshCw buttons for resource management
- **Enhanced search** (#80) - Resource type filtering and advanced search capabilities
- **Project filter input** (#81) - Filter input for large project lists in assignments

### Backend Integration for Resource System Groupings `[ready-for-branch: feature/resource-system-backend]`
- **API endpoint development** - Replace LocalStorage with proper backend persistence
- **Database schema design** - Resource modifications, change history, and system state storage
- **Real-time synchronization** - WebSocket updates for multi-user resource management
- **Conflict resolution** - Handle concurrent modifications and system state changes
- **Migration utilities** - Tools to migrate existing LocalStorage data to backend

## 💡 Ideas & Features

### Resource System Groupings Implementation `[COMPLETED ✅]`
- **System-aware resource organization** - Intelligent grouping by source system (CCPlugins, Claude Flow, Built-in) ✅
- **Interactive system toggle controls** - Enable/disable entire systems with confirmation dialogs ✅
- **Resource modification workflow** - Professional modification interface with change tracking ✅
- **Change history and rollback** - Complete audit trail with visual diff viewer and rollback ✅
- **Context menu integration** - Right-click actions for modify/history/copy/delete operations ✅
- **LocalStorage persistence layer** - Client-side change tracking ready for backend integration ✅
- **Project-specific customization** - System modifications scoped to individual projects ✅
- **Visual system health indicators** - System status display with resource counts ✅

### Advanced Resource Editing `[planned-branch: feature/resource-editors]`
- **Enhanced diff viewer** - Professional visual diff interface with syntax highlighting
- **Resource templates and scaffolding** - System-aware templates for creating new resources
- **In-place resource editing** - Direct editing within 3-column layout
- **Visual hook editor** - Drag-and-drop hook configuration interface
- **Advanced diff viewer for resource comparisons** - Comprehensive side-by-side and inline comparison tools
- **User preferences for sorting and filtering** - Customizable views and search options for resource management
- **Command editor with YAML validation** - Comprehensive command creation and editing tools
- **Settings file management interface** - Unified interface for all configuration files

[... rest of the document remains the same ...]

**Recent Completion**: Backend Integration for Resource System Groupings prepared as the next major development milestone. Frontend Resource System Groupings implementation completed August 6, 2025, transforming resource management from visual-only (45%) to fully functional (90%) with comprehensive modification tracking, rollback capabilities, and system-aware organization.

[... remaining document content stays the same ...]