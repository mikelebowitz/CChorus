# Resource System Management - User Guide

## Overview

CChorus now organizes your Claude Code resources by their source systems (like CCPlugins, Claude Flow, or Built-in resources), giving you powerful tools to manage, modify, and track changes to these resources on a per-project basis.

## Understanding Resource Systems

### What are Resource Systems?
Resource systems are collections of related agents, commands, and hooks that work together as a unified toolkit. Common systems include:

- **CCPlugins** - Community plugin resources
- **Claude Flow** - Workflow automation resources  
- **Built-in** - Core Claude Code resources
- **Custom** - Your personal resources

### Visual System Indicators
Resources now display system badges to help you identify their source:
- **Blue badges** - Built-in system resources
- **Green badges** - CCPlugins resources
- **Purple badges** - Claude Flow resources
- **Gray badges** - Custom/unassigned resources

## Managing Resource Systems

### Enabling and Disabling Systems

1. **Navigate to the Systems section** in the left sidebar
2. **Find the system** you want to manage
3. **Click the toggle switch** next to the system name
4. **Review the confirmation dialog** showing:
   - Number of resources that will be affected
   - Whether this applies globally or to current project only
   - Impact description
5. **Confirm your choice** to enable or disable the system

**Note**: Disabling a system hides all its resources from the interface but doesn't delete them. You can re-enable the system at any time.

### System Health Status
Each system displays a health indicator:
- **✅ Complete** - All system resources are intact and unmodified
- **🔶 Customized** - Some resources have been modified for your projects
- **🔸 Partial** - Some system resources may be missing or disabled
- **❌ Broken** - System has critical issues or missing dependencies

## Modifying System Resources

### When to Modify Resources
You might want to modify system resources to:
- Customize an agent's behavior for your specific project needs
- Fix compatibility issues with your workflow
- Add project-specific information or commands
- Adapt existing resources to your coding style

### How to Modify a Resource

1. **Right-click on any resource** in the resource list
2. **Select "Modify Resource"** from the context menu
3. **Read the system resource warning** - this explains that:
   - The original resource will be preserved
   - Your modification only affects the current project
   - A project-specific variant will be created
4. **Enter a clear reason** for the modification (required)
   - Example: "Customize for TypeScript projects"
   - Example: "Fix compatibility with our coding standards"
5. **Edit the resource content** in the text editor
6. **Click "Save Modification"** to create your customized version

### Visual Modification Indicators
Modified resources display:
- **Orange left border** - Indicates this resource has been customized
- **"Modified" badge** - Shows modification status
- **Modification date** - When the change was made
- **Modification reason** - Your explanation for the change

## Tracking Resource Changes

### Viewing Change History

1. **Right-click on any resource** (original or modified)
2. **Select "View History"** from the context menu
3. **Browse the change timeline** showing:
   - All modifications made to this resource
   - Who made each change and when
   - The reason provided for each change
   - Change type (create, modify, delete, restore)

### Understanding Change Details

In the Change History dialog:
- **Left panel** - Chronological list of all changes
- **Right panel** - Detailed view of selected change including:
  - Before and after content comparison
  - Change metadata (author, timestamp, reason)
  - Revert button (if applicable)

### Comparing Versions
When viewing change details, you can:
- **See "Before" content** - How the resource looked before the change
- **See "After" content** - How the resource looks after the change
- **Review differences** - Changed lines are highlighted
- **Future enhancement**: Visual side-by-side diff viewer coming soon

## Rolling Back Changes

### When to Rollback
You might want to revert a change when:
- The modification caused unexpected issues
- You want to return to the original system version
- You need to try a different approach
- The modification is no longer needed

### How to Rollback

1. **Open Change History** for the resource
2. **Select the change** you want to revert
3. **Click the "Revert" button** in the change details panel
4. **Confirm the rollback** - this will:
   - Restore the resource to its state before that change
   - Create a new "restore" entry in the change history
   - Preserve the full audit trail

**Important**: Rollbacks create new change entries rather than deleting history, so you always have a complete record of all modifications.

## Project-Specific Customization

### Understanding Project Scope
All resource modifications are **project-specific**, meaning:
- Your changes only affect the current project
- Other projects continue using the original system resources
- You can have different customizations for different projects
- Original system resources remain completely untouched

### Managing Multiple Projects
When working across multiple projects:
- Each project can have its own resource customizations
- System enable/disable settings can be project-specific or global
- Change history is tracked per project
- You can copy successful customizations between projects (coming soon)

## Best Practices

### Modification Guidelines
- **Always provide clear reasons** - Help your future self understand why changes were made
- **Make minimal changes** - Modify only what's necessary for your specific needs
- **Test thoroughly** - Verify modified resources work as expected in your project
- **Document complex changes** - Use detailed reasoning for significant modifications

### System Management
- **Enable only needed systems** - Reduce clutter by disabling unused resource systems
- **Regular system health checks** - Monitor system status and address issues promptly
- **Keep original functionality** - When modifying, try to preserve the original resource's core purpose

### Change Tracking
- **Review change history regularly** - Understand how your resources have evolved
- **Use rollback sparingly** - Consider creating new modifications instead of reverting
- **Maintain audit trail** - The complete change history helps with troubleshooting

## Troubleshooting

### Common Issues

**Modified resource not working as expected:**
1. Check the change history to see what was modified
2. Compare with the original version
3. Consider rolling back to test if the issue was introduced by your modification

**System appears broken or incomplete:**
1. Check system health status in the Systems section
2. Verify all required resources are enabled
3. Look for modification conflicts between related resources

**Changes not showing up:**
1. Ensure you're in the correct project context
2. Check if the system is enabled
3. Refresh the resource list by navigating away and back

### Getting Help
- Check the change history for context about previous modifications
- Compare your modified version with the original system resource
- Use the rollback feature to return to a known working state
- Consider reaching out to the system author for guidance on proper customization

## Future Enhancements

Coming soon to Resource System Management:
- **Enhanced visual diff viewer** with syntax highlighting
- **Resource templates** for common customization patterns
- **Cross-project resource copying** to share successful modifications
- **Bulk system operations** for managing multiple systems at once
- **System dependency tracking** to understand resource relationships
- **Automated conflict detection** between modified resources

---

The Resource System Management feature transforms CChorus from a simple resource viewer into a comprehensive resource management platform, giving you the tools you need to customize and track your Claude Code resources while maintaining system integrity and project isolation.