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

    // Can only submit draft campaigns
    if (campaign.status !== 'draft') {
      return errorResponse('Only draft campaigns can be submitted for approval', 400)
    }

    // Validate campaign has required fields
    if (!campaign.title || !campaign.productId) {
      return errorResponse('Campaign is missing required fields', 400)
    }

    await delay(DELAY.MEDIUM)

    return successResponse({
      id,
      status: 'pending_approval',
      message: 'Campaign submitted for approval. You will be notified once reviewed.',
      submittedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Campaign submit error:', error)
    return serverErrorResponse('Failed to submit campaign')
  }
}
