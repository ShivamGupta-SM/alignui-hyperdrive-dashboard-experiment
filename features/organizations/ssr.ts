/**
 * Organizations SSR Data Fetching
 *
 * Server-side data fetching for organization-level pages (including dashboard).
 * Organized by feature for clean architecture.
 */

import { getAuthClient, getOrganizationIdOrNull } from "@/lib/auth/server"
import { getErrorDetails } from "@/lib/api/encore"
import { logSSRError } from "@/lib/logging/error-logger-simple"

/**
 * Get dashboard overview data
 */
export async function getDashboardData() {
	// Check for active organization BEFORE calling API
	const activeOrgId = await getOrganizationIdOrNull()

	if (!activeOrgId) {
		// No active organization - return null gracefully
		return null
	}

	try {
		const client = await getAuthClient()
		const response = await client.organizations.getDashboardOverview({
			organizationId: activeOrgId,
			days: 7,
		})
		return response
	} catch (error) {
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
		const errorInfo = getErrorDetails(error)
		logSSRError(error, "getDashboardData", "dashboard-overview", {
			data: {
				activeOrgId,
				errorMessage: errorInfo.message,
				errorCode: errorInfo.code,
				errorStatus: errorInfo.status,
				isAPIError: errorInfo.isAPIError,
			},
		})

		return null
	}
}
