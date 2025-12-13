'use client'

import type { enrollments, shared } from '@/lib/encore-browser'

// ============================================
// Types - Re-export from Encore client for convenience
// ============================================

export type Enrollment = enrollments.Enrollment
export type EnrollmentWithRelations = enrollments.EnrollmentWithRelations
export type EnrollmentStatus = shared.EnrollmentStatus
export type EnrollmentPricing = enrollments.EnrollmentPricing
export type EnrollmentExportRow = enrollments.EnrollmentExportRow
export type OCRScanResult = enrollments.OCRScanResult
export type OCRScanStatus = enrollments.OCRScanStatus
export type OCRExtractedData = enrollments.OCRExtractedData
export type EnrollmentEventType = enrollments.EnrollmentEventType

// ============================================
// Types
// ============================================

export interface EnrollmentFilters {
  status?: string
  campaignId?: string
  search?: string
  page?: number
  limit?: number
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
