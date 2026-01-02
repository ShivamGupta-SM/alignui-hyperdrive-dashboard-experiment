import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardClient } from "./dashboard-client"
import { getOrganizationById, getOrganizations, getDashboardData } from "@/features/organizations/ssr"
import { DashboardSkeleton } from "./_components"

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Overview of your campaigns, enrollments, and wallet balance",
	openGraph: {
		title: "Dashboard | Hypedrive",
		description: "Overview of your campaigns, enrollments, and wallet balance",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
}

/**
 * Async component that fetches data and renders DashboardClient
 * Wrapped in Suspense for streaming SSR - page shell loads instantly
 *
 * ✅ FIX: Uses Promise.allSettled for graceful degradation
 * If one fetch fails, others still work and UI shows partial data
 */
async function DashboardContent({ organizationId }: { organizationId: string }) {
	// Fetch ALL data server-side in parallel with graceful degradation
	const results = await Promise.allSettled([
		getOrganizationById(organizationId),
		getOrganizations(),
		getDashboardData(organizationId),
	])

	// Extract values with fallbacks for failed fetches
	const organization = results[0].status === "fulfilled" ? results[0].value : null
	const organizations = results[1].status === "fulfilled" ? results[1].value : []
	const dashboardData = results[2].status === "fulfilled" ? results[2].value : null

	return (
		<DashboardClient
			organizationId={organizationId}
			initialOrganization={organization}
			initialOrganizations={organizations}
			initialDashboardData={dashboardData}
		/>
	)
}

export default async function OrganizationDashboardPage({ params }: PageProps) {
	const { organizationId } = await params

	// Streaming SSR: Page shell loads instantly, content streams in
	// User sees skeleton immediately instead of blank page
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContent organizationId={organizationId} />
		</Suspense>
	)
}
