"use server"

/**
 * Enrollment Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 * URL-based multi-tenancy: organizationId from URL params passed to all actions
 *
 * Endpoints are in client.organizations namespace:
 * - approveEnrollment(orgId, campaignId, enrollmentId, params)
 * - rejectEnrollment(orgId, campaignId, enrollmentId, params)
 * - requestChanges(orgId, campaignId, enrollmentId, params)
 * - exportEnrollments(orgId, campaignId, params)
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import type { shared, organizations } from "@/brand-client"
// SSOT: Import enrollment statuses from validations
import { ENROLLMENT_STATUSES } from "@/lib/utils"

// =============================================================================
// Schemas - All actions require organizationId for URL-based multi-tenancy
// =============================================================================

// UI sends "approved" or "rejected" - we map "rejected" to backend's appropriate API
const updateStatusSchema = z.object({
	organizationId: z.string().min(1),
	campaignId: z.string().min(1),
	id: z.string().min(1),
	status: z.enum(["approved", "rejected"]), // UI action, not raw status
	reason: z.string().optional(),
})

const requestChangesSchema = z.object({
	organizationId: z.string().min(1),
	campaignId: z.string().min(1),
	id: z.string().min(1),
	feedback: z.string().min(1, "Feedback is required"),
})

const exportEnrollmentsSchema = z.object({
	organizationId: z.string().min(1),
	campaignId: z.string().min(1),
	status: z.enum(ENROLLMENT_STATUSES).optional(),
})

const extendDeadlineSchema = z.object({
	organizationId: z.string().min(1),
	campaignId: z.string().min(1),
	id: z.string().min(1),
	expiresAt: z.string().min(1, "Expiry date is required"),
})

const bulkUpdateSchema = z.object({
	organizationId: z.string().min(1),
	ids: z.array(z.string().min(1)).min(1, "At least one enrollment ID is required"),
	status: z.enum(["approved", "rejected"]),
	reason: z.string().optional(),
})

// =============================================================================
// Actions - Use organization-scoped endpoints for multi-tenancy
// =============================================================================

/**
 * Update enrollment status (approve/reject)
 * Uses organization-scoped endpoints for proper multi-tenancy
 */
export const updateEnrollmentStatus = authAction
	.inputSchema(updateStatusSchema)
	.action(async ({ parsedInput, ctx }): Promise<{ status: shared.EnrollmentStatus; enrollment: organizations.Enrollment }> => {
		const { organizationId, campaignId, id, status, reason } = parsedInput

		let result: organizations.Enrollment

		if (status === "approved") {
			result = await ctx.client.organizations.approveEnrollment(organizationId, campaignId, id, { remarks: reason })
		} else {
			// "rejected" action maps to reject API
			result = await ctx.client.organizations.rejectEnrollment(organizationId, campaignId, id, { reason: reason || "Rejected" })
		}

		revalidateTag("enrollments")
		revalidateTag(`enrollment-${id}`)
		revalidateTag("dashboard")

		// Return the actual status from backend, not the UI action
		return { status: result.status, enrollment: result }
	})

/**
 * Request changes on enrollment deliverables
 * Asks shopper to resubmit with feedback
 */
export const requestChanges = authAction
	.inputSchema(requestChangesSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, id, feedback } = parsedInput

		const result = await ctx.client.organizations.requestChanges(organizationId, campaignId, id, { reason: feedback })

		revalidateTag("enrollments")
		revalidateTag(`enrollment-${id}`)

		return { enrollmentId: result.id, status: result.status }
	})

/**
 * Export enrollments to Excel
 */
export const exportEnrollments = authAction
	.inputSchema(exportEnrollmentsSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, status } = parsedInput

		const result = await ctx.client.organizations.exportEnrollments(organizationId, campaignId, {
			status,
		})

		return result
	})

/**
 * Extend enrollment deadline
 */
export const extendDeadline = authAction
	.inputSchema(extendDeadlineSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, campaignId, id, expiresAt } = parsedInput

		const result = await ctx.client.organizations.extendEnrollmentDeadline(organizationId, campaignId, id, {
			expiresAt,
		})

		revalidateTag("enrollments")
		revalidateTag(`enrollment-${id}`)

		return { enrollmentId: result.id, expiresAt: result.expiresAt }
	})

/**
 * Bulk update enrollments (approve/reject multiple at once)
 * Uses organization-scoped bulk endpoints for multi-tenancy
 */
export const bulkUpdateEnrollments = authAction
	.inputSchema(bulkUpdateSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, ids, status, reason } = parsedInput

		if (status === "approved") {
			const result = await ctx.client.organizations.bulkApproveEnrollments(organizationId, {
				enrollmentIds: ids,
				remarks: reason,
			})

			revalidateTag("enrollments")
			revalidateTag("dashboard")

			return { updatedCount: result.approved, failedCount: result.failed, errors: result.errors }
		} else {
			const result = await ctx.client.organizations.bulkRejectEnrollments(organizationId, {
				enrollmentIds: ids,
				reason: reason || "Rejected",
			})

			revalidateTag("enrollments")
			revalidateTag("dashboard")

			return { updatedCount: result.rejected, failedCount: result.failed, errors: result.errors }
		}
	})
