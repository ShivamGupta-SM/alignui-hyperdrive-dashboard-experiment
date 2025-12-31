/**
 * Settings SSR Data Fetching
 *
 * Server-side data fetching for settings pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { getAuthClient } from "@/lib/auth/server"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import type { Organization } from "@/features/organizations/types"

/**
 * Creates a fallback organization object with default values
 * Used when API call fails to allow page to still render
 */
function createFallbackOrganization(): Organization {
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
		cinNumber: undefined,
		businessType: undefined,
		industryCategory: undefined,
		contactPerson: undefined,
		phoneNumber: undefined,
		email: undefined,
		approvalStatus: "draft",
		accountTier: "standard",
		creditLimit: undefined,
		creditLimitDecimal: undefined,
		paymentInReady: false,
		payoutReady: false,
		address: undefined,
		city: undefined,
		state: undefined,
		country: "IN",
		postalCode: undefined,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}
}

// Default fallback for settings data - using null to indicate no data
// This avoids type inference issues with ssrFetch generic
const EMPTY_SETTINGS_RESPONSE = null

/**
 * Get settings data (organization, bank accounts, user, GST details)
 * Uses ssrFetch for standardized error handling
 */
export async function getSettingsData(organizationId: string | null) {
	if (!organizationId) {
		logWarn("No organizationId provided for settings query", { source: "getSettingsData" })
		return EMPTY_SETTINGS_RESPONSE
	}

	return ssrFetch(
		{
			source: "getSettingsData",
			feature: "settings",
			context: { organizationId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.auth.getFullOrganization(organizationId, {}),
				client.organizations.listBankAccounts(organizationId, {}),
				client.auth.getSession(),
				client.organizations.getGSTDetails(organizationId),
			])

			const orgResult = results[0].status === "fulfilled" ? results[0].value : createFallbackOrganization()
			const bankAccountsResult = results[1].status === "fulfilled" ? results[1].value : { data: [] }
			const sessionResult = results[2].status === "fulfilled" ? results[2].value : null
			const gstResult = results[3].status === "fulfilled" ? results[3].value : null

			// Log errors for failed promises
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					const names = ["organization", "bank-accounts", "session", "gst-details"]
					logSSRError(result.reason, "getSettingsData", `settings-${names[index]}`, {
						data: { organizationId },
					})
				}
			})

			const userDataResult = sessionResult?.user || null

			// SSOT: Normalize organization fields (null -> undefined for optional fields)
			const normalizedOrg = {
				id: orgResult.id,
				name: orgResult.name,
				slug: orgResult.slug,
				website: orgResult.website ?? undefined,
				logo: orgResult.logo ?? undefined,
				email: orgResult.email ?? undefined,
				phone: orgResult.phoneNumber ?? undefined,
				address: orgResult.address ?? undefined,
				industry: orgResult.industryCategory ?? undefined,
			}

			return {
				user: userDataResult
					? {
							id: userDataResult.id,
							name: userDataResult.name || "",
							email: userDataResult.email || "",
							phone: "",
							avatar: userDataResult.image || undefined,
							role: "owner" as const,
							emailVerified: userDataResult.emailVerified || false,
							twoFactorEnabled: userDataResult.twoFactorEnabled ?? false,
						}
					: {
							id: "",
							name: "",
							email: "",
							phone: "",
							role: "owner" as const,
							emailVerified: false,
						},
				organization: normalizedOrg,
				bankAccounts: bankAccountsResult.data || [],
				gstDetails: gstResult?.gstDetails || null,
			}
		},
		EMPTY_SETTINGS_RESPONSE
	)
}

/**
 * Get profile data
 * Uses direct API call instead of server action to avoid unstable_cache conflict
 */
export async function getProfileData() {
	try {
		const client = await getAuthClient()
		const sessionResult = await client.auth.getSession()

		if (!sessionResult?.session || !sessionResult.user) {
			throw new Error("Session not found")
		}

		// Define expected user shape from session
		interface SessionUser {
			userID?: string
			id?: string
			name?: string
			email?: string
			phone?: string
			organizationRole?: string
			role?: string
			image?: string
			emailVerified?: boolean
			twoFactorEnabled?: boolean
		}
		const user = sessionResult.user as SessionUser

		const userData = {
			id: user.userID || user.id || "",
			name: user.name || "",
			email: user.email || "",
			phone: user.phone || "",
			role: user.organizationRole || user.role || "user",
			image: user.image || undefined,
			emailVerified: user.emailVerified || false,
			twoFactorEnabled: user.twoFactorEnabled ?? false,
		}
		// Ensure required fields are non-empty strings for type safety
		if (!userData.id || !userData.name || !userData.email) {
			throw new Error("User profile is missing required fields")
		}
		return {
			user: userData as {
				id: string
				name: string
				email: string
				phone: string
				role: string
				image?: string
				emailVerified: boolean
				twoFactorEnabled: boolean
			},
			sessions: [] as { id: string; device: string; browser: string; location: string; lastActive: string; current: boolean; iconType: 'computer' | 'smartphone' | 'mac'; userAgent?: string }[],
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
					image: undefined,
					emailVerified: true,
					twoFactorEnabled: false,
				},
				sessions: [] as { id: string; device: string; browser: string; location: string; lastActive: string; current: boolean; iconType: 'computer' | 'smartphone' | 'mac'; userAgent?: string }[],
			}
		}
		throw error
	}
}
