/**
 * Constants Index
 *
 * Centralized re-exports from feature-specific constant files.
 * Import from @/lib/constants for all constant needs.
 */

// URLs & Contact
export {
	EXTERNAL_URLS,
	CONTACT_INFO,
	PLATFORM_INFO,
} from "./urls"

// Limits, Thresholds & Timeouts
export {
	LIMITS,
	THRESHOLDS,
	BALANCE_THRESHOLDS,
	TIMEOUTS,
	CACHE_TTL,
	DISPLAY_LIMITS,
	CAMPAIGN_ENDING_SOON_DAYS,
	CAMPAIGN_SEARCH_DEBOUNCE_MS,
	MAX_RETRY_DELAY_MS,
	DEFAULT_RETRY_COUNT,
	DEFAULT_SUBMISSION_DEADLINE_DAYS,
	MIN_WALLET_BALANCE_WARNING,
	TAX_RATES,
} from "./limits"

// UI Constants
export { UI_DEFAULTS } from "./ui"
export type { ViewMode } from "./ui"

// Status Arrays & Configs
export {
	// Status arrays
	CAMPAIGN_STATUSES,
	ENROLLMENT_STATUSES,
	INVOICE_STATUSES,
	ORGANIZATION_STATUSES,
	// Status configs
	ORGANIZATION_STATUS_CONFIG,
	CAMPAIGN_STATUS_CONFIG,
	ENROLLMENT_STATUS_CONFIG,
	INVOICE_STATUS_CONFIG,
	TRANSACTION_TYPE_CONFIG,
	// Status tabs
	CAMPAIGN_STATUS_TABS,
	ENROLLMENT_STATUS_TABS,
	// Helper functions
	getEnrollmentBadgeStatus,
	getEnrollmentStatusBadgeStatus,
	getCampaignStatusBadgeStatus,
	getEnrollmentStatusLabel,
	getCampaignStatusLabel,
	// Dropdown options
	ROLE_OPTIONS,
	BUSINESS_TYPE_OPTIONS,
	INDUSTRY_CATEGORY_OPTIONS,
	CAMPAIGN_TYPE_OPTIONS,
	DELIVERABLE_TYPE_OPTIONS,
	REJECTION_REASONS,
} from "./statuses"

// Location Data
export {
	INDIA_ISO_CODE,
	INDIAN_STATES,
	getIndianStateByName,
	getCitiesOfState,
	getAllIndianCities,
	E_COMMERCE_PLATFORMS,
	PRODUCT_CATEGORIES,
	PLATFORM_COLORS,
	getPlatformColor,
	GST_STATE_CODES,
	getStateFromGSTCode,
} from "./locations"

// Storage Keys
export {
	STORAGE_KEYS,
	STORAGE_KEY_PATTERNS,
	clearOnboardingStorage,
	clearSessionStorage,
} from "./storage-keys"
export type { StorageKey } from "./storage-keys"

// Edge-compatible Auth Constants
export {
	AUTH_COOKIE_NAMES,
	AUTH_COOKIE_PRIMARY,
	getAuthTokenFromCookies,
	hasAuthCookie,
} from "./edge"

// Query Config (page sizes)
export { DEFAULT_PAGE_SIZE, PAGE_SIZE } from "@/lib/utils/query-config"
