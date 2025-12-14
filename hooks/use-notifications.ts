"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/encore-browser"
import type { notifications } from "@/lib/encore-browser"

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

const notificationKeys = {
	all: ["notifications"] as const,
	list: (filters?: NotificationFilters) => [...notificationKeys.all, "list", filters] as const,
	unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
	detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
	preferences: () => [...notificationKeys.all, "preferences"] as const,
}

// ============================================
// Hooks
// ============================================

/**
 * Fetch notifications list
 */
export function useNotifications(filters?: NotificationFilters) {
	return useQuery({
		queryKey: notificationKeys.list(filters),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.listNotifications({
				skip: ((filters?.page ?? 1) - 1) * (filters?.limit ?? 20),
				take: filters?.limit ?? 20,
				unreadOnly: filters?.unreadOnly,
			})
			return response
		},
	})
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.getUnreadCount()
			return response.count
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	})
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAllAsRead()
		},
		onSuccess: () => {
			// Invalidate all notification queries
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
}

/**
 * Mark a single notification as read
 */
export function useMarkNotificationRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (notificationId: string) => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAsRead(notificationId)
		},
		onSuccess: () => {
			// Invalidate notification queries
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
	return useQuery({
		queryKey: notificationKeys.preferences(),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.listPreferences()
			return response
		},
	})
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (preferences: notifications.UpdatePreferenceRequest) => {
			const client = getEncoreBrowserClient()
			await client.notifications.updatePreference(preferences)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() })
		},
	})
}

