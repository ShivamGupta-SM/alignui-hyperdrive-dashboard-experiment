"use cache: private"

// Server component - fetches team data
import { getTeamData, requireOrganization } from "@/lib/ssr-data"
import { TeamClient } from "./team-client"

export default async function TeamPage() {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization
	await requireOrganization()

	// Direct server fetch - pure RSC
	const data = await getTeamData()

	return <TeamClient initialData={data} />
}
