/**
 * SSR Data Fetching Utilities
 *
 * These functions fetch data on the server side using the Encore client.
 * Used by RSC pages to fetch data before passing to client components.
 */

import { unstable_cache } from "next/cache"
import { getEncoreClient, getAuthenticatedEncoreClient, getErrorDetails } from "@/lib/encore"
import { cookies } from "next/headers"
import type { shared } from "@/lib/encore-client"
import { logSSRError, logAPIError, logError, logWarn, logInfo } from "@/lib/error-logger-simple"
import { initServerMocks } from "@/lib/init-mocks-server"
import { getSession } from "@/app/actions/auth"

// Initialize MSW before any fetch calls (only in development with mocking enabled)
if (typeof window === "undefined" && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	// Initialize MSW asynchronously - don't block module load
	initServerMocks().catch((error) => {
		console.error("[ssr-data] Failed to initialize MSW:", error)
	})
}

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
	// Ensure MSW is initialized before making fetch calls
	if (typeof window === "undefined" && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
		await initServerMocks()
	}
	
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (token) {
		return getAuthenticatedEncoreClient(token)
	}
	
	// No token - return unauthenticated client
	return getEncoreClient()
}

/**
 * Get active organization ID from session (single source of truth)
 * Uses getSession() action - standardized pattern
 *
 * Industry Standard: Session-based active organization (like Stripe, Notion, Clerk)
 * No cookies needed - session.activeOrganizationId is the source
 *
 * @throws {Error} If organization ID is not found
 */
async function getOrganizationId(): Promise<string> {
	const sessionResult = await getSession()
	
	if (!sessionResult.success || !sessionResult.user) {
		throw new Error("Session not found. Please sign in.")
	}

	const activeOrgId = (sessionResult.user as { activeOrganizationId?: string }).activeOrganizationId
	
	if (!activeOrgId) {
		// Industry Standard: Session is source of truth
		// If session has no active org, don't guess - let pages handle it
		// Pages should redirect to onboarding or show "select organization" UI
		throw new Error("Organization ID not found. Please select an organization.")
	}

	return activeOrgId
}

/**
 * Get active organization ID from session (single source of truth)
 * Uses getSession() action - standardized pattern
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
	try {
		const sessionResult = await getSession()
		
		if (!sessionResult.success || !sessionResult.user) {
			return null
		}

		const activeOrgId = (sessionResult.user as { activeOrganizationId?: string }).activeOrganizationId
		
		// Industry Standard: Session is source of truth
		// If session has no activeOrganizationId, return null
		return activeOrgId || null
	} catch (error) {
		// Log error for debugging
		logError(error, { source: "getOrganizationIdOrNull", data: { action: "get session" } })
		
		// Check if it's a network/connectivity error
		if (error instanceof Error) {
			const errorMessage = error.message.toLowerCase()
			if (
				errorMessage.includes("fetch failed") ||
				errorMessage.includes("econnrefused") ||
				errorMessage.includes("failed to fetch")
			) {
				throw new Error(`Backend connection failed: ${error.message}. Please ensure the backend is running.`)
			}
			
			// Check if it's an authentication error
			if (
				errorMessage.includes("unauthenticated") ||
				errorMessage.includes("unauthorized") ||
				errorMessage.includes("session expired")
			) {
				logWarn("Authentication error in getOrganizationIdOrNull", { source: "getOrganizationIdOrNull", data: { errorMessage } })
				return null
			}
		}

		// If error fetching session, return null
		return null
	}
}

/**
 * Get organizations list (SSR helper)
 * Uses getSession() for authentication, then fetches organizations
 * 
 * @returns Organizations list or empty array
 */
export async function getOrganizations(): Promise<Array<{ id: string; name: string; [key: string]: unknown }>> {
	try {
		const sessionResult = await getSession()
		
		if (!sessionResult.success) {
			return []
		}

		const client = await getAuthClient()
		const result = await client.auth.listOrganizations()
		return result.organizations || []
	} catch (error) {
		logSSRError(error, "getOrganizations", "organizations", {})
		return []
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
		logInfo("No organization found, redirecting to onboarding", { source: "requireOrganization" })
		// No organization - redirect to onboarding
		redirect("/onboarding")
	}
	
	logInfo("Organization found", { source: "requireOrganization", data: { orgId } })
}

