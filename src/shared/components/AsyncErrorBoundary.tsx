'use client';

import { ReactNode, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
}

export default function AsyncErrorBoundary({
  children,
  fallback,
  onError,
}: AsyncErrorBoundaryProps) {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      if (onError) {
        onError(error);
      }

      // Prevent the default behavior
      event.preventDefault();

      // Convert promise rejection to error that can be caught by ErrorBoundary
      setTimeout(() => {
        throw error;
      }, 0);
    };

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);

      if (onError) {
        onError(event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      window.removeEventListener('error', handleError);
    };
  }, [onError]);

  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}
