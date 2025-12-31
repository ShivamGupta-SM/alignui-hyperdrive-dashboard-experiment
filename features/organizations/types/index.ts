/**
 * Organizations Feature Types
 *
 * @description
 * Single source of truth for all organization-related types.
 */

import type { auth, organizations, shared } from "@/brand-client"
import type { BaseFilters } from "@/lib/types/base"

// Re-export from Encore client - single source of truth
// Extended with rejectionReason which exists in backend DB but not in generated client type
export type Organization = organizations.Organization & {
	rejectionReason?: string | null
}

// OrganizationListItem matches auth.listOrganizations() response
// Note: This is an inline type in the client, not a named export from organizations namespace
export interface OrganizationListItem {
	id: string
	name: string
	slug: string
	logo: string | null
	createdAt: string
	approvalStatus?: string
	rejectionReason?: string | null
}
export type OrganizationCampaignStats = organizations.OrganizationCampaignStats
export type OrganizationStats = organizations.OrganizationStats
export type OrganizationBankAccount = organizations.OrganizationBankAccount
export type ApprovalStatus = shared.ApprovalStatus
export type AccountTier = shared.AccountTier

// Dashboard types
export type DashboardOverviewResponse = organizations.DashboardOverviewResponse
export type DashboardStats = organizations.DashboardStats
export type EnrollmentChartDataPoint = organizations.EnrollmentChartDataPoint
export type EnrollmentDistribution = organizations.EnrollmentDistribution
export type TopCampaign = organizations.TopCampaign
export type PendingEnrollmentItem = organizations.PendingEnrollmentItem

// GST types
export type GSTDetails = organizations.GSTDetails
export type GSTDetailsResponse = organizations.GSTDetailsResponse

// Deposit Account types
export type DepositAccountDetails = organizations.DepositAccountDetails
export type DepositAccountResponse = organizations.DepositAccountResponse

// Activity types
export type ActivityLogEntry = organizations.ActivityLogEntry

// Request types - from auth namespace (organization creation is via auth endpoints)
export type CreateOrganizationRequest = auth.CreateOrganizationRequest
// Note: UpdateOrganizationRequest is defined locally since updateOrganization endpoint
// is not in brand client. This type matches admin.UpdateOrganizationRequest for field compatibility.
export interface UpdateOrganizationRequest {
	name?: string
	description?: string
	website?: string
	email?: string
	phoneNumber?: string
	contactPerson?: string
	address?: string
	city?: string
	state?: string
	postalCode?: string
	businessType?: string
	industryCategory?: string
}
export type AddBankAccountRequest = organizations.AddBankAccountRequest
export type UpdateBankAccountRequest = organizations.UpdateBankAccountRequest

// Feature-specific types
export interface OrganizationFilters extends BaseFilters {
	approvalStatus?: ApprovalStatus
	accountTier?: AccountTier
}

// Frontend-only types for backwards compatibility
export type OrganizationStatus = ApprovalStatus

// Business type options (uses backend values directly)
export type BusinessType =
	| "pvt_ltd"
	| "llp"
	| "partnership"
	| "proprietorship"
	| "public_ltd"
	| "trust"
	| "society"
	| "other"

// Industry category options (uses backend values directly)
export type IndustryCategory =
	| "electronics"
	| "fashion"
	| "fmcg"
	| "beauty"
	| "home_appliances"
	| "sports"
	| "automotive"
	| "other"

// Organization draft for onboarding wizard
// Field names match the form schema (onboardingFormSchema) for direct compatibility
export interface OrganizationDraft {
	step: 1 | 2 | 3 | 4
	basicInfo?: {
		name: string
		description?: string
		website?: string
		logo?: string
	}
	businessDetails?: {
		businessType: BusinessType
		industryCategory: IndustryCategory
		contactPerson: string
		phone: string
		address: string
		city: string
		state: string
		pinCode: string
	}
	verification?: {
		gstNumber: string
		gstVerified: boolean
		cinNumber?: string
	}
}

// =============================================================================
// Server Action Response Types
// =============================================================================

/**
 * Response from getOrCreateDraftOrganization action
 */
export interface CreateOrgActionResponse {
	id: string
	name: string
	isNew: boolean // true if created, false if already existed
	approvalStatus: "draft" | "pending" | "approved" | "rejected" | "banned"
}

/**
 * Response from completeOnboarding action
 */
export interface CompleteOnboardingResult {
	success: boolean
	organizationId: string
	organizationName: string
	approvalStatus: "pending" // Always pending - GST is pre-verified
	gstDuplicateFlag?: boolean
}

// Alias for convenience
export type CompleteOnboardingActionResponse = CompleteOnboardingResult
