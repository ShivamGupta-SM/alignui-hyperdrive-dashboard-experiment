import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ErrorBoundaryWrapper } from "@/components/dashboard/error-boundary-wrapper"

// All dashboard pages require authentication
// Note: dynamic export removed - incompatible with cacheComponents

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
