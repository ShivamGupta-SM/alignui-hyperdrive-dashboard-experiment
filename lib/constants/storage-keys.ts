/**
 * Centralized localStorage Keys
 *
 * SSOT for all localStorage keys used in the application.
 * Prevents typos and makes it easy to find all localStorage usage.
 */

export const STORAGE_KEYS = {
	// Onboarding
	ONBOARDING_DRAFT: "onboarding-draft",
	ONBOARDING_DRAFT_TIMESTAMP: "onboarding-draft-timestamp",

	// Dashboard alerts
	DASHBOARD_ONBOARDING_ALERT_DISMISSED: "dashboard-onboarding-alert-dismissed",

	// View preferences
	CAMPAIGNS_VIEW_MODE: "campaigns-view-mode",
	PRODUCTS_VIEW_MODE: "products-view-mode",
	ENROLLMENTS_VIEW_MODE: "enrollments-view-mode",

	// UI state
	SIDEBAR_COLLAPSED: "sidebar-collapsed",
	THEME_PREFERENCE: "theme-preference",

	// Session state (cleared on sign out)
	LAST_ORGANIZATION_ID: "last-organization-id",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Pattern for organization-specific dismissed alerts
 * Usage: `${STORAGE_KEY_PATTERNS.ONBOARDING_ALERT_DISMISSED_PREFIX}${orgId}`
 */
export const STORAGE_KEY_PATTERNS = {
	ONBOARDING_ALERT_DISMISSED_PREFIX: "onboarding-alert-dismissed-",
} as const

/**
 * Get organization-specific storage key
 */
export function getOrgStorageKey(prefix: string, orgId: string): string {
	return `${prefix}${orgId}`
}

/**
 * Clear all onboarding-related storage keys
 */
export function clearOnboardingStorage(): void {
	try {
		localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT)
		localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT_TIMESTAMP)

		// Clear all org-specific onboarding alerts
		const keys = Object.keys(localStorage)
		for (const key of keys) {
			if (key.startsWith(STORAGE_KEY_PATTERNS.ONBOARDING_ALERT_DISMISSED_PREFIX)) {
				localStorage.removeItem(key)
			}
		}
	} catch {
		// Ignore localStorage errors (e.g., in SSR or private browsing)
	}
}

/**
 * Clear all session-related storage keys (call on sign out)
 */
export function clearSessionStorage(): void {
	try {
		clearOnboardingStorage()
		localStorage.removeItem(STORAGE_KEYS.LAST_ORGANIZATION_ID)
	} catch {
		// Ignore localStorage errors
	}
}
