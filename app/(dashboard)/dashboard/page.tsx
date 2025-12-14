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
	
	// Industry Standard: Session-based active organization (single source of truth)
	// Middleware should have already verified authentication

	// Check if user has organization (don't force redirect)
	// Industry Standard: Session-based active organization (single source of truth)
	let orgId: string | null = null
	let hasOrganization = false
	try {
		orgId = await getOrganizationIdOrNull()
		hasOrganization = !!orgId
	} catch (error) {
		// If authentication fails, redirect to sign-in
		console.error("[DashboardPage] Error checking organization:", error)
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (
			errorMessage.includes("fetch failed") ||
			errorMessage.includes("unauthenticated") ||
			errorMessage.includes("unauthorized")
		) {
			const { redirect } = await import("next/navigation")
			console.warn("[DashboardPage] Authentication failed, redirecting to sign-in")
			redirect("/sign-in?redirect=/dashboard")
		}
		// For other errors, continue but show error state
	}

	// Fetch dashboard data if organization exists
	// Let errors throw naturally - error boundary will catch them
	let data = null
	if (hasOrganization && orgId) {
		try {
			data = await getDashboardData()
		} catch (error) {
			console.error("[DashboardPage] Error fetching dashboard data:", error)
			// Continue without data - client will show error state
		}
	}

	// Always show dashboard, but with alert if no organization
	return <DashboardClient initialData={data} hasOrganization={hasOrganization} />
}
