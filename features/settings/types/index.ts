/**
 * Settings Feature Types
 *
 * @description
 * Settings-specific types. Shared types are imported from organizations module (SSOT).
 */

import type {
	Organization as OrgType,
	OrganizationBankAccount as BankAccountType,
	GSTDetails as GSTDetailsType,
} from "@/features/organizations/types"

// SSOT: Re-export shared types from organizations module (primary owner)
export type {
	Organization,
	OrganizationBankAccount,
	GSTDetails,
	GSTDetailsResponse,
	ActivityLogEntry,
	ApprovalStatus,
	AccountTier,
	AddBankAccountRequest,
	UpdateBankAccountRequest,
	UpdateOrganizationRequest,
} from "@/features/organizations/types"

// Feature-specific types
// Note: Frontend uses 'phone' and 'industry' which are mapped to 'phoneNumber' and 'industryCategory' in SSR layer
export interface OrganizationSettings {
	name: string
	slug: string
	website?: string
	logo?: string
	description?: string
	phone?: string // Maps to phoneNumber in backend
	email?: string
	address?: string
	industry?: string // Maps to industryCategory in backend
	contactPerson?: string
	city?: string
	state?: string
	postalCode?: string
	country?: string
}

// Use API type directly - OrganizationBankAccount has all fields
// Note: API returns accountNumber (full) and accountNumberMasked (for display)
export type BankAccount = BankAccountType

export interface GstDetails {
	gstNumber: string
	legalName?: string
	tradeName?: string
	state?: string
	isVerified: boolean
	verifiedAt?: string
}

export interface SettingsData {
	organization: OrgType
	bankAccounts: BankAccountType[]
	gstDetails: GSTDetailsType | null
}

export interface AddBankAccountInput {
	bankName: string
	accountNumber: string
	accountHolderName: string
	ifscCode: string
	accountType: "current" | "savings"
}

// NOTE: VerifyGstInput removed - GST verification now only happens during onboarding
// via verifyGST action from @/features/organizations/actions/onboarding

export type OrganizationActivityType =
	| "campaign_created"
	| "campaign_activated"
	| "campaign_paused"
	| "campaign_completed"
	| "enrollment_approved"
	| "enrollment_rejected"
	| "enrollment_bulk_approved"
	| "withdrawal_requested"
	| "withdrawal_completed"
	| "member_invited"
	| "member_joined"
	| "member_removed"
	| "invoice_generated"
	| "product_created"
	| "settings_updated"

export interface OrganizationActivity {
	id: string
	action: string
	type?: OrganizationActivityType
	entityType: string
	entityId: string
	details: Record<string, unknown> | null
	description?: string
	actorName?: string
	actorAvatar?: string
	adminName: string | null
	createdAt: string
}

export interface OrganizationActivityResponse {
	data: OrganizationActivity[]
	total: number
	skip: number
	take: number
	hasMore: boolean
}
