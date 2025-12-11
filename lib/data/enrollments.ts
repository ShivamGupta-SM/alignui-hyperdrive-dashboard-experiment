// Server-side data fetching for enrollments
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type enrollments as enrollmentsApi, type shared } from '@/lib/encore'
import { mockEnrollments } from '@/lib/mocks'
import type { Enrollment, Campaign } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

export interface GetEnrollmentsParams {
  status?: string
  campaignId?: string
  search?: string
  page?: number
  pageSize?: number
}

/**
 * Convert Encore Enrollment to Frontend Enrollment type
 */
function toFrontendEnrollment(enrollment: enrollmentsApi.Enrollment): Enrollment {
  // Map Encore enrollment status to frontend status
  const statusMap: Record<string, Enrollment['status']> = {
    awaiting_submission: 'awaiting_submission',
    awaiting_review: 'awaiting_review',
    changes_requested: 'changes_requested',
    approved: 'approved',
    permanently_rejected: 'rejected',
    withdrawn: 'withdrawn',
    expired: 'expired',
  }

  return {
    id: enrollment.id,
    organizationId: '', // Not in Encore model, would need to get from campaign
    campaignId: enrollment.campaignId,
    shopperId: enrollment.shopperId,
    status: statusMap[enrollment.status] || 'awaiting_submission',
    orderId: enrollment.orderId,
    orderValue: enrollment.orderValue,
    orderDate: enrollment.purchaseDate ? new Date(enrollment.purchaseDate) : new Date(),
    platform: '', // Not in Encore model
    submissionDeadline: enrollment.expiresAt ? new Date(enrollment.expiresAt) : new Date(),
    billAmount: enrollment.lockedBillRate * enrollment.orderValue / 100,
    platformFee: enrollment.lockedPlatformFee,
    gstAmount: 0, // Would calculate based on bill amount
    totalCost: 0, // Would calculate
    createdAt: new Date(enrollment.createdAt),
    updatedAt: new Date(enrollment.updatedAt),
  }
}

/**
 * Convert Encore EnrollmentWithRelations to Frontend Enrollment type
 * This includes shopper, campaign, and platform relations
 */
function toFrontendEnrollmentWithRelations(
  enrollment: enrollmentsApi.EnrollmentWithRelations
): Enrollment {
  // Map Encore enrollment status to frontend status
  const statusMap: Record<string, Enrollment['status']> = {
    awaiting_submission: 'awaiting_submission',
    awaiting_review: 'awaiting_review',
    changes_requested: 'changes_requested',
    approved: 'approved',
    permanently_rejected: 'rejected',
    withdrawn: 'withdrawn',
    expired: 'expired',
  }

  return {
    id: enrollment.id,
    organizationId: '', // Would need to get from campaign
    campaignId: enrollment.campaignId,
    shopperId: enrollment.shopperId,
    status: statusMap[enrollment.status] || 'awaiting_submission',
    orderId: enrollment.orderId,
    orderValue: enrollment.orderValue,
    orderDate: enrollment.purchaseDate ? new Date(enrollment.purchaseDate) : new Date(),
    platform: enrollment.platform?.name || '',
    submissionDeadline: enrollment.expiresAt ? new Date(enrollment.expiresAt) : new Date(),
    billAmount: enrollment.lockedBillRate * enrollment.orderValue / 100,
    platformFee: enrollment.lockedPlatformFee,
    gstAmount: 0, // Would calculate based on bill amount
    totalCost: 0, // Would calculate
    // Include shopper relation data
    shopper: enrollment.shopper
      ? {
          id: enrollment.shopper.id,
          name: enrollment.shopper.displayName,
          email: '', // Not in response
          avatar: enrollment.shopper.avatarUrl,
          previousEnrollments: enrollment.shopper.previousEnrollments,
          approvalRate: enrollment.shopper.approvalRate,
        }
      : undefined,
    // Include campaign relation data
    campaign: enrollment.campaign
      ? {
          id: enrollment.campaign.id,
          organizationId: '',
          productId: '',
          title: enrollment.campaign.title,
          type: 'cashback',
          status: (enrollment.campaign?.status ?? 'draft') as Campaign['status'],
          isPublic: true,
          startDate: new Date(),
          endDate: new Date(),
          submissionDeadlineDays: 0,
          maxEnrollments: 0,
          currentEnrollments: 0,
          approvedCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          totalPayout: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : undefined,
    createdAt: new Date(enrollment.createdAt),
    updatedAt: new Date(enrollment.updatedAt),
  }
}

/**
 * Fetch enrollments from Encore backend
 * Uses EnrollmentWithRelations which includes shopper, campaign, and platform data
 */
async function fetchEnrollmentsFromEncore(
  campaignId: string,
  params?: GetEnrollmentsParams
): Promise<Enrollment[]> {
  const client = getEncoreClient()

  const encoreParams: enrollmentsApi.ListEnrollmentsParams = {
    skip: params?.page ? (params.page - 1) * (params.pageSize || 10) : 0,
    take: params?.pageSize || 50,
    status: params?.status && params.status !== 'all'
      ? params.status as shared.EnrollmentStatus
      : undefined,
    campaignId,
  }

  // listCampaignEnrollments returns EnrollmentWithRelations[] with shopper/campaign/platform
  const response = await client.enrollments.listCampaignEnrollments(campaignId, encoreParams)
  return response.data.map(toFrontendEnrollmentWithRelations)
}

export function getEnrollments(params?: GetEnrollmentsParams): Enrollment[] {
  let enrollments = [...mockEnrollments]

  // Filter by status
  if (params?.status && params.status !== 'all') {
    enrollments = enrollments.filter(e => e.status === params.status)
  }

  // Filter by campaign
  if (params?.campaignId) {
    enrollments = enrollments.filter(e => e.campaignId === params.campaignId)
  }

  // Search by order ID or shopper name
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    enrollments = enrollments.filter(e =>
      e.orderId.toLowerCase().includes(searchLower) ||
      e.shopper?.name.toLowerCase().includes(searchLower)
    )
  }

  return enrollments
}

