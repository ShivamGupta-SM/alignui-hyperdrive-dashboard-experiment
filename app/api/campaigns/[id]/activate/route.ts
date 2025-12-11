import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    // Can only activate approved campaigns
    if (campaign.status !== 'approved') {
      return errorResponse('Only approved campaigns can be activated', 400)
    }

    // Check if start date has passed
    const now = new Date()
    if (new Date(campaign.startDate) > now) {
      return errorResponse('Cannot activate campaign before its start date', 400)
    }

    await delay(DELAY.FAST)

    return successResponse({
      id,
      status: 'active',
      message: 'Campaign activated successfully',
      activatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign activate error:', error)
    return serverErrorResponse('Failed to activate campaign')
  }
}
