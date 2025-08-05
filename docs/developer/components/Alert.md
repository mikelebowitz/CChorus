# Alert Component

## Overview

The `Alert` component is a shadcn/ui compatible notification component that provides consistent error messaging and user feedback throughout CChorus. Introduced in v3.1.0, this component follows the shadcn/ui design patterns and integrates seamlessly with the theme system to display important messages, warnings, and errors.

## Component Architecture

```tsx
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
```

## Component Structure

### Base Alert Component
```tsx
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
```

### AlertTitle Subcomponent
```tsx
const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
```

### AlertDescription Subcomponent
```tsx
const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
);
```

## Variant System

### Default Variant
```tsx
// Neutral informational alerts
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>
```

### Destructive Variant
```tsx
// Error and warning alerts
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

## Styling System

### Variant Classes
```tsx
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### Theme Integration
- **CSS Custom Properties** - Uses theme variables for consistent coloring
- **Dark Mode Support** - Automatic adaptation to dark themes
- **Border System** - Semantic border colors based on variant
- **Icon Integration** - Positioned icons with proper spacing

## Usage in CChorus

### Error Display in Components
```tsx
// ThreeColumnLayout error display
{error && (
  <div className="p-6">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Resources</AlertTitle>
      <AlertDescription>
        Failed to load resources. Please check your connection and try again.
      </AlertDescription>
    </Alert>
  </div>
)}
```

### User Feedback Messages
```tsx
// Success message after resource assignment
<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Resource has been successfully assigned to the project.
  </AlertDescription>
</Alert>
```

### Warning Messages
```tsx
// Warning about missing dependencies
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Some required tools are not available. This may affect functionality.
  </AlertDescription>
</Alert>
```

## Integration with ErrorBoundary

### Fallback Error Display
```tsx
const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => (
  <div className="p-6">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        We encountered an unexpected error. This has been logged for investigation.
      </AlertDescription>
    </Alert>
    <div className="mt-4">
      <Button onClick={resetError} variant="outline" size="sm">
        Try Again
      </Button>
    </div>
  </div>
);
```

## Icon Integration

### Recommended Icons
```tsx
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Error states
<AlertCircle className="h-4 w-4" />

// Warning states  
<AlertTriangle className="h-4 w-4" />

// Success states
<CheckCircle className="h-4 w-4" />

// Information states
<Info className="h-4 w-4" />
```

### Icon Positioning
- **Absolute Positioning** - Icons positioned absolutely within alert container
- **Consistent Sizing** - Standard h-4 w-4 (16px) icon size
- **Proper Spacing** - Content automatically spaced around icons
- **Theme Colors** - Icons inherit appropriate colors from variant

## Accessibility Features

### ARIA Compliance
```tsx
// Built-in accessibility attributes
<div
  role="alert"           // Announces to screen readers
  className={...}
  {...props}
/>
```

### Screen Reader Support
- **Semantic Markup** - Uses proper heading hierarchy with AlertTitle
- **Role Attribute** - `role="alert"` ensures immediate announcement
- **Descriptive Content** - Clear, actionable descriptions
- **Focus Management** - Works with keyboard navigation

### Visual Accessibility
- **High Contrast** - Colors meet WCAG contrast requirements
- **Icon Support** - Visual icons supplement text content
- **Consistent Styling** - Predictable visual patterns
- **Theme Compatibility** - Works with high contrast themes

## Performance Considerations

### Lightweight Implementation
- **Minimal Bundle** - Small component with focused functionality
- **CSS-Only Styling** - No JavaScript animations or complex state
- **Tree Shaking** - Only imported components are bundled
- **Reusable Patterns** - Consistent implementation reduces duplication

### Efficient Rendering
- **ForwardRef Pattern** - Proper ref forwarding for performance
- **Class Name Optimization** - Uses clsx for efficient class merging
- **No Side Effects** - Pure component with no external dependencies

## Testing Strategy

### Component Testing
```tsx
// Test different variants
describe('Alert Component', () => {
  it('renders default variant correctly', () => {
    render(
      <Alert>
        <AlertDescription>Test message</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders destructive variant correctly', () => {
    render(
      <Alert variant="destructive">
        <AlertDescription>Error message</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole('alert')).toHaveClass('border-destructive/50');
  });
});
```

### Accessibility Testing
- **Screen Reader Testing** - Verify announcement behavior
- **Keyboard Navigation** - Ensure focus management works
- **Color Contrast** - Validate WCAG compliance
- **High Contrast Mode** - Test visibility in high contrast themes

## Design System Integration

### shadcn/ui Patterns
- **Compound Components** - Alert, AlertTitle, AlertDescription work together
- **Variant System** - Uses cva (class-variance-authority) for variants
- **Theme Variables** - Consistent with shadcn/ui color system
- **Forward Refs** - Proper ref forwarding for library compatibility

### CChorus Theme System
```tsx
// Seamless integration with CChorus themes
.alert-default {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}

.alert-destructive {
  border-color: hsl(var(--destructive) / 0.5);
  color: hsl(var(--destructive));
}
```

## Usage Examples

### Basic Error Alert
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>
```

### Alert with Title and Description
```tsx
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the cli.
  </AlertDescription>
</Alert>
```

### Custom Styled Alert
```tsx
<Alert className="border-blue-200 bg-blue-50 text-blue-900">
  <Info className="h-4 w-4" />
  <AlertTitle>Custom Information</AlertTitle>
  <AlertDescription>
    This alert uses custom styling while maintaining accessibility.
  </AlertDescription>
</Alert>
```

## Related Components

- [`ErrorBoundary`](./ErrorBoundary.md) - Uses Alert for error display
- [`Button`](../ui/button.md) - Often used with alerts for actions
- [`ThreeColumnLayout`](./ThreeColumnLayout.md) - Primary integration point

## Future Enhancements

### Planned Features
- **Additional Variants** - Success, warning, info variants
- **Animation Support** - Slide-in/slide-out animations
- **Dismissible Alerts** - Close button functionality
- **Toast Integration** - Convert to toast notifications

### Extension Points
- **Custom Icons** - Pluggable icon system
- **Action Buttons** - Built-in action button support
- **Progress Indicators** - Loading states within alerts
- **Rich Content** - Support for links and formatted text

This component provides the foundation for consistent, accessible user feedback throughout CChorus, ensuring users receive clear communication about system state and required actions.