import type { Metadata } from "next"
import React from "react"
import { getCampaignsData } from "@/features/campaigns/ssr"
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

interface PageProps {
	params: Promise<{ organizationId: string }>
	searchParams: Promise<{ status?: string }>
}

export default async function CampaignsPage({ params, searchParams }: PageProps) {
	const { organizationId } = await params
	const searchParamsData = await searchParams
	const statusFilter = searchParamsData.status || "all"

	const guardMessage = "To create and manage campaigns, you need to complete your organization setup. This will only take a few minutes."

	// Fetch data with organizationId from URL
	let initialData: {
		campaigns: any[]
		data: any[]
		total: number
	}

	try {
		const data = await getCampaignsData(organizationId, statusFilter)
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

	return (
		<OrganizationGuard
			message={guardMessage}
			pageType="campaigns"
		>
			<CampaignsWrapper initialData={initialData} initialStatus={statusFilter} />
		</OrganizationGuard>
	)
}
