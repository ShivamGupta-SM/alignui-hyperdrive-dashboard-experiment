/**
 * Settings Feature Types
 * 
 * @description
 * Single source of truth for all settings-related types.
 */

import type { organizations } from "@/lib/api/encore-client"

// Re-export from Encore client
export type OrganizationBankAccount = organizations.OrganizationBankAccount
export type GSTDetails = organizations.GSTDetails
export type Organization = organizations.Organization

// Feature-specific types
export interface OrganizationSettings {
	name: string
	slug: string
	website?: string
	logo?: string
	description?: string
	phoneNumber?: string
	address?: string
	industryCategory?: string
	contactPerson?: string
	city?: string
	state?: string
	postalCode?: string
}

export interface BankAccount {
	id: string
	bankName: string
	accountNumber: string
	accountHolderName: string
	ifscCode: string
	isDefault: boolean
	isVerified: boolean
	accountType: "current" | "savings"
}

export interface GstDetails {
	gstNumber: string
	legalName?: string
	tradeName?: string
	state?: string
	isVerified: boolean
}

export interface SettingsData {
	organization: Organization
	bankAccounts: OrganizationBankAccount[]
	gstDetails: GSTDetails | null
}

export interface AddBankAccountInput {
	bankName: string
	accountNumber: string
	accountHolderName: string
	ifscCode: string
	accountType: "current" | "savings"
}

export interface VerifyGstInput {
	gstNumber: string
}

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
	type: OrganizationActivityType
	entityType: string
	entityId: string
	details: Record<string, unknown>
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



