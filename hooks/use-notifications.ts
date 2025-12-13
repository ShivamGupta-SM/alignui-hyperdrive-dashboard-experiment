'use client'

import type { notifications } from '@/lib/encore-browser'

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
