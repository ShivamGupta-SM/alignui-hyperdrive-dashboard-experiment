/**
 * Notifications Feature
 *
 * Public exports for notification functionality
 */

// Types
export type { UnreadCountResponse, MarkAllAsReadResponse } from "./types"

// Hooks
export {
	notificationKeys,
	useUnreadCount,
	useMarkAllAsRead,
	useNotificationPreferences,
	useUpdateNotificationPreferences,
} from "./hooks/use-notifications"

// Actions
export { markAllNotificationsAsRead } from "./actions/notifications"
