import { type NextRequest, NextResponse } from 'next/server'
import { mockCampaigns, mockProducts } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { campaignQuerySchema, createCampaignBodySchema } from '@/lib/validations'
import {
  paginatedResponse,
  successResponse,
  errorResponse,
  serverErrorResponse,
  calculatePagination,
  paginateArray,
} from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.STANDARD)

    const { searchParams } = new URL(request.url)

    // Validate query parameters with Zod
    const params = campaignQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    )

    if (!params.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: params.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { status, search, page, limit } = params.data
    const orgId = auth.context.organizationId

    // Filter by organization first
    let campaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    // Filter by status
    if (status && status !== 'all') {
      campaigns = campaigns.filter(c => c.status === status)
    }

    // Search by title
    if (search) {
      campaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Populate product relation
    const campaignsWithProducts = campaigns.map(campaign => ({
      ...campaign,
      product: mockProducts.find(p => p.id === campaign.productId),
    }))

    // Pagination
    const total = campaignsWithProducts.length
    const paginatedCampaigns = paginateArray(campaignsWithProducts, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedCampaigns, meta)
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return serverErrorResponse('Failed to fetch campaigns')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.SLOW)

    const body = await request.json()

    // Validate request body with Zod
    const result = createCampaignBodySchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid request body'
      return errorResponse(firstError, 400, result.error.flatten().fieldErrors)
    }

    const validatedData = result.data

    const newCampaign = {
      id: `camp_${Date.now()}`,
      organizationId: auth.context.organizationId,
      ...validatedData,
      status: 'draft' as const,
      currentEnrollments: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      totalPayout: 0,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse(newCampaign, 201)
  } catch (error) {
    console.error('Campaigns POST error:', error)
    return serverErrorResponse('Failed to create campaign')
  }
}
