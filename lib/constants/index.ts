// Hypedrive Brand Dashboard - Constants

import type { OrganizationStatus, BusinessType, IndustryCategory } from "@/features/organizations/types"
import type { CampaignStatus, CampaignType, DeliverableType } from "@/features/campaigns/types"
import type { EnrollmentStatus } from "@/features/enrollments/types"
import type { InvoiceStatus } from "@/features/invoices/types"
import type { UserRole } from "@/features/team/types"
import type { TransactionType } from "@/features/wallet/types"
import { State, City } from "country-state-city"

// ============================================================================
// EXTERNAL URLS - Centralized external service URLs
// ============================================================================

export const EXTERNAL_URLS = {
	QR_CODE_API: "https://api.qrserver.com/v1/create-qr-code",
	WHATSAPP_SUPPORT: "https://wa.me/919876543210",
} as const

// ============================================================================
// CONTACT INFO - Centralized contact information
// ============================================================================

export const CONTACT_INFO = {
	EMAIL: "hello@hypedrive.com",
	PHONE: "+91 98765 43210",
	WHATSAPP_NUMBER: "919876543210",
	OFFICE_LOCATION: "Bengaluru, Karnataka, India",
} as const

// ============================================================================
// LIMITS - Centralized limit values
// ============================================================================

export const LIMITS = {
	BATCH_FETCH_SIZE: 1000, // Max items to fetch in batch operations
	DEFAULT_TAKE: 20, // Default page size for list endpoints
	PASSWORD_MIN_LENGTH: 12,
	QR_CODE_SIZE: 200,
} as const

// ============================================================================
// THRESHOLDS - Time-based thresholds for alerts and warnings
// ============================================================================

export const THRESHOLDS = {
	ENROLLMENT_OVERDUE_HOURS: 48, // Hours after which an enrollment is considered overdue
	SESSION_WARNING_SECONDS: 300, // Seconds before session timeout to show warning
	INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes inactivity timeout
} as const

// ============================================================================
// UI DEFAULTS - Centralized view preferences
// ============================================================================

export const UI_DEFAULTS = {
	VIEW_MODE: "grid" as const,
	TABLE_PAGE_SIZE: 50,
	SHOW_ADVANCED_FILTERS: false,
} as const

export type ViewMode = "grid" | "list"

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================

// OrganizationStatus = ApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "banned"
export const ORGANIZATION_STATUS_CONFIG: Record<
	OrganizationStatus,
	{
		label: string
		color: "yellow" | "green" | "red" | "gray"
		description: string
	}
> = {
	draft: {
		label: "Draft",
		color: "gray",
		description: "Not yet submitted",
	},
	pending: {
		label: "Pending Approval",
		color: "yellow",
		description: "Awaiting admin review",
	},
	approved: {
		label: "Active",
		color: "green",
		description: "Fully operational",
	},
	rejected: {
		label: "Rejected",
		color: "red",
		description: "Application rejected",
	},
	banned: {
		label: "Banned",
		color: "red",
		description: "Account banned",
	},
}

// SSOT: All valid campaign statuses as an array (derived from CampaignStatus type)
// Use this for validation, filtering, and type guards
export const CAMPAIGN_STATUSES = [
	"draft",
	"pending_approval",
	"rejected",
	"approved",
	"active",
	"paused",
	"ended",
	"expired",
	"completed",
	"cancelled",
	"archived",
] as const satisfies readonly CampaignStatus[]

// SSOT: All valid enrollment statuses as an array (derived from EnrollmentStatus type)
// Centralized here - import from @/lib/constants instead of validations.ts
export const ENROLLMENT_STATUSES = [
	"awaiting_submission",
	"awaiting_review",
	"changes_requested",
	"approved",
	"permanently_rejected",
	"withdrawn",
	"expired",
] as const satisfies readonly EnrollmentStatus[]

// SSOT: All valid invoice statuses as an array
export const INVOICE_STATUSES = [
	"draft",
	"sent",
	"viewed",
	"paid",
	"overdue",
	"cancelled",
	"unpaid",
	"partially_paid",
] as const satisfies readonly InvoiceStatus[]

// SSOT: All valid organization statuses as an array
export const ORGANIZATION_STATUSES = [
	"draft",
	"pending",
	"approved",
	"rejected",
	"banned",
] as const satisfies readonly OrganizationStatus[]

