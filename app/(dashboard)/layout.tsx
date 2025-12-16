import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ErrorBoundaryWrapper } from "@/components/dashboard/error-boundary-wrapper"

// All dashboard pages require authentication

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