// ===========================================
// DASHBOARD
// ===========================================

// Cached dashboard data fetching
async function getDashboardDataCached(client: ReturnType<typeof getAuthenticatedEncoreClient>, activeOrgId: string) {
	return client.organizations.getDashboardOverview({ days: 7 })
}

export const getDashboardData = unstable_cache(
	async () => {
		// CRITICAL: Check for active organization BEFORE calling API
		// This prevents unnecessary API calls and clearer error messages
		const activeOrgId = await getOrganizationIdOrNull()

		if (!activeOrgId) {
			// No active organization - return null gracefully
			// DashboardClient will show appropriate UI
			return null
		}

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		// Fetch dashboard data with error handling - always return null on error
		// This ensures page can still render even if dashboard data fails
		try {
			const client = await getAuthClient()
			const response = await getDashboardDataCached(client, activeOrgId)
			return response
	} catch (error) {
		// CRITICAL: Deep error inspection for debugging
		// Check if it's a network error first
		if (error && typeof error === "object" && "message" in error) {
			const errorMsg = String(error.message || "")
			if (
				errorMsg.includes("fetch failed") ||
				errorMsg.includes("ECONNREFUSED") ||
				errorMsg.includes("Failed to fetch") ||
				errorMsg.includes("NetworkError")
			) {
				logSSRError(error, "getDashboardData", "dashboard-overview", {
					data: { 
						errorType: "network",
						activeOrgId,
						message: "Backend connection failed",
					},
				})
				return null
			}
		}
		
		// Log error details for debugging
		logSSRError(error, "getDashboardData", "dashboard-overview", {
			data: { 
				activeOrgId,
			},
		})


		// Try multiple extraction methods
		let errorMessage = "Unknown error"
		let errorCode: string | undefined
		let errorStatus: number | undefined
		let errorDetails: unknown = null

		// Method 1: Use error extraction utilities
		const errorInfo = getErrorDetails(error)
		errorMessage = errorInfo.message
		errorCode = errorInfo.code
		errorStatus = errorInfo.status
		errorDetails = errorInfo.details

		// Method 2: If that didn't work, try manual extraction
		if (errorMessage === "An unexpected error occurred" || !errorMessage) {
			if (error && typeof error === "object") {
				// Try common error properties
				if ("message" in error && typeof error.message === "string") {
					errorMessage = error.message
				}
				if ("code" in error) {
					errorCode = String(error.code)
				}
				if ("status" in error && typeof error.status === "number") {
					errorStatus = error.status
				}
				if ("details" in error) {
					errorDetails = error.details
				}
				// Try nested error (common in wrapped errors)
				if ("error" in error && error.error) {
					const nestedError = error.error
					if (nestedError instanceof Error) {
						errorMessage = nestedError.message || errorMessage
					} else if (typeof nestedError === "string") {
						errorMessage = nestedError
					} else if (nestedError && typeof nestedError === "object" && "message" in nestedError) {
						errorMessage = String(nestedError.message) || errorMessage
					}
				}
			} else if (error instanceof Error) {
				errorMessage = error.message || error.name || errorMessage
			} else if (typeof error === "string") {
				errorMessage = error
			}
		}

		// Log with full context
		logSSRError(error, "getDashboardData", "dashboard-overview", {
			data: { 
				automaticScoping: true,
				activeOrgId,
				errorMessage,
				errorCode,
				errorStatus,
				isAPIError: errorInfo.isAPIError,
				errorDetails,
				rawErrorType: typeof error,
				rawErrorConstructor: error?.constructor?.name,
			},
		})
		
		// Return null - DashboardClient handles null data gracefully
		return null
	}
	},
	["dashboard"], // Cache key
	{
		tags: ["dashboard"],
		revalidate: 60, // Revalidate every 60 seconds
	}
)

// ===========================================
// WALLET
// ===========================================

export async function getWalletData() {
	const client = await getAuthClient()

	// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
	try {
		const [wallet, withdrawals, transactions, holds, stats] = await Promise.all([
			client.wallets.getOrganizationWallet(),
			client.wallets.listOrganizationWithdrawals({ skip: 0, take: 50 }),
			client.wallets.getOrganizationWalletTransactions({ skip: 0, take: 50 }),
			client.wallets.getWalletHolds(),
			client.wallets.getWithdrawalStats({ holderType: "organization" }),
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
			data: { automaticScoping: true },
		})
		return null
	}
}

