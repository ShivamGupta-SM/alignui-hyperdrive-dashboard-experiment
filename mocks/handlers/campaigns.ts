/**
 * Campaigns API Mock Handlers
 * 
 * Intercepts Encore API calls at localhost:4000/campaigns
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  delay,
  DELAY,
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreErrorResponse,
  encoreNotFoundResponse,
} from './utils'

// Campaign already in Encore format from database, just add product relation
function toCampaignWithStats(campaign: any) {
  const product = db.products.findFirst((q) => q.where({ id: campaign.productId }))
  
  return {
    // Stats fields (appear first in Encore type)
    currentEnrollments: campaign.currentEnrollments || 0,
    approvedCount: campaign.approvedCount || 0,
    rejectedCount: campaign.rejectedCount || 0,
    pendingCount: campaign.pendingCount || 0,
    totalPayout: campaign.totalPayout || 0,
    product: product ? {
      id: product.id,
      name: product.name,
      price: product.price || 0,
      productImages: product.productImages || [], // Encore format
    } : undefined,
    // Campaign already in Encore format - return as-is
    ...campaign,
  }
}

export const campaignsHandlers = [
  // GET /campaigns - List campaigns
  http.get(encoreUrl('/campaigns'), async ({ request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    let campaigns = db.campaigns.findMany((q) => q.where({ organizationId: orgId }))

    if (status && status !== 'all') {
      campaigns = campaigns.filter(c => c.status === status)
    }

    campaigns.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = campaigns.length
    const paginatedCampaigns = campaigns.slice(skip, skip + take)

    return encoreListResponse(paginatedCampaigns.map(toCampaignWithStats), total, skip, take)
  }),

  // GET /campaigns/:id - Get campaign
  http.get(encoreUrl('/campaigns/:id'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse(toCampaignWithStats(campaign))
  }),

  // POST /campaigns - Create campaign
  http.post(encoreUrl('/campaigns'), async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const body = await request.json() as { title: string; productId: string; type: string }

    if (!body.title || !body.productId) {
      return encoreErrorResponse('Title and product are required', 400)
    }

    const startDate = new Date()
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const now = new Date().toISOString()
    
    const newCampaign = {
      id: `camp-${Date.now()}`,
      organizationId: auth.organizationId,
      productId: body.productId,
      title: body.title,
      description: '',
      campaignType: (body.type || 'cashback') as 'cashback' | 'barter' | 'hybrid', // Encore format
      status: 'draft' as const,
      isPublic: true,
      startDate: startDate.toISOString(), // Encore format
      endDate: endDate.toISOString(), // Encore format
      enrollmentExpiryDays: 7, // Encore format
      maxEnrollments: 100,
      currentEnrollments: 0,
      billRate: 200,
      platformFee: 20,
      rebatePercentage: 10,
      bonusAmount: 0,
      slug: undefined,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      totalPayout: 0,
      createdAt: now, // Encore format
      updatedAt: now, // Encore format
    }

    // Save to database
    db.campaigns.create(newCampaign)
    
    return encoreResponse(toCampaignWithStats(newCampaign))
  }),

  // PUT /campaigns/:id - Update campaign
  http.put(encoreUrl('/campaigns/:id'), async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params
    const body = await request.json()

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    const updated = { 
      ...campaign, 
      ...(body as Record<string, unknown>), 
      updatedAt: new Date().toISOString(), // Encore format
    }
    
    // Update in database
    db.campaigns.update({ where: { id }, data: updated })
    
    return encoreResponse(toCampaignWithStats(updated))
  }),

  // DELETE /campaigns/:id
  http.delete(encoreUrl('/campaigns/:id'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    if (campaign.status === 'active') {
      return encoreErrorResponse('Cannot delete active campaign', 400)
    }

    return encoreResponse({ deleted: true })
  }),

  // POST /campaigns/:id/activate
  http.post(encoreUrl('/campaigns/:id/activate'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({ ...toCampaignWithStats(campaign), status: 'active' })
  }),

  // POST /campaigns/:id/pause
  http.post(encoreUrl('/campaigns/:id/pause'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({ ...toCampaignWithStats(campaign), status: 'paused' })
  }),

  // GET /campaigns/:id/enrollments - Get campaign enrollments
  http.get(encoreUrl('/campaigns/:id/enrollments'), async ({ params, request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const { id } = params
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    const enrollments = db.enrollments.findMany((q) => q.where({ campaignId: id }))
    const total = enrollments.length
    const paginatedEnrollments = enrollments.slice(skip, skip + take)

    return encoreListResponse(paginatedEnrollments, total, skip, take)
  }),

  // GET /campaigns/:id/stats
  http.get(encoreUrl('/campaigns/:id/stats'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    const enrollments = db.enrollments.findMany((q) => q.where({ campaignId: id }))

    return encoreResponse({
      totalEnrollments: enrollments.length,
      approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
      pendingEnrollments: enrollments.filter(e => e.status === 'awaiting_review').length,
      rejectedEnrollments: enrollments.filter(e => e.status === 'rejected').length,
      totalPayout: enrollments.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.billAmount || 0), 0),
    })
  }),

  // POST /campaigns/:id/resume
  http.post(encoreUrl('/campaigns/:id/resume'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({ ...toCampaignWithStats(campaign), status: 'active' })
  }),

  // GET /campaigns/:id/performance
  http.get(encoreUrl('/campaigns/:id/performance'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({
      views: 15234,
      clicks: 892,
      enrollments: campaign.currentEnrollments || 0,
      conversionRate: 5.8,
      avgOrderValue: 2340,
      totalRevenue: campaign.currentEnrollments * 2340,
    })
  }),

  // GET /campaigns/:id/pricing
  http.get(encoreUrl('/campaigns/:id/pricing'), async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({
      billRate: campaign.billRate,
      platformFee: 20,
      estimatedPayout: campaign.billRate - 20,
      totalBudget: campaign.budget,
      spentBudget: campaign.approvedCount * campaign.billRate,
      remainingBudget: campaign.budget - (campaign.approvedCount * campaign.billRate),
    })
  }),

  // POST /campaigns/:id/archive
  http.post(encoreUrl('/campaigns/:id/archive'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    return encoreResponse({ ...toCampaignWithStats(campaign), status: 'ended' })
  }),

  // POST /campaigns/:id/duplicate
  http.post(encoreUrl('/campaigns/:id/duplicate'), async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const { id } = params

    const campaign = db.campaigns.findFirst((q) => q.where({ id, organizationId: auth.organizationId }))
    if (!campaign) {
      return encoreNotFoundResponse('Campaign')
    }

    const now = new Date().toISOString()
    const newCampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      title: `${campaign.title} (Copy)`,
      status: 'draft' as const,
      createdAt: now, // Encore format
      updatedAt: now, // Encore format
    }

    // Save to database
    db.campaigns.create(newCampaign)
    
    return encoreResponse(toCampaignWithStats(newCampaign))
  }),
]

