# Error Boundary Implementation

This project includes a comprehensive error boundary system to handle and display errors gracefully.

## Components

### 1. ErrorBoundary (`/src/shared/components/ErrorBoundary.tsx`)

- **Class-based component** that catches JavaScript errors in React component tree
- **Internationalized** error messages using next-intl
- **Development mode** shows technical details and stack traces
- **Recovery options**: Try Again, Go Home, Refresh Page
- **Custom fallback UI** support

### 2. AsyncErrorBoundary (`/src/shared/components/AsyncErrorBoundary.tsx`)

- **Extends ErrorBoundary** with async error handling
- **Catches unhandled promise rejections** and converts them to catchable errors
- **Global error handler** for window errors
- **Automatic cleanup** of event listeners

### 3. Global Error Pages

- **`/src/app/global-error.tsx`**: Handles critical application-level errors
- **`/src/app/[locale]/error.tsx`**: Handles route-specific errors with internationalization

## Hooks

### 1. useErrorHandler (`/src/shared/hooks/useErrorHandler.ts`)

```typescript
const { handleError, handleAsyncError } = useErrorHandler({
  onError: (error) => console.log('Custom error handling'),
  rethrow: true, // Whether to rethrow error to trigger error boundary
});

// For sync errors
try {
  riskyOperation();
} catch (error) {
  handleError(error);
}

// For async operations
const safeAsyncOperation = handleAsyncError(async () => {
  await riskyAsyncOperation();
});
```

### 2. useThrowError (`/src/shared/hooks/useErrorHandler.ts`)

```typescript
const throwError = useThrowError();

// Manually trigger error boundary
const handleClick = () => {
  throwError('Something went wrong!');
};
```

## Integration

### Layout Integration

The AsyncErrorBoundary is integrated at the root layout level:

```tsx
// /src/app/[locale]/layout.tsx
<NextIntlClientProvider messages={messages}>
  <AsyncErrorBoundary>
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  </AsyncErrorBoundary>
</NextIntlClientProvider>
```

### Translation Keys

Error boundary messages are internationalized with these keys:

```json
{
  "ErrorBoundary": {
    "title": "Something went wrong",
    "description": "We're sorry, but something unexpected happened. Please try again.",
    "technicalDetails": "Technical Details",
    "tryAgain": "Try Again",
    "goHome": "Go to Home",
    "refresh": "Refresh Page"
  }
}
```

## Usage Examples

### Basic Component Protection

```tsx
import { ErrorBoundary } from '@/shared/components';

function MyComponent() {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Custom Error Handling

```tsx
import { ErrorBoundary } from '@/shared/components';

function MyComponent() {
  const handleError = (error: Error) => {
    // Log to external service
    logErrorToService(error);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Manual Error Triggering

```tsx
import { useThrowError } from '@/shared/hooks';

function MyComponent() {
  const throwError = useThrowError();

  const handleError = () => {
    throwError('Manual error triggered');
  };

  return <button onClick={handleError}>Trigger Error</button>;
}
```

## Error Types Handled

1. **React Component Errors**: Caught by ErrorBoundary
2. **Async Errors**: Handled by useErrorHandler hook
3. **Unhandled Promise Rejections**: Caught by AsyncErrorBoundary
4. **Global JavaScript Errors**: Caught by AsyncErrorBoundary
5. **Server-side Errors**: Handled by Next.js error pages
6. **Route-level Errors**: Handled by [locale]/error.tsx

## Development Features

- **Stack traces** shown in development mode
- **Error test component** for testing error boundaries
- **Console logging** of all errors
- **Error digest IDs** for tracking

## Production Features

- **User-friendly error messages**
- **Recovery options** (retry, go home, refresh)
- **Internationalized content**
- **Clean error reporting** without sensitive information

## Best Practices

1. **Wrap risky components** with ErrorBoundary
2. **Use useErrorHandler** for async operations
3. **Provide custom onError callbacks** for logging
4. **Test error scenarios** during development
5. **Monitor error patterns** in production

The error boundary system provides comprehensive error handling while maintaining a good user experience and helpful development tools.