export const CAMPAIGN_STATUS_CONFIG: Record<
	CampaignStatus,
	{
		label: string
		color: "yellow" | "orange" | "blue" | "green" | "gray" | "red"
		iconName:
			| "draft"
			| "pending"
			| "rejected"
			| "approved"
			| "active"
			| "paused"
			| "ended"
			| "expired"
			| "completed"
			| "cancelled"
			| "archived"
		description: string
		footerMessage: string
		footerColor: string
	}
> = {
	draft: {
		label: "Draft",
		color: "yellow",
		iconName: "draft",
		description: "Being edited",
		footerMessage: "Complete setup to launch",
		footerColor: "text-warning-base",
	},
	pending_approval: {
		label: "Pending Approval",
		color: "orange",
		iconName: "pending",
		description: "Awaiting admin review",
		footerMessage: "Under review",
		footerColor: "text-information-base",
	},
	rejected: {
		label: "Rejected",
		color: "red",
		iconName: "rejected",
		description: "Rejected by admin",
		footerMessage: "Rejected - review feedback",
		footerColor: "text-error-base",
	},
	approved: {
		label: "Approved",
		color: "blue",
		iconName: "approved",
		description: "Ready to activate",
		footerMessage: "Ready to activate",
		footerColor: "text-information-base",
	},
	active: {
		label: "Active",
		color: "green",
		iconName: "active",
		description: "Live and accepting enrollments",
		footerMessage: "Accepting enrollments",
		footerColor: "text-success-base",
	},
	paused: {
		label: "Paused",
		color: "gray",
		iconName: "paused",
		description: "Temporarily stopped",
		footerMessage: "Paused",
		footerColor: "text-text-soft-400",
	},
	ended: {
		label: "Ended",
		color: "gray",
		iconName: "ended",
		description: "Campaign period ended",
		footerMessage: "Campaign ended",
		footerColor: "text-text-sub-600",
	},
	expired: {
		label: "Expired",
		color: "gray",
		iconName: "expired",
		description: "Past end date without completion",
		footerMessage: "Expired",
		footerColor: "text-text-soft-400",
	},
	completed: {
		label: "Completed",
		color: "green",
		iconName: "completed",
		description: "Successfully completed",
		footerMessage: "Campaign ended",
		footerColor: "text-text-sub-600",
	},
	cancelled: {
		label: "Cancelled",
		color: "red",
		iconName: "cancelled",
		description: "Cancelled before completion",
		footerMessage: "Cancelled",
		footerColor: "text-error-base",
	},
	archived: {
		label: "Archived",
		color: "gray",
		iconName: "archived",
		description: "Historical record",
		footerMessage: "Archived",
		footerColor: "text-text-soft-400",
	},
}

export const ENROLLMENT_STATUS_CONFIG: Record<
	EnrollmentStatus,
	{
		label: string
		color: "yellow" | "blue" | "orange" | "green" | "red" | "gray"
		description: string
	}
> = {
	awaiting_submission: {
		label: "Awaiting Submission",
		color: "yellow",
		description: "Waiting for proofs",
	},
	awaiting_review: {
		label: "Awaiting Review",
		color: "blue",
		description: "Ready for brand review",
	},
	changes_requested: {
		label: "Changes Requested",
		color: "orange",
		description: "Needs shopper action",
	},
	approved: {
		label: "Approved",
		color: "green",
		description: "Approved for payout",
	},
	permanently_rejected: {
		label: "Permanently Rejected",
		color: "red",
		description: "Permanently rejected",
	},
	withdrawn: {
		label: "Withdrawn",
		color: "gray",
		description: "Shopper withdrew",
	},
	expired: {
		label: "Expired",
		color: "gray",
		description: "Deadline passed",
	},
}

// InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled" | "unpaid" | "partially_paid"
export const INVOICE_STATUS_CONFIG: Record<
	InvoiceStatus,
	{
		label: string
		color: "yellow" | "green" | "red" | "gray" | "blue" | "orange"
	}
> = {
	draft: {
		label: "Draft",
		color: "gray",
	},
	sent: {
		label: "Sent",
		color: "blue",
	},
	viewed: {
		label: "Viewed",
		color: "blue",
	},
	paid: {
		label: "Paid",
		color: "green",
	},
	overdue: {
		label: "Overdue",
		color: "red",
	},
	cancelled: {
		label: "Cancelled",
		color: "gray",
	},
	unpaid: {
		label: "Unpaid",
		color: "yellow",
	},
	partially_paid: {
		label: "Partially Paid",
		color: "orange",
	},
}

