import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, notFoundResponse, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockBankAccountsByOrg } from '@/lib/mocks'

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
    const orgId = auth.context.organizationId

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === id)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    if (!account.isVerified) {
      return errorResponse('Cannot set unverified account as default', 400)
    }

    await delay(DELAY.FAST)

    // In production, update all accounts to set this one as default
    return successResponse({
      message: 'Default account updated successfully',
      id,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
    })
  } catch (error) {
    console.error('Set default bank account error:', error)
    return serverErrorResponse('Failed to set default bank account')
  }
}
