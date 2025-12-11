import { mockWalletBalanceByOrg, mockTransactions, mockActiveHoldsByOrg } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const { searchParams } = new URL(request.url)
    const transactionType = searchParams.get('type')

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    // Get organization-specific wallet data
    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']
    const activeHolds = mockActiveHoldsByOrg[orgId] || mockActiveHoldsByOrg['1']

    // Get all transactions for this organization
    let transactions = mockTransactions
      .filter(t => t.organizationId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Filter by transaction type if provided
    if (transactionType && transactionType !== 'all') {
      transactions = transactions.filter(t => t.type === transactionType)
    }

    // Calculate transaction stats
    const stats = {
      totalCredits: mockTransactions
        .filter(t => t.organizationId === orgId && t.type === 'credit')
        .reduce((acc, t) => acc + t.amount, 0),
      totalHoldsCreated: mockTransactions
        .filter(t => t.organizationId === orgId && t.type === 'hold_created')
        .reduce((acc, t) => acc + t.amount, 0),
      totalHoldsCommitted: mockTransactions
        .filter(t => t.organizationId === orgId && t.type === 'hold_committed')
        .reduce((acc, t) => acc + t.amount, 0),
      totalHoldsVoided: mockTransactions
        .filter(t => t.organizationId === orgId && t.type === 'hold_voided')
        .reduce((acc, t) => acc + t.amount, 0),
    }

    return successResponse({
      wallet: balance,
      transactions,
      activeHolds,
      stats,
    })
  } catch (error) {
    console.error('Wallet data GET error:', error)
    return serverErrorResponse('Failed to fetch wallet data')
  }
}
