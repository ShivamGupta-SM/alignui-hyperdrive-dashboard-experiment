'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { get, post, put, patch, del } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiError, ApiResponse, PaginatedResponse } from '@/lib/types'

// Re-export stale times for use in hooks
export { STALE_TIMES } from '@/lib/types'

// ============================================
// Default Query/Mutation Configuration
// ============================================

const DEFAULT_RETRY_COUNT = 3

// Retry function that doesn't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  // Don't retry on client errors (4xx)
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  // Retry up to 3 times for server errors
  return failureCount < DEFAULT_RETRY_COUNT
}

// ============================================
// Generic CRUD Hooks
// ============================================

/**
 * Hook for fetching a single resource
 * Returns the unwrapped data directly via select
 */
export function useFetch<T>(
  key: string | readonly unknown[],
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>, AxiosError<ApiError>, T>, 'queryKey' | 'queryFn' | 'select'>
) {
  return useQuery<ApiResponse<T>, AxiosError<ApiError>, T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => get<ApiResponse<T>>(url),
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
    retry: shouldRetry,
    ...options,
  })
}

/**
 * Hook for fetching a paginated list of resources
 * Returns the full paginated response (data + meta)
 */
export function useFetchList<T>(
  key: string | readonly unknown[],
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, AxiosError<ApiError>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? [...key, params] : [key, params]

  return useQuery<PaginatedResponse<T>, AxiosError<ApiError>>({
    queryKey,
    queryFn: () => get<PaginatedResponse<T>>(url, { params }),
    retry: shouldRetry,
    ...options,
  })
}

/**
 * Hook for creating a resource
 */
export function useCreate<TData, TVariables>(
  url: string,
  invalidationKeys: readonly unknown[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, TVariables>({
    mutationFn: (data) => post<ApiResponse<TData>>(url, data),
    onSuccess: () => {
      for (const key of invalidationKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    ...options,
  })
}

/**
 * Hook for full resource updates (PUT)
 */
export function useUpdate<TData, TVariables>(
  url: string,
  invalidationKeys: readonly unknown[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, TVariables>({
    mutationFn: (data) => put<ApiResponse<TData>>(url, data),
    onSuccess: () => {
      for (const key of invalidationKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    ...options,
  })
}

/**
 * Hook for partial updates (PATCH)
 */
export function usePatch<TData, TVariables>(
  url: string,
  invalidationKeys: readonly unknown[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, TVariables>({
    mutationFn: (data) => patch<ApiResponse<TData>>(url, data),
    onSuccess: () => {
      for (const key of invalidationKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    ...options,
  })
}

/**
 * Hook for deleting a resource
 */
export function useDelete<TData = void>(
  url: string,
  invalidationKeys: readonly unknown[][],
  options?: Omit<UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, void>({
    mutationFn: () => del<ApiResponse<TData>>(url),
    onSuccess: () => {
      for (const key of invalidationKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    ...options,
  })
}

// ============================================
// Optimistic Update Helper
// ============================================

/**
 * Creates standard optimistic update handlers for mutations
 */
export function createOptimisticHandlers<TData, TVariables, TContext extends { previousData?: TData }>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly unknown[],
  updateFn: (old: TData | undefined, variables: TVariables) => TData | undefined,
  invalidationKeys: readonly unknown[][]
) {
  return {
    onMutate: async (variables: TVariables): Promise<TContext> => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<TData>(queryKey)
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables))
      return { previousData } as TContext
    },
    onError: (_err: unknown, _variables: TVariables, context: TContext | undefined) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      for (const key of invalidationKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  }
}
