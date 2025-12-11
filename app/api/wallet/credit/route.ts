import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { mockWalletBalanceByOrg } from '@/lib/mocks'

const creditRequestSchema = z.object({
  amount: z.number().min(10000, 'Minimum credit request is ₹10,000').max(10000000, 'Maximum credit request is ₹1,00,00,000'),
  reason: z.string().min(10, 'Please provide a detailed reason (min 10 characters)').max(500, 'Reason is too long'),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, creditRequestSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { amount, reason } = parsed.data
    const orgId = auth.context.organizationId

    // Get current wallet balance
    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    await delay(DELAY.MEDIUM)

    // Generate request ID
    const requestId = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return successResponse({
      requestId,
      requestedAmount: amount,
      currentCreditLimit: balance.creditLimit,
      currentUtilization: balance.creditUtilized,
      reason,
      status: 'pending_review',
      message: 'Your credit limit increase request has been submitted for review. Our team will review and respond within 2-3 business days.',
      submittedAt: new Date().toISOString(),
    }, 201)
  } catch (error) {
    console.error('Credit request error:', error)
    return serverErrorResponse('Failed to submit credit request')
  }
}
