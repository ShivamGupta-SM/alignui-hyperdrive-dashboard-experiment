/**
 * Campaigns API Mock Handlers
 */

import { http } from 'msw'
import { mockCampaigns, mockEnrollments, mockProducts } from '@/lib/mocks'
import { DURATIONS, CAMPAIGN_STATS, LIMITS } from '@/lib/types/constants'
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

function getCampaignStats(campaigns: typeof mockCampaigns) {
  const now = new Date()
  const endingSoonThreshold = new Date(now.getTime() + DURATIONS.CAMPAIGN_ENDING_SOON_DAYS * 24 * 60 * 60 * 1000)
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const endingSoon = activeCampaigns.filter(c => new Date(c.endDate) <= endingSoonThreshold)

  return {
    total: campaigns.length,
    active: activeCampaigns.length,
    endingSoon: endingSoon.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    pending: campaigns.filter(c => c.status === 'pending_approval').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalEnrollments: campaigns.reduce((acc, c) => acc + c.currentEnrollments, 0),
    totalPayout: campaigns.reduce((acc, c) => acc + c.totalPayout, 0),
  }
}

export const campaignsHandlers = [
  // GET /api/campaigns
  http.get('/api/campaigns', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let campaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    if (status && status !== 'all') {
      campaigns = campaigns.filter(c => c.status === status)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      campaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      )
    }

    const total = campaigns.length
    const paginatedCampaigns = paginateArray(campaigns, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedCampaigns, meta)
  }),

  // GET /api/campaigns/data
  http.get('/api/campaigns/data', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const allCampaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    let filteredCampaigns = allCampaigns
    if (status && status !== 'all') {
      filteredCampaigns = allCampaigns.filter(c => c.status === status)
    }

    const stats = getCampaignStats(allCampaigns)

    return successResponse({
      campaigns: filteredCampaigns,
      allCampaigns,
      stats,
    })
  }),

  // GET /api/campaigns/:id
  http.get('/api/campaigns/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const product = campaign.productId
      ? mockProducts.find(p => p.id === campaign.productId)
      : null

    return successResponse({ ...campaign, product })
  }),

  // GET /api/campaigns/:id/stats
  http.get('/api/campaigns/:id/stats', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const enrollments = mockEnrollments.filter(e => e.campaignId === id)
    const product = campaign.productId
      ? mockProducts.find(p => p.id === campaign.productId)
      : null

    // Generate weekly trend data
    const startDate = new Date(campaign.startDate)
    const now = new Date()
    const weeksElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const enrollmentTrend = Array.from({ length: Math.min(weeksElapsed, DURATIONS.MAX_TREND_WEEKS) }, (_, i) => {
      const baseEnrollments = Math.round(campaign.currentEnrollments / weeksElapsed)
      const variance = Math.round(baseEnrollments * (Math.random() * 0.4 - 0.2))
      const weekEnrollments = Math.max(1, baseEnrollments + variance)
      const approvalRate = campaign.currentEnrollments > 0
        ? campaign.approvedCount / campaign.currentEnrollments
        : 0.85
      return {
        name: `Week ${i + 1}`,
        enrollments: weekEnrollments,
        approved: Math.round(weekEnrollments * approvalRate),
      }
    })

    const awaitingSubmission = enrollments.filter(e => e.status === 'awaiting_submission').length

    const stats = {
      totalEnrollments: enrollments.length,
      pendingEnrollments: enrollments.filter(e => e.status === 'awaiting_review').length,
      approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
      rejectedEnrollments: enrollments.filter(e => e.status === 'rejected').length,
      changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
      awaitingSubmission,
      approvalRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'approved').length / enrollments.length) * 100)
        : 0,
      totalOrderValue: enrollments.reduce((acc, e) => acc + e.orderValue, 0),
      totalBillAmount: enrollments.reduce((acc, e) => acc + e.billAmount, 0),
      totalPayout: campaign.totalPayout,
      utilizationRate: campaign.maxEnrollments > 0
        ? Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100)
        : 0,
      daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      averageOrderValue: enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.orderValue, 0) / enrollments.length)
        : 0,
      avgReviewTimeHours: CAMPAIGN_STATS.AVG_REVIEW_TIME_HOURS,
      rejectionRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'rejected').length / enrollments.length) * 100)
        : 0,
      withdrawalRate: CAMPAIGN_STATS.WITHDRAWAL_RATE_PERCENT,
      productName: product?.name || campaign.title,
      productImage: product?.images?.[0] || null,
      enrollmentTrend,
    }

    return successResponse(stats)
  }),

  // POST /api/campaigns
  http.post('/api/campaigns', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const body = await request.json() as Record<string, unknown>

    const newCampaign = {
      id: `campaign-${Date.now()}`,
      organizationId: auth.organizationId,
      ...body,
      status: 'draft',
      currentEnrollments: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      totalPayout: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(newCampaign, 201)
  }),

  // PATCH /api/campaigns/:id
  http.patch('/api/campaigns/:id', async ({ params, request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const updatedCampaign = { ...campaign, ...body, updatedAt: new Date() }

    return successResponse(updatedCampaign)
  }),

  // DELETE /api/campaigns/:id
  http.delete('/api/campaigns/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'draft') {
      return errorResponse('Only draft campaigns can be deleted', 400)
    }

    return successResponse({ message: 'Campaign deleted successfully' })
  }),

  // GET /api/campaigns/:id/data - SSR hydration endpoint
  http.get('/api/campaigns/:id/data', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const enrollments = mockEnrollments
      .filter(e => e.campaignId === id)
      .map(e => ({ id: e.id, status: e.status }))

    return successResponse({ campaign, enrollments })
  }),

  // POST /api/campaigns/:id/submit - Submit for approval
  http.post('/api/campaigns/:id/submit', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'draft') {
      return errorResponse('Only draft campaigns can be submitted for approval', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'pending_approval',
      message: 'Campaign submitted for approval',
    })
  }),

  // POST /api/campaigns/:id/activate - Activate an approved campaign
  http.post('/api/campaigns/:id/activate', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'approved' && campaign.status !== 'pending_approval') {
      return errorResponse('Only approved campaigns can be activated', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'active',
      message: 'Campaign activated successfully',
    })
  }),

  // POST /api/campaigns/:id/pause - Pause an active campaign
  http.post('/api/campaigns/:id/pause', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'active') {
      return errorResponse('Only active campaigns can be paused', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'paused',
      message: 'Campaign paused successfully',
    })
  }),

  // POST /api/campaigns/:id/resume - Resume a paused campaign
  http.post('/api/campaigns/:id/resume', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'paused') {
      return errorResponse('Only paused campaigns can be resumed', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'active',
      message: 'Campaign resumed successfully',
    })
  }),

  // POST /api/campaigns/:id/end - End an active or paused campaign
  http.post('/api/campaigns/:id/end', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'active' && campaign.status !== 'paused') {
      return errorResponse('Only active or paused campaigns can be ended', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'ended',
      message: 'Campaign ended successfully',
    })
  }),

  // POST /api/campaigns/:id/complete - Complete an ended campaign
  http.post('/api/campaigns/:id/complete', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status !== 'ended') {
      return errorResponse('Only ended campaigns can be completed', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'completed',
      message: 'Campaign completed successfully',
    })
  }),

  // POST /api/campaigns/:id/archive - Archive a campaign
  http.post('/api/campaigns/:id/archive', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status === 'active') {
      return errorResponse('Active campaigns cannot be archived', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'archived',
      message: 'Campaign archived successfully',
    })
  }),

  // POST /api/campaigns/:id/cancel - Cancel a campaign
  http.post('/api/campaigns/:id/cancel', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    if (campaign.status === 'completed' || campaign.status === 'cancelled') {
      return errorResponse('This campaign cannot be cancelled', 400)
    }

    return successResponse({
      id: campaign.id,
      status: 'cancelled',
      message: 'Campaign cancelled successfully',
    })
  }),

  // POST /api/campaigns/:id/duplicate - Duplicate a campaign
  http.post('/api/campaigns/:id/duplicate', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const duplicatedCampaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      title: `${campaign.title} (Copy)`,
      status: 'draft',
      currentEnrollments: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      totalPayout: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(duplicatedCampaign, 201)
  }),

  // GET /api/campaigns/:id/validate - Validate campaign before submission
  http.get('/api/campaigns/:id/validate', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const errors: { field: string; message: string }[] = []
    const warnings: { field: string; message: string }[] = []

    // Validate required fields
    if (!campaign.title || campaign.title.length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' })
    }
    if (!campaign.productId) {
      errors.push({ field: 'productId', message: 'Product is required' })
    }
    if (!campaign.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required' })
    }
    if (!campaign.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required' })
    }
    if (campaign.maxEnrollments <= 0) {
      errors.push({ field: 'maxEnrollments', message: 'Max enrollments must be greater than 0' })
    }

    // Warnings
    if (new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      warnings.push({ field: 'endDate', message: 'Campaign ends in less than 7 days' })
    }

    return successResponse({
      isValid: errors.length === 0,
      errors,
      warnings,
      canSubmit: errors.length === 0,
    })
  }),

  // GET /api/campaigns/:id/deliverables - Get campaign deliverables
  http.get('/api/campaigns/:id/deliverables', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    // Return mock deliverables
    const deliverables = [
      { id: 'del-1', name: 'Invoice/Bill Upload', slug: 'invoice', description: 'Upload invoice or bill image', requiresProof: true },
      { id: 'del-2', name: 'Product Review', slug: 'review', description: 'Write a product review', requiresProof: true },
      { id: 'del-3', name: 'Social Media Post', slug: 'social-post', description: 'Share on social media', requiresProof: true },
    ]

    return successResponse(deliverables)
  }),

  // POST /api/campaigns/:id/deliverables/batch - Update campaign deliverables
  http.post('/api/campaigns/:id/deliverables/batch', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const { deliverables, action = 'replace' } = body as {
      deliverables?: string[]
      action?: 'replace' | 'add' | 'remove'
    }

    if (!deliverables || !Array.isArray(deliverables)) {
      return errorResponse('Deliverables array is required', 400)
    }

    return successResponse({
      id: campaign.id,
      deliverables,
      message: `Deliverables ${action}d successfully`,
    })
  }),

  // GET /api/campaigns/:id/performance - Campaign performance metrics
  http.get('/api/campaigns/:id/performance', async ({ params, request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params
    const url = new URL(request.url)
    const days = Number.parseInt(url.searchParams.get('days') || '30', 10)

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    // Generate mock performance data for the requested period
    const performanceData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const baseEnrollments = Math.round(campaign.currentEnrollments / days)
      const variance = Math.round(baseEnrollments * (Math.random() * 0.4 - 0.2))
      const dayEnrollments = Math.max(0, baseEnrollments + variance)
      const approvalRate = campaign.currentEnrollments > 0
        ? campaign.approvedCount / campaign.currentEnrollments
        : 0.85

      return {
        date: date.toISOString().split('T')[0],
        enrollments: dayEnrollments,
        approvals: Math.round(dayEnrollments * approvalRate),
        rejections: Math.round(dayEnrollments * (1 - approvalRate) * 0.3),
        orderValue: dayEnrollments * 5000 + Math.round(Math.random() * 2000),
        payouts: Math.round(dayEnrollments * 500 + Math.random() * 200),
      }
    })

    return successResponse(performanceData)
  }),

  // GET /api/campaigns/:id/pricing - Campaign pricing breakdown
  http.get('/api/campaigns/:id/pricing', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const pricing = {
      campaignId: campaign.id,
      rebatePercentage: campaign.billRate || 18,
      billRate: campaign.billRate || 18,
      platformFee: campaign.platformFee || 50,
      bonusAmount: 0,
      tdsRate: 1,
      gstRate: 18,
      estimatedCostPerEnrollment: Math.round((5000 * (campaign.billRate || 18) / 100) + (campaign.platformFee || 50) * 1.18),
    }

    return successResponse(pricing)
  }),

  // POST /api/campaigns/:id/calculate-payout - Calculate payout estimate
  http.post('/api/campaigns/:id/calculate-payout', async ({ params, request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const { orderValue } = body as { orderValue?: number }
    if (!orderValue || orderValue <= 0) {
      return errorResponse('Valid order value is required', 400)
    }

    const billRate = campaign.billRate || 18
    const platformFee = campaign.platformFee || 50
    const shopperPayout = Math.round(orderValue * billRate / 100)
    const gstAmount = Math.round(platformFee * 0.18)
    const brandCost = shopperPayout + platformFee + gstAmount

    return successResponse({
      orderValue,
      shopperPayout,
      brandCost,
      gstAmount,
      platformFee,
    })
  }),

  // GET /api/campaigns/:id/enrollments/export - Export campaign enrollments
  http.get('/api/campaigns/:id/enrollments/export', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    const status = url.searchParams.get('status')

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === auth.organizationId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    let enrollments = mockEnrollments.filter(e => e.campaignId === id)
    if (status) {
      enrollments = enrollments.filter(e => e.status === status)
    }

    const exportData = enrollments.map(e => ({
      enrollmentId: e.id,
      orderId: e.orderId,
      orderValue: e.orderValue,
      purchaseDate: e.orderDate ? new Date(e.orderDate).toISOString() : null,
      shopperName: e.shopper?.name || 'Unknown',
      shopperEmail: e.shopper?.email || '',
      status: e.status,
      rebatePercentage: campaign.billRate || 18,
      bonusAmount: 0,
      shopperPayout: e.billAmount,
      submittedAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
      approvedAt: e.status === 'approved' ? new Date(e.updatedAt).toISOString() : null,
      createdAt: new Date(e.createdAt).toISOString(),
    }))

    return successResponse({
      data: exportData,
      totalCount: exportData.length,
      campaignTitle: campaign.title,
      exportedAt: new Date().toISOString(),
      downloadUrl: format === 'xlsx' ? `/api/campaigns/${id}/enrollments/download.xlsx` : undefined,
    })
  }),

  // GET /api/campaigns/search - Search campaigns
  http.get('/api/campaigns/search', async ({ request }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const q = url.searchParams.get('q') || ''
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    // Filter campaigns by organization
    let campaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    // Apply search query (search in title and description)
    if (q) {
      const searchLower = q.toLowerCase()
      campaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (status) {
      campaigns = campaigns.filter(c => c.status === status)
    }

    // Get total before pagination
    const total = campaigns.length

    // Apply pagination
    const paginatedCampaigns = campaigns.slice(skip, skip + take)

    return successResponse({
      data: paginatedCampaigns,
      total,
      skip,
      take,
      hasMore: skip + take < total,
    })
  }),
]
