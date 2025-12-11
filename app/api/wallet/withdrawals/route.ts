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

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
    const status = url.searchParams.get('status')

    await delay(DELAY.STANDARD)

    // Generate mock withdrawal history
    const allWithdrawals = [
      {
        id: 'wd-1',
        organizationId: orgId,
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
      },
      {
        id: 'wd-2',
        organizationId: orgId,
        amount: 25000,
        status: 'processing' as const,
        bankAccountId: 'bank-1',
        bankAccountName: 'HDFC Bank',
        bankAccountLast4: '1234',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        failureReason: null,
        referenceNumber: null,
      },
      {
        id: 'wd-3',
        organizationId: orgId,
        amount: 75000,
        status: 'pending' as const,
        bankAccountId: 'bank-2',
        bankAccountName: 'ICICI Bank',
        bankAccountLast4: '5678',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: null,
        completedAt: null,
        failureReason: null,
        referenceNumber: null,
      },
    ]

    let withdrawals = allWithdrawals
    if (status && status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status)
    }

    const total = withdrawals.length
    const start = (page - 1) * limit
    const paginatedWithdrawals = withdrawals.slice(start, start + limit)

    return successResponse({
      withdrawals: paginatedWithdrawals,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Withdrawals list error:', error)
    return serverErrorResponse('Failed to fetch withdrawals')
  }
}
