/**
 * URL Validation Utilities
 * 
 * Prevents open redirect vulnerabilities by validating callback/redirect URLs
 * Only allows same-origin or explicitly whitelisted URLs
 */

/**
 * Validates a callback/redirect URL to prevent open redirect attacks (client-side)
 * @param url - The URL to validate
 * @param allowedOrigins - Optional list of allowed origins (defaults to current origin)
 * @returns The validated URL if safe, null otherwise
 */
export function validateCallbackUrl(
	url: string | null | undefined,
	allowedOrigins?: string[]
): string | null {
	if (!url || typeof window === "undefined") return null

	try {
		const urlObj = new URL(url, window.location.origin)

		// Default allowed origins: current origin only
		const origins = allowedOrigins || [window.location.origin]

		// Check if URL is same-origin or in allowed list
		const isAllowed = origins.some((origin) => {
			try {
				const originUrl = new URL(origin)
				return urlObj.origin === originUrl.origin
			} catch {
				return false
			}
		})

		if (!isAllowed) {
			console.warn("[URL Validation] Blocked redirect to external URL:", url)
			return null
		}

		// Ensure path starts with / (relative to origin)
		if (!urlObj.pathname.startsWith("/")) {
			return null
		}

		// Block javascript: and data: protocols
		if (urlObj.protocol === "javascript:" || urlObj.protocol === "data:") {
			console.warn("[URL Validation] Blocked dangerous protocol:", urlObj.protocol)
			return null
		}

		return urlObj.pathname + urlObj.search + urlObj.hash
	} catch (error) {
		console.warn("[URL Validation] Invalid URL:", url, error)
		return null
	}
}

/**
 * Validates a callback URL for server-side use
 * @param url - The URL to validate
 * @param baseUrl - Base URL for relative URLs (defaults to process.env.NEXT_PUBLIC_APP_URL)
 * @returns The validated URL if safe, null otherwise
 */
export function validateCallbackUrlServer(
	url: string | null | undefined,
	baseUrl?: string
): string | null {
	if (!url) return null

	const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

	try {
		const urlObj = new URL(url, base)

		// Only allow same-origin URLs
		const baseUrlObj = new URL(base)
		if (urlObj.origin !== baseUrlObj.origin) {
			console.warn("[URL Validation] Blocked redirect to external URL:", url)
			return null
		}

		// Ensure path starts with / (relative to origin)
		if (!urlObj.pathname.startsWith("/")) {
			return null
		}

		// Block javascript: and data: protocols
		if (urlObj.protocol === "javascript:" || urlObj.protocol === "data:") {
			console.warn("[URL Validation] Blocked dangerous protocol:", urlObj.protocol)
			return null
		}

		return urlObj.pathname + urlObj.search + urlObj.hash
	} catch (error) {
		console.warn("[URL Validation] Invalid URL:", url, error)
		return null
	}
}

/**
 * Gets a safe redirect URL, falling back to default if validation fails
 * @param url - The URL to validate
 * @param fallback - Fallback URL if validation fails
 * @param allowedOrigins - Optional list of allowed origins
 * @returns The validated URL or fallback
 */
export function getSafeRedirectUrl(
	url: string | null | undefined,
	fallback: string,
	allowedOrigins?: string[]
): string {
	const validated = validateCallbackUrl(url, allowedOrigins)
	return validated || fallback
}

