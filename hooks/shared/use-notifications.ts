"use client"

/**
 * Notification Hooks - Re-exports from SSOT location
 *
 * All notification logic is in @/features/notifications
 * This file provides convenient re-exports.
 *
 * For new code, import directly from:
 * ```tsx
 * import { useUnreadCount, useMarkAllAsRead } from "@/features/notifications"
 * ```
 */

// ============================================
// Re-exports from SSOT location
// ============================================

// Primary hooks from features/notifications
export {
	notificationKeys,
	useUnreadCount,
	useNotificationPreferences,
	useMarkAllAsRead,
	useUpdateNotificationPreferences,
} from "@/features/notifications/hooks/use-notifications"

// Types from SSOT
export type {
	NotificationType,
	NotificationChannel,
	Notification,
	BackendNotification,
	NotificationPreference,
	NotificationFilters,
} from "@/features/notifications/types"

// Novu check
export { isNovuEnabled } from "./use-novu"

// ============================================
// Deprecated aliases - will be removed
// ============================================

import { useQuery, useMutation } from "@tanstack/react-query"
import { useMarkAllAsRead as useMarkAllAsReadPrimary, useUnreadCount as useUnreadCountPrimary } from "@/features/notifications/hooks/use-notifications"
import { isNovuEnabled } from "./use-novu"
import type { BackendNotification, NotificationFilters } from "@/features/notifications/types"

/**
 * @deprecated Use Novu React hooks for notification lists
 */
export function useNotifications(_filters?: NotificationFilters) {
	return useQuery({
		queryKey: ["notifications", "list-legacy"],
		queryFn: async () => ({
			notifications: [] as BackendNotification[],
			hasMore: false,
		}),
		staleTime: Number.POSITIVE_INFINITY,
		enabled: !isNovuEnabled(),
	})
}

/** @deprecated Use useUnreadCount from @/features/notifications */
export const useUnreadNotificationCount = useUnreadCountPrimary

/** @deprecated Use useMarkAllAsRead from @/features/notifications */
export const useMarkAllNotificationsRead = useMarkAllAsReadPrimary

/** @deprecated Backend doesn't support single notification marking */
export function useMarkNotificationRead() {
	return useMutation({
		mutationFn: async () => {},
	})
}
