import type { Metadata } from "next"
import { Suspense } from "react"
import { getCampaignsData } from "@/features/campaigns/ssr"
import { CampaignsClient } from "./campaigns-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/logging/error-logger-simple"
import type { CampaignWithStats, CampaignStatus } from "@/features/campaigns"
import { isValidCampaignStatus } from "@/lib/utils/validators"

export const metadata: Metadata = {
	title: "Campaigns",
	description: "Manage your influencer marketing campaigns",
	openGraph: {
		title: "Campaigns | Hypedrive",
		description: "Manage your influencer marketing campaigns",
	},
}

// Prevent prerendering to avoid Button.Icon serialization issues
export const dynamic = "force-dynamic"

interface PageProps {
	params: Promise<{ organizationId: string }>
	searchParams: Promise<{ status?: string }>
}

async function CampaignsData({ organizationId, statusFilter }: { organizationId: string; statusFilter: CampaignStatus | "all" }) {
	let initialData: {
		campaigns: CampaignWithStats[]
		total?: number
	}

	try {
		const data = await getCampaignsData(organizationId, statusFilter)
		// SSOT: Use standardized 'data' field from ssr.ts
		initialData = {
			campaigns: data.data ?? [],
			total: data.total,
		}
	} catch (error) {
		logError(error, { source: "CampaignsPage", data: { action: "fetch campaigns data", statusFilter } })
		initialData = {
			campaigns: [],
			total: 0,
		}
	}

	return <CampaignsClient initialData={initialData} initialStatus={statusFilter} />
}

export default async function CampaignsPage({ params, searchParams }: PageProps) {
	const { organizationId } = await params
	const searchParamsData = await searchParams
	const rawStatus = searchParamsData.status
	// Validate status filter - only pass valid CampaignStatus or "all"
	const statusFilter: CampaignStatus | "all" = rawStatus && isValidCampaignStatus(rawStatus) ? rawStatus : "all"

	const guardMessage = "To create and manage campaigns, you need to complete your organization setup. This will only take a few minutes."

	return (
		<OrganizationGuard
			message={guardMessage}
			pageType="campaigns"
		>
			<Suspense fallback={<div className="p-8">Loading campaigns...</div>}>
				<CampaignsData organizationId={organizationId} statusFilter={statusFilter} />
			</Suspense>
		</OrganizationGuard>
	)
}
