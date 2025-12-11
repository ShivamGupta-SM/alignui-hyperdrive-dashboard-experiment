import { mockCampaigns } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { DURATIONS } from '@/lib/types/constants'
import type { Campaign } from '@/lib/types'

function getCampaignStats(campaigns: Campaign[]) {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + DURATIONS.CAMPAIGN_ENDING_SOON_DAYS * 24 * 60 * 60 * 1000)
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const endingSoon = activeCampaigns.filter(c => new Date(c.endDate) <= sevenDaysFromNow)

  return {
    total: campaigns.length,
    active: activeCampaigns.length,
    endingSoon: endingSoon.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    pending: campaigns.filter(c => c.status === 'pending_approval').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalEnrollments: campaigns.reduce((acc, c) => acc + c.currentEnrollments, 0),
    totalPayout: campaigns.reduce((acc, c) => acc + c.totalPayout, 0),
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Get all campaigns for this organization
    const allCampaigns = mockCampaigns.filter(c => c.organizationId === orgId)

    // Filter by status if provided
    let filteredCampaigns = allCampaigns
    if (status && status !== 'all') {
      filteredCampaigns = allCampaigns.filter(c => c.status === status)
    }

    // Calculate stats from all campaigns (not filtered)
    const stats = getCampaignStats(allCampaigns)

    return successResponse({
      campaigns: filteredCampaigns,
      allCampaigns,
      stats,
    })
  } catch (error) {
    console.error('Campaigns data GET error:', error)
    return serverErrorResponse('Failed to fetch campaigns data')
  }
}
