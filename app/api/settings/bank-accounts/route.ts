import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockBankAccountsByOrg } from '@/lib/mocks'

const addBankAccountSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(9, 'Account number must be at least 9 digits').max(18, 'Account number is too long'),
  confirmAccountNumber: z.string(),
  accountHolder: z.string().min(2, 'Account holder name is required'),
  ifscCode: z.string().length(11, 'IFSC code must be 11 characters').regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ['confirmAccountNumber'],
})

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const orgId = auth.context.organizationId

    await delay(DELAY.FAST)

    const bankAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']

    return successResponse(bankAccounts)
  } catch (error) {
    console.error('Bank accounts GET error:', error)
    return serverErrorResponse('Failed to fetch bank accounts')
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, addBankAccountSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { bankName, accountNumber, accountHolder, ifscCode } = parsed.data
    const orgId = auth.context.organizationId

    // Check for duplicate account
    const existingAccounts = mockBankAccountsByOrg[orgId] || mockBankAccountsByOrg['1']
    const maskedNumber = `****${accountNumber.slice(-4)}`
    const duplicate = existingAccounts.find((acc: { accountNumber: string }) => acc.accountNumber === maskedNumber)
    if (duplicate) {
      return errorResponse('This bank account is already added', 400)
    }

    await delay(DELAY.MEDIUM)

    // In production, verify bank account via penny drop or IMPS
    const newAccount = {
      id: `bank-${Date.now()}`,
      bankName,
      accountNumber: maskedNumber,
      accountHolder,
      ifscCode,
      isDefault: existingAccounts.length === 0,
      isVerified: false, // Will be verified after penny drop
      verificationStatus: 'pending',
      addedAt: new Date().toISOString(),
    }

    return successResponse(newAccount, 201)
  } catch (error) {
    console.error('Bank account POST error:', error)
    return serverErrorResponse('Failed to add bank account')
  }
}