export function getEnrollmentById(id: string): Enrollment | null {
  return mockEnrollments.find(e => e.id === id) || null
}

/**
 * Get enrollment by ID from Encore backend
 */
export async function getEnrollmentByIdAsync(id: string): Promise<Enrollment | null> {
  if (USE_ENCORE) {
    try {
      const client = getEncoreClient()
      const enrollment = await client.enrollments.getEnrollment(id)
      return toFrontendEnrollment(enrollment)
    } catch (error) {
      console.error('Failed to fetch enrollment from Encore:', error)
    }
  }
  return getEnrollmentById(id)
}

/**
 * Get enrollment detail data for SSR hydration
 */
export async function getEnrollmentDetailData(id: string): Promise<EnrollmentDetailData | null> {
  const enrollment = await getEnrollmentByIdAsync(id)
  if (!enrollment) return null

  return {
    enrollment,
  }
}

export interface EnrollmentDetailData {
  enrollment: Enrollment
}

export function getPendingEnrollments(): Enrollment[] {
  return mockEnrollments.filter(e => e.status === 'awaiting_review')
}

export function getEnrollmentStats() {
  const enrollments = mockEnrollments
  return {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'awaiting_review').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
  }
}

// Helper function to check if enrollment is overdue (>48 hours)
const isOverdue = (date: Date): boolean => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  return diffMs > 48 * 60 * 60 * 1000
}

export function getEnrollmentStatsWithOverdue(enrollments: Enrollment[]) {
  const pendingEnrollments = enrollments.filter(e => e.status === 'awaiting_review')
  const overdueEnrollments = pendingEnrollments.filter(e => isOverdue(e.createdAt))

  return {
    total: enrollments.length,
    pending: pendingEnrollments.length,
    overdue: overdueEnrollments.length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    totalValue: enrollments.reduce((acc, e) => acc + e.orderValue, 0),
  }
}

// Types for SSR data
export interface EnrollmentStats {
  total: number
  pending: number
  overdue: number
  approved: number
  rejected: number
  totalValue: number
}

export interface EnrollmentsData {
  enrollments: Enrollment[]
  allEnrollments: Enrollment[]
  stats: EnrollmentStats
}

/**
 * Get all enrollments data for SSR hydration
 */
export async function getEnrollmentsData(
  statusFilter?: string,
  campaignId?: string
): Promise<EnrollmentsData> {
  if (USE_ENCORE && campaignId) {
    try {
      const allEnrollments = await fetchEnrollmentsFromEncore(campaignId)
      const filteredEnrollments = statusFilter && statusFilter !== 'all'
        ? await fetchEnrollmentsFromEncore(campaignId, { status: statusFilter })
        : allEnrollments
      const stats = getEnrollmentStatsWithOverdue(allEnrollments)

      return {
        enrollments: filteredEnrollments,
        allEnrollments,
        stats,
      }
    } catch (error) {
      console.error('Failed to fetch enrollments from Encore, falling back to mocks:', error)
    }
  }

  // Fallback to mock data
  const allEnrollments = getEnrollments()
  const filteredEnrollments = getEnrollments({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined
  })
  const stats = getEnrollmentStatsWithOverdue(allEnrollments)

  return {
    enrollments: filteredEnrollments,
    allEnrollments,
    stats,
  }
}
