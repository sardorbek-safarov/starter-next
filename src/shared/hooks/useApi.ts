import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../lib/http-client';

// Generic API mutation hook
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}

// Simplified API call hook using TanStack Query
export function useApi() {
  const queryClient = useQueryClient();

  const request = async <TData = any>(
    url: string,
    options?: RequestInit & { skipRefresh?: boolean }
  ): Promise<TData> => {
    const response = await httpClient.request(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  };

  const invalidateQueries = (queryKeys: string[][]) => {
    queryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  const updateQueryData = <TData = any>(queryKey: string[], data: TData) => {
    queryClient.setQueryData(queryKey, data);
  };

  return {
    request,
    invalidateQueries,
    updateQueryData,
    queryClient,
  };
}
