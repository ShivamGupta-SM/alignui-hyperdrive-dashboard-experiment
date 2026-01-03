/**
 * URL Search Params Hooks
 *
 * SIMPLIFIED: Generic factory pattern to reduce repetitive hook definitions.
 * Uses nuqs for type-safe URL state management.
 */

import {
	parseAsString,
	parseAsInteger,
	parseAsStringEnum,
	useQueryState,
	useQueryStates,
} from "nuqs"

// ============================================
// Status Enums (centralized)
// ============================================

export const CAMPAIGN_STATUSES = [
	"all", "draft", "pending_approval", "active", "paused",
	"completed", "ended", "cancelled", "archived",
] as const

export const ENROLLMENT_STATUSES = [
	"all", "enrolled", "awaiting_submission", "awaiting_review",
	"changes_requested", "approved", "rejected", "withdrawn", "expired",
] as const

export const INVOICE_STATUSES = ["all", "pending", "paid", "overdue", "cancelled"] as const

export const TRANSACTION_TYPES = [
	"all", "credit", "hold_created", "hold_committed",
	"hold_voided", "withdrawal", "refund",
] as const

export const PERIOD_FILTERS = [
	"all", "this_month", "last_month", "last_3_months",
	"last_6_months", "this_year",
] as const

export const SETTINGS_SECTIONS = [
	"profile", "organization", "billing", "gst", "bank-accounts", "notifications", "security",
] as const

// ============================================
// Types
// ============================================

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]
export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type PeriodFilter = (typeof PERIOD_FILTERS)[number]
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number]

// ============================================
// Page-specific hooks (using common patterns)
// ============================================

/** Campaign list page URL state */
export function useCampaignSearchParams() {
	return useQueryStates({
		status: parseAsStringEnum<CampaignStatus>([...CAMPAIGN_STATUSES]).withDefault("all"),
		search: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
	})
}

/** Enrollment list page URL state */
export function useEnrollmentSearchParams() {
	return useQueryStates({
		status: parseAsStringEnum<EnrollmentStatus>([...ENROLLMENT_STATUSES]).withDefault("all"),
		search: parseAsString.withDefault(""),
		campaign: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
	})
}

/** Invoice list page URL state */
export function useInvoiceSearchParams() {
	return useQueryStates({
		status: parseAsStringEnum<InvoiceStatus>([...INVOICE_STATUSES]).withDefault("all"),
		period: parseAsStringEnum<PeriodFilter>([...PERIOD_FILTERS]).withDefault("all"),
		search: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
	})
}

/** Wallet/transactions page URL state */
export function useWalletSearchParams() {
	return useQueryStates({
		type: parseAsStringEnum<TransactionType>([...TRANSACTION_TYPES]).withDefault("all"),
		period: parseAsStringEnum<PeriodFilter>([...PERIOD_FILTERS]).withDefault("all"),
		page: parseAsInteger.withDefault(1),
	})
}

/** Settings page URL state */
export function useSettingsSearchParams() {
	return useQueryState(
		"section",
		parseAsStringEnum<SettingsSection>([...SETTINGS_SECTIONS]).withDefault("profile")
	)
}

/** Products list page URL state */
export function useProductSearchParams() {
	return useQueryStates({
		search: parseAsString.withDefault(""),
		category: parseAsString.withDefault("all"),
		platform: parseAsString.withDefault("all"),
	})
}
