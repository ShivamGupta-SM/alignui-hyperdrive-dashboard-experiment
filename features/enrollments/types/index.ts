/**
 * Enrollments Feature Types
 *
 * @description
 * Single source of truth for all enrollment-related types.
 * Note: EnrollmentWithRelations and some other types are in 'organizations' namespace
 */

import type { enrollments, organizations, shared } from "@/brand-client"
import type { BaseFilters } from "@/lib/types/base"

// Re-export from Encore client
// Basic enrollment types from 'enrollments' namespace
export type Enrollment = enrollments.Enrollment
export type EnrollmentDetail = enrollments.EnrollmentDetail
export type EnrollmentDeliverable = enrollments.EnrollmentDeliverable
export type EnrollmentPricing = enrollments.EnrollmentPricing
export type EnrollmentEventType = enrollments.EnrollmentEventType

// These types are in 'organizations' namespace (used in org-scoped endpoints)
export type EnrollmentWithRelations = organizations.EnrollmentWithRelations
export type EnrollmentExportRow = organizations.EnrollmentExportRow

// Status type from shared
export type EnrollmentStatus = shared.EnrollmentStatus

// OCR types
export type OCRScanResult = enrollments.OCRScanResult
export type OCRScanStatus = enrollments.OCRScanStatus
export type OCRExtractedData = enrollments.OCRExtractedData
export type OCRValidation = enrollments.OCRValidation
export type ScanOrderResult = enrollments.ScanOrderResult

// Request types
export type CreateEnrollmentRequest = enrollments.CreateEnrollmentRequest

// Feature-specific types
export interface EnrollmentFilters extends BaseFilters {
	status?: EnrollmentStatus
	campaignId?: string
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

// Stats types
import type { BaseStats } from "@/lib/types/base"

export interface EnrollmentStats extends BaseStats {
	pending: number
	approved: number
	rejected: number
	expired: number
}
