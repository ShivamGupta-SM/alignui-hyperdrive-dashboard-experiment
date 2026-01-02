import type { Metadata } from "next"

// Prevent prerendering to avoid Button.Icon serialization issues
export const dynamic = "force-dynamic"
import { Suspense } from "react"
import { getEnrollmentsData } from "@/features/enrollments/ssr"
import { getCampaignsData } from "@/features/campaigns/ssr"
import { EnrollmentsClient } from "./enrollments-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError, logError } from "@/lib/logging/error-logger-simple"
import EnrollmentsLoading from "./loading"

export const metadata: Metadata = {
	title: "Enrollments",
	description: "Review and manage creator enrollments for your campaigns",
	openGraph: {
		title: "Enrollments | Hypedrive",
		description: "Review and manage creator enrollments for your campaigns",
	},
}

interface PageProps {
	params: Promise<{ organizationId: string }>
	searchParams: Promise<{ status?: string; campaign?: string }>
}

async function EnrollmentsData({ organizationId, statusFilter, campaignFilter }: { organizationId: string; statusFilter: string; campaignFilter: string }) {
	try {
		// URL-based multi-tenancy: pass organizationId from URL params
		const results = await Promise.allSettled([
			getEnrollmentsData(organizationId, statusFilter, campaignFilter),
			getCampaignsData(organizationId),
		])

		const data = results[0].status === "fulfilled" ? results[0].value : { enrollments: [], data: [], total: 0 }
		const campaignsData = results[1].status === "fulfilled" ? results[1].value : null

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["enrollments", "campaigns"]
				logSSRError(result.reason, "EnrollmentsPage", `enrollments-${names[index]}`, { data: { statusFilter, campaignFilter } })
			}
		})

		return <EnrollmentsClient initialData={data} initialStatus={statusFilter} initialCampaign={campaignFilter} campaigns={campaignsData?.data || []} />
	} catch (error) {
		logError(error, { source: "EnrollmentsPage", data: { action: "fetch enrollments data", statusFilter, campaignFilter } })
		return <EnrollmentsClient initialData={{ enrollments: [], data: [], total: 0 }} initialStatus={statusFilter} initialCampaign={campaignFilter} />
	}
}

export default async function EnrollmentsPage({ params, searchParams }: PageProps) {
	const { organizationId } = await params
	const searchParamsData = await searchParams
	const statusFilter = searchParamsData.status || "all"
	const campaignFilter = searchParamsData.campaign || ""

	return (
		<OrganizationGuard pageType="enrollments">
			<Suspense fallback={<EnrollmentsLoading />}>
				<EnrollmentsData organizationId={organizationId} statusFilter={statusFilter} campaignFilter={campaignFilter} />
			</Suspense>
		</OrganizationGuard>
	)
}
