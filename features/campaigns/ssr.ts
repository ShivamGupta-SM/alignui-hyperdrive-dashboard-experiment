/**
 * Campaigns SSR Data Fetching
 *
 * Server-side data fetching for campaign pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient } from "@/lib/auth/server"
import { isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"
import type { shared } from "@/lib/api/encore-client"

/**
 * Get campaigns list
 */
export async function getCampaignsData(organizationId: string, status?: string) {
	try {
		const client = await getAuthClient()
		const session = await client.auth.getSession()

		if (!session?.user) {
			logWarn("User not authenticated, returning empty campaigns data", { source: "getCampaignsData" })
			return {
				campaigns: [],
				data: [],
				total: 0,
				skip: 0,
				take: 50,
				hasMore: false,
			}
		}

		const params: {
			organizationId: string
			skip: number
			take: number
			status?: shared.CampaignStatus
		} = {
			organizationId,
			skip: 0,
			take: 50,
		}

		if (status && status !== "all") {
			params.status = status as shared.CampaignStatus
		}

		const response = await client.campaigns.listCampaigns(params)
		return { campaigns: response.data, ...response }
	} catch (error) {
		// Handle authentication errors gracefully
		if (isAuthenticationError(error)) {
			logWarn("Authentication error in getCampaignsData, returning empty data", {
				source: "getCampaignsData",
				data: { errorMessage: getErrorMessageForLog(error), statusFilter: status },
			})
			return {
				campaigns: [],
				data: [],
				total: 0,
				skip: 0,
				take: 50,
				hasMore: false,
			}
		}

		logSSRError(error, "getCampaignsData", "campaigns", {
			data: { organizationId, statusFilter: status },
		})

		return {
			campaigns: [],
			data: [],
			total: 0,
			skip: 0,
			take: 50,
			hasMore: false,
		}
	}
}

/**
 * Get campaign detail data
 */
export async function getCampaignDetailData(campaignId: string) {
	const client = await getAuthClient()

	try {
		const results = await Promise.allSettled([
			client.campaigns.getCampaign(campaignId),
			client.campaigns.getCampaignStats(campaignId),
			client.campaigns.getCampaignPricing(campaignId),
			client.campaigns.listCampaignDeliverables(campaignId),
			client.campaigns.getCampaignPerformance(campaignId, {}),
			client.enrollments.listCampaignEnrollments(campaignId, { take: 100 }),
			client.integrations.listActivePlatforms(),
		])

		const campaign = results[0].status === "fulfilled" ? results[0].value : null
		const stats = results[1].status === "fulfilled" ? results[1].value : undefined
		const pricing = results[2].status === "fulfilled" ? results[2].value : undefined
		const deliverables = results[3].status === "fulfilled" ? results[3].value : { data: [] }
		const performance = results[4].status === "fulfilled" ? results[4].value : { data: [] }
		const enrollments = results[5].status === "fulfilled" ? results[5].value : { data: [] }
		const platforms = results[6].status === "fulfilled" ? results[6].value : { platforms: [] }

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["campaign", "stats", "pricing", "deliverables", "performance", "enrollments", "platforms"]
				logSSRError(result.reason, "getCampaignDetailData", `campaign-${names[index]}`, { data: { campaignId } })
			}
		})

		// Campaign is required - if it fails, return null
		if (!campaign) {
			return null
		}

		// Handle legacy enrollments format
		const enrollmentsData = enrollments.data || []
		if (Array.isArray(enrollmentsData) && enrollmentsData.length > 0 && "enrollment" in enrollmentsData[0]) {
			const convertedEnrollments = (enrollmentsData as Array<{ enrollment: unknown }>).map((item) => item.enrollment)
			enrollments.data = convertedEnrollments as typeof enrollmentsData
		}

		return {
			campaign,
			stats,
			pricing,
			deliverables: deliverables.data || [],
			performance: performance.data || [],
			enrollments: enrollmentsData,
			platforms: platforms.platforms || [],
		}
	} catch (error) {
		logSSRError(error, "getCampaignDetailData", "campaign-detail", { data: { campaignId } })
		return null
	}
}
