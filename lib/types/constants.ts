// Query Key Constants & Cache Times

export const QUERY_KEYS = {
  CAMPAIGNS: 'campaigns',
  ENROLLMENTS: 'enrollments',
  INVOICES: 'invoices',
  WALLET: 'wallet',
  DASHBOARD: 'dashboard',
  SESSIONS: 'sessions',
} as const

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
} as const

// GST State Codes Mapping
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
} as const

// Marketing Statistics (for landing page)
export const MARKETING_STATS = [
  { value: '500+', label: 'Active Brands' },
  { value: '₹50Cr+', label: 'Payouts Processed' },
  { value: '1M+', label: 'Enrollments' },
  { value: '95%', label: 'Approval Rate' },
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
export const VALIDATION = {
  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_SIMPLE_MIN_LENGTH: 6,
  // Names
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  // Organization
  ORG_NAME_MAX_LENGTH: 100,
  // Product
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 200,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 500,
  // Campaign
  CAMPAIGN_TITLE_MIN_LENGTH: 3,
  CAMPAIGN_TITLE_MAX_LENGTH: 200,
  CAMPAIGN_DESCRIPTION_MAX_LENGTH: 1000,
  // Enrollments
  MAX_ENROLLMENTS_MIN: 1,
  MAX_ENROLLMENTS_MAX: 100000,
  // Bill rate percentage (0-100)
  BILL_RATE_MIN: 0,
  BILL_RATE_MAX: 100,
  // Submission deadline in days
  SUBMISSION_DEADLINE_MIN_DAYS: 1,
  SUBMISSION_DEADLINE_MAX_DAYS: 90,
  // Wallet amounts (in rupees)
  MIN_WITHDRAWAL_AMOUNT: 1000,
  MIN_ADD_FUNDS_AMOUNT: 100,
  CREDIT_REQUEST_MIN: 10000,
  CREDIT_REQUEST_MAX: 500000,
  CREDIT_LIMIT_REQUEST_MIN: 100000,
  CREDIT_LIMIT_REQUEST_MAX: 10000000,
  // Bank account
  BANK_ACCOUNT_MIN_LENGTH: 9,
  BANK_ACCOUNT_MAX_LENGTH: 18,
  // 2FA code length
  TWO_FA_CODE_LENGTH: 6,
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
