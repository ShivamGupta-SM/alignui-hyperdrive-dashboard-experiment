/**
 * Server-Side Auth Utilities
 *
 * Shared utilities for SSR data fetching across features.
 * Used by feature-level ssr.ts files.
 */

import { cookies } from "next/headers"
import { getEncoreClient, getAuthenticatedEncoreClient } from "@/lib/api/encore"
import { getSession } from "@/features/auth"
import { logError, logWarn, logInfo } from "@/lib/logging/error-logger-simple"
import { initServerMocks } from "@/lib/init-mocks-server"

// Initialize MSW before any fetch calls (only in development with mocking enabled)
if (typeof window === "undefined" && process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	initServerMocks().catch((error) => {
		console.error("[auth/server] Failed to initialize MSW:", error)
	})
}

/**
 * Get authenticated Encore client using auth-token from cookies
 *
 * Industry Standard: Single source of truth - session only
 * No cookies needed for active organization - session.activeOrganizationId is the source
 */
export async function getAuthClient() {
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
 *
 * Industry Standard: Session-based active organization (like Stripe, Notion, Clerk)
 * No cookies needed - session.activeOrganizationId is the source
 *
 * @returns Organization ID if exists, null otherwise
 */
export async function getOrganizationIdOrNull(): Promise<string | null> {
	try {
		const sessionResult = await getSession({})

		if (!sessionResult?.data?.session || !sessionResult.data.user) {
			return null
		}

		const activeOrgId = (sessionResult.data.user as { activeOrganizationId?: string }).activeOrganizationId

		return activeOrgId || null
	} catch (error) {
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

		return null
	}
}

/**
 * Get organizations list (SSR helper)
 */
export async function getOrganizations(): Promise<Array<{ id: string; name: string; [key: string]: unknown }>> {
	try {
		const sessionResult = await getSession({})

		if (!sessionResult?.data?.session) {
			return []
		}

		const client = await getAuthClient()
		const result = await client.auth.listOrganizations()
		return (result.organizations || []) as unknown as Array<{ [key: string]: unknown; id: string; name: string }>
	} catch (error) {
		logError(error, { source: "getOrganizations", data: { action: "list organizations" } })
		return []
	}
}

/**
 * Check if user has an organization, redirect to onboarding if not
 */
export async function requireOrganization() {
	const { redirect } = await import("next/navigation")

	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		logInfo("No organization found, redirecting to onboarding", { source: "requireOrganization" })
		redirect("/onboarding")
	}

	logInfo("Organization found", { source: "requireOrganization", data: { orgId } })
}
