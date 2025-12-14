"use cache"

import { getEnrollmentsData, getCampaignsData, requireOrganization } from "@/lib/ssr-data"
import { EnrollmentsClient } from "./enrollments-client"

export default async function EnrollmentsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string; campaign?: string }>
}) {
	// Check if user has organization
	await requireOrganization()

	const params = await searchParams
	const statusFilter = params.status || "all"
	const campaignFilter = params.campaign || ""

	// Direct server fetch - pure RSC
	const [data, campaignsData] = await Promise.all([
		getEnrollmentsData(statusFilter, campaignFilter),
		getCampaignsData(), // Fetch campaigns for filter dropdown
	])

	return (
		<EnrollmentsClient
			initialData={data}
			initialStatus={statusFilter}
			initialCampaign={campaignFilter}
			campaigns={campaignsData.campaigns || []}
		/>
	)
}
