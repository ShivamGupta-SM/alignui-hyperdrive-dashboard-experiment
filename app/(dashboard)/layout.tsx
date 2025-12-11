import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getUser, getOrganizations } from '@/lib/data'

// All dashboard pages require authentication and fresh user data
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get data on the server
  const user = await getUser()
  const organizations = await getOrganizations()

  return (
    <DashboardShell user={user} organizations={organizations}>
      {children}
    </DashboardShell>
  )
}
