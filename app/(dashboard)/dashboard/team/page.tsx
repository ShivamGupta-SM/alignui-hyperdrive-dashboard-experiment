import type { Metadata } from "next"
import { Suspense } from "react"
import { getTeamData } from "@/lib/ssr-data"
import { TeamClient } from "./team-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Team",
	description: "Manage your team members and invitations",
	openGraph: {
		title: "Team | Hypedrive",
		description: "Manage your team members and invitations",
	},
}

async function TeamData() {
	try {
		const data = await getTeamData()
		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <TeamClient initialData={data || { members: [], invitations: [] }} />
	} catch (error) {
		logSSRError(error, "getTeamData", "team-data", {})
		// Industry Standard: Return empty data, let context handle organization state
		return <TeamClient initialData={{ members: [], invitations: [] }} />
	}
}

export default async function TeamPage() {
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<div className="p-8">Loading team...</div>}>
				<TeamData />
			</Suspense>
		</OrganizationGuard>
	)
}
