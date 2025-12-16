/**
 * URL Validation Utilities
 * Prevents open redirect vulnerabilities by validating callback URLs
 */

import { logWarn } from "../logging/error-logger-simple"

/**
 * Common URL validation logic
 * Checks for dangerous protocols and ensures path starts with /
 */
function validateUrlCommon(urlObj: URL): boolean {
	// Block dangerous protocols
	if (urlObj.protocol === "javascript:" || urlObj.protocol === "data:") {
		logWarn("Blocked dangerous protocol", { source: "URLValidation", data: { protocol: urlObj.protocol, url: urlObj.href } })
		return false
	}

	// Ensure path starts with /
	if (!urlObj.pathname.startsWith("/")) {
		return false
	}

	return true
}

/**
 * Validates a callback URL on the client side
 * Only allows same-origin URLs to prevent open redirects
 * 
 * @param url - The URL to validate
 * @param allowedOrigins - Optional list of allowed origins (defaults to current origin)
 * @returns The validated URL or null if invalid
 */
export function validateCallbackUrl(
	url: string | null | undefined,
	allowedOrigins?: string[]
): string | null {
	if (!url) return null

	try {
		const urlObj = new URL(url, window.location.origin)

		// Only allow same-origin URLs
		const currentOrigin = window.location.origin
		const allowed = allowedOrigins || [currentOrigin]

		if (!allowed.includes(urlObj.origin)) {
			logWarn("Blocked redirect to external URL", { source: "URLValidation", data: { url } })
			return null
		}

		// Common validation
		if (!validateUrlCommon(urlObj)) {
			return null
		}

		return urlObj.pathname + urlObj.search + urlObj.hash
	} catch (error) {
		logWarn("Invalid URL", { source: "URLValidation", data: { url, error } })
		return null
	}
}

/**
 * Validates a callback URL on the server side
 * Only allows same-origin URLs to prevent open redirects
 * 
 * @param url - The URL to validate
 * @param origin - The origin to validate against (defaults to NEXT_PUBLIC_APP_URL)
 * @returns The validated URL or null if invalid
 */
export function validateCallbackUrlServer(
	url: string | null | undefined,
	origin?: string
): string | null {
	if (!url) return null

	try {
		const baseOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
		const urlObj = new URL(url, baseOrigin)

		// Only allow same-origin URLs
		const allowedOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

		if (urlObj.origin !== new URL(allowedOrigin).origin) {
			logWarn("Blocked redirect to external URL", { source: "URLValidation", data: { url } })
			return null
		}

		// Common validation
		if (!validateUrlCommon(urlObj)) {
			return null
		}

		return urlObj.pathname + urlObj.search + urlObj.hash
	} catch (error) {
		logWarn("Invalid URL", { source: "URLValidation", data: { url, error } })
		return null
	}
}

/**
 * Gets a safe redirect URL, falling back to default if validation fails
 * 
 * @param url - The URL to validate
 * @param fallback - Fallback URL if validation fails
 * @param allowedOrigins - Optional list of allowed origins
 * @returns The validated URL or fallback
 */
export function getSafeRedirectUrl(
	url: string | null | undefined,
	fallback: string = "/",
	allowedOrigins?: string[]
): string {
	const validated = validateCallbackUrl(url, allowedOrigins)
	return validated || fallback
}