// TransactionType = "credit" | "debit" | "hold" | "release" | "hold_committed"
export const TRANSACTION_TYPE_CONFIG: Record<
	TransactionType,
	{
		label: string
		color: "green" | "red" | "blue" | "gray"
		sign: "+" | "-" | ""
	}
> = {
	credit: {
		label: "Credit",
		color: "green",
		sign: "+",
	},
	debit: {
		label: "Debit",
		color: "red",
		sign: "-",
	},
	hold: {
		label: "Hold Created",
		color: "red",
		sign: "-",
	},
	release: {
		label: "Hold Released",
		color: "green",
		sign: "+",
	},
	hold_committed: {
		label: "Hold Committed",
		color: "red",
		sign: "-",
	},
}

// ============================================================================
// DROPDOWN OPTIONS
// ============================================================================

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
	{
		value: "owner",
		label: "Owner",
		description: "Full access, cannot be removed",
	},
	{
		value: "admin",
		label: "Admin",
		description: "Manage campaigns, enrollments, wallet, team",
	},
	{
		value: "manager",
		label: "Manager",
		description: "Manage campaigns and review enrollments",
	},
	{
		value: "viewer",
		label: "Viewer",
		description: "View-only access to dashboard",
	},
]

// BUSINESS_TYPE_OPTIONS - Aligned with BUSINESS_TYPES from validations.ts (SSOT)
// All 8 business types are now included for consistency
export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
	{ value: "proprietorship", label: "Sole Proprietorship" },
	{ value: "partnership", label: "Partnership" },
	{ value: "llp", label: "LLP" },
	{ value: "pvt_ltd", label: "Private Limited" },
	{ value: "public_ltd", label: "Public Limited" },
	{ value: "trust", label: "Trust" },
	{ value: "society", label: "Society" },
	{ value: "other", label: "Other" },
]

export const INDUSTRY_CATEGORY_OPTIONS: { value: IndustryCategory; label: string }[] = [
	{ value: "electronics", label: "Electronics" },
	{ value: "fashion", label: "Fashion & Apparel" },
	{ value: "fmcg", label: "FMCG" },
	{ value: "beauty", label: "Beauty & Personal Care" },
	{ value: "home_appliances", label: "Home Appliances" },
	{ value: "sports", label: "Sports & Fitness" },
	{ value: "automotive", label: "Automotive" },
	{ value: "other", label: "Other" },
]

export const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string; description: string }[] =
	[
		{
			value: "cashback",
			label: "Cashback",
			description: "Shoppers receive cashback on purchase",
		},
		{
			value: "barter",
			label: "Barter",
			description: "Product exchange for content",
		},
		{
			value: "hybrid",
			label: "Hybrid",
			description: "Combination of cashback and barter",
		},
	]

export const DELIVERABLE_TYPE_OPTIONS: {
	value: DeliverableType
	label: string
	description: string
}[] = [
	{
		value: "order_screenshot",
		label: "Order Screenshot",
		description: "Screenshot of order confirmation",
	},
	{
		value: "delivery_photo",
		label: "Delivery Photo",
		description: "Photo of received product",
	},
	{
		value: "product_review",
		label: "Product Review",
		description: "Written review on platform",
	},
	{
		value: "social_media_post",
		label: "Social Media Post",
		description: "Post on social media",
	},
	{
		value: "unboxing_video",
		label: "Unboxing Video",
		description: "Video of product unboxing",
	},
	{
		value: "custom",
		label: "Custom",
		description: "Custom deliverable",
	},
]

// ============================================================================
// INDIA LOCATION DATA (using country-state-city package)
// ============================================================================

/** India ISO code */
export const INDIA_ISO_CODE = "IN"

/**
 * Get all Indian states from country-state-city package
 * Returns array of state names sorted alphabetically
 */
export const INDIAN_STATES = State.getStatesOfCountry(INDIA_ISO_CODE)
	.map((state) => state.name)
	.sort()

/**
 * Get state details by state name
 * @param stateName - Name of the state (e.g., "Maharashtra")
 * @returns State object with isoCode, name, etc. or undefined
 */
