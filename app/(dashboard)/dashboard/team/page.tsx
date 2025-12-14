"use cache"

import { getTeamData, requireOrganization } from "@/lib/ssr-data"
import { TeamClient } from "./team-client"

export default async function TeamPage() {
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getTeamData()

	return <TeamClient initialData={data} />
}
