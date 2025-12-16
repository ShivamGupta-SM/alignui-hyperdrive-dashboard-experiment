import type { Metadata } from "next"
import React from "react"
import { getCampaignsData, getOrganizationIdOrNull } from "@/lib/ssr-data"
import { CampaignsWrapper } from "./campaigns-wrapper"
import { OrganizationGuard } from "@/components/dashboard/organization-guard"
import { logError } from "@/lib/logging/error-logger-simple"

export const metadata: Metadata = {
	title: "Campaigns",
	description: "Manage your influencer marketing campaigns",
	openGraph: {
		title: "Campaigns | Hypedrive",
		description: "Manage your influencer marketing campaigns",
	},
}

// Prevent prerendering to avoid Button.Icon serialization issues
export const dynamic = "force-dynamic"


export default async function CampaignsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string }>
}) {
	const params = await searchParams
	const statusFilter = params.status || "all"

	// Check if organization exists (for conditional data fetching)
	const orgId = await getOrganizationIdOrNull()

	const guardMessage = "To create and manage campaigns, you need to complete your organization setup. This will only take a few minutes."
	
	// Fetch data first, then render
	let initialData: {
		campaigns: any[]
		data: any[]
		total: number
	}
	
	if (!orgId) {
		initialData = {
			campaigns: [],
			data: [],
			total: 0,
		}
	} else {
		try {
			const data = await getCampaignsData(statusFilter)
			initialData = {
				campaigns: data.campaigns || data.data,
				data: data.data || data.campaigns,
				total: data.total,
			}
		} catch (error) {
			logError(error, { source: "CampaignsPage", data: { action: "fetch campaigns data", statusFilter } })
			initialData = {
				campaigns: [],
				data: [],
				total: 0,
			}
		}
	}
	
	return (
		<OrganizationGuard 
			message={guardMessage}
			pageType="campaigns"
		>
			<CampaignsWrapper initialData={initialData} initialStatus={statusFilter} />
		</OrganizationGuard>
	)
}
