# Claude Code Agent Editor

A modern web-based editor for managing Claude Code sub-agents. This application provides a simple, intuitive interface for creating, editing, and organizing your Claude Code sub-agents with support for tool selection, color coding, and comprehensive prompt editing.

## Features

- **Visual Agent Management**: Browse all your sub-agents in a clean card-based layout
- **Rich Editor**: Comprehensive editing interface with form validation
- **Tool Selection**: Easy checkbox interface for selecting which tools each agent can access
- **Color Coding**: Visual color themes for better organization
- **Search & Filter**: Quickly find agents by name or description
- **Real-time Preview**: See agent configurations at a glance
- **YAML Frontmatter**: Proper parsing and serialization of agent configuration files

## Sub-Agent Structure

Sub-agents are stored as Markdown files with YAML frontmatter in the `.claude/agents/` directory:

```markdown
---
name: agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # Optional - inherits all tools if omitted
color: "#3B82F6"           # Optional - visual color theme
---

System prompt content goes here...
```

## Available Tools

The editor supports all Claude Code tools:
- Task, Bash, Glob, Grep, LS
- Read, Edit, MultiEdit, Write
- NotebookRead, NotebookEdit
- WebFetch, WebSearch, TodoWrite
- ExitPlanMode

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## Usage

### Creating a New Agent
1. Click the "New Agent" button
2. Fill in the required fields:
   - **Name**: Lowercase letters, numbers, and hyphens only
   - **Description**: When should this agent be invoked?
   - **System Prompt**: The agent's specialized instructions
3. Optionally select specific tools and choose a color theme
4. Click "Create Agent" to save

### Editing an Existing Agent  
1. Click the edit icon on any agent card
2. Modify the fields as needed
3. Click "Update Agent" to save changes

### Deleting an Agent
1. Click the trash icon on any agent card
2. Confirm the deletion in the popup dialog

## File System Integration

Currently configured as a demo with mock data. In a production environment, this would integrate with:
- Local file system operations for reading/writing agent files
- Proper `.claude/agents/` directory scanning
- File system watching for external changes

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **js-yaml** for YAML parsing
- **Modern ES modules** and development tools

## Development

The project structure follows modern React patterns:

```
src/
├── components/          # React components
│   ├── AgentCard.tsx   # Individual agent display
│   └── AgentEditor.tsx # Agent creation/editing form
├── utils/              # Utility functions
│   ├── agentUtils.ts   # Agent parsing and validation
│   └── fileSystem.ts   # File system operations (mock)
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Contributing

This is a simple editor built for Claude Code sub-agent management. Feel free to extend it with additional features like:
- Real file system integration
- Agent templates and examples
- Import/export functionality
- Batch operations
- Agent testing capabilities