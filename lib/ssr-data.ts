/**
 * SSR Data Fetching Utilities
 *
 * These functions fetch data on the server side using the Encore client.
 * Used by RSC pages to fetch data before passing to client components.
 */

// Mocking disabled - removed MSW initialization

import { getEncoreClient, getAuthenticatedEncoreClient } from "@/lib/encore"
import { cookies } from "next/headers"
import type { shared } from "@/lib/encore-client"
import { logSSRError, logAPIError } from "@/lib/error-logger-simple"

/**
 * Get authenticated Encore client using auth-token from cookies
 * 
 * Industry Standard: Single source of truth - session only
 * No cookies needed for active organization - session.activeOrganizationId is the source
 * 
 * This function reads auth-token from cookies to authenticate API calls.
 * Active organization comes from session (via me() or getSession()).
 */
async function getAuthClient() {
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (token) {
		return getAuthenticatedEncoreClient(token)
	}
	
	// No token - return unauthenticated client
	return getEncoreClient()
}

/**
 * Get current organization ID from session (single source of truth)
 *
 * Industry Standard: Session-based active organization (like Stripe, Notion, Clerk)
 * No cookies needed - session.activeOrganizationId is the source
 *
 * @throws {Error} If organization ID is not found
 */
async function getOrganizationId(): Promise<string> {
	const client = await getAuthClient()

	try {
		// Get from session (single source of truth)
		const me = await client.auth.me()
		if (me.activeOrganizationId) {
			return me.activeOrganizationId
		}
	} catch (error) {
		console.warn("Failed to get organization ID from session:", error)
	}

	// Industry Standard: Session is source of truth
	// If session has no active org, don't guess - let pages handle it
	// Pages should redirect to onboarding or show "select organization" UI
	throw new Error("Organization ID not found. Please select an organization.")
}

/**
 * Check if user has an organization
 * Returns organization ID or null if no organization
 * 
 * Industry Standard: Session-based active organization (single source of truth)
 * No cookies needed - session.activeOrganizationId is the source
 * 
 * SECURITY: Middleware should handle authentication checks.
 * This function only checks for organization existence.
 * 
 * @returns Organization ID if exists, null otherwise
 */
export async function getOrganizationIdOrNull(): Promise<string | null> {
	const client = await getAuthClient()

	try {
		// First check if user is authenticated using me() endpoint (more reliable)
		// This is a secondary check - middleware should have already verified
		let activeOrgId: string | undefined = undefined
		try {
			const meResult = await client.auth.me()
			// MeResponse IS the user object (not wrapped in user property)
			activeOrgId = meResult.activeOrganizationId
			
			// If activeOrganizationId is already set in session, use it
			if (activeOrgId) {
				console.log(`[getOrganizationIdOrNull] Using activeOrganizationId from me(): ${activeOrgId}`)
				return activeOrgId
			}
		} catch (meError) {
			// Check if it's a network/connectivity error
			const errorMessage = meError instanceof Error ? meError.message : String(meError)
			if (errorMessage.includes("fetch failed") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("Failed to fetch")) {
				console.error("[getOrganizationIdOrNull] Backend connection failed - is backend running?", {
					error: errorMessage,
					baseURL: process.env.NEXT_PUBLIC_ENCORE_URL || process.env.ENCORE_API_URL || "http://localhost:4000"
				})
				// Re-throw to let caller handle (they can redirect to sign-in or show error)
				throw new Error(`Backend connection failed: ${errorMessage}. Please ensure the backend is running.`)
			}
			
			// If me() fails, try getSession() as fallback
			console.warn("[getOrganizationIdOrNull] me() failed, trying getSession():", meError)
			try {
				const sessionResult = await client.auth.getSession()
				if (!sessionResult.session || !sessionResult.user) {
					// No session - return null (middleware should handle redirect)
					console.warn("[getOrganizationIdOrNull] No active session found")
					return null
				}
				// Use session data to continue
				// Type assertion: getSession() returns user with activeOrganizationId
				activeOrgId = (sessionResult.user as { activeOrganizationId?: string }).activeOrganizationId
				if (activeOrgId) {
					console.log(`[getOrganizationIdOrNull] Using activeOrganizationId from getSession(): ${activeOrgId}`)
					return activeOrgId
				}
			} catch (sessionError) {
				// Both me() and getSession() failed
				const sessionErrorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError)
				if (sessionErrorMessage.includes("fetch failed") || sessionErrorMessage.includes("ECONNREFUSED")) {
					throw new Error(`Backend connection failed: ${sessionErrorMessage}. Please ensure the backend is running.`)
				}
				// Authentication error - token might be invalid
				console.warn("[getOrganizationIdOrNull] Both me() and getSession() failed:", sessionErrorMessage)
				return null
			}
		}

		// Industry Standard: Session is source of truth
		// If session has no activeOrganizationId, return null
		// Don't fallback to first org - let pages handle "no org" state
		// Pages should redirect to onboarding or show organization selector
		console.log("[getOrganizationIdOrNull] No activeOrganizationId in session, returning null")
		return null
	} catch (error) {
		// Log error for debugging
		console.error("[getOrganizationIdOrNull] Error fetching organizations:", error)
		
		// Check if it's an authentication error
		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase()
			if (
				errorMessage.includes("unauthenticated") ||
				errorMessage.includes("unauthorized") ||
				errorMessage.includes("session expired") ||
				errorMessage.includes("fetch failed")
			) {
				console.warn("[getOrganizationIdOrNull] Authentication error:", errorMessage)
				return null
			}
		}

		// If error fetching organizations, return null
		console.error("[getOrganizationIdOrNull] Unexpected error, returning null")
		return null
	}
}

