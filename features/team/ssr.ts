/**
 * Team SSR Data Fetching
 *
 * Server-side data fetching for team pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"

// Default fallback for team data
const EMPTY_TEAM_RESPONSE = {
	members: [],
	invitations: [],
}

/**
 * Get team data (members and invitations)
 * Uses ssrFetch for standardized error handling
 */
export async function getTeamData(organizationId: string | null) {
	if (!organizationId) {
		logWarn("No organizationId provided for team query", { source: "getTeamData" })
		return EMPTY_TEAM_RESPONSE
	}

	return ssrFetch(
		{
			source: "getTeamData",
			feature: "team",
			context: { organizationId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.auth.listMembersAuth(organizationId),
				client.auth.listInvitations(organizationId),
			])

			const members = results[0].status === "fulfilled" ? results[0].value : { members: [] }
			const invitations = results[1].status === "fulfilled" ? results[1].value : { invitations: [] }

			// Log errors for failed promises
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					const names = ["members", "invitations"]
					logSSRError(result.reason, "getTeamData", `team-${names[index]}`, { data: { organizationId } })
				}
			})

			return {
				members: members.members || [],
				invitations: invitations.invitations || [],
			}
		},
		EMPTY_TEAM_RESPONSE
	)
}
