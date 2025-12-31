/**
 * Organizations SSR Data Fetching
 *
 * Server-side data fetching for organization-level pages (including dashboard).
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { logWarn } from "@/lib/logging/error-logger-simple"
import type { OrganizationListItem } from "./types"

/**
 * Get current organization by ID (for server-side rendering)
 * Uses ssrFetch for standardized error handling
 */
export async function getOrganizationById(organizationId: string): Promise<OrganizationListItem | null> {
	if (!organizationId) return null

	return ssrFetch(
		{
			source: "getOrganizationById",
			feature: "organizations",
			context: { organizationId },
		},
		async (client) => {
			try {
				// First try to get full organization details
				const org = await client.auth.getFullOrganization(organizationId, {})
				return org as unknown as OrganizationListItem
			} catch {
				// If direct fetch fails, try from list (fallback)
				const result = await client.auth.listOrganizations()
				const org = result.organizations?.find((o) => o.id === organizationId)
				return (org as OrganizationListItem) ?? null
			}
		},
		null
	)
}

/**
 * Get all user organizations (for navigation/switcher)
 * Uses ssrFetch for standardized error handling
 */
export async function getOrganizations(): Promise<OrganizationListItem[]> {
	return ssrFetch(
		{
			source: "getOrganizations",
			feature: "organizations",
			context: {},
		},
		async (client) => {
			const result = await client.auth.listOrganizations()
			return (result.organizations ?? []) as OrganizationListItem[]
		},
		[]
	)
}

/**
 * Get dashboard overview data
 * Uses ssrFetch for standardized error handling
 */
export async function getDashboardData(organizationId: string | null) {
	if (!organizationId) {
		logWarn("No organizationId provided for dashboard query", { source: "getDashboardData" })
		return null
	}

	return ssrFetch(
		{
			source: "getDashboardData",
			feature: "dashboard",
			context: { organizationId },
		},
		async (client) => {
			const response = await client.organizations.getDashboardOverview(organizationId, {
				days: 7,
			})
			return response
		},
		null
	)
}
