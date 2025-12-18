"use server"

/**
 * Enrollment Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import type { shared } from "@/lib/api/encore-client"

// =============================================================================
// Schemas
// =============================================================================

const updateStatusSchema = z.object({
	id: z.string().min(1),
	status: z.enum(["approved", "rejected", "withdrawn"]),
	reason: z.string().optional(),
})

const bulkUpdateSchema = z.object({
	ids: z.array(z.string().min(1)).min(1),
	status: z.enum(["approved", "rejected"]),
	reason: z.string().optional(),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Update enrollment status (approve/reject/withdraw)
 */
export const updateEnrollmentStatus = authAction
	.inputSchema(updateStatusSchema)
	.action(async ({ parsedInput, ctx }): Promise<{ status: shared.EnrollmentStatus }> => {
		const { id, status, reason } = parsedInput

		if (status === "approved") {
			await ctx.client.enrollments.approveEnrollment(id, { remarks: reason })
		} else if (status === "rejected") {
			await ctx.client.enrollments.rejectEnrollment(id, { reason: reason || "Rejected" })
		} else if (status === "withdrawn") {
			await ctx.client.enrollments.withdrawEnrollment(id)
		}

		revalidateTag("enrollments")
		revalidateTag(`enrollment-${id}`)
		revalidateTag("dashboard")

		return { status: status as shared.EnrollmentStatus }
	})

/**
 * Bulk update enrollments
 */
export const bulkUpdateEnrollments = authAction
	.inputSchema(bulkUpdateSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { ids, status, reason } = parsedInput

		if (status === "approved") {
			await ctx.client.enrollments.bulkApproveEnrollments({
				enrollmentIds: ids,
				remarks: reason,
			})
		} else if (status === "rejected") {
			await ctx.client.enrollments.bulkRejectEnrollments({
				enrollmentIds: ids,
				reason: reason || "Rejected",
			})
		}

		revalidateTag("enrollments")
		revalidateTag("dashboard")

		return { updatedCount: ids.length }
	})
