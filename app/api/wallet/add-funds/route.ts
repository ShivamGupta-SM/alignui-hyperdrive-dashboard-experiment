import { z } from 'zod'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'

const addFundsSchema = z.object({
  amount: z.number().min(1000, 'Minimum deposit is ₹1,000').max(10000000, 'Maximum deposit is ₹1,00,00,000'),
  paymentMethod: z.enum(['upi', 'netbanking', 'card', 'bank_transfer']),
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, addFundsSchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { amount, paymentMethod } = parsed.data

    await delay(DELAY.FAST)

    // Generate order ID for payment
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // In production, this would integrate with a payment gateway (Razorpay, Stripe, etc.)
    // and return an actual payment URL
    const paymentUrl = `/api/wallet/payment/${orderId}`

    // Bank transfer details for manual transfer
    const bankDetails = paymentMethod === 'bank_transfer' ? {
      bankName: 'HDFC Bank',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0001234',
      accountHolder: 'Hyprive Technologies Pvt. Ltd.',
      reference: orderId,
    } : undefined

    return successResponse({
      orderId,
      amount,
      paymentMethod,
      paymentUrl,
      bankDetails,
      status: 'pending',
      message: paymentMethod === 'bank_transfer'
        ? 'Please transfer the amount using the bank details provided. Use the order ID as reference.'
        : 'Redirecting to payment gateway...',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
    }, 201)
  } catch (error) {
    console.error('Add funds error:', error)
    return serverErrorResponse('Failed to initiate fund addition')
  }
}
