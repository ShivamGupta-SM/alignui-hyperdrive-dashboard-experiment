/**
 * SSR Data Fetching Utilities
 *
 * These functions fetch data on the server side using the Encore client.
 * Used by RSC pages to fetch data before passing to client components.
 */

import { getEncoreClient } from "@/lib/encore"
import { cookies } from "next/headers"
import type { shared } from "@/lib/encore-client"

// Cookie name for active organization
const ACTIVE_ORG_COOKIE = "active-organization-id"

/**
 * Get current organization ID from cookies
 *
 * @throws {Error} If organization ID is not found
 */
async function getOrganizationId(): Promise<string> {
	const cookieStore = await cookies()
	const orgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

	if (!orgId) {
		// In production, this should redirect to organization selection
		// For now, throw error to prevent silent failures
		throw new Error("Organization ID not found. Please select an organization.")
	}

	return orgId
}

/**
 * Check if user has an organization, redirect to onboarding if not
 * Use this in pages that require an organization
 */
export async function requireOrganization() {
	const { redirect } = await import("next/navigation")
	const client = getEncoreClient()

	try {
		const orgsResult = await client.auth.listOrganizations()
		const organizations = orgsResult.organizations || []

		// If user has no organization, redirect to onboarding
		if (organizations.length === 0) {
			redirect("/onboarding")
		}
	} catch (error) {
		// If error fetching organizations, redirect to onboarding
		redirect("/onboarding")
	}
}

// ===========================================
// DASHBOARD
// ===========================================

export async function getDashboardData() {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const response = await client.organizations.getDashboardOverview(orgId, { days: 7 })
	return response
}

// ===========================================
// WALLET
// ===========================================

export async function getWalletData() {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const [wallet, withdrawals, transactions, holds, stats] = await Promise.all([
		client.wallets.getOrganizationWallet(orgId),
		client.wallets.listOrganizationWithdrawals(orgId, { skip: 0, take: 50 }),
		client.wallets.getOrganizationWalletTransactions(orgId, { skip: 0, take: 50 }),
		client.wallets.getWalletHolds(orgId),
		client.wallets.getWithdrawalStats({ holderType: "organization", holderId: orgId }),
	])

	return {
		balance: wallet,
		withdrawals: withdrawals.data || [],
		transactions: transactions.data,
		activeHolds: holds.holds,
		stats,
	}
}

// ===========================================
// CAMPAIGNS
// ===========================================

export async function getCampaignsData(status?: string) {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const params: {
		organizationId: string
		skip: number
		take: number
		status?: shared.CampaignStatus
	} = {
		organizationId: orgId,
		skip: 0,
		take: 50,
	}

	if (status && status !== "all") {
		params.status = status as shared.CampaignStatus
	}

	const response = await client.campaigns.listCampaigns(params)
	// Return with 'campaigns' key for CampaignsClient compatibility
	return { campaigns: response.data, ...response }
}

export async function getCampaignDetailData(campaignId: string) {
	const client = getEncoreClient()

	const [campaign, stats, pricing, deliverables, performance, enrollments, platforms] =
		await Promise.all([
			client.campaigns.getCampaign(campaignId),
			client.campaigns.getCampaignStats(campaignId).catch(() => undefined),
			client.campaigns.getCampaignPricing(campaignId).catch(() => undefined),
			client.campaigns.listCampaignDeliverables(campaignId).catch(() => ({ data: [] })),
			client.campaigns.getCampaignPerformance(campaignId, {}).catch(() => ({ data: [] })),
			client.enrollments
				.listCampaignEnrollments(campaignId, { take: 100 })
				.catch(() => ({ data: [] })),
			client.integrations.listActivePlatforms().catch(() => ({ platforms: [] })),
		])

	return {
		...campaign, // Spread campaign properties
		stats,
		pricing,
		deliverables: deliverables?.data || [],
		performance: performance?.data || [],
		enrollments: enrollments?.data || [],
		platforms: platforms?.platforms || [],
	}
}

// ===========================================
// ENROLLMENTS
// ===========================================

export async function getEnrollmentsData(status?: string, campaignId?: string) {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const params: {
		organizationId?: string
		skip: number
		take: number
		status?: shared.EnrollmentStatus
		campaignId?: string
	} = {
		organizationId: orgId,
		skip: 0,
		take: 50,
	}

	if (status && status !== "all") {
		params.status = status as shared.EnrollmentStatus
	}

	if (campaignId && campaignId !== "") {
		params.campaignId = campaignId
	}

	const response = await client.enrollments.listMyEnrollments(params)
	// Return with 'enrollments' key for EnrollmentsClient compatibility
	return { enrollments: response.data, ...response }
}

