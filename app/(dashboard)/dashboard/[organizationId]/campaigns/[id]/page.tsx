import { getCampaignDetailData } from "@/features/campaigns/ssr"
import { CampaignDetailClient } from "./campaign-detail-client"

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	// Direct server fetch - pure RSC
	const data = await getCampaignDetailData(id)

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