// ===========================================
// CAMPAIGNS
// ===========================================

export const getCampaignsData = unstable_cache(
	async (status?: string) => {
		const client = await getAuthClient()

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		const params: {
			skip: number
			take: number
			status?: shared.CampaignStatus
		} = {
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
			logSSRError(error, "getCampaignsData", "campaigns", {
				data: {
					automaticScoping: true,
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
	},
	["campaigns"], // Cache key
	{
		tags: ["campaigns"],
		revalidate: 60, // Revalidate every 60 seconds
	}
)

export async function getCampaignDetailData(campaignId: string) {
	const client = await getAuthClient()

	const [campaign, stats, pricing, deliverables, performance, enrollments, platforms] =
		await Promise.all([
			client.campaigns.getCampaign(campaignId),
			client.campaigns.getCampaignStats(campaignId).catch((error) => {
				logSSRError(error, "getCampaignDetailData", "campaign-stats", { data: { campaignId } })
				return undefined
			}),
			client.campaigns.getCampaignPricing(campaignId).catch((error) => {
				logSSRError(error, "getCampaignDetailData", "campaign-pricing", { data: { campaignId } })
				return undefined
			}),
			client.campaigns.listCampaignDeliverables(campaignId).catch((error) => {
				logSSRError(error, "getCampaignDetailData", "campaign-deliverables", { data: { campaignId } })
				return { data: [] }
			}),
			client.campaigns.getCampaignPerformance(campaignId, {}).catch((error) => {
				logSSRError(error, "getCampaignDetailData", "campaign-performance", { data: { campaignId } })
				return { data: [] }
			}),
			client.enrollments
				.listCampaignEnrollments(campaignId, { take: 100 })
				.catch((error) => {
					logSSRError(error, "getCampaignDetailData", "campaign-enrollments", { data: { campaignId } })
					return { data: [] }
				}),
			client.integrations.listActivePlatforms().catch((error) => {
				logSSRError(error, "getCampaignDetailData", "active-platforms", { data: { campaignId } })
				return { platforms: [] }
			}),
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

	// Industry Standard: Backend uses activeOrganizationId automatically
	// For brands: Use listOrganizationEnrollments (all enrollments across all campaigns)
	// For shoppers: Use listMyEnrollments (their own enrollments)
	
	// Check if user has active organization (brand) or is a shopper
	const orgId = await getOrganizationIdOrNull()
	
	const params: {
		skip: number
		take: number
		status?: shared.EnrollmentStatus
		campaignId?: string
	} = {
		skip: 0,
		take: 50,
	}

	if (status && status !== "all") {
		params.status = status as shared.EnrollmentStatus
	}

	if (campaignId && campaignId !== "") {
		params.campaignId = campaignId
	}

	// If user has active organization, use organization-level endpoint (for brands)
	// Otherwise, use shopper endpoint (for shoppers)
	let response
	if (orgId) {
		response = await client.enrollments.listOrganizationEnrollments(params)
	} else {
		response = await client.enrollments.listMyEnrollments(params)
	}
	
	// Return with 'enrollments' key for EnrollmentsClient compatibility
	return { enrollments: response.data, ...response }
}

export async function getEnrollmentDetailData(enrollmentId: string) {
	const client = await getAuthClient()

	// Use getEnrollmentDetail which includes history, shopper info, campaign info, etc.
	const enrollmentDetail = await client.enrollments.getEnrollmentDetail(enrollmentId)

	// Fetch platforms and campaign deliverables for categorization
	const [platforms, campaignDeliverables] = await Promise.all([
		client.integrations.listActivePlatforms().catch((error) => {
			logSSRError(error, "getEnrollmentDetailData", "active-platforms", { data: { enrollmentId } })
			return { platforms: [] }
		}),
		enrollmentDetail.campaign?.id
			? client.campaigns
				.listCampaignDeliverables(enrollmentDetail.campaign.id)
				.catch((error) => {
					logSSRError(error, "getEnrollmentDetailData", "campaign-deliverables", { data: { enrollmentId, campaignId: enrollmentDetail.campaign?.id } })
					return { data: [] }
				})
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

		// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
		const DEFAULT_INVOICE_PAGE_SIZE = 50
		const response = await client.invoices.listInvoices({ skip: 0, take: DEFAULT_INVOICE_PAGE_SIZE })
		// Return with 'invoices' key for InvoicesClient compatibility
		return { invoices: response.data || [], ...response }
	} catch (error) {
		logError(error, { source: "getInvoicesData", data: { action: "fetch invoices" } })
		return { invoices: [], data: [], total: 0 }
	}
}

// ===========================================
// TEAM
// ===========================================

export async function getTeamData() {
	const client = await getAuthClient()

	// Get active organization ID from session (single source of truth)
	const activeOrgId = await getOrganizationIdOrNull() || undefined

	// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
	// But listInvitations requires organizationId parameter
	const [members, invitations] = await Promise.all([
		// listMembers was moved to Better Auth service
		client.auth.listMembersAuth().catch((error) => {
			logSSRError(error, "getTeamData", "members", { data: { activeOrgId } })
			return { members: [] }
		}),
		activeOrgId
			? client.auth.listInvitations({ organizationId: activeOrgId }).catch((error) => {
				logSSRError(error, "getTeamData", "invitations", { data: { activeOrgId } })
				return { invitations: [] }
			})
			: Promise.resolve({ invitations: [] }),
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

	// Industry Standard: Backend uses activeOrganizationId automatically - no need to check here
	// Backend will return appropriate errors if no active org

	// Get active organization ID from session (single source of truth)
	const activeOrgId = await getOrganizationIdOrNull()

	// Industry Standard: Backend uses activeOrganizationId automatically - no need to pass it
	// Fetch all data with individual error handling - never fail completely
	// Each call has fallback so page always loads, even with partial data
	const [organization, bankAccounts, userData] = await Promise.allSettled([
		activeOrgId
			? client.organizations.getOrganization(activeOrgId).catch((error) => {
					// CRITICAL: Log with full context BEFORE returning fallback
					logAPIError(error, "getSettingsData", `/organizations/${activeOrgId}`, { automaticScoping: true })
					// Return minimal organization object so page can still render
					return {
						id: "",
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
					} as any
				})
			: Promise.resolve({
					id: "",
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
				} as any),
		client.organizations.listBankAccounts().catch((error) => {
			// CRITICAL: Log with full context BEFORE returning fallback
			logAPIError(error, "getSettingsData", `/organizations/bank-accounts`, { automaticScoping: true })
			// Return empty array so page can still render
			return { data: [] }
		}),
		client.auth.me().catch((error) => {
			logSSRError(error, "getSettingsData", "user-data", { data: { automaticScoping: true } })
			return null
		}), // Get user data, fallback to null if fails
	])

	// Extract values from Promise.allSettled results
	const orgResult = organization.status === "fulfilled" ? organization.value : organization.reason
	const bankAccountsResult = bankAccounts.status === "fulfilled" ? bankAccounts.value : { data: [] }
	const userDataResult = userData.status === "fulfilled" ? userData.value : null

	let gstDetails = null
	try {
		const gstResponse = await client.organizations.getGSTDetails()
		gstDetails = gstResponse.gstDetails
	} catch (error) {
		// GST not verified yet or error - continue without it
		logSSRError(error, "getSettingsData", "gst-details", {
			data: { automaticScoping: true, fallbackUsed: true },
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
			id: orgResult.id || "",
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
	try {
		// Use getSession() as single source of truth
		const sessionResult = await getSession()
		
		if (!sessionResult.success || !sessionResult.user) {
			throw new Error("Session not found")
		}

		const user = sessionResult.user as {
			userID: string
			name: string
			email: string
			phone?: string
			organizationRole?: string
			role?: string
			image?: string
			emailVerified?: boolean
			twoFactorEnabled?: boolean
			activeOrganizationId?: string
		}

		return {
			user: {
				id: user.userID,
				name: user.name,
				email: user.email,
				phone: user.phone || "",
				role: user.organizationRole || user.role || "user",
				image: user.image,
				emailVerified: user.emailVerified || false,
				twoFactorEnabled: user.twoFactorEnabled ?? false,
			},
			sessions: [],
			activeOrganizationId: user.activeOrganizationId,
		}
	} catch (error) {
		// In production, should redirect to sign-in or show error
		// For development, we can provide a fallback, but this should be removed in production
		if (process.env.NODE_ENV === "development") {
			logWarn("Failed to fetch user profile, using fallback data", { source: "getProfileData", data: { error } })
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
