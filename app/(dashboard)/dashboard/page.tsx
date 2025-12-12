import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getDashboardData } from '@/lib/ssr-data'
import { dashboardKeys } from '@/lib/query-keys'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const queryClient = getServerQueryClient()

  // Prefetch dashboard data on server (MSW intercepts via instrumentation.ts)
  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => getDashboardData(),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
