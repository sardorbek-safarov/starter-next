import { useCallback } from 'react';

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  rethrow?: boolean;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onError, rethrow = true } = options;

  const handleError = useCallback(
    (error: Error | unknown) => {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Log the error
      console.error('Error caught by useErrorHandler:', errorObj);

      // Call the custom error handler if provided
      if (onError) {
        onError(errorObj);
      }

      // Rethrow the error to trigger error boundary if needed
      if (rethrow) {
        throw errorObj;
      }
    },
    [onError, rethrow]
  );

  // Wrapper for async functions
  const handleAsyncError = useCallback(
    (asyncFn: () => Promise<any>) => {
      return async () => {
        try {
          await asyncFn();
        } catch (error) {
          handleError(error);
        }
      };
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}

// Hook to manually trigger error boundary
export function useThrowError() {
  return useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    throw errorObj;
  }, []);
}
