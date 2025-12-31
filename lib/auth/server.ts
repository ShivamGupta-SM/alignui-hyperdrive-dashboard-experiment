/**
 * Server-Side Auth Utilities
 *
 * Single responsibility: Get authenticated API client from cookies
 */

import { cookies } from "next/headers"
import { getEncoreClient, getAuthenticatedEncoreClient } from "@/lib/api/server"
import { initServerMocks } from "@/lib/init-mocks-server"
import { getAuthTokenFromCookies } from "@/lib/constants"

// Initialize MSW before any fetch calls (only in development with mocking enabled)
if (typeof window === "undefined" && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	initServerMocks().catch((error) => {
		console.error("[auth/server] Failed to initialize MSW:", error)
	})
}

/**
 * Get authenticated Encore client using auth-token from cookies
 * SSOT: Uses AUTH_COOKIE_NAMES from @/lib/constants
 */
export async function getAuthClient() {
	// Ensure MSW is initialized before making fetch calls
	if (typeof window === "undefined" && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
		await initServerMocks()
	}

	const cookieStore = await cookies()
	// SSOT: Use centralized cookie name checking
	const token = getAuthTokenFromCookies((name) => cookieStore.get(name)?.value)

	if (token) {
		return getAuthenticatedEncoreClient(token)
	}

	// No token - return unauthenticated client
	return getEncoreClient()
}
