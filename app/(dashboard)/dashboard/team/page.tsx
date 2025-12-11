import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getTeamData } from '@/lib/data/team'
import { teamKeys } from '@/lib/query-keys'
import { TeamClient } from './team-client'

// Revalidate every 60 seconds (team changes are less frequent)
export const revalidate = 60

export default async function TeamPage() {
  const queryClient = getServerQueryClient()

  // Prefetch team data on server
  await queryClient.prefetchQuery({
    queryKey: teamKeys.data(),
    queryFn: () => getTeamData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeamClient />
    </HydrationBoundary>
  )
}