/**
 * Check if user has an organization, redirect to onboarding if not
 * Use this in pages that REQUIRE an organization (not dashboard)
 * 
 * Industry Standard: Session-based active organization (single source of truth)
 * 
 * Note: redirect() throws a special error that should not be caught
 * 
 * SECURITY: Middleware should handle authentication checks.
 * This function only checks for organization existence.
 */
export async function requireOrganization() {
	const { redirect } = await import("next/navigation")

	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		console.log("[requireOrganization] No organization found, redirecting to onboarding")
		// No organization - redirect to onboarding
		redirect("/onboarding")
	}
	
	console.log("[requireOrganization] Organization found:", orgId)
}

// ===========================================
// DASHBOARD
// ===========================================

export async function getDashboardData() {
	const client = await getAuthClient()
	
	// Use getOrganizationIdOrNull to avoid throwing errors
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		console.warn("[getDashboardData] No organization ID found for dashboard data")
		return null
	}

	// Fetch dashboard data with error handling - always return null on error
	// This ensures page can still render even if dashboard data fails
	try {
		const response = await client.organizations.getDashboardOverview(orgId, { days: 7 })
		return response
	} catch (error) {
		// CRITICAL: Log with full context BEFORE returning fallback
		// This ensures root cause is always visible for debugging
		logSSRError(error, "getDashboardData", "dashboard-overview", {
			data: { organizationId: orgId },
		})
		
		// Return null - DashboardClient handles null data gracefully
		return null
	}
}

// ===========================================
// WALLET
// ===========================================

export async function getWalletData() {
	const client = await getAuthClient()
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		console.warn("[getWalletData] No organization ID found for wallet data")
		return null
	}

	try {
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
	} catch (error) {
		logSSRError(error, "getWalletData", "wallet-data", {
			data: { organizationId: orgId },
		})
		return null
	}
}

// ===========================================
// CAMPAIGNS
// ===========================================

export async function getCampaignsData(status?: string) {
	const client = await getAuthClient()
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		console.warn("[getCampaignsData] No organization ID found for campaigns data")
		return {
			campaigns: [],
			data: [],
			total: 0,
		}
	}

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

	// Fetch campaigns with error handling - always return valid structure
	try {
		const response = await client.campaigns.listCampaigns(params)
		// Return with 'campaigns' key for CampaignsClient compatibility
		return { campaigns: response.data, ...response }
	} catch (error) {
		// CRITICAL: Log with full context BEFORE returning fallback
		const orgId = await getOrganizationId().catch(() => "unknown")
		logSSRError(error, "getCampaignsData", "campaigns", {
			data: {
				organizationId: orgId,
				statusFilter: status,
				fallbackUsed: true, // Important flag
			},
		})
		
		// Return empty structure - CampaignsClient handles empty data gracefully
		return {
			campaigns: [],
			data: [],
			total: 0,
			skip: 0,
			take: 50,
			hasMore: false,
		}
	}
}

export async function getCampaignDetailData(campaignId: string) {
	const client = await getAuthClient()

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
	const client = await getAuthClient()
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
	const client = await getAuthClient()

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
	const client = await getAuthClient()

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
	const client = await getAuthClient()
	const result = await client.products.listAllCategories()
	return result.categories || []
}

// ===========================================
// INVOICES
// ===========================================

export async function getInvoicesData() {
	try {
		const client = await getAuthClient()
		const orgId = await getOrganizationId()

		// Use default page size from constants
		const DEFAULT_INVOICE_PAGE_SIZE = 50
		const response = await client.invoices.listInvoices({ organizationId: orgId, skip: 0, take: DEFAULT_INVOICE_PAGE_SIZE })
		// Return with 'invoices' key for InvoicesClient compatibility
		return { invoices: response.data || [], ...response }
	} catch (error) {
		console.error("Failed to fetch invoices data:", error)
		return { invoices: [], data: [], total: 0 }
	}
}

// ===========================================
// TEAM
// ===========================================

