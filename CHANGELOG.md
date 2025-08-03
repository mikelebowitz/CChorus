# Changelog

All notable changes to CChorus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-08-02

### Added - 3-Column UI Architecture
- **🎨 Professional 3-Column Layout** - Complete UI overhaul with hierarchical navigation
- **📱 Real Resource Data Integration** - Live resource discovery and management
- **🔄 ResourceAssignmentPanel** - Cross-project resource deployment with visual tracking
- **🛠️ ResourceDataService** - Unified service for loading agents, commands, hooks, and CLAUDE.md files
- **📝 ClaudeMdEditor Integration** - Professional react-md-editor with save/cancel workflows
- **🎯 Enhanced Project Caching** - Intelligent caching with background refresh and streaming
- **🎨 Theme-Aware Resource Lists** - Alternating row colors and professional styling

### Changed - Interface Modernization
- **New Default Experience** - 3-column layout is now the primary interface
- **Simplified Project Display** - Clean presentation with descriptions vs file paths
- **Enhanced Navigation** - Sidebar with Users, Projects, Agents, Commands, Hooks, CLAUDE.md sections
- **Context-Aware Content** - Dynamic middle column based on navigation selection
- **Improved Resource Assignment** - Visual assignment management with project checkboxes

### Fixed - Major Bug Resolutions
- **CLAUDE.md File Discovery** - Fixed filter bug preventing CLAUDE.md files from displaying
- **Resource Assignment Tracking** - Built assignment map from existing file paths
- **Component Integration** - Proper ThreeColumnLayout integration with existing components

### Technical - Architecture Improvements
- **Component Architecture** - ThreeColumnLayout, ClaudeMdEditor, LayoutToggle, ResourceAssignmentPanel
- **Type Safety** - Full TypeScript integration with comprehensive interfaces
- **Performance** - Optimized resource loading and state management
- **Accessibility** - Keyboard navigation and screen reader support

## [1.5.0] - 2025-07-31

### Added
- **🚀 System-Wide Agent Discovery** - Comprehensive scanning across all projects on the system
- **New `/api/agents/system` endpoint** - Replaces project-specific scanning with system-wide discovery
- **Project Context Metadata** - Each agent now includes project name, path, and source classification
- **Advanced Agent Scanner Module** - New `agentScanner.js` with streaming capabilities using readdirp v4
- **Memory-Efficient Scanning** - Stream-based processing for large directory structures
- **Enhanced Error Resilience** - Robust handling of filesystem issues, permissions, and broken symlinks
- **Performance Optimizations** - Smart directory filtering and depth control
- **TypeScript Support** - Full type definitions for new agent discovery features

### Changed
- **⚠️ BREAKING CHANGE**: API endpoint `/api/agents/project` replaced with `/api/agents/system`
- Updated `ApiFileSystemService` to use system-wide scanning instead of project-specific scanning
- Enhanced `SubAgent` interface with project metadata fields (`projectName`, `projectPath`, `relativePath`)
- Improved agent loading strategy - now provides comprehensive system view instead of user+project approach
- Updated readdirp dependency to v4.1.2 with function-based filtering (string glob patterns deprecated)

### Technical Improvements
- Implemented streaming-based agent file scanning with `scanAgentFiles()` async generator
- Added promise-based `scanAgentFilesArray()` for convenience use cases
- Enhanced server-side project information extraction from file paths
- Improved agent sorting by project name and agent name
- Added comprehensive error logging and graceful degradation

### Developer Experience
- New `agentScanner.ts` TypeScript module with full type safety
- Enhanced development documentation for the new scanning architecture
- Improved debugging capabilities with detailed logging
- Better error messages for filesystem issues

## [Previous] - 2025-07-30

### Added
- New `AgentTabbedEditor` component with 3-tab interface (Basic Info, Color & Tools, Prompt)
- Floating action buttons for Update/Cancel operations
- Empty state display when no agent is selected
- Character count display in prompt editor
- Visual error indicators on tabs with validation errors
- Comprehensive session documentation in `docs/sessions/`
- `STATUS.md` for tracking project status
- Professional badges in README

### Changed
- **BREAKING**: Switched from 3-column to 2-column layout
- Moved statistics section below agent list instead of bottom of page
- Renamed "Styling & Tools" tab to "Color & Tools"
- Increased logo size by 20% (h-8 to h-10)
- Replaced CSS hard-coded colors with daisyUI theme variables
- Improved color picker with theme-aware selection indicators
- Enhanced logo theming (white on dark themes, colored on light)
- Complete README overhaul with professional formatting

### Fixed
- Theme switching now properly applies to all UI elements
- Button positioning with proper floating behavior
- Cancel button only shown when actively editing
- Tools list height constraint removed
- Server startup ENOENT error by creating `.claude/agents` directory
- CSS specificity issues with proper `@layer` directives

### Removed
- Excessive `!important` declarations from CSS
- Legacy `AgentConfigPanel` component
- Legacy `PromptEditor` component
- Inline style overrides in favor of theme variables

## [0.9.0] - 2025-07-30

### Added
- Complete daisyUI theme system with 30+ professional themes
- Theme persistence in localStorage
- Keyboard shortcut for theme switching (Ctrl/Cmd + T)
- Enhanced file browser with home directory default
- MCP server integration improvements
- Comprehensive override CSS system

### Changed
- Major UI/UX overhaul with professional design
- Enhanced responsive design for all screen sizes
- Improved visual hierarchy throughout application

### Fixed
- Textarea height constraints for natural content flow
- File browser dot file visibility
- MCP server detection accuracy

## [0.8.0] - 2025-07-29

### Added
- Initial CChorus implementation
- Agent management system (CRUD operations)
- User and project level agent support
- Tool selection interface
- YAML frontmatter parsing
- File import/export functionality
- Basic search and filter capabilities
- Express API backend
- React frontend with TypeScript

### Technical Stack
- React 18.3.1 + TypeScript + Vite
- Tailwind CSS + daisyUI
- Express.js backend
- File-based agent storage

---

*For detailed session logs, see the `docs/sessions/` directory.*