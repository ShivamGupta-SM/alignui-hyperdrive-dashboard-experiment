// Enrollment Types
// Re-export from Encore (source of truth) for backwards compatibility

import type { enrollments, shared } from "@/lib/api/encore-client"

// Re-export Encore types as source of truth
export type EnrollmentStatus = shared.EnrollmentStatus
export type Enrollment = enrollments.Enrollment
export type EnrollmentWithRelations = enrollments.EnrollmentWithRelations

// Frontend-specific types (not in backend)
// These are UI-only types that don't exist in Encore

export interface EnrollmentSubmission {
	id: string
	enrollmentId: string
	deliverableId: string
	fileUrl: string
	fileType: string
	status: "pending" | "approved" | "rejected"
	submittedAt: Date
}

export interface EnrollmentHistoryItem {
	id: string
	enrollmentId: string
	action: string
	description: string
	performedBy?: string
	performedAt: Date
}
