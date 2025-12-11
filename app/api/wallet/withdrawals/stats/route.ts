import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId
    const url = new URL(request.url)
    const holderType = url.searchParams.get('holderType') || 'organization'
    const holderId = url.searchParams.get('holderId') || orgId

    await delay(DELAY.FAST)

    // Generate mock withdrawal stats
    const stats = {
      totalWithdrawals: 12,
      totalAmount: 425000, // ₹4,25,000
      pendingCount: 1,
      pendingAmount: 25000, // ₹25,000
      processingCount: 0,
      processingAmount: 0,
      completedCount: 10,
      completedAmount: 385000, // ₹3,85,000
      failedCount: 1,
      failedAmount: 15000, // ₹15,000 (failed attempt)
      cancelledCount: 0,
      cancelledAmount: 0,
      // Time-based stats
      thisMonthCount: 2,
      thisMonthAmount: 75000, // ₹75,000
      lastMonthCount: 3,
      lastMonthAmount: 125000, // ₹1,25,000
      // Average stats
      averageWithdrawalAmount: 35417, // ₹35,417
      averageProcessingTime: 48, // hours
      // Success rate
      successRate: 91, // 10/11 (excluding pending)
    }

    return successResponse(stats)
  } catch (error) {
    console.error('Withdrawal stats error:', error)
    return serverErrorResponse('Failed to fetch withdrawal stats')
  }
}
