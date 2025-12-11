'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import type { DeliverableType } from '@/lib/mocks'

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

export const deliverableKeys = {
  all: ['deliverables'] as const,
  lists: () => [...deliverableKeys.all, 'list'] as const,
  list: () => [...deliverableKeys.lists()] as const,
  details: () => [...deliverableKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliverableKeys.details(), id] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch all active deliverable types
 */
export function useDeliverables() {
  return useQuery({
    queryKey: deliverableKeys.list(),
    queryFn: () => get<ApiResponse<DeliverableType[]>>('/api/deliverables'),
    staleTime: STALE_TIMES.STATIC, // Deliverable types rarely change
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
 * Fetch single deliverable type by ID
 */
export function useDeliverable(id: string) {
  return useQuery({
    queryKey: deliverableKeys.detail(id),
    queryFn: () => get<ApiResponse<DeliverableType>>(`/api/deliverables/${id}`),
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
