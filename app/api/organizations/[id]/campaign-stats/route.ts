import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockOrganizations, mockCampaigns, mockEnrollments } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params

    const org = mockOrganizations.find(o => o.id === id)

    if (!org) {
      return notFoundResponse('Organization')
    }

    await delay(DELAY.FAST)

    // Calculate campaign statistics from mock data
    // Campaign type has organizationId (not brandId)
    const orgCampaigns = mockCampaigns.filter(c => c.organizationId === id)
    const orgEnrollments = mockEnrollments.filter(e =>
      orgCampaigns.some(c => c.id === e.campaignId)
    )

    const totalCampaigns = orgCampaigns.length
    const activeCampaigns = orgCampaigns.filter(c => c.status === 'active').length
    const completedCampaigns = orgCampaigns.filter(c => c.status === 'completed').length
    const draftCampaigns = orgCampaigns.filter(c => c.status === 'draft').length

    // Calculate budget from totalPayout (since Campaign type doesn't have budget/spentBudget)
    const totalBudget = orgCampaigns.reduce((sum, c) => sum + (c.totalPayout || 0) * 1.2, 0) // Estimate budget as 120% of payout
    const spentBudget = orgCampaigns.reduce((sum, c) => sum + (c.totalPayout || 0), 0)
    const remainingBudget = totalBudget - spentBudget

    const totalEnrollments = orgEnrollments.length
    const approvedEnrollments = orgEnrollments.filter(e => e.status === 'approved').length
    // EnrollmentStatus uses 'enrolled' for pending enrollments
    const pendingEnrollments = orgEnrollments.filter(e => e.status === 'enrolled' || e.status === 'awaiting_submission' || e.status === 'awaiting_review').length

    return successResponse({
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      draftCampaigns,
      totalBudget,
      spentBudget,
      remainingBudget,
      totalEnrollments,
      approvedEnrollments,
      pendingEnrollments,
    })
  } catch (error) {
    console.error('Organization campaign stats error:', error)
    return serverErrorResponse('Failed to fetch organization campaign stats')
  }
}
