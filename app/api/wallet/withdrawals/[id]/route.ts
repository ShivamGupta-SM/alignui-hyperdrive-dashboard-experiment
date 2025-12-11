import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

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

    await delay(DELAY.FAST)

    // Mock withdrawal data
    const withdrawal = {
      id,
      organizationId: auth.context.organizationId,
      amount: 50000,
      status: 'completed' as const,
      bankAccountId: 'bank-1',
      bankAccountName: 'HDFC Bank',
      bankAccountLast4: '1234',
      requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      failureReason: null,
      referenceNumber: 'REF-123456',
    }

    if (!withdrawal) {
      return notFoundResponse('Withdrawal')
    }

    return successResponse(withdrawal)
  } catch (error) {
    console.error('Withdrawal detail error:', error)
    return serverErrorResponse('Failed to fetch withdrawal')
  }
}
