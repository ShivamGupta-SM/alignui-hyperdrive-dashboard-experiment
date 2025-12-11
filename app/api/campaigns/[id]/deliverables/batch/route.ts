import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const batchDeliverablesSchema = z.object({
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  action: z.enum(['replace', 'add', 'remove']).default('replace'),
})

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId

    const body = await request.json()
    const validationResult = batchDeliverablesSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { deliverables, action } = validationResult.data

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    // Can only modify deliverables on draft campaigns
    if (campaign.status !== 'draft') {
      return errorResponse('Can only modify deliverables on draft campaigns', 400)
    }

    await delay(DELAY.FAST)

    // deliverables param contains IDs of deliverables to manage
    // campaign.deliverables contains full CampaignDeliverable objects
    const currentDeliverables = campaign.deliverables || []
    const currentIds = currentDeliverables.map(d => d.id)
    let updatedIds: string[]

    switch (action) {
      case 'replace':
        updatedIds = deliverables
        break
      case 'add':
        updatedIds = [...new Set([...currentIds, ...deliverables])]
        break
      case 'remove':
        updatedIds = currentIds.filter(id => !deliverables.includes(id))
        break
      default:
        updatedIds = deliverables
    }

    return successResponse({
      id,
      deliverableIds: updatedIds,
      action,
      message: `Deliverables ${action === 'replace' ? 'updated' : action === 'add' ? 'added' : 'removed'} successfully`,
    })
  } catch (error) {
    console.error('Campaign batch deliverables error:', error)
    return serverErrorResponse('Failed to update deliverables')
  }
}
