/**
 * Enrollments API Mock Handlers
 * 
 * Intercepts Encore API calls at localhost:4000/enrollments
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreErrorResponse,
  encoreNotFoundResponse,
} from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

// Enrollment already in Encore format from database - return as-is
function toEnrollmentWithRelations(enrollment: any) {
  return enrollment
}

export const enrollmentsHandlers = [
  // GET /enrollments - List enrollments
  http.get(encoreUrl('/enrollments'), async ({ request }) => {
    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')
    const campaignId = url.searchParams.get('campaignId')

    let enrollments = db.enrollments.findMany((q) => q.where({ organizationId: orgId }))

    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }
    if (campaignId) {
      enrollments = enrollments.filter(e => e.campaignId === campaignId)
    }

    enrollments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(paginatedEnrollments.map(toEnrollmentWithRelations), total, skip, take)
  }),

  // GET /enrollments/me - My enrollments (alias)
  http.get(encoreUrl('/enrollments/me'), async ({ request }) => {
    const auth = getAuthContext()
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    let enrollments = db.enrollments.findMany((q) => q.where({ organizationId: auth.organizationId }))

    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(paginatedEnrollments.map(toEnrollmentWithRelations), total, skip, take)
  }),

  // GET /enrollments/:id - Get enrollment
  http.get(encoreUrl('/enrollments/:id'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params
    const enrollmentId = Array.isArray(id) ? id[0] : id

    if (!enrollmentId) {
      return encoreNotFoundResponse('Enrollment')
    }

    const enrollment = db.enrollments.findFirst((q) => q.where({ id: enrollmentId as string, organizationId: auth.organizationId }))
    if (!enrollment) {
      return encoreNotFoundResponse('Enrollment')
    }

    return encoreResponse(toEnrollmentWithRelations(enrollment))
  }),

  // POST /enrollments/:id/approve
  http.post(encoreUrl('/enrollments/:id/approve'), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params

    const enrollment = db.enrollments.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!enrollment) {
      return encoreNotFoundResponse('Enrollment')
    }

    if (enrollment.status !== 'awaiting_review') {
      return encoreErrorResponse('Only enrollments awaiting review can be approved', 400)
    }

    return encoreResponse({
      ...toEnrollmentWithRelations(enrollment),
      status: 'approved',
      approvedAt: new Date().toISOString(),
    })
  }),

  // POST /enrollments/:id/reject
  http.post(encoreUrl('/enrollments/:id/reject'), async ({ params, request }) => {
    const auth = getAuthContext()
    const { id } = params
    await request.json().catch(() => ({}))

    const enrollment = db.enrollments.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!enrollment) {
      return encoreNotFoundResponse('Enrollment')
    }

    if (enrollment.status !== 'awaiting_review') {
      return encoreErrorResponse('Only enrollments awaiting review can be rejected', 400)
    }

    return encoreResponse({
      ...toEnrollmentWithRelations(enrollment),
      status: 'rejected',
    })
  }),

  // POST /enrollments/:id/request-changes
  http.post(encoreUrl('/enrollments/:id/request-changes'), async ({ params }) => {
    const auth = getAuthContext()
    const { id } = params

    const enrollment = db.enrollments.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!enrollment) {
      return encoreNotFoundResponse('Enrollment')
    }

    return encoreResponse({
      ...toEnrollmentWithRelations(enrollment),
      status: 'changes_requested',
      canResubmit: true,
    })
  }),

  // POST /enrollments/batch/approve - Bulk approve
  http.post(encoreUrl('/enrollments/batch/approve'), async ({ request }) => {
    const auth = getAuthContext()
    const body = await request.json() as { enrollmentIds: string[] }

    if (!body.enrollmentIds?.length) {
      return encoreErrorResponse('At least one enrollment ID is required', 400)
    }

    let approved = 0
    const errors: Record<string, string> = {}

    for (const enrollmentId of body.enrollmentIds) {
      const enrollment = db.enrollments.findFirst((q) => q.where({ id: enrollmentId, organizationId: auth.organizationId }))
      if (!enrollment) {
        errors[enrollmentId] = 'Not found'
      } else if (enrollment.status !== 'awaiting_review') {
        errors[enrollmentId] = 'Not awaiting review'
      } else {
        approved++
      }
    }

    return encoreResponse({ approved, failed: Object.keys(errors).length, errors })
  }),

  // POST /enrollments/batch/reject - Bulk reject
  http.post(encoreUrl('/enrollments/batch/reject'), async ({ request }) => {
    const auth = getAuthContext()
    const body = await request.json() as { enrollmentIds: string[]; reason: string }

    if (!body.enrollmentIds?.length) {
      return encoreErrorResponse('At least one enrollment ID is required', 400)
    }

    let rejected = 0
    const errors: Record<string, string> = {}

    for (const enrollmentId of body.enrollmentIds) {
      const enrollment = db.enrollments.findFirst((q) => q.where({ id: enrollmentId, organizationId: auth.organizationId }))
      if (!enrollment) {
        errors[enrollmentId] = 'Not found'
      } else if (enrollment.status !== 'awaiting_review') {
        errors[enrollmentId] = 'Not awaiting review'
      } else {
        rejected++
      }
    }

    return encoreResponse({ rejected, failed: Object.keys(errors).length, errors })
  }),

  // GET /campaigns/:campaignId/enrollments
  http.get(encoreUrl('/campaigns/:campaignId/enrollments'), async ({ params, request }) => {
    const auth = getAuthContext()
    const { campaignId } = params
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    const campaign = db.campaigns.findFirst((q) => q.where({ id: campaignId, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    let enrollments = db.enrollments.findMany((q) => q.where({ campaignId }))

    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }

    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(paginatedEnrollments.map(toEnrollmentWithRelations), total, skip, take)
  }),

  // GET /campaigns/:campaignId/enrollment-stats
  http.get(encoreUrl('/campaigns/:campaignId/enrollment-stats'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { campaignId } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id: campaignId, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    const enrollments = db.enrollments.findMany((q) => q.where({ campaignId }))

    return encoreResponse({
      total: enrollments.length,
      awaitingSubmission: enrollments.filter(e => e.status === 'awaiting_submission').length,
      awaitingReview: enrollments.filter(e => e.status === 'awaiting_review').length,
      changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
      approved: enrollments.filter(e => e.status === 'approved').length,
      rejected: enrollments.filter(e => e.status === 'rejected').length,
      totalOrderValue: enrollments.reduce((sum, e) => sum + (e.orderValue || 0), 0),
      totalPayouts: enrollments.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.lockedBillRate || 0), 0),
    })
  }),
]
