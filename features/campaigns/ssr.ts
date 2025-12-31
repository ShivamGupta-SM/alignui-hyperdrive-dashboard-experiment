/**
 * Campaigns SSR Data Fetching
 *
 * Server-side data fetching for campaign pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { getAuthClient } from "@/lib/auth/server"
import { TAX_RATES } from "@/lib/constants"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"
import { isValidCampaignStatus } from "@/lib/utils/validators"
import type { shared } from "@/brand-client"

// SSOT: Default fallback for campaigns list - single 'data' field only
const EMPTY_CAMPAIGNS_RESPONSE = {
	data: [],
	total: 0,
	skip: 0,
	take: SSR_PAGE_SIZE.DEFAULT,
	hasMore: false,
}

/**
 * Get campaigns list
 * Uses ssrFetch for standardized error handling
 */
export async function getCampaignsData(organizationId: string, status?: string) {
	return ssrFetch(
		{
			source: "getCampaignsData",
			feature: "campaigns",
			context: { organizationId, statusFilter: status },
		},
		async (client) => {
			const params: {
				skip: number
				take: number
				status?: shared.CampaignStatus
			} = {
				skip: 0,
				take: SSR_PAGE_SIZE.DEFAULT,
			}

			if (status && status !== "all" && isValidCampaignStatus(status)) {
				params.status = status
			}

			const response = await client.organizations.listCampaigns(organizationId, params)
			// SSOT: Clean response format - only 'data' field
			return { data: response.data, total: response.total, skip: response.skip, take: response.take, hasMore: response.hasMore }
		},
		EMPTY_CAMPAIGNS_RESPONSE
	)
}

/**
 * Get campaign detail data
 * Uses org-scoped endpoints from organizations namespace
 */
export async function getCampaignDetailData(organizationId: string, campaignId: string) {
	const client = await getAuthClient()

	try {
		const results = await Promise.allSettled([
			// All campaign operations use org-scoped endpoints
			client.organizations.getCampaign(organizationId, campaignId),
			client.organizations.getCampaignStats(organizationId, campaignId),
			client.organizations.listCampaignDeliverables(organizationId, campaignId),
			client.organizations.getCampaignPerformance(organizationId, campaignId, {}),
			client.organizations.listCampaignEnrollments(organizationId, campaignId, { take: SSR_PAGE_SIZE.LARGE }),
			client.platforms.listActivePlatforms(),
		])

		const campaign = results[0].status === "fulfilled" ? results[0].value : undefined
		const stats = results[1].status === "fulfilled" ? results[1].value : undefined
		const deliverables = results[2].status === "fulfilled" ? results[2].value : { data: [] }
		const performance = results[3].status === "fulfilled" ? results[3].value : { data: [] }
		const enrollments = results[4].status === "fulfilled" ? results[4].value : { data: [] }
		const platforms = results[5].status === "fulfilled" ? results[5].value : { platforms: [] }

		// SSOT: Extract pricing from campaign - matches CampaignPricing type from brand-client
		// All required fields must be present to satisfy type safety
		const pricing = campaign
			? {
					campaignId: campaign.id,
					rebatePercentage: campaign.rebatePercentage ?? 0,
					billRate: campaign.billRate ?? 0,
					platformFee: campaign.platformFee ?? 0,
					platformFeeDecimal: ((campaign.platformFee ?? 0) / 100).toFixed(2),
					bonusAmount: campaign.bonusAmount ?? 0,
					bonusAmountDecimal: ((campaign.bonusAmount ?? 0) / 100).toFixed(2),
					tdsRate: TAX_RATES.TDS_DEFAULT, // TDS calculated by backend during payout
					gstRate: TAX_RATES.GST_STANDARD, // Standard GST rate in India
					estimatedCostPerEnrollment: 0,
					estimatedCostPerEnrollmentDecimal: "0.00",
				}
			: undefined

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["campaign", "stats", "deliverables", "performance", "enrollments", "platforms"]
				logSSRError(result.reason, "getCampaignDetailData", `campaign-${names[index]}`, { data: { organizationId, campaignId } })
			}
		})

		// Campaign is required - if it fails, return null
		if (!campaign) {
			return null
		}

		// SSOT: Use standardized enrollments data directly
		// Legacy format conversion removed - backend now returns consistent format
		const enrollmentsData = enrollments.data || []

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
		logSSRError(error, "getCampaignDetailData", "campaign-detail", { data: { organizationId, campaignId } })
		return null
	}
}
