/**
 * Enrollments API Mock Handlers
 */

import { http } from 'msw'
import { mockEnrollments, mockCampaigns } from '@/lib/mocks'
import { LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

function getEnrollmentStats(enrollments: typeof mockEnrollments) {
  return {
    total: enrollments.length,
    awaitingReview: enrollments.filter(e => e.status === 'awaiting_review').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
    changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
    awaitingSubmission: enrollments.filter(e => e.status === 'awaiting_submission').length,
  }
}

export const enrollmentsHandlers = [
  // GET /api/enrollments
  http.get('/api/enrollments', async ({ request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const status = url.searchParams.get('status')
    const campaignId = url.searchParams.get('campaignId')
    const search = url.searchParams.get('search')

    // Filter by organization first
    let enrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    // Filter by status
    if (status && status !== 'all') {
      enrollments = enrollments.filter(e => e.status === status)
    }

    // Filter by campaign
    if (campaignId) {
      enrollments = enrollments.filter(e => e.campaignId === campaignId)
    }

    // Search by order ID or shopper name
    if (search) {
      const searchLower = search.toLowerCase()
      enrollments = enrollments.filter(e =>
        e.orderId.toLowerCase().includes(searchLower) ||
        e.shopper?.name.toLowerCase().includes(searchLower)
      )
    }

    const total = enrollments.length
    const paginatedEnrollments = paginateArray(enrollments, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedEnrollments, meta)
  }),

  // GET /api/enrollments/data
  http.get('/api/enrollments/data', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const campaignId = url.searchParams.get('campaignId')

    const allEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    let filteredEnrollments = allEnrollments
    if (status && status !== 'all') {
      filteredEnrollments = allEnrollments.filter(e => e.status === status)
    }
    if (campaignId) {
      filteredEnrollments = filteredEnrollments.filter(e => e.campaignId === campaignId)
    }

    // Get campaigns for filter dropdown
    const campaigns = mockCampaigns
      .filter(c => c.organizationId === orgId)
      .map(c => ({ id: c.id, title: c.title }))

    const stats = getEnrollmentStats(allEnrollments)

    return successResponse({
      enrollments: filteredEnrollments,
      allEnrollments,
      campaigns,
      stats,
    })
  }),

  // GET /api/enrollments/:id
  http.get('/api/enrollments/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    return successResponse(enrollment)
  }),

  // GET /api/enrollments/:id/data
  http.get('/api/enrollments/:id/data', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Get related campaign
    const campaign = mockCampaigns.find(c => c.id === enrollment.campaignId)

    return successResponse({
      enrollment,
      campaign,
    })
  }),

  // PATCH /api/enrollments/:id
  http.patch('/api/enrollments/:id', async ({ params, request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    const { status, reason } = body as { status?: string; reason?: string }

    const updatedEnrollment = {
      ...enrollment,
      ...(status && { status }),
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id as string,
          action: `Status changed to ${status}`,
          description: reason || `Enrollment ${status}`,
          performedBy: auth.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  }),

  // POST /api/enrollments/:id/approve
  http.post('/api/enrollments/:id/approve', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    if (enrollment.status !== 'awaiting_review') {
      return errorResponse('Only enrollments awaiting review can be approved', 400)
    }

    const updatedEnrollment = {
      ...enrollment,
      status: 'approved',
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id as string,
          action: 'Approved',
          description: (body.notes as string) || 'Enrollment approved',
          performedBy: auth.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  }),

  // POST /api/enrollments/:id/reject
  http.post('/api/enrollments/:id/reject', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    if (enrollment.status !== 'awaiting_review') {
      return errorResponse('Only enrollments awaiting review can be rejected', 400)
    }

    const { reason } = body as { reason?: string }

    const updatedEnrollment = {
      ...enrollment,
      status: 'rejected',
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id as string,
          action: 'Rejected',
          description: reason || 'Enrollment rejected',
          performedBy: auth.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  }),

  // POST /api/enrollments/:id/request-changes
  http.post('/api/enrollments/:id/request-changes', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    const { reason } = body as { reason?: string }

    const updatedEnrollment = {
      ...enrollment,
      status: 'changes_requested',
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id as string,
          action: 'Changes Requested',
          description: reason || 'Additional changes requested',
          performedBy: auth.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  }),

  // POST /api/enrollments/:id/extend-deadline
  http.post('/api/enrollments/:id/extend-deadline', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    const { days, reason } = body as { days?: number; reason?: string }

    const currentDeadline = new Date(enrollment.submissionDeadline)
    const newDeadline = new Date(currentDeadline.getTime() + (days || 7) * 24 * 60 * 60 * 1000)

    const updatedEnrollment = {
      ...enrollment,
      submissionDeadline: newDeadline,
      updatedAt: new Date(),
      history: [
        ...(enrollment.history || []),
        {
          id: `hist_${Date.now()}`,
          enrollmentId: id as string,
          action: 'Deadline Extended',
          description: reason || `Deadline extended by ${days || 7} days`,
          performedBy: auth.user.name,
          performedAt: new Date(),
        },
      ],
    }

    return successResponse(updatedEnrollment)
  }),

  // PATCH /api/enrollments/bulk - Bulk update enrollments (client uses PATCH)
  http.patch('/api/enrollments/bulk', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const body = await request.json() as Record<string, unknown>
    const { ids, status, reason } = body as {
      ids?: string[]
      status?: string
      reason?: string
    }

    if (!status || !ids?.length) {
      return errorResponse('Status and enrollment IDs are required', 400)
    }

    let updatedCount = 0
    for (const enrollmentId of ids) {
      const enrollment = mockEnrollments.find(
        e => e.id === enrollmentId && e.organizationId === auth.organizationId
      )

      if (enrollment && enrollment.status === 'awaiting_review') {
        updatedCount++
      }
    }

    return successResponse({
      updatedCount,
    })
  }),

  // GET /api/enrollments/:id/pricing - Get pricing details for an enrollment
  http.get('/api/enrollments/:id/pricing', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === auth.organizationId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    // Generate pricing based on enrollment data
    const orderValue = enrollment.orderValue || 5000
    const platformFee = Math.round(orderValue * 0.02) // 2% platform fee
    const gstRate = 0.18 // 18% GST
    const gstAmount = Math.round(platformFee * gstRate)
    const billAmount = enrollment.billAmount || Math.round(orderValue * 0.1)
    const totalDeductions = platformFee + gstAmount
    const netPayout = billAmount - totalDeductions

    const pricing = {
      orderValue,
      billAmount,
      platformFee,
      platformFeePercent: 2,
      gstRate: gstRate * 100,
      gstAmount,
      totalDeductions,
      netPayout,
      currency: 'INR',
      breakdown: [
        { label: 'Order Value', amount: orderValue, type: 'info' as const },
        { label: 'Bill Amount (Payout)', amount: billAmount, type: 'earning' as const },
        { label: 'Platform Fee (2%)', amount: -platformFee, type: 'deduction' as const },
        { label: 'GST (18%)', amount: -gstAmount, type: 'deduction' as const },
        { label: 'Net Payout', amount: netPayout, type: 'total' as const },
      ],
    }

    return successResponse(pricing)
  }),

  // GET /api/enrollments/stats - Get enrollment statistics
  http.get('/api/enrollments/stats', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const orgEnrollments = mockEnrollments.filter(e => e.organizationId === orgId)

    const stats = {
      total: orgEnrollments.length,
      pending: orgEnrollments.filter(e => e.status === 'enrolled' || e.status === 'awaiting_submission').length,
      awaitingReview: orgEnrollments.filter(e => e.status === 'awaiting_review').length,
      approved: orgEnrollments.filter(e => e.status === 'approved').length,
      rejected: orgEnrollments.filter(e => e.status === 'rejected').length,
      expired: orgEnrollments.filter(e => e.status === 'expired').length,
      averageApprovalTime: 2.5, // Mock: 2.5 hours average
      approvalRate: orgEnrollments.length > 0
        ? Math.round((orgEnrollments.filter(e => e.status === 'approved').length / orgEnrollments.length) * 100)
        : 0,
    }

    return successResponse(stats)
  }),

  // GET /api/enrollments/scan-status/:scanId - Get OCR scan status
  http.get('/api/enrollments/scan-status/:scanId', async ({ params }) => {
    await delay(DELAY.FAST)

    const { scanId } = params

    // Mock scan results
    const mockScanResults: Record<string, {
      scanId: string
      enrollmentId?: string
      campaignId?: string
      status: 'pending' | 'processing' | 'completed' | 'failed'
      extractedData?: {
        orderId?: string
        orderDate?: string
        totalAmount?: number
        productName?: string
        sellerName?: string
        platform?: string
      }
      confidence?: number
      errorMessage?: string
      createdAt: string
      completedAt?: string
    }> = {
      'scan_001': {
        scanId: 'scan_001',
        enrollmentId: 'enr_001',
        campaignId: 'camp_001',
        status: 'completed',
        extractedData: {
          orderId: 'ORD-2024-12345',
          orderDate: '2024-12-01',
          totalAmount: 5499,
          productName: 'Samsung Galaxy Earbuds',
          sellerName: 'Samsung Official Store',
          platform: 'Amazon',
        },
        confidence: 0.95,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3500000).toISOString(),
      },
      'scan_002': {
        scanId: 'scan_002',
        enrollmentId: 'enr_002',
        campaignId: 'camp_001',
        status: 'processing',
        createdAt: new Date(Date.now() - 30000).toISOString(),
      },
      'scan_003': {
        scanId: 'scan_003',
        enrollmentId: 'enr_003',
        campaignId: 'camp_002',
        status: 'failed',
        errorMessage: 'Could not extract order details from image. Please upload a clearer receipt.',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 7100000).toISOString(),
      },
    }

    const scanResult = mockScanResults[scanId as string]

    if (!scanResult) {
      return notFoundResponse('Scan result')
    }

    return successResponse(scanResult)
  }),
]
