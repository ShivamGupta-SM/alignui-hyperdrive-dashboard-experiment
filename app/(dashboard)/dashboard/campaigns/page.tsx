import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getCampaignsData } from '@/lib/data/campaigns'
import { campaignKeys } from '@/lib/query-keys'
import { CampaignsClient } from './campaigns-client'

// Revalidate every 60 seconds (ISR) for better caching while staying fresh
export const revalidate = 60

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const queryClient = getServerQueryClient()

  // Prefetch campaigns data on server
  await queryClient.prefetchQuery({
    queryKey: campaignKeys.data(statusFilter),
    queryFn: () => getCampaignsData(statusFilter),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignsClient initialStatus={statusFilter} />
    </HydrationBoundary>
  )
}
