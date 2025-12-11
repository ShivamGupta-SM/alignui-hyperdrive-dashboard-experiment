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

    // Can only cancel draft, pending_approval, approved, or paused campaigns
    if (!['draft', 'pending_approval', 'approved', 'paused'].includes(campaign.status)) {
      return errorResponse('Cannot cancel campaign in current status', 400)
    }

    await delay(DELAY.FAST)

    return successResponse({
      id,
      status: 'cancelled',
      message: 'Campaign cancelled successfully',
      cancelledAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign cancel error:', error)
    return serverErrorResponse('Failed to cancel campaign')
  }
}
