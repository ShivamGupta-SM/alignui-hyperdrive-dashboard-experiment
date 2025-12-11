import { mockWalletBalanceByOrg, mockTransactions, mockActiveHoldsByOrg } from '@/lib/mocks'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

export async function GET() {
  try {
    // Authenticate request
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    const orgId = auth.context.organizationId

    // Get organization-specific wallet data
    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']
    const activeHolds = mockActiveHoldsByOrg[orgId] || mockActiveHoldsByOrg['1']

    // Filter transactions by organization
    const recentTransactions = mockTransactions
      .filter(t => t.organizationId === orgId)
      .slice(0, 5)

    return successResponse({
      balance,
      recentTransactions,
      activeHolds,
    })
  } catch (error) {
    console.error('Wallet GET error:', error)
    return serverErrorResponse('Failed to fetch wallet data')
  }
}
