# ErrorBoundary Component

## Overview

The `ErrorBoundary` component is a React error boundary that provides comprehensive error handling and recovery mechanisms for CChorus. Introduced in v3.1.0, this component catches JavaScript errors anywhere in the child component tree, logs errors, and displays a user-friendly fallback UI instead of crashing the entire application.

## Component Architecture

```tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  resetError: () => void;
}
```

## Key Features

### Production-Grade Error Handling
- **Comprehensive Error Catching** - Catches all JavaScript errors in child components
- **Error Logging** - Logs detailed error information for debugging
- **Graceful Degradation** - Shows user-friendly error UI instead of blank page
- **Error Recovery** - Provides retry mechanism to recover from transient errors

### User-Friendly Fallback UI
```tsx
// Default fallback component with professional styling
const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => (
  <div className="flex items-center justify-center min-h-[200px] p-6">
    <div className="text-center space-y-4">
      <div className="text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-2" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        We encountered an unexpected error. This has been logged for investigation.
      </p>
      <Button onClick={resetError} variant="outline" size="sm">
        Try Again
      </Button>
    </div>
  </div>
);
```

### Retry Mechanism
```tsx
// Built-in error recovery functionality
const resetError = () => {
  setState({ hasError: false, error: null });
};

// Automatic state reset on successful retry
componentDidUpdate(prevProps: ErrorBoundaryProps) {
  if (prevProps.children !== this.props.children && this.state.hasError) {
    this.setState({ hasError: false, error: null });
  }
}
```

## Implementation Details

### React Error Boundary Lifecycle
```tsx
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Catch errors during rendering
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Log error details for debugging
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  // Reset error state when children change
  public componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
}
```

### Custom Fallback Support
```tsx
// Usage with custom fallback component
<ErrorBoundary fallback={CustomErrorFallback}>
  <YourComponent />
</ErrorBoundary>

// Custom fallback implementation
const CustomErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => (
  <div className="custom-error-display">
    <h2>Oops! Something went wrong</h2>
    <details>
      <summary>Error details</summary>
      <pre>{error?.message}</pre>
    </details>
    <button onClick={resetError}>Retry</button>
  </div>
);
```

## Integration with CChorus Components

### ThreeColumnLayout Integration
```tsx
// Comprehensive error protection for the main layout
<ErrorBoundary>
  <div className="h-full flex flex-col">
    {/* Layout content protected from errors */}
    <header>...</header>
    <main>...</main>
  </div>
</ErrorBoundary>
```

### Selective Error Boundaries
```tsx
// Multiple error boundaries for different sections
<div className="app">
  <ErrorBoundary>
    <Header />
  </ErrorBoundary>
  
  <ErrorBoundary>
    <MainContent />
  </ErrorBoundary>
  
  <ErrorBoundary>
    <Sidebar />
  </ErrorBoundary>
</div>
```

## Error Types Handled

### Common React Errors
- **Rendering Errors** - Errors during component rendering
- **Lifecycle Errors** - Errors in componentDidMount, componentDidUpdate, etc.
- **Event Handler Errors** - Errors in click handlers, form submissions
- **State Update Errors** - Errors during setState operations

### Resource Loading Errors
- **API Call Failures** - Network timeouts, server errors
- **Data Parsing Errors** - Invalid JSON, malformed data
- **Resource Not Found** - Missing files, broken paths
- **Permission Errors** - Access denied, authentication failures

## Theme Integration

### shadcn/ui Compliance
```tsx
// Uses shadcn/ui components and theme variables
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Theme-aware styling
<div className="bg-background text-foreground">
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      An error occurred while loading this content.
    </AlertDescription>
  </Alert>
</div>
```

### Consistent Visual Design
- **Color System** - Uses semantic colors (destructive for errors)
- **Typography** - Consistent with design system typography
- **Spacing** - Follows standard spacing patterns
- **Icons** - Lucide React icons for visual consistency

## Testing Strategy

### Error Simulation
```tsx
// Component for testing error boundaries
const ErrorTrigger: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Test error for ErrorBoundary');
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
};

// Test wrapper
<ErrorBoundary>
  <ErrorTrigger />
</ErrorBoundary>
```

### Manual Testing Scenarios
1. **Component Crash** - Trigger runtime errors in components
2. **Network Failures** - Simulate API call failures
3. **Invalid Data** - Test with malformed or missing data
4. **Recovery Testing** - Verify retry mechanism works correctly

## Performance Considerations

### Minimal Overhead
- **Lightweight Implementation** - No performance impact during normal operation
- **Error State Only** - Additional rendering only when errors occur
- **Efficient Recovery** - Quick state reset on successful retry

### Memory Management
- **Error Cleanup** - Properly clears error state on recovery
- **No Memory Leaks** - No persistent references to error objects
- **Component Unmounting** - Handles cleanup during component unmount

## Best Practices

### Placement Strategy
```tsx
// ✅ Good: Wrap high-level components
<ErrorBoundary>
  <App />
</ErrorBoundary>

// ✅ Good: Multiple boundaries for isolation
<ErrorBoundary>
  <Sidebar />
</ErrorBoundary>
<ErrorBoundary>
  <MainContent />
</ErrorBoundary>

// ❌ Avoid: Too granular (every button)
<ErrorBoundary>
  <Button>Click me</Button>
</ErrorBoundary>
```

### Error Logging
```tsx
// Enhanced error logging for production
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Log to console for development
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // errorTrackingService.logError(error, errorInfo);
  }
}
```

## Related Components

- [`Alert`](./Alert.md) - Used for error message display
- [`ThreeColumnLayout`](./ThreeColumnLayout.md) - Primary integration point
- [`Button`](../ui/button.md) - Used for retry mechanism

## Usage Example

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ThreeColumnLayout />
      </div>
    </ErrorBoundary>
  );
}
```

## Future Enhancements

### Planned Features
- **Error Reporting Integration** - Automatic error reporting to external services
- **Error Analytics** - Track error patterns and frequency
- **Contextual Recovery** - Smart recovery based on error type
- **Custom Error Pages** - Specialized fallback UI for different error types

### Extension Points
- **Custom Fallback Components** - Pluggable error display components
- **Error Categorization** - Different handling for different error types
- **Recovery Strategies** - Configurable retry logic and timeouts
- **User Feedback** - Allow users to report errors with context

This component provides the foundation for robust error handling throughout CChorus, ensuring a professional user experience even when unexpected errors occur.