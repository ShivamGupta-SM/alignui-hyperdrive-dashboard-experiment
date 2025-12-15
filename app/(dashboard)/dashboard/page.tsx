import type { Metadata } from "next"
import { Suspense } from "react"
import { getDashboardData } from "@/lib/ssr-data"
import { DashboardClient } from "./dashboard-client"
import { cookies } from "next/headers"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError, logWarn } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Overview of your campaigns, enrollments, and wallet balance",
	openGraph: {
		title: "Dashboard | Hypedrive",
		description: "Overview of your campaigns, enrollments, and wallet balance",
	},
}

// Note: dynamic and revalidate exports removed - incompatible with cacheComponents

async function DashboardData() {
	const data = await getDashboardData()
	// Industry Standard: Don't pass hasOrganization prop - use context instead
	return <DashboardClient initialData={data} />
}

export default async function DashboardPage() {
	// CRITICAL: Access request data (cookies) FIRST before any API calls
	// This ensures Next.js can properly handle static generation
	// Any use of Math.random() or other non-deterministic functions must come after this
	const cookieStore = await cookies()
	// Touch cookies to mark this as a dynamic route
	cookieStore.toString()
	
	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="dashboard">
			<Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
				<DashboardData />
			</Suspense>
		</OrganizationGuard>
	)
}
