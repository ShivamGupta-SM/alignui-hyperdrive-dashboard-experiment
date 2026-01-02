/**
 * Edge-compatible Constants
 *
 * SSOT for constants that can be used in Edge Runtime (middleware).
 * These constants are intentionally simple (no external dependencies)
 * so they can be imported safely in middleware.
 *
 * Other files should import from @/lib/constants (which re-exports these)
 * to maintain a single import path throughout the codebase.
 */

// ============================================================================
// AUTH COOKIE CONSTANTS - SSOT
// ============================================================================

/**
 * Auth cookie names to check for authentication
 * Order matters - primary cookie is first
 */
export const AUTH_COOKIE_NAMES = ["auth-token", "better-auth.session_token"] as const

/** Primary auth cookie name (used when setting/clearing) */
export const AUTH_COOKIE_PRIMARY = AUTH_COOKIE_NAMES[0]

/**
 * Get first valid auth token from cookies
 * @param getCookie - Function to get cookie value by name
 * @returns Token value or null
 */
export function getAuthTokenFromCookies(getCookie: (name: string) => string | undefined): string | null {
	for (const cookieName of AUTH_COOKIE_NAMES) {
		const value = getCookie(cookieName)
		if (value) {
			return value
		}
	}
	return null
}

/**
 * Check if any auth cookie exists
 * @param hasCookie - Function to check if cookie exists
 * @returns True if authenticated
 */
export function hasAuthCookie(hasCookie: (name: string) => boolean): boolean {
	return AUTH_COOKIE_NAMES.some(hasCookie)
}
