/**
 * Team SSR Data Fetching
 *
 * Server-side data fetching for team pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient, getOrganizationIdOrNull } from "@/lib/auth/server"
import { logSSRError } from "@/lib/logging/error-logger-simple"

/**
 * Get team data (members and invitations)
 */
export async function getTeamData() {
	const client = await getAuthClient()
	const activeOrgId = (await getOrganizationIdOrNull()) || undefined

	try {
		const results = await Promise.allSettled([
			// listMembers was moved to Better Auth service
			client.auth.listMembersAuth(),
			activeOrgId ? client.organizations.listInvitations(activeOrgId) : Promise.resolve({ data: [] }),
		])

		const members = results[0].status === "fulfilled" ? results[0].value : { members: [] }
		const invitations = results[1].status === "fulfilled" ? results[1].value : { data: [] }

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["members", "invitations"]
				logSSRError(result.reason, "getTeamData", names[index], { data: { activeOrgId } })
			}
		})

		return {
			members: members.members || [],
			invitations: invitations.data || [],
		}
	} catch (error) {
		logSSRError(error, "getTeamData", "team-data", { data: { activeOrgId } })
		return {
			members: [],
			invitations: [],
		}
	}
}
