import type { Metadata } from "next"
import { Suspense } from "react"
import { getTeamData } from "@/features/team/ssr"
import { TeamClient } from "./team-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import TeamLoading from "./loading"

export const metadata: Metadata = {
	title: "Team",
	description: "Manage your team members and invitations",
	openGraph: {
		title: "Team | Hypedrive",
		description: "Manage your team members and invitations",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
}

async function TeamData({ organizationId }: { organizationId: string }) {
	try {
		const data = await getTeamData(organizationId)
		return <TeamClient initialData={data || { members: [], invitations: [] }} />
	} catch (error) {
		logSSRError(error, "getTeamData", "team-data", {})
		return <TeamClient initialData={{ members: [], invitations: [] }} />
	}
}

export default async function TeamPage({ params }: PageProps) {
	const { organizationId } = await params
	return (
		<OrganizationGuard pageType="default">
			<Suspense fallback={<TeamLoading />}>
				<TeamData organizationId={organizationId} />
			</Suspense>
		</OrganizationGuard>
	)
}
