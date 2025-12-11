import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getCampaignDetailData } from '@/lib/data/campaigns'
import { campaignKeys } from '@/lib/query-keys'
import { CampaignDetailClient } from './campaign-detail-client'

// Revalidate every 60 seconds (ISR) for better caching while staying fresh
export const revalidate = 60

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const queryClient = getServerQueryClient()

  // Prefetch campaign data on server
  await queryClient.prefetchQuery({
    queryKey: [...campaignKeys.detail(id), 'ssr'] as const,
    queryFn: () => getCampaignDetailData(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignDetailClient campaignId={id} />
    </HydrationBoundary>
  )
}
