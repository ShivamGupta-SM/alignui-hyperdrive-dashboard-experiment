import type { NextRequest } from 'next/server'
import { mockCampaigns, mockProducts } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { updateCampaignBodySchema } from '@/lib/validations'
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    const { id } = await params
    const campaign = mockCampaigns.find(c => c.id === id)

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    // Populate product relation
    const campaignWithProduct = {
      ...campaign,
      product: mockProducts.find(p => p.id === campaign.productId),
    }

    return successResponse(campaignWithProduct)
  } catch (error) {
    console.error('Campaign GET error:', error)
    return serverErrorResponse('Failed to fetch campaign')
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.SLOW)

    const { id } = await params
    const campaign = mockCampaigns.find(c => c.id === id)

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    const body = await request.json()

    // Validate request body with Zod
    const result = updateCampaignBodySchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid request body'
      return errorResponse(firstError, 400, result.error.flatten().fieldErrors)
    }

    const validatedData = result.data

    const updatedCampaign = {
      ...campaign,
      ...validatedData,
      // Convert date strings to Date objects if provided
      ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
      ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
      updatedAt: new Date(),
    }

    return successResponse(updatedCampaign)
  } catch (error) {
    console.error('Campaign PATCH error:', error)
    return serverErrorResponse('Failed to update campaign')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await getAuthContext(request)
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.SLOW)

    const { id } = await params
    const campaign = mockCampaigns.find(c => c.id === id)

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    return successResponse({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Campaign DELETE error:', error)
    return serverErrorResponse('Failed to delete campaign')
  }
}
