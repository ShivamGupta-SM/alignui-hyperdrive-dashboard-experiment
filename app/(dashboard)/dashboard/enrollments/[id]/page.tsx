import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/get-query-client'
import { getEnrollmentDetailData } from '@/lib/ssr-data'
import { enrollmentKeys } from '@/lib/query-keys'
import { EnrollmentDetailClient } from './enrollment-detail-client'

// Revalidate every 30 seconds (enrollments change frequently)
export const revalidate = 30

export default async function EnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const queryClient = getServerQueryClient()

  // Prefetch enrollment data on server
  await queryClient.prefetchQuery({
    queryKey: [...enrollmentKeys.detail(id), 'ssr'] as const,
    queryFn: () => getEnrollmentDetailData(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EnrollmentDetailClient enrollmentId={id} />
    </HydrationBoundary>
  )
}
