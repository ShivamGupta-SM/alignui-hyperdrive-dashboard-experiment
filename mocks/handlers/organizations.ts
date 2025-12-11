/**
 * Organizations API Mock Handlers
 */

import { http } from 'msw'
import { mockCampaigns, mockEnrollments } from '@/lib/mocks'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  notFoundResponse,
  errorResponse,
} from './utils'

// Mock organizations data
const mockOrganizations = [
  {
    id: '1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    logo: null,
    website: 'https://acme.example.com',
    industry: 'E-commerce',
    size: '50-200',
    description: 'Leading e-commerce platform',
    status: 'active' as const,
    verificationStatus: 'verified' as const,
    creditLimit: 500000,
    currentCredit: 125000,
    gstNumber: '22AAAAA0000A1Z5',
    panNumber: 'AAAAA0000A',
    billingAddress: {
      line1: '123 Business Park',
      line2: 'Suite 100',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en',
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
      },
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-06-01').toISOString(),
  },
  {
    id: '2',
    name: 'TechStart Inc',
    slug: 'techstart-inc',
    logo: null,
    website: 'https://techstart.example.com',
    industry: 'Technology',
    size: '10-50',
    description: 'Innovative tech startup',
    status: 'active' as const,
    verificationStatus: 'verified' as const,
    creditLimit: 200000,
    currentCredit: 50000,
    gstNumber: '22BBBBB0000B1Z5',
    panNumber: 'BBBBB0000B',
    billingAddress: {
      line1: '456 Tech Hub',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en',
      notificationPreferences: {
        email: true,
        push: false,
        sms: false,
      },
    },
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-05-15').toISOString(),
  },
]

