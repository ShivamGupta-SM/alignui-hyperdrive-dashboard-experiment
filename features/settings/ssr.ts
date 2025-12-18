/**
 * Settings SSR Data Fetching
 *
 * Server-side data fetching for settings pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient, getOrganizationIdOrNull } from "@/lib/auth/server"
import { logSSRError, logAPIError, logWarn } from "@/lib/logging/error-logger-simple"
import { getSession } from "@/features/auth"

/**
 * Get settings data (organization, bank accounts, user, GST details)
 */
export async function getSettingsData() {
	const client = await getAuthClient()
	const activeOrgId = await getOrganizationIdOrNull()

	// Fetch all data with individual error handling - never fail completely
	const [organization, bankAccounts, userData] = await Promise.allSettled([
		activeOrgId
			? client.organizations.getOrganization(activeOrgId).catch((error) => {
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
		// URL-based multi-tenancy: organizationId in URL path
		activeOrgId
			? client.organizations.listBankAccounts(activeOrgId).catch((error) => {
					logAPIError(error, "getSettingsData", `/organizations/${activeOrgId}/bank-accounts`, { automaticScoping: true })
					return { data: [] }
				})
			: Promise.resolve({ data: [] }),
		client.auth.me().catch((error) => {
			logSSRError(error, "getSettingsData", "user-data", { data: { automaticScoping: true } })
			return null
		}),
	])

	// Extract values from Promise.allSettled results
	const orgResult = organization.status === "fulfilled" ? organization.value : organization.reason
	const bankAccountsResult = bankAccounts.status === "fulfilled" ? bankAccounts.value : { data: [] }
	const userDataResult = userData.status === "fulfilled" ? userData.value : null

	let gstDetails = null
	if (activeOrgId) {
		try {
			const gstResponse = await client.organizations.getGSTDetails(activeOrgId)
			gstDetails = gstResponse.gstDetails
		} catch (error) {
			// GST not verified yet or error - continue without it
			logSSRError(error, "getSettingsData", "gst-details", {
				data: { automaticScoping: true, fallbackUsed: true },
			})
		}
	}

	// Map backend fields to frontend expected format
	return {
		user: userDataResult
			? {
					id: userDataResult.userID,
					name: userDataResult.name || "",
					email: userDataResult.email || "",
					phone: userDataResult.phone || "",
					avatar: (userDataResult as { avatar?: string }).avatar || userDataResult.image || undefined,
					role: "owner",
					emailVerified: userDataResult.emailVerified || false,
					twoFactorEnabled: userDataResult.twoFactorEnabled ?? false,
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
			phone: orgResult.phone || orgResult.phoneNumber || "",
			industry: orgResult.industry || orgResult.industryCategory || "",
			email: orgResult.email || "",
		},
		bankAccounts: bankAccountsResult.data || [],
		gstDetails,
	}
}

/**
 * Get profile data
 */
export async function getProfileData() {
	try {
		const sessionResult = await getSession({})

		if (!sessionResult?.data?.session || !sessionResult.data.user) {
			throw new Error("Session not found")
		}

		const user = sessionResult.data.user as unknown as {
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
		throw error
	}
}
