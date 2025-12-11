import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns, mockDeliverableTypes } from '@/lib/mocks'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - List deliverables for a campaign
export async function GET(_request: Request, { params }: RouteParams) {
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

    await delay(DELAY.FAST)

    // Return campaign's deliverables with full details
    // campaign.deliverables is CampaignDeliverable[] - objects with id, type, title, etc.
    const deliverables = (campaign.deliverables || []).map(d => {
      const deliverableType = mockDeliverableTypes.find(dt => dt.slug === d.type || dt.name === d.type)
      return {
        id: d.id,
        name: d.title,
        slug: d.type,
        description: d.description || deliverableType?.description || '',
        requiresProof: deliverableType?.requiresProof ?? true,
        isRequired: d.isRequired,
      }
    })

    return successResponse(deliverables)
  } catch (error) {
    console.error('Campaign deliverables get error:', error)
    return serverErrorResponse('Failed to fetch campaign deliverables')
  }
}

// POST - Add deliverables to a campaign
const addDeliverablesSchema = z.object({
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
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
    const validationResult = addDeliverablesSchema.safeParse(body)

    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400)
    }

    const { deliverables } = validationResult.data

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

    // deliverables param is array of deliverable type slugs to add
    // campaign.deliverables is CampaignDeliverable[] - objects with id, type, title, etc.
    const currentTypes = (campaign.deliverables || []).map(d => d.type as string)
    const newDeliverables = deliverables.filter(d => !currentTypes.includes(d))

    return successResponse({
      id,
      addedDeliverables: newDeliverables,
      totalCount: currentTypes.length + newDeliverables.length,
      message: 'Deliverables added successfully',
    })
  } catch (error) {
    console.error('Campaign add deliverables error:', error)
    return serverErrorResponse('Failed to add deliverables')
  }
}
