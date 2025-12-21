/**
 * Enrollments SSR Data Fetching
 *
 * Server-side data fetching for enrollment pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient } from "@/lib/auth/server"
import { isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"
import type { shared } from "@/lib/api/encore-client"

/**
 * Get enrollments list
 */
export async function getEnrollmentsData(organizationId: string | null, status?: string, campaignId?: string) {
	try {
		const client = await getAuthClient()
		const session = await client.auth.getSession()

		if (!session?.user) {
			logWarn("User not authenticated, returning empty enrollments data", { source: "getEnrollmentsData" })
			return { enrollments: [], data: [], total: 0, skip: 0, take: 50, hasMore: false }
		}

		const params: {
			organizationId?: string
			skip: number
			take: number
			status?: shared.EnrollmentStatus
			campaignId?: string
		} = {
			skip: 0,
			take: 50,
		}

		if (status && status !== "all") {
			params.status = status as shared.EnrollmentStatus
		}

		if (campaignId && campaignId !== "") {
			params.campaignId = campaignId
		}

		// If user has active organization, use organization-level endpoint (for brands)
		// Otherwise, use shopper endpoint (for shoppers)
		let response
		if (organizationId) {
			response = await client.enrollments.listOrganizationEnrollments({ ...params, organizationId })
		} else {
			response = await client.enrollments.listMyEnrollments(params)
		}

		return { enrollments: response.data, ...response }
	} catch (error) {
		// Handle authentication errors gracefully
		if (isAuthenticationError(error)) {
			logWarn("Authentication error in getEnrollmentsData, returning empty data", {
				source: "getEnrollmentsData",
				data: { errorMessage: getErrorMessageForLog(error) },
			})
			return { enrollments: [], data: [], total: 0, skip: 0, take: 50, hasMore: false }
		}

		logSSRError(error, "getEnrollmentsData", "enrollments", {
			data: { status, campaignId },
		})
		return { enrollments: [], data: [], total: 0, skip: 0, take: 50, hasMore: false }
	}
}

/**
 * Get enrollment detail data
 */
export async function getEnrollmentDetailData(enrollmentId: string) {
	const client = await getAuthClient()

	// Use getEnrollmentDetail which includes history, shopper info, campaign info, etc.
	const enrollmentDetail = await client.enrollments.getEnrollmentDetail(enrollmentId)

	// Fetch platforms and campaign deliverables for categorization
	try {
		const results = await Promise.allSettled([
			client.integrations.listActivePlatforms(),
			enrollmentDetail.campaign?.id
				? client.campaigns.listCampaignDeliverables(enrollmentDetail.campaign.id).catch((error) => {
						logSSRError(error, "getEnrollmentDetailData", "campaign-deliverables", {
							data: { enrollmentId, campaignId: enrollmentDetail.campaign?.id },
						})
						return { data: [] }
					})
				: Promise.resolve({ data: [] }),
		])

		const platforms = results[0].status === "fulfilled" ? results[0].value : { platforms: [] }
		const campaignDeliverables = results[1].status === "fulfilled" ? results[1].value : { data: [] }

		// Log errors for failed promises
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				const names = ["platforms", "campaign-deliverables"]
				logSSRError(result.reason, "getEnrollmentDetailData", names[index], { data: { enrollmentId } })
			}
		})

		return {
			...enrollmentDetail,
			platforms: platforms.platforms || [],
			campaignDeliverables: campaignDeliverables?.data || [],
		}
	} catch (error) {
		logSSRError(error, "getEnrollmentDetailData", "enrollment-detail", { data: { enrollmentId } })
		return {
			...enrollmentDetail,
			platforms: [],
			campaignDeliverables: [],
		}
	}
}
