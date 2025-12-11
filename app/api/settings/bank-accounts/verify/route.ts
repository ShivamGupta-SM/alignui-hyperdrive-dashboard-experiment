import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, notFoundResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockBankAccountsByOrg } from '@/lib/mocks'

const verifyBankAccountSchema = z.object({
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, verifyBankAccountSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { bankAccountId } = parsed.data
    const orgId = auth.context.organizationId

    // Find the bank account
    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const account = bankAccounts.find((acc: { id: string }) => acc.id === bankAccountId)

    if (!account) {
      return notFoundResponse('Bank account')
    }

    await delay(DELAY.SLOW) // Simulate penny drop verification

    // In production, this would:
    // 1. Initiate a penny drop transfer (₹1 or ₹2)
    // 2. Verify the account exists and is active
    // 3. Match the account holder name
    // 4. Return verification status

    // Mock successful verification
    return successResponse({
      id: account.id,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      bankName: account.bankName,
      ifscCode: account.ifscCode,
      isVerified: true,
      verificationStatus: 'verified' as const,
      verificationMessage: 'Bank account verified successfully via penny drop',
    })
  } catch (error) {
    console.error('Bank account verification error:', error)
    return serverErrorResponse('Failed to verify bank account')
  }
}
