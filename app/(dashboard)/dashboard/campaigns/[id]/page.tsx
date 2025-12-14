import { getCampaignDetailData, requireOrganization } from "@/lib/ssr-data"
import { CampaignDetailClient } from "./campaign-detail-client"

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	// Check if user has organization
	await requireOrganization()

	const { id } = await params

	// Direct server fetch - pure RSC
	const data = await getCampaignDetailData(id)

	return <CampaignDetailClient campaignId={id} initialData={data} />
}
