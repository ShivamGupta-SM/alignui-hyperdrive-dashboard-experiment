/**
 * Notification Types
 *
 * SSOT: All notification types are defined here.
 * Re-exports namespace from brand-client and defines UI-specific types.
 */

export type { notifications } from "@/brand-client"

// =============================================================================
// Notification Type Enum - SSOT for all notification event types
// =============================================================================

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

// =============================================================================
// Notification Data Structures
// =============================================================================

/**
 * Backend notification structure (from Encore/Novu)
 */
export interface BackendNotification {
	id: string
	type: NotificationType
	title: string
	body: string
	isRead: boolean
	createdAt: string
	data?: Record<string, unknown>
}

/**
 * UI notification structure (used by NotificationsDrawer)
 */
export interface Notification {
	id: string
	userId: string
	type: NotificationType
	title: string
	message: string
	actionUrl?: string
	actionLabel?: string
	isRead: boolean
	createdAt: Date | string
}

/**
 * Notification preference setting
 */
export interface NotificationPreference {
	type: NotificationType
	channels: NotificationChannel[]
	enabled: boolean
}

/**
 * Filters for listing notifications
 */
export interface NotificationFilters {
	type?: NotificationType
	unreadOnly?: boolean
	page?: number
	limit?: number
}

// =============================================================================
// Response Types
// =============================================================================

export interface UnreadCountResponse {
	count: number
}

export interface MarkAllAsReadResponse {
	success: boolean
}
