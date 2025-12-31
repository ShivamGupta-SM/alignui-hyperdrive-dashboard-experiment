import { Suspense } from "react"
import { getCampaignDetailData } from "@/features/campaigns/ssr"
import { CampaignDetailClient } from "./campaign-detail-client"
import { logSSRError } from "@/lib/logging/error-logger-simple"

async function CampaignData({ organizationId, id }: { organizationId: string; id: string }) {
	let data = null
	try {
		// Direct server fetch - pure RSC, URL-based multi-tenancy
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
		<Suspense fallback={<div className="p-8">Loading campaign...</div>}>
			<CampaignData organizationId={organizationId} id={id} />
		</Suspense>
	)
}
