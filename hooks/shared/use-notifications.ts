"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { notifications } from "@/lib/api/encore-browser"
import { isNovuEnabled } from "./use-novu"

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
	all: ["notifications"] as const,
	lists: () => [...notificationKeys.all, "list"] as const,
	list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
	detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
	counts: () => [...notificationKeys.all, "counts"] as const,
	preferences: () => [...notificationKeys.all, "preferences"] as const,
}

// ============================================
// Hooks - Backend API (Fallback when Novu not configured)
// ============================================

/**
 * Hook to fetch notifications from backend API
 * 
 * Note: When Novu is configured, use @novu/react hooks directly:
 * ```tsx
 * import { useNotifications } from '@novu/react'
 * const { notifications } = useNotifications()
 * ```
 * 
 * This hook is for fallback when Novu is not configured.
 */
export function useNotifications(filters?: NotificationFilters) {
	return useQuery({
		queryKey: notificationKeys.list(filters),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.listNotifications({
				skip: ((filters?.page || 1) - 1) * (filters?.limit || 50),
				take: filters?.limit || 50,
				type: filters?.type,
				unreadOnly: filters?.unreadOnly,
			})
			return {
				notifications: response.data.map((n) => ({
					...n,
					read: n.isRead,
					isRead: n.isRead,
				})),
				isLoading: false,
				isFetching: false,
				hasMore: response.hasMore,
				fetchMore: async () => {},
				refetch: async () => {},
			}
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		enabled: !isNovuEnabled(), // Only use when Novu is NOT enabled
	})
}

/**
 * Hook to get unread notification count from backend API
 * 
 * Note: When Novu is configured, use @novu/react hooks directly:
 * ```tsx
 * import { useCounts } from '@novu/react'
 * const { counts } = useCounts({ filters: [{ read: false }] })
 * const unreadCount = counts?.[0]?.count || 0
 * ```
 */
export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: notificationKeys.counts(),
		queryFn: async () => {
			const client = getEncoreBrowserClient()
			const response = await client.notifications.getUnreadCount()
			return response.count
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: true,
		enabled: !isNovuEnabled(), // Only use when Novu is NOT enabled
	})
}

/**
 * Hook to mark all notifications as read via backend API
 * 
 * Note: When Novu is configured, use @novu/react hooks directly:
 * ```tsx
 * import { useNovu } from '@novu/react'
 * const { markAllAsRead } = useNovu()
 * await markAllAsRead()
 * ```
 */
export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async () => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAllAsRead()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
}

/**
 * Hook to mark a single notification as read via backend API
 * 
 * Note: When Novu is configured, use @novu/react hooks directly:
 * ```tsx
 * import { useNovu } from '@novu/react'
 * const { markNotificationAsRead } = useNovu()
 * await markNotificationAsRead(notificationId)
 * ```
 */
export function useMarkNotificationRead() {
	const queryClient = useQueryClient()
	
	return useMutation({
		mutationFn: async (notificationId: string) => {
			const client = getEncoreBrowserClient()
			await client.notifications.markAsRead(notificationId)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
}