export async function getEnrollmentDetailData(enrollmentId: string) {
	const client = getEncoreClient()

	// Use getEnrollmentDetail which includes history, shopper info, campaign info, etc.
	const enrollmentDetail = await client.enrollments.getEnrollmentDetail(enrollmentId)

	// Fetch platforms and campaign deliverables for categorization
	const [platforms, campaignDeliverables] = await Promise.all([
		client.integrations.listActivePlatforms().catch(() => ({ platforms: [] })),
		enrollmentDetail.campaign?.id
			? client.campaigns
					.listCampaignDeliverables(enrollmentDetail.campaign.id)
					.catch(() => ({ data: [] }))
			: Promise.resolve({ data: [] }),
	])

	return {
		...enrollmentDetail,
		platforms: platforms.platforms || [],
		campaignDeliverables: campaignDeliverables?.data || [],
	}
}

// ===========================================
// PRODUCTS
// ===========================================

export async function getProductsData() {
	const client = getEncoreClient()

	const [products, categories, platforms] = await Promise.all([
		client.products.listProducts({ skip: 0, take: 100 }),
		client.products.listAllCategories(),
		client.integrations.listActivePlatforms(),
	])

	return {
		data: products.data,
		total: products.total,
		categories: categories.categories || [],
		platforms: platforms.platforms || [],
	}
}

// Get categories for product form (server-side)
export async function getCategoriesData() {
	const client = getEncoreClient()
	const result = await client.products.listAllCategories()
	return result.categories || []
}

// ===========================================
// INVOICES
// ===========================================

export async function getInvoicesData() {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const response = await client.invoices.listInvoices({ organizationId: orgId, skip: 0, take: 50 })
	// Return with 'invoices' key for InvoicesClient compatibility
	return { invoices: response.data, ...response }
}

// ===========================================
// TEAM
// ===========================================

export async function getTeamData() {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const [members, invitations] = await Promise.all([
		client.organizations.listMembers(orgId),
		client.auth.listInvitations({ organizationId: orgId }).catch(() => ({ data: [] })),
	])

	return {
		members: members.data,
		invitations: invitations.data || [],
	}
}

// ===========================================
// SETTINGS
// ===========================================

export async function getSettingsData() {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	const [organization, bankAccounts, userData] = await Promise.all([
		client.organizations.getOrganization(orgId),
		client.organizations.listBankAccounts(orgId),
		client.auth
			.me()
			.catch(() => null), // Get user data, fallback to null if fails
	])

	let gstDetails = null
	try {
		gstDetails = await client.organizations.getGSTDetails(orgId)
	} catch {
		// GST not verified yet
	}

	// Map backend fields to frontend expected format
	return {
		user: userData
			? {
					id: userData.userID,
					name: userData.name || "",
					email: userData.email || "",
					phone: userData.phone || "",
					avatar: userData.avatar || undefined,
					role: "owner", // Default role, should come from session
					emailVerified: userData.emailVerified || false,
				}
			: {
					id: "",
					name: "",
					email: "",
					phone: "",
					role: "owner",
					emailVerified: false,
				},
		organization: {
			id: organization.id,
			...organization,
			// Map field names for frontend compatibility
			phone: organization.phoneNumber || "",
			industry: organization.industryCategory || "",
			email: organization.email || "",
		},
		bankAccounts: bankAccounts.data,
		gstDetails,
	}
}

// ===========================================
// PROFILE
// ===========================================

export async function getProfileData() {
	const client = getEncoreClient()

	try {
		// Try to get the current user from Encore's auth service
		// This requires the request to be authenticated (token in cookies/headers)
		const me = await client.auth.me()

		return {
			user: {
				id: me.userID,
				name: me.name,
				email: me.email,
				phone: me.phone || "", // ❌ Backend missing: phone field in MeResponse
				role: me.organizationRole || me.role,
				image: me.image,
				emailVerified: me.emailVerified,
				twoFactorEnabled: me.twoFactorEnabled, // ❌ Backend missing: twoFactorEnabled field in MeResponse
			},
			sessions: [],
			activeOrganizationId: me.activeOrganizationId,
		}
	} catch (error) {
		// In production, should redirect to sign-in or show error
		// For development, we can provide a fallback, but this should be removed in production
		if (process.env.NODE_ENV === "development") {
			console.warn("Failed to fetch user profile, using fallback data:", error)
			return {
				user: {
					id: "1",
					name: "Admin User",
					email: "admin@hypedrive.io",
					phone: "+91 98765 43210",
					role: "admin",
				},
				sessions: [],
			}
		}
		// In production, rethrow the error to trigger error boundary
		throw error
	}
}
