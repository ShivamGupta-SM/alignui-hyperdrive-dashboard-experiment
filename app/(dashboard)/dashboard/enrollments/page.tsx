import { getEnrollmentsData } from '@/lib/ssr-data'
import { EnrollmentsClient } from './enrollments-client'

export const revalidate = 60

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'

  // Direct server fetch - pure RSC
  const data = await getEnrollmentsData(statusFilter)

  return <EnrollmentsClient initialData={data} initialStatus={statusFilter} />
}