export function getIndianStateByName(stateName: string) {
	return State.getStatesOfCountry(INDIA_ISO_CODE).find(
		(state) => state.name.toLowerCase() === stateName.toLowerCase()
	)
}

/**
 * Get cities for a given Indian state
 * @param stateName - Name of the state (e.g., "Maharashtra")
 * @returns Array of city names sorted alphabetically
 */
export function getCitiesOfState(stateName: string): string[] {
	const state = getIndianStateByName(stateName)
	if (!state) return []
	return City.getCitiesOfState(INDIA_ISO_CODE, state.isoCode)
		.map((city) => city.name)
		.sort()
}

/**
 * Get all Indian cities (flat list)
 * @returns Array of all city names in India
 */
export function getAllIndianCities(): string[] {
	return City.getCitiesOfCountry(INDIA_ISO_CODE)
		?.map((city) => city.name)
		.sort() || []
}

export const E_COMMERCE_PLATFORMS = [
	"Amazon",
	"Flipkart",
	"Myntra",
	"Ajio",
	"Nykaa",
	"Tata CLiQ",
	"Reliance Digital",
	"Croma",
	"Any Platform",
]

export const PRODUCT_CATEGORIES = [
	"Electronics",
	"Fashion",
	"Footwear",
	"Beauty & Personal Care",
	"Home & Kitchen",
	"Sports & Fitness",
	"Toys & Games",
	"Books",
	"Automotive",
	"Other",
]

// ============================================================================
// REJECTION REASONS
// ============================================================================

export const REJECTION_REASONS = [
	{ id: "fraudulent_screenshot", label: "Fraudulent order screenshot" },
	{ id: "wrong_platform", label: "Order not from approved platform" },
	{ id: "value_mismatch", label: "Order value mismatch" },
	{ id: "fake_review", label: "Fake/plagiarized review" },
	{ id: "wrong_date", label: "Order date outside campaign period" },
	{ id: "max_rejections", label: "Exceeded maximum rejection attempts" },
	{ id: "other", label: "Other" },
]

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_SUBMISSION_DEADLINE_DAYS = 45
// DEFAULT_PAGE_SIZE - Import from @/lib/utils/query-config (SSOT)
export { DEFAULT_PAGE_SIZE, PAGE_SIZE } from "@/lib/utils/query-config"
export const MIN_WALLET_BALANCE_WARNING = 10000 // ₹10,000
// Note: INVITATION_EXPIRY_DAYS is defined in lib/types/constants.ts DURATIONS object (SSOT)
// Import from there: import { DURATIONS } from "@/lib/types/constants"

// ============================================================================
// CAMPAIGN CONSTANTS
// ============================================================================

/** Days before campaign end to show "ending soon" warning */
export const CAMPAIGN_ENDING_SOON_DAYS = 7
/** Search debounce delay in ms */
export const CAMPAIGN_SEARCH_DEBOUNCE_MS = 300
/** Maximum retry delay for failed queries in ms */
export const MAX_RETRY_DELAY_MS = 10000
/** Default retry count for failed queries */
export const DEFAULT_RETRY_COUNT = 2

// ============================================================================
// TIMEOUTS & DELAYS
// ============================================================================

export const TIMEOUTS = {
	// Debounce delays
	DEBOUNCE: 300,
	SEARCH_DEBOUNCE: 300,

	// Toast durations
	TOAST_SUCCESS: 5000,
	TOAST_ERROR: 7000,
	TOAST_INFO: 5000,

	// Polling intervals
	POLLING: 30000,

	// File operations
	FILE_DOWNLOAD_CLEANUP: 100, // Delay before revoking object URL
	FILE_UPLOAD_TIMEOUT: 30000,

	// Auto-save intervals
	AUTO_SAVE_LOCAL: 1000,
	AUTO_SAVE_BACKEND: 3000,

	// UI feedback delays
	REDIRECT_DELAY: 500, // After successful auth/action
	SAVED_INDICATOR: 2000, // "Saved" message display time
	OAUTH_DELAY: 1000, // OAuth callback processing
	RESEND_COOLDOWN_SEC: 1, // Resend button cooldown (seconds)
} as const

// ============================================================================
// PLATFORM INFO
// ============================================================================

