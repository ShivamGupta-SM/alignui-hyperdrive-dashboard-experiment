import { DashboardShell } from "@/components/dashboard/dashboard-shell"

// All dashboard pages require authentication
// Note: dynamic export removed - incompatible with cacheComponents

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <DashboardShell>{children}</DashboardShell>
}
