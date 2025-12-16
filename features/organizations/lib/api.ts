/**
 * Organizations API - Single source of truth for all organization operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { organizations } from "@/lib/api/encore-client"
import type { Organization } from '../types'

/**
 * List user's organizations
 * 
 * @returns List of organizations
 */
export async function listOrganizations(): Promise<{
	organizations: Organization[]
}> {
	const client = getEncoreBrowserClient()
	const result = await client.auth.listOrganizations()
	return {
		organizations: (result.organizations || []) as Organization[],
	}
}

/**
 * Get dashboard overview
 * 
 * @param params - Dashboard query parameters
 * @returns Dashboard overview data
 */
export async function getDashboardOverview(params: { days?: number }): Promise<organizations.DashboardOverviewResponse> {
	const client = getEncoreBrowserClient()
	return client.organizations.getDashboardOverview(params)
}

