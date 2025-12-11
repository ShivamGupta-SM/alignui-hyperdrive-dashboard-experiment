import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockCampaigns } from '@/lib/mocks'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Payout tier type
interface PayoutTier {
  minOrderValue: number
  payoutAmount: number
}

// Extended campaign type with optional payout fields
interface CampaignWithPayout {
  payoutAmount?: number
  minOrderValue?: number
  payoutTiers?: PayoutTier[]
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params
    const orgId = auth.context.organizationId
    const body = await request.json()

    const { orderValue, quantity = 1 } = body as { orderValue?: number; quantity?: number }

    if (!orderValue || orderValue <= 0) {
      return errorResponse('Order value is required and must be positive', 400)
    }

    const campaign = mockCampaigns.find(
      c => c.id === id && c.organizationId === orgId
    )

    if (!campaign) {
      return notFoundResponse('Campaign')
    }

    await delay(DELAY.FAST)

    // Cast to extended type for optional payout fields
    const campaignData = campaign as typeof campaign & CampaignWithPayout

    // Check minimum order value
    const minOrderValue = campaignData.minOrderValue ?? 0
    if (orderValue < minOrderValue) {
      return errorResponse(`Order value must be at least ${minOrderValue}`, 400)
    }

    // Calculate payout based on campaign rules
    let payoutPerUnit = campaignData.payoutAmount ?? 500

    // Apply tier-based pricing if available
    const payoutTiers = campaignData.payoutTiers ?? []
    if (payoutTiers.length > 0) {
      const applicableTier = payoutTiers
        .filter((t: PayoutTier) => orderValue >= t.minOrderValue)
        .sort((a: PayoutTier, b: PayoutTier) => b.minOrderValue - a.minOrderValue)[0]

      if (applicableTier) {
        payoutPerUnit = applicableTier.payoutAmount
      }
    }

    const totalPayout = payoutPerUnit * quantity
    const platformFeePercent = 2
    const platformFee = Math.round(totalPayout * (platformFeePercent / 100))
    const gstPercent = 18
    const gstAmount = Math.round(platformFee * (gstPercent / 100))
    const totalDeductions = platformFee + gstAmount
    const netPayout = totalPayout - totalDeductions

    const estimate = {
      orderValue,
      quantity,
      payoutPerUnit,
      totalPayout,
      platformFeePercent,
      platformFee,
      gstPercent,
      gstAmount,
      totalDeductions,
      netPayout,
      currency: 'INR',
      applicableTier: payoutTiers.find((t: PayoutTier) => t.payoutAmount === payoutPerUnit) ?? null,
      breakdown: [
        { label: 'Order Value', amount: orderValue * quantity, type: 'info' as const },
        { label: `Payout (${quantity} x ₹${payoutPerUnit})`, amount: totalPayout, type: 'earning' as const },
        { label: `Platform Fee (${platformFeePercent}%)`, amount: -platformFee, type: 'deduction' as const },
        { label: `GST (${gstPercent}%)`, amount: -gstAmount, type: 'deduction' as const },
        { label: 'Net Payout', amount: netPayout, type: 'total' as const },
      ],
    }

    return successResponse(estimate)
  } catch (error) {
    console.error('Calculate payout error:', error)
    return serverErrorResponse('Failed to calculate payout')
  }
}
