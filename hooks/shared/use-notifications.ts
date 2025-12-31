"use client"

/**
 * Notification Hooks - Consolidated Re-exports
 *
 * SSOT: All notification logic is now in @/features/notifications
 * This file provides re-exports for backward compatibility.
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
// Legacy aliases for backward compatibility
// ============================================

import { useQuery } from "@tanstack/react-query"
import { useMarkAllAsRead as useMarkAllAsReadPrimary } from "@/features/notifications/hooks/use-notifications"
import { isNovuEnabled } from "./use-novu"
import type { BackendNotification, NotificationFilters } from "@/features/notifications/types"

/**
 * @deprecated Use Novu React hooks for notification lists
 * Backend doesn't have listNotifications endpoint - returns empty data
 */
export function useNotifications(_filters?: NotificationFilters) {
	return useQuery({
		queryKey: ["notifications", "list-legacy", _filters?.type ?? "all"],
		queryFn: async () => ({
			notifications: [] as BackendNotification[],
			isLoading: false,
			isFetching: false,
			hasMore: false,
			fetchMore: async () => {},
			refetch: async () => {},
		}),
		staleTime: 30 * 1000,
		enabled: !isNovuEnabled(),
	})
}

/**
 * @deprecated Use useUnreadCount from @/features/notifications
 */
export { useUnreadCount as useUnreadNotificationCount } from "@/features/notifications/hooks/use-notifications"

/**
 * @deprecated Use useMarkAllAsRead from @/features/notifications
 */
export { useMarkAllAsRead as useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-notifications"

/**
 * @deprecated Use useMarkAllAsRead - backend doesn't support single notification marking
 */
export function useMarkNotificationRead() {
	return useMarkAllAsReadPrimary()
}
