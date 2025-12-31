/**
 * Centralized route helpers for URL-based multi-tenancy
 * All dashboard routes include organizationId
 *
 * ## Navigation Method Guidelines (router.push vs router.replace)
 *
 * ### Use router.replace() for:
 * - **Automatic redirects** - When user lands on a page and is automatically redirected
 *   based on their state (e.g., /dashboard → /dashboard/{orgId})
 * - **Auth flow completions** - After sign-in success, to prevent back-button returning to login
 * - **State-based redirects** - When org status changes (pending → approved)
 * - **Invalid route corrections** - When URL org doesn't exist, redirect to valid org
 * - **Post-auth redirects** - Redirecting to intended destination after authentication
 *
 * Examples:
 * ```ts
 * // After successful sign-in - don't keep login in history
 * router.replace("/dashboard")
 *
 * // Auto-redirect from /dashboard to specific org
 * router.replace(`/dashboard/${approvedOrgId}`)
 *
 * // User on invalid org, redirect to valid one
 * router.replace(`/dashboard/${validOrgId}`)
 * ```
 *
 * ### Use router.push() for:
 * - **User-initiated navigation** - Clicking links, buttons, menu items
 * - **Form submissions** - After creating/updating resources
 * - **Drill-down navigation** - List → Detail, Campaign → Enrollment
 * - **Any navigation user explicitly requested**
 *
 * Examples:
 * ```ts
 * // User clicks "Create Campaign" button
 * router.push(`/dashboard/${orgId}/campaigns/create`)
 *
 * // After form submission, go to new resource
 * router.push(`/dashboard/${orgId}/campaigns/${newCampaignId}`)
 *
 * // User clicks notification to view enrollment
 * router.push(`/dashboard/${orgId}/enrollments/${enrollmentId}`)
 * ```
 *
 * ### Key Principle:
 * - replace = "The user didn't ask to be here, don't pollute their history"
 * - push = "The user wanted to go here, let them go back"
 */

/**
 * Profile tab hash fragments for deep linking
 */
export const PROFILE_TABS = {
	general: "",
	security: "#security",
	notifications: "#notifications",
} as const

/**
 * Settings tab query params for deep linking
 */
export const SETTINGS_TABS = {
	general: "",
	notifications: "?tab=notifications",
	billing: "?tab=billing",
	integrations: "?tab=integrations",
} as const

export const routes = {
	// Auth routes (no org)
	auth: {
		signIn: "/sign-in",
		signUp: "/sign-up",
		forgotPassword: "/forgot-password",
		resetPassword: "/reset-password",
		verifyEmail: "/verify-email",
	},

	// Dashboard routes (org-scoped)
	dashboard: {
		root: "/dashboard",
		home: (orgId: string) => `/dashboard/${orgId}`,
		campaigns: {
			list: (orgId: string) => `/dashboard/${orgId}/campaigns`,
			create: (orgId: string) => `/dashboard/${orgId}/campaigns/create`,
			detail: (orgId: string, campaignId: string) => `/dashboard/${orgId}/campaigns/${campaignId}`,
			edit: (orgId: string, campaignId: string) => `/dashboard/${orgId}/campaigns/${campaignId}?mode=edit`,
		},
		products: {
			list: (orgId: string) => `/dashboard/${orgId}/products`,
			create: (orgId: string) => `/dashboard/${orgId}/products/new`,
			detail: (orgId: string, productId: string) => `/dashboard/${orgId}/products/${productId}`,
		},
		enrollments: {
			list: (orgId: string) => `/dashboard/${orgId}/enrollments`,
			detail: (orgId: string, enrollmentId: string) => `/dashboard/${orgId}/enrollments/${enrollmentId}`,
		},
		wallet: (orgId: string) => `/dashboard/${orgId}/wallet`,
		invoices: (orgId: string) => `/dashboard/${orgId}/invoices`,
		team: (orgId: string) => `/dashboard/${orgId}/team`,
		settings: (orgId: string, tab?: keyof typeof SETTINGS_TABS) =>
			`/dashboard/${orgId}/settings${tab ? SETTINGS_TABS[tab] : ""}`,
		profile: (orgId: string, tab?: keyof typeof PROFILE_TABS) =>
			`/dashboard/${orgId}/profile${tab ? PROFILE_TABS[tab] : ""}`,
		help: (orgId: string) => `/dashboard/${orgId}/help`,
	},

	// Onboarding routes
	onboarding: {
		root: "/onboarding",
		pending: "/onboarding/pending",
		banned: "/onboarding/banned",
		/**
		 * Build onboarding URL with optional returnTo parameter
		 * Use this when redirecting to onboarding from a specific context
		 */
		withReturnTo: (returnTo?: string) => {
			if (!returnTo) return "/onboarding"
			// Validate returnTo is a safe internal path
			if (!isValidInternalUrl(returnTo)) return "/onboarding"
			return `/onboarding?returnTo=${encodeURIComponent(returnTo)}`
		},
	},

	// Verify routes (2FA)
	verify: {
		root: "/verify",
		backupCode: "/verify/backup-code",
		/**
		 * Build verify URL with token
		 * Note: Token should ideally be in session, not URL
		 */
		withToken: (token: string) => `/verify?token=${encodeURIComponent(token)}`,
	},
}

/**
 * Validates that a URL is a safe internal path (not external/malicious)
 * Used for notification action URLs and other dynamic navigation
 */
export function isValidInternalUrl(url: string | undefined | null): boolean {
	if (!url) return false
	// Must start with / and not be a protocol-relative URL
	if (!url.startsWith("/") || url.startsWith("//")) return false
	// Block javascript: and data: URLs
	const lowerUrl = url.toLowerCase()
	if (lowerUrl.includes("javascript:") || lowerUrl.includes("data:")) return false
	return true
}

/**
 * Safely navigates to a URL only if it's a valid internal path
 * Returns the URL if valid, or a fallback path if not
 */
export function getSafeNavigationUrl(url: string | undefined | null, fallback: string = "/dashboard"): string {
	return isValidInternalUrl(url) ? url! : fallback
}

// Client-only hooks (useDashboardRoutes, useOrganizationId) are in @/lib/routes-hooks.ts
// Import from there for client components that need organization-scoped routes
