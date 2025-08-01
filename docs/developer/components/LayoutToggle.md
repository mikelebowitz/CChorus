# LayoutToggle Component

## Overview

The `LayoutToggle` component provides users with the ability to switch between CChorus's modern 3-column interface and the classic tabbed interface. This component ensures backward compatibility while promoting the new professional layout as the default experience.

## Component Interface

```tsx
interface LayoutToggleProps {
  useNewLayout: boolean;
  onToggle: (useNewLayout: boolean) => void;
  className?: string;
}
```

## Component Implementation

```tsx
import React from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Layout, Columns3 } from 'lucide-react';

export function LayoutToggle({ useNewLayout, onToggle, className }: LayoutToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Layout size={16} className={useNewLayout ? 'text-muted-foreground' : 'text-primary'} />
        <Label htmlFor="layout-toggle" className="text-sm font-medium">
          Tabbed
        </Label>
      </div>
      
      <Switch
        id="layout-toggle"
        checked={useNewLayout}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex items-center gap-2">
        <Label htmlFor="layout-toggle" className="text-sm font-medium">
          3-Column
        </Label>
        <Columns3 size={16} className={useNewLayout ? 'text-primary' : 'text-muted-foreground'} />
      </div>
    </div>
  );
}
```

## Key Features

### Visual Layout Indication
- **Tabbed Interface Icon**: `Layout` icon represents the classic tabbed interface
- **3-Column Interface Icon**: `Columns3` icon represents the modern 3-column layout
- **Active State Styling**: Icons change color based on current selection
- **Clear Labels**: "Tabbed" and "3-Column" labels for accessibility

### Switch Component Integration
- **shadcn/ui Switch**: Uses the professional Switch component from shadcn/ui
- **Consistent Styling**: Matches CChorus's design system
- **Smooth Animations**: Provides satisfying toggle animations
- **Accessibility**: Full keyboard support and screen reader compatibility

### State Management
```tsx
// In parent component (App.tsx)
const [useNewLayout, setUseNewLayout] = useState(true);

<LayoutToggle 
  useNewLayout={useNewLayout}
  onToggle={setUseNewLayout}
  className="ml-auto"
/>
```

## Integration Points

### App.tsx Integration
The LayoutToggle is integrated into the main App component to control the primary interface:

```tsx
function AppContent() {
  const [useNewLayout, setUseNewLayout] = useState(true); // Default to 3-column
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with layout toggle */}
      <header className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1>CChorus</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LayoutToggle 
              useNewLayout={useNewLayout}
              onToggle={setUseNewLayout}
            />
          </div>
        </div>
      </header>
      
      {/* Conditional layout rendering */}
      {useNewLayout ? (
        <ThreeColumnLayout />
      ) : (
        <TabbedInterface />
      )}
    </div>
  );
}
```

### Theme Integration
The component fully integrates with CChorus's theme system:

```tsx
// Theme-aware styling
<Layout size={16} className={useNewLayout ? 'text-muted-foreground' : 'text-primary'} />
<Columns3 size={16} className={useNewLayout ? 'text-primary' : 'text-muted-foreground'} />
```

## Accessibility Features

### Keyboard Navigation
- **Tab Support**: Full keyboard navigation with proper tab order
- **Enter/Space**: Activates the toggle with standard keyboard shortcuts
- **Focus Indicators**: Clear visual focus indicators for keyboard users

### Screen Reader Support
```tsx
<Label htmlFor="layout-toggle" className="text-sm font-medium">
  Tabbed
</Label>
<Switch
  id="layout-toggle"
  checked={useNewLayout}
  onCheckedChange={onToggle}
  aria-label="Toggle between tabbed and 3-column layout"
/>
```

### High Contrast Support
- Compatible with system high contrast modes
- Maintains visibility in all theme variations
- Clear visual distinction between active and inactive states

## Default Behavior

### New User Experience
```tsx
// Default to 3-column layout for new users
const [useNewLayout, setUseNewLayout] = useState(true);
```

### State Persistence
Future enhancement will include local storage persistence:

```tsx
// Planned enhancement
const [useNewLayout, setUseNewLayout] = useState(() => {
  const stored = localStorage.getItem('cchorus-layout-preference');
  return stored ? JSON.parse(stored) : true; // Default to 3-column
});

const handleToggle = (newValue: boolean) => {
  setUseNewLayout(newValue);
  localStorage.setItem('cchorus-layout-preference', JSON.stringify(newValue));
};
```

## Visual Design

### Layout Structure
```
[Tabbed Icon] [Tabbed Label] ——— [Switch] ——— [3-Column Label] [3-Column Icon]
                                     ↑
                            Active state indicator
```

### Color Scheme
- **Active State**: Primary color for selected layout icon
- **Inactive State**: Muted foreground color for unselected layout icon
- **Switch**: Primary color when 3-column is selected
- **Labels**: Medium font weight for clear readability

## Usage Examples

### Basic Usage
```tsx
import { LayoutToggle } from '@/components/LayoutToggle';

function Header() {
  const [layout, setLayout] = useState(true);
  
  return (
    <div className="flex items-center justify-between p-4">
      <h1>CChorus</h1>
      <LayoutToggle 
        useNewLayout={layout}
        onToggle={setLayout}
      />
    </div>
  );
}
```

### With Custom Styling
```tsx
<LayoutToggle 
  useNewLayout={useNewLayout}
  onToggle={setUseNewLayout}
  className="border rounded-lg p-2 bg-card"
/>
```

## Performance Considerations

### Minimal Re-renders
- Component only re-renders when toggle state changes
- Efficient prop passing with minimal overhead
- No unnecessary animations or transitions

### Memory Usage
- Lightweight component with minimal state
- No memory leaks or cleanup required
- Efficient icon rendering with Lucide React

## Testing Strategy

### Manual Testing
- Verify toggle switches between layouts correctly
- Test keyboard navigation and activation
- Confirm visual states match actual layout
- Validate theme integration across light/dark modes

### Accessibility Testing
- Screen reader announcement verification
- Keyboard-only navigation testing
- High contrast mode compatibility
- Focus management validation

## Future Enhancements

### Planned Features
- **Persistence**: Local storage for user layout preferences
- **Animation**: Smooth transition animations between layouts
- **Tooltips**: Helpful tooltips explaining layout differences
- **Keyboard Shortcuts**: Global keyboard shortcut for quick toggling

### Advanced Features
- **Layout Previews**: Mini previews showing layout differences
- **Per-Route Preferences**: Different layout preferences per route
- **User Onboarding**: Guided tour highlighting layout benefits

## Development Notes

- **Component Isolation**: Self-contained with clear interface
- **TypeScript Integration**: Full type safety with proper interfaces
- **Design System Compliance**: Uses shadcn/ui components consistently
- **Accessibility First**: Built with accessibility as a primary concern

## Related Components

- [`ThreeColumnLayout`](./ThreeColumnLayout.md) - The modern 3-column interface
- [`Switch`](../ui/switch.md) - The underlying switch component
- [`ThemeToggle`](./ThemeToggle.md) - Similar toggle for theme switching

This component provides users with control over their CChorus experience while promoting the modern 3-column interface as the preferred default experience.