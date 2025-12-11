import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockEnrollments } from '@/lib/mocks'

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

    const enrollment = mockEnrollments.find(
      e => e.id === id && e.organizationId === orgId
    )

    if (!enrollment) {
      return notFoundResponse('Enrollment')
    }

    await delay(DELAY.FAST)

    // Generate pricing based on enrollment data
    const orderValue = enrollment.orderValue || 5000
    const platformFee = Math.round(orderValue * 0.02) // 2% platform fee
    const gstRate = 0.18 // 18% GST
    const gstAmount = Math.round(platformFee * gstRate)
    const billAmount = enrollment.billAmount || Math.round(orderValue * 0.1)
    const totalDeductions = platformFee + gstAmount
    const netPayout = billAmount - totalDeductions

    const pricing = {
      orderValue,
      billAmount,
      platformFee,
      platformFeePercent: 2,
      gstRate: gstRate * 100,
      gstAmount,
      totalDeductions,
      netPayout,
      currency: 'INR',
      breakdown: [
        { label: 'Order Value', amount: orderValue, type: 'info' as const },
        { label: 'Bill Amount (Payout)', amount: billAmount, type: 'earning' as const },
        { label: 'Platform Fee (2%)', amount: -platformFee, type: 'deduction' as const },
        { label: 'GST (18%)', amount: -gstAmount, type: 'deduction' as const },
        { label: 'Net Payout', amount: netPayout, type: 'total' as const },
      ],
    }

    return successResponse(pricing)
  } catch (error) {
    console.error('Enrollment pricing error:', error)
    return serverErrorResponse('Failed to fetch enrollment pricing')
  }
}
