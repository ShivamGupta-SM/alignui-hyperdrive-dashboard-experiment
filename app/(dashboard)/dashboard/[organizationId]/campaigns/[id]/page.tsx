import { Suspense } from "react"
import { getCampaignDetailData } from "@/features/campaigns/ssr"
import { CampaignDetailClient } from "./campaign-detail-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { CampaignDetailLoading } from "@/components/dashboard/loading-skeletons"

async function CampaignData({ organizationId, id }: { organizationId: string; id: string }) {
	let data = null
	try {
		// Direct server fetch - pure RSC, URL-based multi-tenancy
		// API validates campaign belongs to organizationId via org-scoped endpoint
		data = await getCampaignDetailData(organizationId, id)
	} catch (error) {
		logSSRError(error, "getCampaignDetailData", "campaign-detail", { data: { organizationId, campaignId: id } })
		data = null
	}

	// Transform data to match CampaignDetailClientProps interface
	const initialData = data ? {
		...data.campaign,
		stats: data.stats,
		pricing: data.pricing,
		deliverables: data.deliverables,
		performance: data.performance,
		enrollments: data.enrollments,
		platforms: data.platforms,
	} : undefined

	return <CampaignDetailClient campaignId={id} initialData={initialData} />
}

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ organizationId: string; id: string }>
}) {
	const { organizationId, id } = await params

	return (
		<OrganizationGuard pageType="campaigns">
			<Suspense fallback={<CampaignDetailLoading />}>
				<CampaignData organizationId={organizationId} id={id} />
			</Suspense>
		</OrganizationGuard>
	)
}
