'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import type { Platform } from '@/lib/mocks'

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Query Keys
// ============================================

export const platformKeys = {
  all: ['platforms'] as const,
  lists: () => [...platformKeys.all, 'list'] as const,
  list: () => [...platformKeys.lists()] as const,
  active: () => [...platformKeys.all, 'active'] as const,
  details: () => [...platformKeys.all, 'detail'] as const,
  detail: (id: string) => [...platformKeys.details(), id] as const,
  byName: (name: string) => [...platformKeys.all, 'name', name] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all platforms
 */
export function usePlatforms() {
  return useQuery({
    queryKey: platformKeys.list(),
    queryFn: () => get<ApiResponse<Platform[]>>('/api/platforms'),
    staleTime: STALE_TIMES.STATIC, // Platforms rarely change
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch active platforms only
 */
export function useActivePlatforms() {
  return useQuery({
    queryKey: platformKeys.active(),
    queryFn: () => get<ApiResponse<Platform[]>>('/api/platforms/active'),
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch single platform by ID
 */
export function usePlatform(id: string) {
  return useQuery({
    queryKey: platformKeys.detail(id),
    queryFn: () => get<ApiResponse<Platform>>(`/api/platforms/${id}`),
    enabled: !!id,
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}

/**
 * Fetch platform by name/slug
 */
export function usePlatformByName(name: string) {
  return useQuery({
    queryKey: platformKeys.byName(name),
    queryFn: () => get<ApiResponse<Platform>>(`/api/platforms/name/${encodeURIComponent(name)}`),
    enabled: !!name,
    staleTime: STALE_TIMES.STATIC,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data
      }
      throw new Error(response.error)
    },
  })
}
