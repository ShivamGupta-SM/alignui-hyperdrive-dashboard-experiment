import type { Metadata } from "next"
import { Suspense } from "react"
import { getCampaignsData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { CampaignsClient } from "./campaigns-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "Campaigns",
	description: "Manage your influencer marketing campaigns",
	openGraph: {
		title: "Campaigns | Hypedrive",
		description: "Manage your influencer marketing campaigns",
	},
}

// Note: dynamic and revalidate exports removed - incompatible with cacheComponents

async function CampaignsData({ statusFilter }: { statusFilter: string }) {
	const orgId = await getOrganizationIdOrNull()
	
	if (!orgId) {
		return (
			<CampaignsClient
				initialData={{
					campaigns: [],
					data: [],
					total: 0,
				}}
				initialStatus={statusFilter}
			/>
		)
	}

	try {
		const data = await getCampaignsData(statusFilter)
		const initialData = {
			campaigns: data.campaigns || data.data,
			data: data.data || data.campaigns,
			total: data.total,
		}
		return <CampaignsClient initialData={initialData} initialStatus={statusFilter} />
	} catch (error) {
		logError(error, { source: "CampaignsPage", data: { action: "fetch campaigns data", statusFilter } })
		return (
			<CampaignsClient
				initialData={{
					campaigns: [],
					data: [],
					total: 0,
				}}
				initialStatus={statusFilter}
			/>
		)
	}
}

export default async function CampaignsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>
}) {
	const params = await searchParams
	const statusFilter = params.status || "all"

	// Check if organization exists (for conditional data fetching)
	const orgId = await getOrganizationIdOrNull()

	return (
		<OrganizationGuard 
			message="To create and manage campaigns, you need to complete your organization setup. This will only take a few minutes."
			pageType="campaigns"
		>
			<Suspense fallback={<div className="p-8">Loading campaigns...</div>}>
				<CampaignsData statusFilter={statusFilter} />
			</Suspense>
		</OrganizationGuard>
	)
}
