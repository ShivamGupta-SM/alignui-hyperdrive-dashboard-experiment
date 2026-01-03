/**
 * Shared Data Hooks
 *
 * Hooks for fetching shared/cross-feature data.
 * Explicit exports for better tree-shaking and clarity.
 */

// Dashboard hooks
export { dashboardKeys, useDashboard } from "./use-dashboard"
export type { DashboardData } from "./use-dashboard"

// Current organization hook (SSOT for URL-based org)
export { useCurrentOrganization } from "./use-current-organization"
export type { UseCurrentOrganizationReturn } from "./use-current-organization"

// Debounce search hook (replaces duplicated debounce logic)
export { useDebounceSearch } from "./use-debounce-search"
export type { UseDebounceSearchOptions, UseDebounceSearchReturn } from "./use-debounce-search"

// Draft form persistence hook
export { useDraftForm } from "./use-draft-form"
export type { UseDraftFormOptions } from "./use-draft-form"

// Backend notification hooks (fallback when Novu not configured)
export {
	notificationKeys,
	useNotifications,
	useUnreadNotificationCount,
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "./use-notifications"
export type {
	NotificationType,
	NotificationChannel,
	Notification,
	NotificationPreference,
	NotificationFilters,
} from "./use-notifications"

// Novu utilities
export {
	novuKeys,
	isNovuEnabled,
	getNovuAppId,
	getNovuApiUrl,
	getNovuWsUrl,
} from "./use-novu"

// Export utilities
export {
	useExport,
	dateTransform,
	currencyTransform,
	booleanTransform,
	createCampaignExportColumns,
	createEnrollmentExportColumns,
	createProductExportColumns,
} from "./use-export"
export type {
	ExportFormat,
	ExportColumn,
	UseExportOptions,
	UseExportReturn,
} from "./use-export"
