import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ErrorBoundaryWrapper } from "@/components/dashboard/error-boundary-wrapper"

// Dashboard layout uses ISR with short revalidation
// - Layout shell (sidebar, header) can be cached
// - Dynamic data is fetched client-side via React Query
// - Middleware handles auth protection at Edge level
export const revalidate = 60 // Revalidate layout every 60 seconds

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ErrorBoundaryWrapper>
			<DashboardShell>{children}</DashboardShell>
		</ErrorBoundaryWrapper>
	)
}
