// Hypedrive Brand Dashboard - Core Types
// Re-exports from domain-specific files for backwards compatibility

// User & Auth Types
export type { User, UserRole, TeamMember, Invitation } from "./user"

// Organization Types
export type {
	Organization,
	OrganizationStatus,
	BusinessType,
	IndustryCategory,
	OrganizationDraft,
} from "./organization"

// Product Types
export type { Product } from "./product"

// Campaign Types
// Re-export from Encore (source of truth)
export type {
	Campaign,
	CampaignStatus,
	CampaignType,
	CampaignDeliverable,
	CampaignWithStats,
} from "./campaign"
// Frontend-only types
export type {
	DeliverableType,
	CampaignFormData,
} from "./campaign"

// Enrollment Types
// Re-export from Encore (source of truth)
export type {
	Enrollment,
	EnrollmentStatus,
	EnrollmentWithRelations,
} from "./enrollment"
// Frontend-only types
export type {
	EnrollmentSubmission,
	EnrollmentHistoryItem,
} from "./enrollment"

// Wallet & Transaction Types
export type {
	WalletBalance,
	Transaction,
	TransactionType,
	ActiveHold,
	WalletSummary,
} from "./wallet"

// Invoice Types
export type { Invoice, InvoiceStatus, InvoiceLineItem } from "./invoice"

// Notification Types
export type { Notification, NotificationType } from "./notification"

// API Response Types
export type {
	ApiResponse,
	PaginatedResponse,
	ApiErrorResponse,
	ApiError,
} from "./api"

// Dashboard Types
export type {
	DashboardStats,
	EnrollmentChartData,
	TopCampaign,
	EnrollmentDistribution,
	PendingEnrollmentItem,
	RecentActivity,
	DashboardData,
} from "./dashboard"

// Constants
export { STALE_TIMES } from "./constants"