export const PLATFORM_INFO = {
	name: "Hypedrive Technologies Pvt. Ltd.",
	gstin: "27AABCH1234C1Z5",
	email: "support@hypedrive.io",
	website: "hypedrive.io",
} as const

// ============================================================================
// TAX RATES - SSOT for all tax calculations
// ============================================================================

export const TAX_RATES = {
	/** Standard GST rate in India (18%) */
	GST_STANDARD: 18,
	/** TDS rate - calculated by backend during payout */
	TDS_DEFAULT: 0,
} as const

// ============================================================================
// STATUS FILTER TABS (for UI filtering)
// ============================================================================

export const CAMPAIGN_STATUS_TABS = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "pending_approval", label: "Pending" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
] as const

export const ENROLLMENT_STATUS_TABS = [
	{ value: "all", label: "All" },
	{ value: "awaiting_review", label: "Pending" },
	{ value: "changes_requested", label: "Changes" },
	{ value: "approved", label: "Approved" },
	{ value: "permanently_rejected", label: "Rejected" },
] as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get badge status color for enrollment status (legacy - for Badge component)
 */
export function getEnrollmentBadgeStatus(
	status: EnrollmentStatus
): "warning" | "info" | "success" | "error" | "default" {
	const statusMap: Record<EnrollmentStatus, "warning" | "info" | "success" | "error" | "default"> = {
		awaiting_submission: "warning",
		awaiting_review: "info",
		changes_requested: "warning",
		approved: "success",
		permanently_rejected: "error",
		withdrawn: "default",
		expired: "default",
	}
	return statusMap[status] ?? "default"
}

/**
 * Get StatusBadge component status for enrollment
 * Used with StatusBadge.Root status prop
 */
export function getEnrollmentStatusBadgeStatus(
	status: EnrollmentStatus
): "completed" | "pending" | "failed" | "disabled" {
	switch (status) {
		case "approved":
			return "completed"
		case "awaiting_review":
		case "awaiting_submission":
		case "changes_requested":
			return "pending"
		case "permanently_rejected":
		case "withdrawn":
		case "expired":
			return "failed"
		default:
			return "disabled"
	}
}

/**
 * Get StatusBadge component status for campaign
 * Used with StatusBadge.Root status prop
 */
export function getCampaignStatusBadgeStatus(
	status: CampaignStatus
): "completed" | "pending" | "failed" | "disabled" {
	switch (status) {
		case "active":
		case "completed":
			return "completed"
		case "draft":
		case "pending_approval":
		case "approved":
			return "pending"
		case "rejected":
		case "cancelled":
			return "failed"
		case "paused":
		case "ended":
		case "expired":
		case "archived":
			return "disabled"
		default:
			return "disabled"
	}
}

/**
 * Get human-readable label for enrollment status
 */
export function getEnrollmentStatusLabel(status: EnrollmentStatus): string {
	return ENROLLMENT_STATUS_CONFIG[status]?.label ?? status
}

/**
 * Get human-readable label for campaign status
 */
export function getCampaignStatusLabel(status: CampaignStatus): string {
	return CAMPAIGN_STATUS_CONFIG[status]?.label ?? status
}

// ============================================================================
// PLATFORM COLORS (for Product badges)
// ============================================================================

export const PLATFORM_COLORS: Record<string, string> = {
	Amazon: "bg-orange-100 text-orange-700",
	Flipkart: "bg-yellow-100 text-yellow-700",
	Myntra: "bg-pink-100 text-pink-700",
	Ajio: "bg-purple-100 text-purple-700",
	Nykaa: "bg-rose-100 text-rose-700",
	"Tata CLiQ": "bg-blue-100 text-blue-700",
	"Reliance Digital": "bg-red-100 text-red-700",
	Croma: "bg-green-100 text-green-700",
	"Any Platform": "bg-gray-100 text-gray-600",
} as const

/**
 * Get platform badge color classes
 * Falls back to gray if platform not found
 */
export function getPlatformColor(platform: string | null | undefined): string {
	if (!platform) return "bg-gray-100 text-gray-600"
	return PLATFORM_COLORS[platform] ?? "bg-gray-100 text-gray-600"
}

// ============================================================================
// GST STATE CODES (for auto-fill from GST verification)
// ============================================================================

/**
 * GST State Code to State Name mapping
 * Used for auto-filling state from GST API response
 */
