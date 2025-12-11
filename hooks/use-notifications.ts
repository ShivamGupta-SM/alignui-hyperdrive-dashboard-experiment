'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ApiResponse, ApiError, PaginatedResponse } from '@/lib/types'
import { STALE_TIMES } from '@/lib/types'
import { DURATIONS } from '@/lib/types/constants'
import type { MockNotification } from '@/lib/mocks'

// Retry configuration - don't retry on 4xx errors
const shouldRetry = (failureCount: number, error: AxiosError<ApiError>) => {
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return false
  }
  return failureCount < 3
}

// ============================================
// Types
// ============================================

export interface NotificationFilters {
  type?: 'campaign' | 'enrollment' | 'wallet' | 'team' | 'system'
  unreadOnly?: boolean
  page?: number
  limit?: number
}

// ============================================
// Query Keys
// ============================================

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated notifications
 */
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => get<PaginatedResponse<MockNotification>>('/api/notifications', { params: filters }),
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
  })
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => get<ApiResponse<{ count: number }>>('/api/notifications/unread-count'),
    staleTime: STALE_TIMES.REALTIME,
    retry: shouldRetry,
    select: (response) => {
      if (response.success) {
        return response.data.count
      }
      return 0
    },
    refetchInterval: DURATIONS.NOTIFICATION_REFETCH_MS,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Mark a single notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      post<ApiResponse<MockNotification>>(`/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      post<ApiResponse<{ message: string; count: number }>>('/api/notifications/mark-all-read', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
