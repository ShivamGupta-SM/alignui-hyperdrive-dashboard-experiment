import type { Metadata } from "next"
import { Suspense } from "react"
import { getCampaignsData } from "@/features/campaigns/ssr"
import { CampaignsClient } from "./campaigns-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/logging/error-logger-simple"
import type { CampaignWithStats, CampaignStatus } from "@/features/campaigns"
import type { ProductWithStats } from "@/features/products"
import { isValidCampaignStatus } from "@/lib/utils/validators"
import CampaignsLoading from "./loading"

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
		products: ProductWithStats[]
	}

	try {
		const data = await getCampaignsData(organizationId, statusFilter)
		// SSOT: Use standardized 'data' field from ssr.ts - includes products for modal
		initialData = {
			campaigns: data.data ?? [],
			total: data.total,
			products: data.products ?? [],
		}
	} catch (error) {
		logError(error, { source: "CampaignsPage", data: { action: "fetch campaigns data", statusFilter } })
		initialData = {
			campaigns: [],
			total: 0,
			products: [],
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
			<Suspense fallback={<CampaignsLoading />}>
				<CampaignsData organizationId={organizationId} statusFilter={statusFilter} />
			</Suspense>
		</OrganizationGuard>
	)
}
