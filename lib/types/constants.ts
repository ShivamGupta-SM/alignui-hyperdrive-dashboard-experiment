// Cache times (in milliseconds)
export const STALE_TIMES = {
	// Data that changes frequently (30 seconds)
	REALTIME: 30 * 1000,
	// Standard data (1 minute)
	STANDARD: 60 * 1000,
	// Data that rarely changes (5 minutes)
	STATIC: 5 * 60 * 1000,
} as const

// Business Logic Thresholds
export const THRESHOLDS = {
	// Hours after which an enrollment is considered overdue
	ENROLLMENT_OVERDUE_HOURS: 48,
	// Minimum wallet balance warning threshold (in rupees)
	LOW_BALANCE_WARNING: 50000,
	// Password strength minimum for signup
	MIN_PASSWORD_STRENGTH: 50,
	// Approval rate threshold for positive delta display
	HIGH_APPROVAL_RATE: 80,
	// Rejection rate threshold for positive delta display
	LOW_REJECTION_RATE: 15,
	// Order value threshold for "high value" enrollments (in rupees)
	HIGH_VALUE_ORDER: 25000,
} as const

// GST State Codes Mapping
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
	"26": "Dadra and Nagar Haveli and Daman and Diu",
	"27": "Maharashtra",
	"29": "Karnataka",
	"30": "Goa",
	"31": "Lakshadweep",
	"32": "Kerala",
	"33": "Tamil Nadu",
	"34": "Puducherry",
	"35": "Andaman and Nicobar Islands",
	"36": "Telangana",
	"37": "Andhra Pradesh",
} as const

// Marketing Statistics (for landing page)
export const MARKETING_STATS = [
	{ value: "500+", label: "Active Brands" },
	{ value: "₹50Cr+", label: "Payouts Processed" },
	{ value: "1M+", label: "Enrollments" },
	{ value: "95%", label: "Approval Rate" },
] as const

// Time Duration Constants (in days unless otherwise noted)
export const DURATIONS = {
	// Session expiration in days
	SESSION_EXPIRY_DAYS: 30,
	// Team invitation expiration in days
	INVITATION_EXPIRY_DAYS: 7,
	// Days before campaign end to show "ending soon" warning
	CAMPAIGN_ENDING_SOON_DAYS: 7,
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
export const LIMITS = {
	// Default page size for lists
	DEFAULT_PAGE_SIZE: 20,
	// Pending enrollments limit on dashboard
	PENDING_ENROLLMENTS_LIMIT: 10,
	// Team members page size
	TEAM_MEMBERS_PAGE_SIZE: 20,
	// Category products page size
	CATEGORY_PRODUCTS_PAGE_SIZE: 20,
	// Number of 2FA backup codes to generate
	BACKUP_CODES_COUNT: 10,
	// QR code size in pixels
	QR_CODE_SIZE: 200,
	// Rating stars count
	RATING_STARS_COUNT: 5,
} as const

// Validation Boundaries
// ⚠️ DEPRECATED: Use VALIDATION_CONSTANTS from @/lib/validations instead
// This is kept for backward compatibility but will be removed in future
// Import from validations.ts: import { VALIDATION_CONSTANTS } from "@/lib/utils/validations"
import { VALIDATION_CONSTANTS } from "@/lib/utils/validations"

export const VALIDATION = {
	// Password
	PASSWORD_MIN_LENGTH: VALIDATION_CONSTANTS.PASSWORD_MIN_LENGTH,
	PASSWORD_SIMPLE_MIN_LENGTH: VALIDATION_CONSTANTS.PASSWORD_SIMPLE_MIN_LENGTH,
	// Names
	NAME_MIN_LENGTH: VALIDATION_CONSTANTS.NAME_MIN_LENGTH,
	NAME_MAX_LENGTH: VALIDATION_CONSTANTS.NAME_MAX_LENGTH,
	// Organization
	ORG_NAME_MAX_LENGTH: VALIDATION_CONSTANTS.ORG_NAME_MAX_LENGTH,
	// Product
	PRODUCT_NAME_MIN_LENGTH: VALIDATION_CONSTANTS.PRODUCT_NAME_MIN_LENGTH,
	PRODUCT_NAME_MAX_LENGTH: VALIDATION_CONSTANTS.PRODUCT_NAME_MAX_LENGTH,
	PRODUCT_DESCRIPTION_MAX_LENGTH: VALIDATION_CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH,
	// Campaign
	CAMPAIGN_TITLE_MIN_LENGTH: VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MIN_LENGTH,
	CAMPAIGN_TITLE_MAX_LENGTH: VALIDATION_CONSTANTS.CAMPAIGN_TITLE_MAX_LENGTH,
	CAMPAIGN_DESCRIPTION_MAX_LENGTH: VALIDATION_CONSTANTS.CAMPAIGN_DESCRIPTION_MAX_LENGTH,
	// Enrollments
	MAX_ENROLLMENTS_MIN: VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MIN,
	MAX_ENROLLMENTS_MAX: VALIDATION_CONSTANTS.MAX_ENROLLMENTS_MAX,
	// Bill rate percentage (0-100)
	BILL_RATE_MIN: 0,
	BILL_RATE_MAX: 100,
	// Submission deadline in days
	SUBMISSION_DEADLINE_MIN_DAYS: VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MIN_DAYS,
	SUBMISSION_DEADLINE_MAX_DAYS: VALIDATION_CONSTANTS.SUBMISSION_DEADLINE_MAX_DAYS,
	// Wallet amounts (in rupees)
	MIN_WITHDRAWAL_AMOUNT: VALIDATION_CONSTANTS.MIN_WITHDRAWAL_AMOUNT,
	MIN_ADD_FUNDS_AMOUNT: VALIDATION_CONSTANTS.MIN_ADD_FUNDS_AMOUNT,
	CREDIT_REQUEST_MIN: VALIDATION_CONSTANTS.CREDIT_REQUEST_MIN,
	CREDIT_REQUEST_MAX: VALIDATION_CONSTANTS.CREDIT_REQUEST_MAX,
	CREDIT_LIMIT_REQUEST_MIN: VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MIN,
	CREDIT_LIMIT_REQUEST_MAX: VALIDATION_CONSTANTS.CREDIT_LIMIT_REQUEST_MAX,
	// Bank account
	BANK_ACCOUNT_MIN_LENGTH: VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MIN_LENGTH,
	BANK_ACCOUNT_MAX_LENGTH: VALIDATION_CONSTANTS.BANK_ACCOUNT_NUMBER_MAX_LENGTH,
	// 2FA code length
	TWO_FA_CODE_LENGTH: VALIDATION_CONSTANTS.TWO_FA_CODE_LENGTH,
	// Phone number digits
	PHONE_NUMBER_LENGTH: 10,
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
