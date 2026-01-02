/**
 * Hypedrive Brand Dashboard - Core Types
 *
 * This file provides a centralized export for all types.
 * Domain-specific types are re-exported from their feature modules.
 *
 * ARCHITECTURE:
 * - lib/types/base.ts - Shared interfaces (BaseFilters, etc.)
 * - lib/types/constants.ts - Business constants
 * - lib/types/api.ts - API response types
 * - lib/types/user.ts - User/Auth types (not feature-based)
 * - lib/types/notification.ts - Notification types
 * - lib/types/dashboard.ts - Dashboard-specific types
 * - features/[domain]/types/ - Domain-specific types (source of truth)
 */

// =============================================================================
// Shared Base Types (kept in lib/types)
// =============================================================================

export type {
	BaseFilters,
	SortableFilters,
	DateRangeFilters,
	PaginationMeta,
	BaseStats,
	PageClientProps,
	DetailPageClientProps,
	SSRListResponse,
	BulkOperationError,
	BulkOperationResult,
	PartialUpdateResult,
} from "./base"
export type { ApiResponse, PaginatedResponse, ApiErrorResponse, ApiError } from "./api"
// User types - re-export from features/team (source of truth)
export type { UserRole, UserResponse as User } from "@/features/team/types"
// TeamMember and Invitation are also from features/team
export type { Member as TeamMember, Invitation } from "@/features/team/types"
export type { Notification, NotificationType } from "./notification"
export type { RecentActivity, DashboardData } from "./dashboard"

// =============================================================================
// Constants (business logic values)
// =============================================================================

// Re-export from their actual source locations
export { STALE_TIME, VALIDATION_CONSTANTS } from "@/lib/utils"
export { GST_STATE_CODES } from "@/lib/constants"

// Constants from local file
export {
	THRESHOLDS,
	MARKETING_STATS,
	DURATIONS,
	LIMITS,
	CAMPAIGN_STATS,
	BREAKPOINTS,
	FILE_SIZES,
	ANIMATION,
} from "./constants"

// =============================================================================
// Domain Types - Re-exported from Features (source of truth)
// =============================================================================

// Campaign Types
export type {
	Campaign,
	CampaignStatus,
	CampaignType,
	CampaignWithStats,
	CampaignStats,
	CampaignPricing,
	CampaignPerformance,
	Deliverable,
	DeliverableStatus,
	DeliverableType,
	CampaignDeliverableResponse,
	CreateCampaignRequest,
	UpdateCampaignRequest,
	ListCampaignsParams,
	CampaignFilters,
} from "@/features/campaigns/types"

// Enrollment Types
export type {
	Enrollment,
	EnrollmentStatus,
	EnrollmentWithRelations,
	EnrollmentDetail,
	EnrollmentDeliverable,
	EnrollmentPricing,
	EnrollmentExportRow,
	CreateEnrollmentRequest,
	EnrollmentFilters,
} from "@/features/enrollments/types"

// Product Types
export type {
	Product,
	ProductWithStats,
	ProductCategory,
	ProductImageItem,
	ProductImageInput,
	CreateProductRequest,
	UpdateProductRequest,
	ListProductsParams,
	ProductFilters,
} from "@/features/products/types"

// Wallet Types
export type {
	OrganizationWallet,
	WalletTransaction,
	Withdrawal,
	WithdrawalStatus,
	ActiveHold,
	TransactionType,
	WalletFilters,
	DepositAccountDetails as WalletDepositAccountDetails,
} from "@/features/wallet/types"

// Organization Types
export type {
	Organization,
	OrganizationStats,
	OrganizationBankAccount,
	GSTDetails,
	DepositAccountDetails,
	DashboardOverviewResponse,
	OrganizationCampaignStats,
	ActivityLogEntry,
	ApprovalStatus,
	AccountTier,
	OrganizationStatus,
	BusinessType,
	IndustryCategory,
	OrganizationDraft,
	CreateOrganizationRequest,
	UpdateOrganizationRequest,
	AddBankAccountRequest,
	UpdateBankAccountRequest,
	OrganizationFilters,
} from "@/features/organizations/types"

// Invoice Types
export type {
	Invoice,
	InvoiceStatus,
	InvoiceLineItem,
	ListInvoicesParams,
	InvoiceFilters,
} from "@/features/invoices/types"

// Dashboard types from organizations feature
export type {
	DashboardStats,
	TopCampaign,
	PendingEnrollmentItem,
	EnrollmentChartDataPoint,
	EnrollmentDistribution,
} from "@/features/organizations/types"
