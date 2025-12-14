/**
 * SSR Data Fetching Utilities
 *
 * These functions fetch data on the server side using the Encore client.
 * Used by RSC pages to fetch data before passing to client components.
 */

// Initialize MSW on server side early (for RSC + Server Actions mocking)
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	// Dynamic import to avoid bundling in production
	import("@/lib/init-mocks-server").catch(() => {
		// Silently fail if MSW not available
	})
}

import { getEncoreClient } from "@/lib/encore"
import { cookies } from "next/headers"
import type { shared } from "@/lib/encore-client"

// Cookie name for active organization
const ACTIVE_ORG_COOKIE = "active-organization-id"

/**
 * Get current organization ID from cookies or session
 *
 * @throws {Error} If organization ID is not found
 */
async function getOrganizationId(): Promise<string> {
	const cookieStore = await cookies()
	let orgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

	// If not in cookie, try to get from session
	if (!orgId) {
		try {
			const client = getEncoreClient()
			const me = await client.auth.me()
			orgId = me.activeOrganizationId
		} catch (error) {
			// If session fetch fails, continue to check if user has organizations
			console.warn("Failed to get organization ID from session:", error)
		}
	}

	// If still no orgId, try to get first organization from list
	if (!orgId) {
		try {
			const client = getEncoreClient()
			const orgsResult = await client.auth.listOrganizations()
			const organizations = orgsResult.organizations || []
			
			if (organizations.length > 0) {
				orgId = organizations[0].id
			}
		} catch (error) {
			console.warn("Failed to get organizations list:", error)
		}
	}

	if (!orgId) {
		// In production, this should redirect to organization selection
		// For now, throw error to prevent silent failures
		throw new Error("Organization ID not found. Please select an organization.")
	}

	return orgId
}

/**
 * Check if user has an organization
 * Returns organization info or null if no organization
 * 
 * IMPORTANT: This function assumes cookies/headers have already been accessed
 * in the calling Server Component to satisfy Next.js 16 requirements.
 * 
 * SECURITY: Middleware should handle authentication checks.
 * This function only checks for organization existence.
 * 
 * @returns Organization ID if exists, null otherwise
 */
export async function getOrganizationIdOrNull(): Promise<string | null> {
	// Access cookies first to ensure proper Next.js 16 static generation
	// This must happen before any API calls that might use Math.random()
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
	const client = getEncoreClient()

	try {
		// First check if user is authenticated (session exists)
		// This is a secondary check - middleware should have already verified
		const sessionResult = await client.auth.getSession()
		if (!sessionResult.session || !sessionResult.user) {
			// No session - return null (middleware should handle redirect)
			return null
		}

		// Then check for organization
		const orgsResult = await client.auth.listOrganizations()
		const organizations = orgsResult.organizations || []

		// Return first organization ID or null
		return organizations.length > 0 ? organizations[0].id : null
	} catch (error) {
		// Check if it's an authentication error
		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase()
			if (
				errorMessage.includes("unauthenticated") ||
				errorMessage.includes("unauthorized") ||
				errorMessage.includes("session expired")
			) {
				return null
			}
		}
		
		// If error fetching organizations, return null
		return null
	}
}

/**
 * Check if user has an organization, redirect to onboarding if not
 * Use this in pages that REQUIRE an organization (not dashboard)
 * 
 * Note: redirect() throws a special error that should not be caught
 * 
 * IMPORTANT: This function assumes cookies/headers have already been accessed
 * in the calling Server Component to satisfy Next.js 16 requirements.
 * 
 * SECURITY: Middleware should handle authentication checks.
 * This function only checks for organization existence.
 */
export async function requireOrganization() {
	const { redirect } = await import("next/navigation")
	
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		// No organization - redirect to onboarding
		redirect("/onboarding")
	}
}

// ===========================================
// DASHBOARD
// ===========================================

export async function getDashboardData() {
	// Access cookies first to ensure proper Next.js 16 static generation
	// This must happen before any API calls that might use Math.random()
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
	try {
		const client = getEncoreClient()
		const orgId = await getOrganizationId()

		const response = await client.organizations.getDashboardOverview(orgId, { days: 7 })
		return response
	} catch (error) {
		console.error("Failed to fetch dashboard data:", error)
		// Log more details for debugging
		if (error instanceof Error) {
			console.error("Error message:", error.message)
			console.error("Error stack:", error.stack)
		}
		// Re-throw the error so the page can handle it properly
		// The page will redirect or show error boundary
		throw error
	}
}

// ===========================================
// WALLET
// ===========================================

export async function getWalletData() {
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
	const client = getEncoreClient()
	const result = await client.products.listAllCategories()
	return result.categories || []
}

// ===========================================
// INVOICES
// ===========================================

export async function getInvoicesData() {
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
		const gstResponse = await client.organizations.getGSTDetails(orgId)
		gstDetails = gstResponse.gstDetails
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
	// Access cookies first to ensure proper Next.js 16 static generation
	const cookieStore = await cookies()
	cookieStore.toString() // Touch cookies to mark as dynamic
	
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
