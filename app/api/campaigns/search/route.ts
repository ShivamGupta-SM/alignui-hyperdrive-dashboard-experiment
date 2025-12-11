import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)
    const status = url.searchParams.get('status')

    await delay(DELAY.FAST)

    // Filter campaigns by organization
    let campaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    // Apply search query (search in title and description)
    if (q) {
      const searchLower = q.toLowerCase()
      campaigns = campaigns.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter
    if (status) {
      campaigns = campaigns.filter(c => c.status === status)
    }

    // Get total before pagination
    const total = campaigns.length

    // Apply pagination
    const paginatedCampaigns = campaigns.slice(skip, skip + take)

    return successResponse({
      data: paginatedCampaigns,
      total,
      skip,
      take,
      hasMore: skip + take < total,
    })
  } catch (error) {
    console.error('Campaign search error:', error)
    return serverErrorResponse('Failed to search campaigns')
  }
}
