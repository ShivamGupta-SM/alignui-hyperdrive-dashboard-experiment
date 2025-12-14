"use cache"

import { getCampaignsData, requireOrganization } from "@/lib/ssr-data"
import { CampaignsClient } from "./campaigns-client"

export default async function CampaignsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>
}) {
	// Check if user has organization
	await requireOrganization()

	const params = await searchParams
	const statusFilter = params.status || "all"

	// Direct server fetch - pure RSC, no React Query
	const data = await getCampaignsData(statusFilter)

	return <CampaignsClient initialData={data} initialStatus={statusFilter} />
}
