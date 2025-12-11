'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEncoreBrowserClient } from '@/lib/encore-browser'
import type { notifications } from '@/lib/encore-browser'
import { STALE_TIMES } from '@/lib/types'
import { DURATIONS } from '@/lib/types/constants'

// Re-export types from Encore for convenience
export type Notification = notifications.Notification
export type NotificationType = notifications.NotificationType
export type NotificationChannel = notifications.NotificationChannel
export type NotificationPreference = notifications.NotificationPreference

// ============================================
// Types
// ============================================

export interface NotificationFilters {
  type?: NotificationType
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
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated notifications
 */
export function useNotifications(filters: NotificationFilters = {}) {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => client.notifications.listNotifications({
      skip: filters.page ? (filters.page - 1) * (filters.limit || 20) : 0,
      take: filters.limit || 20,
      type: filters.type,
      unreadOnly: filters.unreadOnly,
    }),
    staleTime: STALE_TIMES.REALTIME,
  })
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const result = await client.notifications.getUnreadCount()
      return result.count
    },
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: DURATIONS.NOTIFICATION_REFETCH_MS,
  })
}

/**
 * Fetch notification preferences
 */
export function useNotificationPreferences() {
  const client = getEncoreBrowserClient()

  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: async () => {
      const result = await client.notifications.listPreferences()
      return result.data
    },
    staleTime: STALE_TIMES.STATIC,
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) => client.notifications.markAsRead(id),
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
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: () => client.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

/**
 * Update notification preference
 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (data: notifications.UpdatePreferenceRequest) =>
      client.notifications.updatePreference(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() })
    },
  })
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  const client = getEncoreBrowserClient()

  return useMutation({
    mutationFn: (id: string) => client.notifications.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
