"use cache: private"

import { getCampaignsData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { CampaignsClient } from "./campaigns-client"

export default async function CampaignsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>
}) {
	// Industry Standard: Session-based active organization (single source of truth)
	// Check if user has organization (graceful - don't force redirect)
	const orgId = await getOrganizationIdOrNull()
	const hasOrganization = !!orgId

	const params = await searchParams
	const statusFilter = params.status || "all"

	// Fetch campaigns data if organization exists
	let data = null
	if (hasOrganization && orgId) {
		try {
			data = await getCampaignsData(statusFilter)
		} catch (error) {
			console.error("[CampaignsPage] Failed to fetch campaigns data:", error)
			data = {
				data: [],
				total: 0,
			}
		}
	}

	// Extract only the fields needed by CampaignsClient
	const initialData = data
		? {
				campaigns: data.campaigns || data.data,
				data: data.data || data.campaigns,
				total: data.total,
			}
		: {
				campaigns: [],
				data: [],
				total: 0,
			}

	return (
		<CampaignsClient
			initialData={initialData}
			initialStatus={statusFilter}
			hasOrganization={hasOrganization}
		/>
	)
}
