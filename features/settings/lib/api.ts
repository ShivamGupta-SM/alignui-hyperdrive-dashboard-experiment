/**
 * Settings API - Single source of truth for all settings operations
 * 
 * @description
 * All settings-related API calls go through here.
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { organizations } from "@/lib/api/encore-client"
import type {
	Organization,
	OrganizationBankAccount,
	GSTDetails,
	OrganizationSettings,
	AddBankAccountInput,
	VerifyGstInput,
} from '../types'

/**
 * Get organization by ID
 * 
 * @param organizationId - Organization ID (or "me" for active org)
 * @returns Organization data
 */
export async function getOrganization(organizationId: string): Promise<Organization> {
	const client = getEncoreBrowserClient()
	
	if (organizationId && organizationId !== "me") {
		return client.organizations.getOrganization(organizationId)
	}
	
	// Get active org ID from auth.me()
	const me = await client.auth.me()
	const activeOrgId = me.activeOrganizationId
	if (!activeOrgId) {
		throw new Error("No active organization")
	}
	return client.organizations.getOrganization(activeOrgId)
}

/**
 * List bank accounts
 * 
 * @returns List of bank accounts
 */
export async function listBankAccounts(): Promise<{ data: OrganizationBankAccount[] }> {
	const client = getEncoreBrowserClient()
	return client.organizations.listBankAccounts()
}

/**
 * Get GST details
 * 
 * @returns GST details
 */
export async function getGSTDetails(): Promise<{ gstDetails: GSTDetails | null }> {
	const client = getEncoreBrowserClient()
	return client.organizations.getGSTDetails()
}

/**
 * Update organization settings
 * 
 * @param organizationId - Organization ID
 * @param data - Settings data
 * @returns Updated organization
 */
export async function updateOrganization(
	organizationId: string,
	data: Partial<OrganizationSettings>
): Promise<Organization> {
	const client = getEncoreBrowserClient()
	return client.organizations.updateOrganization(organizationId, data)
}

/**
 * Get settings data (organization, bank accounts, GST)
 * 
 * @param organizationId - Organization ID
 * @returns Combined settings data
 */
export async function getSettingsData(organizationId: string): Promise<{
	organization: Organization
	bankAccounts: OrganizationBankAccount[]
	gstDetails: GSTDetails | null
}> {
	const client = getEncoreBrowserClient()
	
	// Get active org ID if "me" is used
	let activeOrgId: string = organizationId
	if (organizationId === "me" || !organizationId) {
		const me = await client.auth.me()
		const orgId = me.activeOrganizationId
		if (!orgId) {
			throw new Error("No active organization")
		}
		activeOrgId = orgId
	}

	const results = await Promise.allSettled([
		client.organizations.getOrganization(activeOrgId),
		client.organizations.listBankAccounts(),
		client.organizations.getGSTDetails(),
	])

	const organization = results[0].status === "fulfilled" ? results[0].value : null
	const bankAccountsData = results[1].status === "fulfilled" ? results[1].value : { data: [] }
	const gstData = results[2].status === "fulfilled" ? results[2].value : { gstDetails: null }

	if (!organization) {
		throw new Error("Failed to fetch organization")
	}

	return {
		organization,
		bankAccounts: bankAccountsData.data || [],
		gstDetails: gstData.gstDetails,
	}
}

/**
 * Get organization activity
 * 
 * @param params - Activity query parameters
 * @returns Activity response
 */
export async function getOrganizationActivity(params: {
	skip?: number
	take?: number
}): Promise<{ data: unknown[]; total: number; skip: number; take: number; hasMore: boolean }> {
	const client = getEncoreBrowserClient()
	return client.organizations.getOrganizationActivity(params)
}

/**
 * Add bank account
 * 
 * @param data - Bank account data
 * @returns Created bank account
 */
export async function addBankAccount(data: AddBankAccountInput): Promise<OrganizationBankAccount> {
	const client = getEncoreBrowserClient()
	return client.organizations.addBankAccount(data)
}

/**
 * Delete bank account
 * 
 * @param id - Bank account ID
 */
export async function deleteBankAccount(id: string): Promise<void> {
	const client = getEncoreBrowserClient()
	await client.organizations.deleteBankAccount(id)
}

/**
 * Set default bank account
 * 
 * @param id - Bank account ID
 */
export async function setDefaultBankAccount(id: string): Promise<void> {
	const client = getEncoreBrowserClient()
	await client.organizations.setDefaultBankAccount(id)
}

/**
 * Verify GST
 * 
 * @param data - GST verification data
 * @returns Verification result
 */
export async function verifyGST(data: VerifyGstInput): Promise<{ success: boolean; message?: string }> {
	const client = getEncoreBrowserClient()
	const result = await client.organizations.verifyGST(data)
	return { success: true, message: "GST verified successfully" }
}

/**
 * Verify bank account
 * 
 * @param bankAccountId - Bank account ID
 * @returns Verification result
 */
export async function verifyBankAccount(bankAccountId: string): Promise<{ success: boolean; message?: string }> {
	const client = getEncoreBrowserClient()
	await client.organizations.verifyBankAccount(bankAccountId)
	return { success: true, message: "Bank account verification initiated" }
}
