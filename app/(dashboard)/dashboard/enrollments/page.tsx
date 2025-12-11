import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getEnrollmentsData } from '@/lib/data/enrollments'
import { enrollmentKeys } from '@/lib/query-keys'
import { EnrollmentsClient } from './enrollments-client'

// Revalidate every 60 seconds (ISR) for better caching while staying fresh
export const revalidate = 60

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'
  const queryClient = getServerQueryClient()

  // Prefetch enrollments data on server
  await queryClient.prefetchQuery({
    queryKey: enrollmentKeys.data(statusFilter),
    queryFn: () => getEnrollmentsData(statusFilter),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EnrollmentsClient initialStatus={statusFilter} />
    </HydrationBoundary>
  )
}
