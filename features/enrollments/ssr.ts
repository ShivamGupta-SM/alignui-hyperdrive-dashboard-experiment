/**
 * Enrollments SSR Data Fetching
 *
 * Server-side data fetching for enrollment pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { getAuthClient } from "@/lib/auth/server"
import { logSSRError, logWarn } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"
import { isValidEnrollmentStatus } from "@/lib/utils/validators"
import type { shared } from "@/brand-client"

// Default fallback for enrollments
const EMPTY_ENROLLMENTS_RESPONSE = {
	enrollments: [],
	data: [],
	total: 0,
	skip: 0,
	take: SSR_PAGE_SIZE.DEFAULT,
	hasMore: false,
}

/**
 * Get enrollments list
 * Uses ssrFetch for standardized error handling
 */
export async function getEnrollmentsData(organizationId: string | null, status?: string, campaignId?: string) {
	if (!organizationId) {
		logWarn("No organizationId provided for enrollments query", { source: "getEnrollmentsData" })
		return EMPTY_ENROLLMENTS_RESPONSE
	}

	return ssrFetch(
		{
			source: "getEnrollmentsData",
			feature: "enrollments",
			context: { organizationId, status, campaignId },
		},
		async (client) => {
			const params: {
				skip: number
				take: number
				status?: shared.EnrollmentStatus
				campaignId?: string
			} = {
				skip: 0,
				take: SSR_PAGE_SIZE.DEFAULT,
			}

			if (status && status !== "all" && isValidEnrollmentStatus(status)) {
				params.status = status
			}

			if (campaignId && campaignId !== "") {
				params.campaignId = campaignId
			}

			const response = await client.organizations.listOrganizationEnrollments(organizationId, params)
			// ✅ FIX Bug 16: Explicit return instead of spread to avoid exposing internal fields
			return {
				enrollments: response.data || [],
				data: response.data || [],
				total: response.total ?? 0,
				skip: response.skip ?? 0,
				take: response.take ?? SSR_PAGE_SIZE.DEFAULT,
				hasMore: response.hasMore ?? false,
			}
		},
		EMPTY_ENROLLMENTS_RESPONSE
	)
}

/**
 * Get enrollment detail data
 * URL-based multi-tenancy: organizationId from URL params
 *
 * Uses new direct endpoint: GET /organizations/:orgId/enrollments/:enrollmentId/detail
 * No campaignId lookup required - backend handles validation internally.
 */
export async function getEnrollmentDetailData(organizationId: string, enrollmentId: string) {
	const client = await getAuthClient()

	// Use new direct endpoint - no campaignId required
	const enrollmentDetail = await client.organizations.getEnrollmentDetailById(organizationId, enrollmentId)

	// Get campaignId from the enrollment detail for fetching deliverables
	const campaignId = enrollmentDetail.campaign.id

	// Fetch platforms and campaign deliverables for categorization
	try {
		const results = await Promise.allSettled([
			client.platforms.listActivePlatforms(),
			client.organizations.listCampaignDeliverables(organizationId, campaignId).catch((error) => {
				logSSRError(error, "getEnrollmentDetailData", "campaign-deliverables", {
					data: { enrollmentId, campaignId },
				})
				return { data: [] }
			}),
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
