import { getCampaignsData } from '@/lib/ssr-data'
import { CampaignsClient } from './campaigns-client'

export const revalidate = 60

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status || 'all'

  // Direct server fetch - pure RSC, no React Query
  const data = await getCampaignsData(statusFilter)

  return <CampaignsClient initialData={data} initialStatus={statusFilter} />
}
