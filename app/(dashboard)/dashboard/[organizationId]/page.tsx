import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardClient } from "./dashboard-client"

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

export default async function OrganizationDashboardPage({ params }: PageProps) {
	const { organizationId } = await params

	return (
		<Suspense fallback={<div className="p-8">Loading dashboard...</div>}>
			<DashboardClient organizationId={organizationId} />
		</Suspense>
	)
}
