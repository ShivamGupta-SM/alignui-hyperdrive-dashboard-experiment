import { getDashboardData } from '@/lib/ssr-data'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  // Direct server fetch - pure RSC, no React Query
  const data = await getDashboardData()

  return <DashboardClient initialData={data} />
}
