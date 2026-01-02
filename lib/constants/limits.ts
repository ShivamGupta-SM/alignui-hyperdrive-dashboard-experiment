/**
 * Limits, Thresholds & Timeouts
 *
 * Centralized configuration values for limits, thresholds, and timing.
 */

// ============================================================================
// LIMITS
// ============================================================================

export const LIMITS = {
	BATCH_FETCH_SIZE: 1000,
	DEFAULT_TAKE: 20,
	PASSWORD_MIN_LENGTH: 12,
	QR_CODE_SIZE: 200,
} as const

// ============================================================================
// THRESHOLDS
// ============================================================================

export const THRESHOLDS = {
	/** Hours after which an enrollment is considered overdue */
	ENROLLMENT_OVERDUE_HOURS: 48,
	/** Seconds before session timeout to show warning */
	SESSION_WARNING_SECONDS: 300,
	/** 30 minutes inactivity timeout */
	INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,
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
	FILE_DOWNLOAD_CLEANUP: 100,
	FILE_UPLOAD_TIMEOUT: 30000,

	// Auto-save intervals
	AUTO_SAVE_LOCAL: 1000,
	AUTO_SAVE_BACKEND: 3000,

	// UI feedback delays
	REDIRECT_DELAY: 500,
	SAVED_INDICATOR: 2000,
	OAUTH_DELAY: 1000,
	RESEND_COOLDOWN_SEC: 1,
} as const

// ============================================================================
// CACHE TTL VALUES
// ============================================================================

export const CACHE_TTL = {
	ORGANIZATIONS: 30000,
	USER_PROFILE: 60000,
	DASHBOARD_STATS: 30000,
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
	/** Max characters for initials */
	INITIALS_LENGTH: 2,
} as const

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
// DEFAULTS
// ============================================================================

export const DEFAULT_SUBMISSION_DEADLINE_DAYS = 45
export const MIN_WALLET_BALANCE_WARNING = 10000

// ============================================================================
// TAX RATES
// ============================================================================

export const TAX_RATES = {
	/** Standard GST rate in India (18%) */
	GST_STANDARD: 18,
	/** TDS rate - calculated by backend during payout */
	TDS_DEFAULT: 0,
} as const
