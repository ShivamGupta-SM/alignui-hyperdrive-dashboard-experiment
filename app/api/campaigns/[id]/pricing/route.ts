import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Extended campaign type with optional payout fields
interface CampaignWithPayout {
  payoutAmount?: number
  minOrderValue?: number
  payoutTiers?: Array<{ minOrderValue: number; payoutAmount: number }>
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

    // Cast to extended type for optional payout fields
    const campaignData = campaign as typeof campaign & CampaignWithPayout

    // Generate pricing details based on campaign data
    const basePayout = campaignData.payoutAmount ?? 500
    const platformFeePercent = 2
    const gstPercent = 18
    const platformFee = Math.round(basePayout * (platformFeePercent / 100))
    const gstAmount = Math.round(platformFee * (gstPercent / 100))
    const totalDeductions = platformFee + gstAmount
    const netPayout = basePayout - totalDeductions

    const pricing = {
      basePayout,
      platformFeePercent,
      platformFee,
      gstPercent,
      gstAmount,
      totalDeductions,
      netPayout,
      currency: 'INR',
      minOrderValue: campaignData.minOrderValue ?? 0,
      maxPayoutPerEnrollment: basePayout,
      estimatedCostPerEnrollment: netPayout,
      breakdown: [
        { label: 'Base Payout Amount', amount: basePayout, type: 'earning' as const },
        { label: `Platform Fee (${platformFeePercent}%)`, amount: -platformFee, type: 'deduction' as const },
        { label: `GST on Platform Fee (${gstPercent}%)`, amount: -gstAmount, type: 'deduction' as const },
        { label: 'Net Payout to Shopper', amount: netPayout, type: 'total' as const },
      ],
      tiers: campaignData.payoutTiers ?? [],
    }

    return successResponse(pricing)
  } catch (error) {
    console.error('Campaign pricing error:', error)
    return serverErrorResponse('Failed to fetch campaign pricing')
  }
}
