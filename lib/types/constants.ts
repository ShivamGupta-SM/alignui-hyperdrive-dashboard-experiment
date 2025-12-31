/**
 * UI/Business Logic Constants
 *
 * SSOT references:
 * - Query caching (STALE_TIME, PAGE_SIZE) → @/lib/utils/query-config
 * - GST codes, campaign constants → @/lib/constants
 * - Validation constants → @/lib/utils/validations
 */

import { PAGE_SIZE } from "@/lib/utils/query-config"
import { THRESHOLDS as BASE_THRESHOLDS, LIMITS as BASE_LIMITS } from "@/lib/constants"

// Business Logic Thresholds
// Extended from @/lib/constants THRESHOLDS (SSOT)
export const THRESHOLDS = {
	// SSOT: From @/lib/constants
	ENROLLMENT_OVERDUE_HOURS: BASE_THRESHOLDS.ENROLLMENT_OVERDUE_HOURS,
	// Password strength minimum for signup
	MIN_PASSWORD_STRENGTH: 50,
	// Approval rate threshold for positive delta display
	HIGH_APPROVAL_RATE: 80,
	// Rejection rate threshold for positive delta display
	LOW_REJECTION_RATE: 15,
	// Order value threshold for "high value" enrollments (in rupees)
	HIGH_VALUE_ORDER: 25000,
} as const

// Marketing Statistics (for landing page)
export const MARKETING_STATS = [
	{ value: "500+", label: "Active Brands" },
	{ value: "₹50Cr+", label: "Payouts Processed" },
	{ value: "1M+", label: "Enrollments" },
	{ value: "95%", label: "Approval Rate" },
] as const

// Time Duration Constants (in days unless otherwise noted)
// SSOT: This is the source of truth for time-based constants
// Note: CAMPAIGN_ENDING_SOON_DAYS is in @/lib/constants (SSOT for campaign constants)
export const DURATIONS = {
	// Session expiration in days
	SESSION_EXPIRY_DAYS: 30,
	// Team invitation expiration in days
	INVITATION_EXPIRY_DAYS: 7,
	// Default deadline for change requests in days
	CHANGE_REQUEST_DEADLINE_DAYS: 7,
	// Weeks of trend data to display
	MAX_TREND_WEEKS: 8,
	// Upload/Download URL expiration in seconds
	SIGNED_URL_EXPIRY_SECONDS: 3600,
	// Notification polling interval in milliseconds
	NOTIFICATION_REFETCH_MS: 30000,
	// Clipboard feedback timeout in milliseconds
	CLIPBOARD_FEEDBACK_MS: 2000,
} as const

// Pagination & List Limits
// Extended from @/lib/constants LIMITS (SSOT)
export const LIMITS = {
	// Default page size for lists
	DEFAULT_PAGE_SIZE: PAGE_SIZE.DEFAULT,
	// Pending enrollments limit on dashboard
	PENDING_ENROLLMENTS_LIMIT: 10,
	// Team members page size
	TEAM_MEMBERS_PAGE_SIZE: PAGE_SIZE.SMALL,
	// Category products page size
	CATEGORY_PRODUCTS_PAGE_SIZE: PAGE_SIZE.SMALL,
	// Number of 2FA backup codes to generate
	BACKUP_CODES_COUNT: 10,
	// SSOT: From @/lib/constants
	QR_CODE_SIZE: BASE_LIMITS.QR_CODE_SIZE,
	// Rating stars count
	RATING_STARS_COUNT: 5,
} as const

// Campaign Statistics
export const CAMPAIGN_STATS = {
	// Average review time in hours (for display)
	AVG_REVIEW_TIME_HOURS: 2.5,
	// Estimated withdrawal rate percentage
	WITHDRAWAL_RATE_PERCENT: 5,
} as const

// Responsive Breakpoints (in pixels)
export const BREAKPOINTS = {
	mobile: 640,
	tablet: 768,
	desktop: 1024,
	wide: 1280,
} as const

// File Size Constants (in bytes)
export const FILE_SIZES = {
	// Maximum file upload sizes
	MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
	MAX_FILE_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
	MAX_PRODUCT_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// Animation Constants
export const ANIMATION = {
	// Default animation delay increment (in milliseconds)
	DELAY_INCREMENT: 100,
	// Time update interval (in milliseconds)
	TIME_UPDATE_INTERVAL: 60000, // 1 minute
} as const
