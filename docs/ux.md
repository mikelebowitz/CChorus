UX Specification: Integrated Explorer Panel
This document outlines the user experience and component architecture for the resource management application, based on an integrated "VS Code" style layout. The primary goal is to provide a powerful, familiar, and efficient interface for developers.
1. High-Level Layout
The UI is structured into three persistent columns, allowing users to retain context while navigating, editing, and managing resources.
+--------------------------------+----------------------------+-----------------------------+
|                                |                            |                             |
| [Column 1: Explorer Panel]     | [Column 2: Editor Panel]   | [Column 3: Properties Panel]|
| - Navigation Tree              | - Markdown Editor for      | - Metadata & Settings       |
| - Resource Lists               |   selected resource        | - Project Assignments       |
| - Filtering & Actions          |                            |                             |
|                                |                            |                             |
+--------------------------------+----------------------------+-----------------------------+

2. Column 1: Explorer Panel
(This section remains the same as previously defined: a filterable, collapsible tree for navigating all resources.)
3. Column 2: Editor Panel
(This section remains the same: it displays the Markdown editor for the selected resource.)
4. Column 3: Properties Panel (Revised)
This panel is a dynamic command center for the selected resource. Its content adapts based on the resource's scope (User-level vs. Project-local).
A. Resource Properties
This section contains the core metadata for the resource.
 * Components: A form composed of:
   * Label and Input for the resource name.
   * Label and Select for categorical properties.
   * Label and Switch for boolean settings.
   * Button for primary actions like Save or Delete.
B. Project Assignments
This section is the hub for managing which projects a User-level resource is applied to.
 * Context: This entire section should only be visible and active when a resource from the "User Library" scope is selected in the Explorer Panel.
 * Goal: Provide a scannable, filterable list of all projects, allowing the user to easily toggle the resource's application on or off for each one.
Implementation Details:
 * Filter Input: To handle a large number of projects, a filter input is placed at the top of this section.
   * Component: Input with a Search icon from lucide-react.
   * Placeholder: "Filter projects..."
 * Project List: A scrollable list displays each project and its current state.
   * Container: A div with a max-height and overflow-y: auto.
   * List Item: Each row is a div using flex with justify-content: space-between and align-items: center.
   * Toggle Control: The Switch component is used for the on/off control. Its onCheckedChange event should trigger the API call to apply or remove the resource from that specific project. Instant feedback via a Toast is recommended (e.g., "✅ Applied to Project Gamma").
Visual Mockup of the Properties Panel
+-----------------------------+
| [Properties Panel]          |
|                             |
|  Resource Properties        |
|  -------------------        |
|  Name                       |
|  [my-global-hook.md      ]  |
|                             |
|  Type                       |
|  [Hook                   v] |
|                             |
|  [Save Changes] [Delete]    |
|                             |
| =========================== |
|                             |
|  Project Assignments        |
|  -------------------        |
|  [Filter projects...     ]  |
| +-------------------------+ |
| | Project Alpha      [ O] | | <- (Switch is on)
| | Project Beta       [O ] | | <- (Switch is off)
| | Project Gamma      [ O] | |
| | Project Delta      [ O] | |
| +-------------------------+ |
|      (Scrollable)           |
+-----------------------------+

5. Component & Library Summary
(This table is largely the same, but the notes for Column 3's components are updated)
| Feature | Recommended Shadcn/UI Component(s) | Notes / Library |
|---|---|---|
| Main Layout | Resizable Panels (e.g., react-resizable-panels) | For creating the three-column layout. |
| Explorer Tree | Collapsible | Use recursively to build the tree structure. |
| Global Filter | Input | lucide-react for the Search icon. |
| Hover Actions | Button (variant: ghost, size: icon) | lucide-react for PlusCircle, RefreshCw. |
| Properties | Label, Input, Select, Button | For core metadata form. |
| Assignments | Input, Switch, Toast | For the Project Assignments section. |
6. Updated User Flow: Managing a Global Hook
 * Locate Resource: In the Explorer Panel, the user expands the "User Library" and then "Hooks" to find my-global-hook.md.
 * Select Resource: The user clicks on my-global-hook.md.
   * The item is highlighted in the Explorer Panel.
   * The Editor Panel loads the hook's content.
   * The Properties Panel populates with its metadata and the "Project Assignments" list.
 * Check Assignments: The user glances at the Properties Panel and sees the resource is active for "Project Alpha" but not for "Project Beta".
 * Apply to New Project: They find "Project Beta" in the list (using the filter if necessary) and click its Switch to the "on" position.
 * Feedback: A Toast notification appears at the corner of the screen: "✅ my-global-hook.md applied to Project Beta."
 * Edit & Save: The user makes a small change to the hook's code in the Editor Panel and clicks the Save Changes Button in the properties section. The change is now live for both Project Alpha and Project Beta.
