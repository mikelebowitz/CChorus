# Changelog

All notable changes to CChorus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-07-30

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