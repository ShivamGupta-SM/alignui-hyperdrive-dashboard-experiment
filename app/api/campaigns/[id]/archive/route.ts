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

    // Can only archive ended, completed, or cancelled campaigns
    if (!['ended', 'completed', 'cancelled'].includes(campaign.status)) {
      return errorResponse('Only ended, completed, or cancelled campaigns can be archived', 400)
    }

    await delay(DELAY.FAST)

    return successResponse({
      id,
      status: 'archived',
      previousStatus: campaign.status,
      message: 'Campaign archived successfully',
      archivedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign archive error:', error)
    return serverErrorResponse('Failed to archive campaign')
  }
}
