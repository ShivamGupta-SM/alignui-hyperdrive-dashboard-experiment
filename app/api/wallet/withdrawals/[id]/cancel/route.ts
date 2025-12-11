import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { id } = await params

    await delay(DELAY.MEDIUM)

    // In real implementation, check if withdrawal can be cancelled
    // Only pending withdrawals can be cancelled
    const canCancel = true // Mock: always allow in demo

    if (!canCancel) {
      return errorResponse('Only pending withdrawals can be cancelled', 400)
    }

    return successResponse({
      id,
      status: 'cancelled',
      message: 'Withdrawal cancelled successfully',
    })
  } catch (error) {
    console.error('Cancel withdrawal error:', error)
    return serverErrorResponse('Failed to cancel withdrawal')
  }
}
