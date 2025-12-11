import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
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

    // Find the campaign to duplicate
    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.MEDIUM)

    // Create a new campaign ID
    const newId = `campaign-${Date.now()}`

    // In production, this would create a new campaign in the database
    const duplicatedCampaign = {
      ...campaign,
      id: newId,
      title: `${campaign.title} (Copy)`,
      status: 'draft' as const,
      currentEnrollments: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      totalPayout: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return successResponse({
      id: newId,
      campaign: duplicatedCampaign,
      message: 'Campaign duplicated successfully',
    }, 201)
  } catch (error) {
    console.error('Campaign duplicate error:', error)
    return serverErrorResponse('Failed to duplicate campaign')
  }
}