export const organizationsHandlers = [
  // GET /api/organizations/my - List user's organizations
  http.get('/api/organizations/my', async () => {
    await delay(DELAY.FAST)

    const orgs = mockOrganizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      role: org.id === '1' ? 'owner' : 'member',
      status: org.status,
      verificationStatus: org.verificationStatus,
    }))

    return successResponse(orgs)
  }),

  // GET /api/organizations/current - Get current organization
  http.get('/api/organizations/current', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const org = mockOrganizations.find(o => o.id === auth.organizationId)

    if (!org) {
      return notFoundResponse('Organization')
    }

    return successResponse(org)
  }),

  // GET /api/organizations/:id - Get organization by ID
  http.get('/api/organizations/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    return successResponse(org)
  }),

  // POST /api/organizations/switch - Switch active organization
  http.post('/api/organizations/switch', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const body = await request.json() as Record<string, unknown>
    const { organizationId } = body as { organizationId?: string }

    if (!organizationId) {
      return errorResponse('Organization ID is required', 400)
    }

    const org = mockOrganizations.find(o => o.id === organizationId)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // In a real app, this would update the session
    return successResponse({
      message: 'Organization switched successfully',
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    })
  }),

  // PATCH /api/organizations/:id - Update organization
  http.patch('/api/organizations/:id', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    const updatedOrg = {
      ...org,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return successResponse(updatedOrg)
  }),

  // PATCH /api/organizations/:id/logo - Update organization logo
  http.patch('/api/organizations/:id/logo', async ({ params, request }) => {
    await delay(DELAY.SLOW)

    const { id } = params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // Handle both JSON body and FormData
    let logoUrl: string | null = null
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const body = await request.json() as Record<string, unknown>
      logoUrl = (body.logoUrl as string) || null
    } else if (contentType?.includes('multipart/form-data')) {
      // For FormData, generate a mock URL
      logoUrl = `https://storage.example.com/logos/${id}/${Date.now()}.png`
    }

    return successResponse({
      id: org.id,
      logo: logoUrl,
      message: 'Logo updated successfully',
    })
  }),

  // POST /api/organizations/:id/credit-increase - Request credit limit increase
  http.post('/api/organizations/:id/credit-increase', async ({ params, request }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params
    const body = await request.json() as Record<string, unknown>

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    const { requestedAmount, reason, documents } = body as {
      requestedAmount?: number
      reason?: string
      documents?: string[]
    }

    if (!requestedAmount || requestedAmount <= org.creditLimit) {
      return errorResponse('Requested amount must be greater than current credit limit', 400)
    }

    if (!reason || reason.length < 10) {
      return errorResponse('Please provide a detailed reason for the credit increase', 400)
    }

    const request_id = `cr-${Date.now()}`

    return successResponse({
      requestId: request_id,
      organizationId: id,
      currentCreditLimit: org.creditLimit,
      requestedAmount,
      reason,
      documents: documents || [],
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '3-5 business days',
      message: 'Credit increase request submitted successfully',
    })
  }),

  // GET /api/organizations/:id/credit-requests - Get credit increase request history
  http.get('/api/organizations/:id/credit-requests', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // Mock credit increase request history
    const requests = [
      {
        id: 'cr-1',
        organizationId: id,
        previousLimit: 300000,
        requestedAmount: 500000,
        approvedAmount: 500000,
        reason: 'Expanding marketing campaigns for Q4',
        status: 'approved' as const,
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'Admin User',
        notes: 'Approved based on payment history',
      },
      {
        id: 'cr-2',
        organizationId: id,
        previousLimit: 500000,
        requestedAmount: 750000,
        approvedAmount: null,
        reason: 'Planning major campaign expansion',
        status: 'pending_review' as const,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        notes: null,
      },
    ]

    return successResponse(requests)
  }),

  // GET /api/organizations/:id/members - Get organization members
  http.get('/api/organizations/:id/members', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    const members = [
      {
        id: 'mem-1',
        userId: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mem-2',
        userId: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: null,
        role: 'admin',
        status: 'active',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mem-3',
        userId: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        avatar: null,
        role: 'member',
        status: 'active',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return successResponse(members)
  }),

  // GET /api/organizations/:id/activity - Get organization activity
  http.get('/api/organizations/:id/activity', async ({ params, request }) => {
    await delay(DELAY.FAST)

    const { id } = params
    const url = new URL(request.url)
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // Generate mock activity
    const activities = [
      {
        id: 'act-1',
        type: 'campaign_created',
        description: 'New campaign "Summer Sale 2024" was created',
        entityType: 'campaign',
        entityId: 'camp-1',
        performedBy: 'John Doe',
        performedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-2',
        type: 'enrollment_approved',
        description: 'Enrollment #ENR-001 was approved',
        entityType: 'enrollment',
        entityId: 'enr-1',
        performedBy: 'Jane Smith',
        performedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-3',
        type: 'team_member_invited',
        description: 'Bob Wilson was invited to the team',
        entityType: 'team',
        entityId: 'mem-3',
        performedBy: 'John Doe',
        performedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-4',
        type: 'withdrawal_requested',
        description: 'Withdrawal of ₹50,000 was requested',
        entityType: 'wallet',
        entityId: 'wd-1',
        performedBy: 'John Doe',
        performedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-5',
        type: 'campaign_activated',
        description: 'Campaign "Winter Collection" was activated',
        entityType: 'campaign',
        entityId: 'camp-2',
        performedBy: 'Jane Smith',
        performedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const paginatedActivities = activities.slice(skip, skip + take)

    return successResponse({
      data: paginatedActivities,
      total: activities.length,
      skip,
      take,
      hasMore: skip + take < activities.length,
    })
  }),

  // GET /api/organizations/:id/campaign-stats - Get organization campaign statistics
  http.get('/api/organizations/:id/campaign-stats', async ({ params }) => {
    await delay(DELAY.FAST)

    const { id } = params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    // Calculate campaign statistics from mock data
    const orgCampaigns = mockCampaigns.filter(c => c.organizationId === id)
    const orgEnrollments = mockEnrollments.filter(e =>
      orgCampaigns.some(c => c.id === e.campaignId)
    )

    const totalCampaigns = orgCampaigns.length
    const activeCampaigns = orgCampaigns.filter(c => c.status === 'active').length
    const completedCampaigns = orgCampaigns.filter(c => c.status === 'completed').length
    const draftCampaigns = orgCampaigns.filter(c => c.status === 'draft').length

    // Calculate budget from totalPayout
    const totalBudget = orgCampaigns.reduce((sum, c) => sum + (c.totalPayout || 0) * 1.2, 0)
    const spentBudget = orgCampaigns.reduce((sum, c) => sum + (c.totalPayout || 0), 0)
    const remainingBudget = totalBudget - spentBudget

    const totalEnrollments = orgEnrollments.length
    const approvedEnrollments = orgEnrollments.filter(e => e.status === 'approved').length
    const pendingEnrollments = orgEnrollments.filter(e =>
      e.status === 'enrolled' || e.status === 'awaiting_submission' || e.status === 'awaiting_review'
    ).length

    return successResponse({
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      draftCampaigns,
      totalBudget,
      spentBudget,
      remainingBudget,
      totalEnrollments,
      approvedEnrollments,
      pendingEnrollments,
    })
  }),
]
