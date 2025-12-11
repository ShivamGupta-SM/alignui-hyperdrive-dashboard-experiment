import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns, mockEnrollments, mockProducts } from '@/lib/mocks'
import { CAMPAIGN_STATS, DURATIONS } from '@/lib/types/constants'

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
    const orgId = auth.context.organizationId

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.FAST)

    // Get enrollments for this campaign
    const enrollments = mockEnrollments.filter(e => e.campaignId === id)

    // Get product info if available
    const product = campaign.productId
      ? mockProducts.find(p => p.id === campaign.productId)
      : null

    // Generate weekly trend data based on campaign dates
    const startDate = new Date(campaign.startDate)
    const now = new Date()
    const weeksElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    const enrollmentTrend = Array.from({ length: Math.min(weeksElapsed, DURATIONS.MAX_TREND_WEEKS) }, (_, i) => {
      // Generate realistic weekly data based on total enrollments
      const baseEnrollments = Math.round(campaign.currentEnrollments / weeksElapsed)
      const variance = Math.round(baseEnrollments * (Math.random() * 0.4 - 0.2))
      const weekEnrollments = Math.max(1, baseEnrollments + variance)
      const approvalRate = campaign.currentEnrollments > 0
        ? campaign.approvedCount / campaign.currentEnrollments
        : 0.85
      return {
        name: `Week ${i + 1}`,
        enrollments: weekEnrollments,
        approved: Math.round(weekEnrollments * approvalRate),
      }
    })

    // Calculate awaiting submission count (approved but not yet submitted final proof)
    const awaitingSubmission = enrollments.filter(e => e.status === 'awaiting_submission').length

    const stats = {
      totalEnrollments: enrollments.length,
      pendingEnrollments: enrollments.filter(e => e.status === 'awaiting_review').length,
      approvedEnrollments: enrollments.filter(e => e.status === 'approved').length,
      rejectedEnrollments: enrollments.filter(e => e.status === 'rejected').length,
      changesRequested: enrollments.filter(e => e.status === 'changes_requested').length,
      awaitingSubmission,
      approvalRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'approved').length / enrollments.length) * 100)
        : 0,
      totalOrderValue: enrollments.reduce((acc, e) => acc + e.orderValue, 0),
      totalBillAmount: enrollments.reduce((acc, e) => acc + e.billAmount, 0),
      totalPayout: campaign.totalPayout,
      utilizationRate: campaign.maxEnrollments > 0
        ? Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100)
        : 0,
      daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      averageOrderValue: enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.orderValue, 0) / enrollments.length)
        : 0,
      // Performance metrics
      avgReviewTimeHours: CAMPAIGN_STATS.AVG_REVIEW_TIME_HOURS,
      rejectionRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'rejected').length / enrollments.length) * 100)
        : 0,
      withdrawalRate: CAMPAIGN_STATS.WITHDRAWAL_RATE_PERCENT,
      // Product info
      productName: product?.name || campaign.title,
      productImage: product?.images?.[0] || null,
      // Trend data for chart
      enrollmentTrend,
    }

    return successResponse(stats)
  } catch (error) {
    console.error('Campaign stats error:', error)
    return serverErrorResponse('Failed to fetch campaign stats')
  }
}