export async function getTeamData() {
	const client = await getAuthClient()
	const orgId = await getOrganizationId()

	const [members, invitations] = await Promise.all([
		// listMembers was moved to Better Auth service
		client.auth.listMembersAuth({ organizationId: orgId }).catch(() => ({ members: [] })),
		client.auth.listInvitations({ organizationId: orgId }).catch(() => ({ invitations: [] })),
	])

	return {
		members: members.members || [],
		invitations: invitations.invitations || [],
	}
}

// ===========================================
// SETTINGS
// ===========================================

export async function getSettingsData() {
	const client = await getAuthClient()
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		console.warn("[getSettingsData] No organization ID found for settings data")
		return {
			user: {
				id: "",
				name: "",
				email: "",
				phone: "",
				role: "owner",
				emailVerified: false,
				twoFactorEnabled: false,
			},
			organization: {
				id: "",
				name: "Organization",
				slug: "",
				phone: "",
				industry: "",
				email: "",
			},
			bankAccounts: [],
			gstDetails: null,
		}
	}

	// Fetch all data with individual error handling - never fail completely
	// Each call has fallback so page always loads, even with partial data
	const [organization, bankAccounts, userData] = await Promise.allSettled([
		client.organizations.getOrganization(orgId).catch((error) => {
			// CRITICAL: Log with full context BEFORE returning fallback
			logAPIError(error, "getSettingsData", `/organizations/${orgId}`, { organizationId: orgId })
			// Return minimal organization object so page can still render
			return {
				id: orgId,
				name: "Organization",
				slug: "",
				logo: undefined,
				description: undefined,
				website: undefined,
				gstNumber: undefined,
				gstVerified: false,
				gstLegalName: undefined,
				gstTradeName: undefined,
				panNumber: undefined,
				panVerified: false,
				panHolderName: undefined,
				cinNumber: undefined,
				businessType: undefined,
				industryCategory: undefined,
				contactPerson: undefined,
				phoneNumber: undefined,
				email: undefined,
				phone: undefined,
				industry: undefined,
				approvalStatus: "draft" as const,
				accountTier: "standard" as const,
				creditLimit: undefined,
				address: undefined,
				city: undefined,
				state: undefined,
				country: "IN",
				postalCode: undefined,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
		}),
		client.organizations.listBankAccounts(orgId).catch((error) => {
			// CRITICAL: Log with full context BEFORE returning fallback
			logAPIError(error, "getSettingsData", `/organizations/${orgId}/bank-accounts`, { organizationId: orgId })
			// Return empty array so page can still render
			return { data: [] }
		}),
		client.auth.me().catch(() => null), // Get user data, fallback to null if fails
	])

	// Extract values from Promise.allSettled results
	const orgResult = organization.status === "fulfilled" ? organization.value : organization.reason
	const bankAccountsResult = bankAccounts.status === "fulfilled" ? bankAccounts.value : { data: [] }
	const userDataResult = userData.status === "fulfilled" ? userData.value : null

	let gstDetails = null
	try {
		const gstResponse = await client.organizations.getGSTDetails(orgId)
		gstDetails = gstResponse.gstDetails
	} catch (error) {
		// GST not verified yet or error - continue without it
		logSSRError(error, "getSettingsData", "gst-details", {
			data: { organizationId: orgId, fallbackUsed: true },
		})
	}

	// Map backend fields to frontend expected format
	// Always return valid structure, even with partial data
	return {
		user: userDataResult
			? {
				id: userDataResult.userID,
				name: userDataResult.name || "",
				email: userDataResult.email || "",
				phone: userDataResult.phone || "", // ✅ Backend now provides phone field
				avatar: (userDataResult as { avatar?: string }).avatar || userDataResult.image || undefined, // Use image as fallback for avatar
				role: "owner", // Default role, should come from session
				emailVerified: userDataResult.emailVerified || false,
				twoFactorEnabled: userDataResult.twoFactorEnabled ?? false, // ✅ Backend now provides twoFactorEnabled field
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
			id: orgResult.id || orgId,
			...orgResult,
			// Use standardized field names (backend now provides phone, industry, email)
			phone: orgResult.phone || orgResult.phoneNumber || "",
			industry: orgResult.industry || orgResult.industryCategory || "",
			email: orgResult.email || "",
		},
		bankAccounts: bankAccountsResult.data || [],
		gstDetails,
	}
}

// ===========================================
// PROFILE
// ===========================================

export async function getProfileData() {
	const client = await getAuthClient()

	try {
		// Try to get the current user from Encore's auth service
		// This requires the request to be authenticated (token in cookies/headers)
		const me = await client.auth.me()

		return {
			user: {
				id: me.userID,
				name: me.name,
				email: me.email,
				phone: me.phone || "", // ✅ Backend now provides phone field
				role: me.organizationRole || me.role,
				image: me.image,
				emailVerified: me.emailVerified,
				twoFactorEnabled: me.twoFactorEnabled ?? false, // ✅ Backend now provides twoFactorEnabled field
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
