import type { Metadata } from "next"
import { Suspense } from "react"
import { getEnrollmentsData, getCampaignsData } from "@/lib/ssr-data"
import { EnrollmentsClient } from "./enrollments-client"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logSSRError } from "@/lib/error-logger-simple"
import { logError } from "@/lib/error-logger-simple"

export const metadata: Metadata = {
	title: "Enrollments",
	description: "Review and manage creator enrollments for your campaigns",
	openGraph: {
		title: "Enrollments | Hypedrive",
		description: "Review and manage creator enrollments for your campaigns",
	},
}

// Note: dynamic and revalidate exports removed - incompatible with cacheComponents

async function EnrollmentsData({ statusFilter, campaignFilter }: { statusFilter: string; campaignFilter: string }) {
	try {
		const results = await Promise.allSettled([
			getEnrollmentsData(statusFilter, campaignFilter),
			getCampaignsData(undefined),
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

		// Industry Standard: Don't pass hasOrganization prop - use context instead
		return <EnrollmentsClient initialData={data} initialStatus={statusFilter} initialCampaign={campaignFilter} campaigns={campaignsData?.campaigns || campaignsData?.data || []} />
	} catch (error) {
		logError(error, { source: "EnrollmentsPage", data: { action: "fetch enrollments data", statusFilter, campaignFilter } })
		// Industry Standard: Return empty data, let context handle organization state
		return <EnrollmentsClient initialData={{ enrollments: [], data: [], total: 0 }} initialStatus={statusFilter} initialCampaign={campaignFilter} />
	}
}

export default async function EnrollmentsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string; campaign?: string }>
}) {
	const params = await searchParams
	const statusFilter = params.status || "all"
	const campaignFilter = params.campaign || ""

	// Industry Standard: Use OrganizationGuard for consistent UX
	return (
		<OrganizationGuard pageType="enrollments">
			<Suspense fallback={<div className="p-8">Loading enrollments...</div>}>
				<EnrollmentsData statusFilter={statusFilter} campaignFilter={campaignFilter} />
			</Suspense>
		</OrganizationGuard>
	)
}
