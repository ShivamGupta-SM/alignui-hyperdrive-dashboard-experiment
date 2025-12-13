import { DashboardShell } from '@/components/dashboard/dashboard-shell'

// All dashboard pages require authentication
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
