import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockWalletBalanceByOrg, mockBankAccountsByOrg } from '@/lib/mocks'

const withdrawSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is ₹100').max(1000000, 'Maximum withdrawal is ₹10,00,000'),
  bankAccountId: z.string().min(1, 'Bank account is required'),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, withdrawSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { amount, bankAccountId } = parsed.data
    const orgId = auth.context.organizationId

    // Get wallet balance
    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    // Validate sufficient balance
    if (amount > balance.availableBalance) {
      return errorResponse('Insufficient balance for withdrawal', 400)
    }

    // Validate bank account exists
    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const bankAccount = bankAccounts.find((acc: { id: string }) => acc.id === bankAccountId)
    if (!bankAccount) {
      return errorResponse('Bank account not found', 404)
    }

    if (!bankAccount.isVerified) {
      return errorResponse('Bank account is not verified', 400)
    }

    await delay(DELAY.MEDIUM)

    // Generate withdrawal ID
    const withdrawalId = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return successResponse({
      withdrawalId,
      amount,
      bankAccountId,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      status: 'processing',
      message: 'Withdrawal request submitted. Funds will be credited within 2-3 business days.',
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }, 201)
  } catch (error) {
    console.error('Wallet withdraw error:', error)
    return serverErrorResponse('Failed to process withdrawal request')
  }
}
