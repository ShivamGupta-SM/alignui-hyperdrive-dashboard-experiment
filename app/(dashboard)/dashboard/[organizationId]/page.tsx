import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardClient } from "./dashboard-client"
import { getOrganizationById, getOrganizations } from "@/features/organizations/ssr"
import { DashboardSkeleton } from "./components"

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

	// Fetch organization data server-side to avoid client fetching all orgs
	const [organization, organizations] = await Promise.all([
		getOrganizationById(organizationId),
		getOrganizations(),
	])

	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardClient
				organizationId={organizationId}
				initialOrganization={organization}
				initialOrganizations={organizations}
			/>
		</Suspense>
	)
}
