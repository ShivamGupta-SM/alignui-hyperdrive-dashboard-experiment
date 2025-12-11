// Hypedrive Brand Dashboard - Core Types
// Re-exports from domain-specific files for backwards compatibility

// User & Auth Types
export type { User, UserRole, TeamMember, Invitation } from './user'

// Organization Types
export type {
  Organization,
  OrganizationStatus,
  BusinessType,
  IndustryCategory,
  OrganizationDraft,
} from './organization'

// Product Types
export type { Product } from './product'

// Campaign Types
export type {
  Campaign,
  CampaignStatus,
  CampaignType,
  CampaignDeliverable,
  DeliverableType,
  CampaignFormData,
} from './campaign'

// Enrollment Types
export type {
  Enrollment,
  EnrollmentStatus,
  EnrollmentSubmission,
  EnrollmentHistoryItem,
} from './enrollment'

// Wallet & Transaction Types
export type {
  WalletBalance,
  Transaction,
  TransactionType,
  ActiveHold,
  WalletSummary,
} from './wallet'

// Invoice Types
export type { Invoice, InvoiceStatus, InvoiceLineItem } from './invoice'

// Notification Types
export type { Notification, NotificationType } from './notification'

// API Response Types
export type {
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  ApiError,
} from './api'

// Dashboard Types
export type {
  DashboardStats,
  EnrollmentChartData,
  TopCampaign,
  EnrollmentDistribution,
  PendingEnrollmentItem,
  RecentActivity,
  DashboardData,
} from './dashboard'

// Server Action Types
export type {
  ActionResult,
  CreateActionResult,
  UpdateActionResult,
  DeleteActionResult,
  CampaignActionResult,
  EnrollmentActionResult,
  WalletActionResult,
  SettingsActionResult,
  ActionErrorResult,
} from './actions'

// Constants
export { QUERY_KEYS, STALE_TIMES } from './constants'
