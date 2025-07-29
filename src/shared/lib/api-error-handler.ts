'use client';

import { useToast } from '../hooks/useToast';

/**
 * Utility functions for handling API errors with toast notifications
 */
export function useApiError() {
  const { showError, showGenericError } = useToast();

  const handleApiError = (error: unknown, customMessage?: string) => {
    if (customMessage) {
      showError(customMessage);
    } else if (error instanceof Error) {
      showError(error.message);
    } else {
      showGenericError();
    }
  };

  const createApiError = (response: Response, defaultMessage: string) => {
    return response
      .json()
      .then((data) => new Error(data.message || defaultMessage))
      .catch(() => new Error(defaultMessage));
  };

  return {
    handleApiError,
    createApiError,
  };
}

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  errorMessage?: string
): T {
  return ((...args: any[]) => {
    return apiCall(...args).catch((error: unknown) => {
      // Let the calling component handle the error with toast
      throw error;
    });
  }) as T;
}
