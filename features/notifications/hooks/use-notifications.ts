"use client"

/**
 * Notification Hooks
 *
 * React Query hooks for notification operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@/lib/api/client"
import { STALE_TIME, REFETCH_INTERVAL, createMutationErrorHandler } from "@/lib/utils/query-config"

// =============================================================================
// Query Keys
// =============================================================================

export const notificationKeys = {
	all: ["notifications"] as const,
	unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
	preferences: () => [...notificationKeys.all, "preferences"] as const,
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Hook to get unread notification count
 * SSOT: Uses STALE_TIME.REALTIME for real-time notification counts
 */
export function useUnreadCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: () => client.notifications.getUnreadCount(),
		staleTime: STALE_TIME.REALTIME, // 30 seconds - centralized constant
		refetchInterval: REFETCH_INTERVAL.SHORT, // 1 minute - centralized constant
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
	})
}

/**
 * Hook to get notification preferences
 * SSOT: Uses STALE_TIME.MEDIUM for semi-static preference data
 */
export function useNotificationPreferences() {
	return useQuery({
		queryKey: notificationKeys.preferences(),
		queryFn: () => client.notifications.getNotificationPreferences(),
		staleTime: STALE_TIME.MEDIUM, // 5 minutes - centralized constant
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
	})
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: () => client.notifications.markAllAsRead(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationKeys.all })
		},
		onError: createMutationErrorHandler("mark notifications as read"),
	})
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (params: {
			workflowId?: string
			channels: {
				email?: boolean
				sms?: boolean
				inApp?: boolean
				push?: boolean
				chat?: boolean
			}
		}) => client.notifications.updateNotificationPreferences(params),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationKeys.preferences() })
			toast.success("Notification preferences updated")
		},
		onError: createMutationErrorHandler("update notification preferences"),
	})
}
