import { getDashboardData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { DashboardClient } from "./dashboard-client"
import { cookies } from "next/headers"

export default async function DashboardPage() {
	// CRITICAL: Access request data (cookies) FIRST before any API calls
	// This ensures Next.js can properly handle static generation
	// Any use of Math.random() or other non-deterministic functions must come after this
	const cookieStore = await cookies()
	// Touch cookies to mark this as a dynamic route
	cookieStore.toString()

	// Check if user has organization (don't force redirect)
	const orgId = await getOrganizationIdOrNull()
	const hasOrganization = !!orgId

	// Try to fetch dashboard data if organization exists
	let data = null
	if (hasOrganization) {
		try {
			data = await getDashboardData()
	} catch (error) {
			// Log error but don't block page render
			console.error("Failed to fetch dashboard data:", error)
			// Continue with null data - client will show alert
		}
	}

	// Always show dashboard, but with alert if no organization
	return <DashboardClient initialData={data} hasOrganization={hasOrganization} />
}
