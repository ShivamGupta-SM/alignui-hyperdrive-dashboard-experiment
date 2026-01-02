import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ErrorBoundaryWrapper } from "@/components/dashboard/error-boundary-wrapper"
import { getOrganizations } from "@/features/organizations/ssr"

// Dashboard layout uses ISR with short revalidation
// - SSR: Orgs fetched server-side for sidebar (no Suspense - avoids hydration mismatch)
// - Middleware handles auth protection at Edge level
export const revalidate = 60 // Revalidate layout every 60 seconds

/**
 * Dashboard Layout - SSR without Suspense
 *
 * We fetch organizations synchronously in the layout to avoid hydration mismatch.
 * Suspense in layouts causes mismatch because fallback HTML != final HTML.
 *
 * The org fetch is fast (~20-30ms) and cached, so blocking here is acceptable.
 * Individual pages can use their own Suspense boundaries for page-specific data.
 */
export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// SSR: Fetch organizations for sidebar org switcher
	// This is fast (~20-30ms) and cached with revalidate=60
	const organizations = await getOrganizations()

	return (
		<ErrorBoundaryWrapper>
			<DashboardShell initialOrganizations={organizations}>
				{children}
			</DashboardShell>
		</ErrorBoundaryWrapper>
	)
}
