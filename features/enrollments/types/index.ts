/**
 * Enrollments Feature Types
 */

import type { enrollments, shared } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Enrollment = enrollments.Enrollment
export type EnrollmentWithRelations = enrollments.EnrollmentWithRelations
export type EnrollmentStatus = shared.EnrollmentStatus
export type EnrollmentPricing = enrollments.EnrollmentPricing
export type EnrollmentExportRow = enrollments.EnrollmentExportRow
export type OCRScanResult = enrollments.OCRScanResult
export type OCRScanStatus = enrollments.OCRScanStatus
export type OCRExtractedData = enrollments.OCRExtractedData
export type EnrollmentEventType = enrollments.EnrollmentEventType

// Feature-specific types
export interface EnrollmentFilters {
	status?: string
	campaignId?: string
	search?: string
	skip?: number
	take?: number
	[key: string]: string | number | undefined
}

export interface EnrollmentTransitionHistoryItem {
	id: string
	fromStatus: string | null
	toStatus: string
	triggeredBy: string
	triggeredByName: string
	reason: string | null
	createdAt: string
}

export interface EnrollmentTransitionsResponse {
	enrollmentId: string
	currentStatus: string
	allowedTransitions: EnrollmentEventType[]
	history: EnrollmentTransitionHistoryItem[]
}

