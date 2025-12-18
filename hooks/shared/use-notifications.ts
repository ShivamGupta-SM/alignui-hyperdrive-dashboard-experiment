"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { isNovuEnabled } from "./use-novu"

// ============================================
// Types - Define locally since backend doesn't export these
// ============================================

export type NotificationType =
	| "campaign_approved"
	| "campaign_rejected"
	| "campaign_started"
	| "campaign_ended"
	| "enrollment_approved"
	| "enrollment_rejected"
	| "deliverable_approved"
	| "deliverable_rejected"
	| "revision_requested"
	| "withdrawal_completed"
	| "withdrawal_failed"
	| "kyc_verified"
	| "kyc_rejected"
	| "organization_approved"
	| "organization_rejected"
	| "payment_received"
	| "invoice_generated"
	| "invoice_overdue"
	| "system_announcement"
	| "general"

export type NotificationChannel = "in_app" | "email" | "push"

export interface Notification {
	id: string
	type: NotificationType
	title: string
	body: string
	isRead: boolean
	createdAt: string
	data?: Record<string, unknown>
}

export interface NotificationPreference {
	type: NotificationType
	channels: NotificationChannel[]
	enabled: boolean
}

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
 * Hook to fetch notifications
 *
 * Note: When Novu is configured, use @novu/react hooks directly:
 * ```tsx
 * import { useNotifications } from '@novu/react'
 * const { notifications } = useNotifications()
 * ```
 *
 * This hook returns an empty list since the backend doesn't have listNotifications.
 * The app should use Novu's React hooks for actual notification lists.
 */
export function useNotifications(_filters?: NotificationFilters) {
	return useQuery({
		queryKey: notificationKeys.list(_filters),
		queryFn: async () => {
			// Backend doesn't have listNotifications - use Novu React hooks instead
			return {
				notifications: [] as Notification[],
				isLoading: false,
				isFetching: false,
				hasMore: false,
				fetchMore: async () => {},
				refetch: async () => {},
			}
		},
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
		enabled: !isNovuEnabled(),
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
		staleTime: 30 * 1000,
		refetchOnWindowFocus: true,
		enabled: !isNovuEnabled(),
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
 * Hook to mark a single notification as read
 *
 * Note: This uses markAllAsRead as the backend doesn't have markAsRead for single notifications.
 * When Novu is configured, use @novu/react hooks directly for per-notification marking.
 */
export function useMarkNotificationRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (_notificationId: string) => {
			// Backend doesn't have markAsRead for single notifications
			// Use Novu's React hooks for this functionality
			const client = getEncoreBrowserClient()
			await client.notifications.markAllAsRead()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notificationKeys.all })
		},
	})
}
