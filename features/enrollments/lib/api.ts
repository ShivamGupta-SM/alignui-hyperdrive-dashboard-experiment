/**
 * Enrollments API - Single source of truth for all enrollment operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { enrollments } from "@/lib/api/encore-client"

/**
 * Get enrollment by ID
 * 
 * @param id - Enrollment ID
 * @returns Enrollment data
 */
export async function getEnrollment(id: string) {
	const client = getEncoreBrowserClient()
	return client.enrollments.getEnrollment(id)
}

/**
 * List enrollments
 * 
 * @param params - List parameters
 * @returns List of enrollments
 */
export async function listEnrollments(params?: enrollments.ListEnrollmentsParams) {
	const client = getEncoreBrowserClient()
	return client.enrollments.listMyEnrollments(params || {})
}

/**
 * Approve enrollment
 * 
 * @param id - Enrollment ID
 * @param data - Approval data
 * @returns Approval result
 */
export async function approveEnrollment(id: string, data: enrollments.ApproveEnrollmentRequest) {
	const client = getEncoreBrowserClient()
	return client.enrollments.approveEnrollment(id, data)
}

/**
 * Reject enrollment
 * 
 * @param id - Enrollment ID
 * @param data - Rejection data
 */
export async function rejectEnrollment(id: string, data: enrollments.RejectEnrollmentRequest) {
	const client = getEncoreBrowserClient()
	return client.enrollments.rejectEnrollment(id, data)
}

/**
 * Withdraw enrollment
 * 
 * @param id - Enrollment ID
 */
export async function withdrawEnrollment(id: string) {
	const client = getEncoreBrowserClient()
	return client.enrollments.withdrawEnrollment(id)
}

