/**
 * Enrollments Server Actions
 * 
 * @description
 * Server-side actions for enrollment mutations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import type { Result } from "@/shared/lib/errors/types"
import type { shared } from "@/lib/api/encore-client"
import { updateEnrollmentBodySchema, bulkUpdateEnrollmentBodySchema } from "@/lib/utils/validations"

/**
 * Update enrollment status
 * 
 * @description
 * Updates enrollment status (approve, reject, withdraw).
 * 
 * @param id - Enrollment ID
 * @param status - New status
 * @param reason - Optional reason
 * @returns Result indicating success or error
 */
export async function updateEnrollmentStatus(
	id: string,
	status: string,
	reason?: string
): Promise<Result<{ status: shared.EnrollmentStatus }>> {
	const client = getEncoreClient()

	if (!id || typeof id !== "string") {
		return { success: false, error: new Error("Enrollment ID is required") }
	}

	const validation = updateEnrollmentBodySchema.safeParse({ status, reason })
	if (!validation.success) {
		return {
			success: false,
			error: new Error(validation.error.issues[0]?.message || "Invalid input"),
		}
	}

	try {
		if (status === "approved") {
			await client.enrollments.approveEnrollment(id, { remarks: reason })
		} else if (status === "rejected") {
			await client.enrollments.rejectEnrollment(id, { reason: reason || "Rejected" })
		} else if (status === "withdrawn") {
			await client.enrollments.withdrawEnrollment(id)
		} else {
			throw new Error("Invalid status transition")
		}

		revalidatePath("/dashboard/enrollments")
		revalidatePath(`/dashboard/enrollments/${id}`)
		revalidatePath("/dashboard")

		return { success: true, data: { status: status as shared.EnrollmentStatus } }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Bulk update enrollments
 * 
 * @description
 * Updates multiple enrollments at once.
 * 
 * @param ids - Array of enrollment IDs
 * @param status - New status
 * @param reason - Optional reason
 * @returns Result with updated count or error
 */
export async function bulkUpdateEnrollments(
	ids: string[],
	status: string,
	reason?: string
): Promise<Result<{ updatedCount: number }>> {
	const client = getEncoreClient()

	const validation = bulkUpdateEnrollmentBodySchema.safeParse({ ids, status, reason })
	if (!validation.success) {
		return {
			success: false,
			error: new Error(validation.error.issues[0]?.message || "Invalid input"),
		}
	}

	try {
		if (status === "approved") {
			await client.enrollments.bulkApproveEnrollments({
				enrollmentIds: ids,
				remarks: reason,
			})
		} else if (status === "rejected") {
			await client.enrollments.bulkRejectEnrollments({
				enrollmentIds: ids,
				reason: reason || "Rejected",
			})
		} else {
			throw new Error(`Bulk ${status} not supported`)
		}

		revalidatePath("/dashboard/enrollments")
		revalidatePath("/dashboard")

		return { success: true, data: { updatedCount: ids.length } }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}
