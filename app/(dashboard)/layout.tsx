import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { User, Organization } from '@/lib/types'

// All dashboard pages require authentication
export const dynamic = 'force-dynamic'

// Static user/org for now - in production would come from auth
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@hypedrive.io',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Nike',
    slug: 'nike',
    status: 'active',
    gstVerified: true,
    panVerified: true,
    creditLimit: 500000,
    creditUtilized: 100000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Samsung',
    slug: 'samsung',
    status: 'active',
    gstVerified: true,
    panVerified: true,
    creditLimit: 750000,
    creditUtilized: 200000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell user={mockUser} organizations={mockOrganizations}>
      {children}
    </DashboardShell>
  )
}