export const GST_STATE_CODES: Record<string, string> = {
	"01": "Jammu & Kashmir",
	"02": "Himachal Pradesh",
	"03": "Punjab",
	"04": "Chandigarh",
	"05": "Uttarakhand",
	"06": "Haryana",
	"07": "Delhi",
	"08": "Rajasthan",
	"09": "Uttar Pradesh",
	"10": "Bihar",
	"11": "Sikkim",
	"12": "Arunachal Pradesh",
	"13": "Nagaland",
	"14": "Manipur",
	"15": "Mizoram",
	"16": "Tripura",
	"17": "Meghalaya",
	"18": "Assam",
	"19": "West Bengal",
	"20": "Jharkhand",
	"21": "Odisha",
	"22": "Chhattisgarh",
	"23": "Madhya Pradesh",
	"24": "Gujarat",
	"26": "Dadra & Nagar Haveli and Daman & Diu",
	"27": "Maharashtra",
	"28": "Andhra Pradesh",
	"29": "Karnataka",
	"30": "Goa",
	"31": "Lakshadweep",
	"32": "Kerala",
	"33": "Tamil Nadu",
	"34": "Puducherry",
	"35": "Andaman & Nicobar Islands",
	"36": "Telangana",
	"37": "Andhra Pradesh (New)",
} as const

/**
 * Get state name from GST state code
 * @param code - 2-digit GST state code (e.g., "27" for Maharashtra)
 * @returns State name or "India" if not found
 */
export function getStateFromGSTCode(code: string): string {
	return GST_STATE_CODES[code] || "India"
}

// ============================================================================
// AUTH COOKIE CONSTANTS - SSOT
// ============================================================================

/**
 * Auth cookie names to check for authentication
 * Order matters - primary cookie is first
 */
export const AUTH_COOKIE_NAMES = ["auth-token", "better-auth.session_token"] as const

/** Primary auth cookie name (used when setting/clearing) */
export const AUTH_COOKIE_PRIMARY = AUTH_COOKIE_NAMES[0]

/**
 * Get first valid auth token from cookies
 * @param getCookie - Function to get cookie value by name
 * @returns Token value or null
 */
export function getAuthTokenFromCookies(getCookie: (name: string) => string | undefined): string | null {
	for (const cookieName of AUTH_COOKIE_NAMES) {
		const value = getCookie(cookieName)
		if (value) {
			return value
		}
	}
	return null
}

/**
 * Check if any auth cookie exists
 * @param hasCookie - Function to check if cookie exists
 * @returns True if authenticated
 */
export function hasAuthCookie(hasCookie: (name: string) => boolean): boolean {
	return AUTH_COOKIE_NAMES.some(hasCookie)
}

// ============================================================================
// CACHE TTL VALUES
// ============================================================================

export const CACHE_TTL = {
	ORGANIZATIONS: 30000, // 30 seconds
	USER_PROFILE: 60000, // 1 minute
	DASHBOARD_STATS: 30000, // 30 seconds
} as const

// ============================================================================
// DISPLAY LIMITS (for UI slicing/pagination)
// ============================================================================

export const DISPLAY_LIMITS = {
	/** Priority enrollments shown on dashboard */
	PRIORITY_ENROLLMENTS: 3,
	/** Top campaigns shown on dashboard */
	TOP_CAMPAIGNS: 3,
	/** Product preview limit */
	PRODUCT_PREVIEW: 10,
	/** Default table page size */
	TABLE_PAGE_SIZE: 50,
	/** Activity feed items */
	ACTIVITY_FEED: 20,
	/** Recent items in command menu */
	RECENT_ITEMS: 5,
	/** Max characters for initials (e.g. "JD" for "John Doe") */
	INITIALS_LENGTH: 2,
} as const

// ============================================================================
// BALANCE THRESHOLDS (for wallet warnings)
// ============================================================================

export const BALANCE_THRESHOLDS = {
	/** Low balance warning threshold - ₹50,000 */
	LOW_WARNING: 50000,
	/** Critical balance threshold - ₹10,000 */
	CRITICAL: 10000,
} as const

// ============================================================================
// RE-EXPORTS - Centralized storage keys and validators
// ============================================================================

export { STORAGE_KEYS, STORAGE_KEY_PATTERNS, clearOnboardingStorage, clearSessionStorage } from "./storage-keys"
export type { StorageKey } from "./storage-keys"

