import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../lib/http-client';
import { useToast } from './useToast';

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
    try {
      const response = await httpClient.request(url, {
        method: options?.method || 'GET',
        data: options?.body ? JSON.parse(options.body as string) : undefined,
        headers: options?.headers as Record<string, string>,
        skipRefresh: options?.skipRefresh,
      });

      if (response.status >= 400) {
        const errorData = response.data || { message: 'Request failed' };
        throw errorData;
      }

      return response.data;
    } catch (error: any) {
      // Re-throw the error to be handled by React Query or the calling component
      throw error.response?.data || error;
    }
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
