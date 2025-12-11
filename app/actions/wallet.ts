'use server'

import { revalidatePath } from 'next/cache'
import type { WalletActionResult } from '@/lib/types'
import {
  withdrawalBodySchema,
  addFundsBodySchema,
  creditRequestBodySchema,
} from '@/lib/validations'
import { delay, DELAY } from '@/lib/utils/delay'

export async function requestWithdrawal(data: unknown): Promise<WalletActionResult> {
  // Validate input
  const validation = withdrawalBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.LONG)

  // In a real app, this would create a withdrawal request
  const withdrawalId = `wd_${Date.now()}`

  revalidatePath('/dashboard/wallet')
  revalidatePath('/dashboard')

  return {
    success: true,
    withdrawalId,
    message: 'Withdrawal request submitted. Processing time: 2-3 business days.',
  }
}

export async function addFunds(data: unknown): Promise<WalletActionResult> {
  // Validate input
  const validation = addFundsBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would initiate payment flow
  const orderId = `order_${Date.now()}`

  return {
    success: true,
    orderId,
    paymentUrl: `/api/payments/${orderId}`,
  }
}

export async function requestCredit(data: unknown): Promise<WalletActionResult> {
  // Validate input
  const validation = creditRequestBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  await delay(DELAY.SLOW)

  const requestId = `cr_${Date.now()}`

  revalidatePath('/dashboard/wallet')

  return {
    success: true,
    requestId,
    message: 'Credit request submitted for review.',
  }
}

export async function getTransactionReceipt(transactionId: string): Promise<WalletActionResult> {
  // Validate id
  if (!transactionId || typeof transactionId !== 'string') {
    return { success: false, error: 'Transaction ID is required' }
  }

  await delay(DELAY.STANDARD)

  // In a real app, this would generate/fetch receipt PDF
  const receiptUrl = `/api/receipts/${transactionId}.pdf`

  return {
    success: true,
    receiptUrl,
  }
}
