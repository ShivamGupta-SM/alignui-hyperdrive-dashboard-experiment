import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns, mockEnrollments } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId
    const url = new URL(request.url)
    const days = Number.parseInt(url.searchParams.get('days') || '30', 10)

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.FAST)

    // Get enrollments for this campaign
    const enrollments = mockEnrollments.filter(e => e.campaignId === id)

    // Generate daily performance data for the specified number of days
    const performance = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))

      // Generate realistic daily data based on total enrollments
      const baseEnrollments = Math.round(enrollments.length / days)
      const variance = Math.round(baseEnrollments * (Math.random() * 0.6 - 0.3))
      const dailyEnrollments = Math.max(0, baseEnrollments + variance)

      const approvalRate = 0.75 + Math.random() * 0.2
      const dailyApprovals = Math.round(dailyEnrollments * approvalRate)
      const dailyRejections = dailyEnrollments - dailyApprovals

      const avgOrderValue = 2500 + Math.random() * 5000
      const orderValue = Math.round(dailyEnrollments * avgOrderValue)
      const payouts = Math.round(orderValue * 0.1)

      return {
        date: date.toISOString().split('T')[0],
        enrollments: dailyEnrollments,
        approvals: dailyApprovals,
        rejections: dailyRejections,
        orderValue,
        payouts,
      }
    })

    return successResponse(performance)
  } catch (error) {
    console.error('Campaign performance error:', error)
    return serverErrorResponse('Failed to fetch campaign performance')
  }
}
