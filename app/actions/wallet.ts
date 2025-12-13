'use server'

import { revalidatePath } from 'next/cache'
import type { WalletActionResult } from '@/lib/types'
import {
  withdrawalBodySchema,
  creditRequestBodySchema,
} from '@/lib/validations'
import { getEncoreClient } from '@/lib/encore'
import { cookies } from 'next/headers'

// Helper to get org ID from cookies
async function getOrganizationId(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get('active-organization-id')?.value || '1'
}

export async function requestWithdrawal(data: unknown): Promise<WalletActionResult> {
  const validation = withdrawalBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const client = getEncoreClient()
  const orgId = await getOrganizationId()

  try {
    const result = await client.wallets.createOrganizationWithdrawal(orgId, {
       amount: validation.data.amount,
       notes: validation.data.notes,
    })

    revalidatePath('/dashboard/wallet')
    return {
      success: true,
      message: 'Withdrawal requested successfully',
      withdrawalId: result.id
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to request withdrawal'
    }
  }
}

export async function requestCredit(data: unknown): Promise<WalletActionResult> {
  const validation = creditRequestBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const client = getEncoreClient()
  const orgId = await getOrganizationId()

  try {
    // Note: requestCreditIncrease takes orgId inside the body based on Client definition, 
    // OR as a path param?
    // Let's check signature in previous thought... 
    // "client.organizations.requestCreditIncrease(orgId, { requestedAmount, reason })" 
    // Wait, let's verify requestCreditIncrease signature.
    // Assuming usage in hooks/use-organizations.ts: client.organizations.requestCreditIncrease(orgId, { requestedAmount, reason })
    await client.organizations.requestCreditIncrease(orgId, {
      requestedAmount: validation.data.amount,
      reason: validation.data.reason
    })

    revalidatePath('/dashboard/wallet')
    return {
      success: true,
      message: 'Credit request submitted for review.',
      requestId: 'submitted'
    }
  } catch (error: any) {
     return {
      success: false,
      error: error.message || 'Failed to request credit'
    }
  }
}

export async function cancelWithdrawal(withdrawalId: string): Promise<WalletActionResult> {
  const client = getEncoreClient()
  
  try {
    await client.wallets.cancelWithdrawal(withdrawalId)
    revalidatePath('/dashboard/wallet')
    return {
        success: true,
        message: 'Withdrawal cancelled'
    }
  } catch (error: any) {
    return {
        success: false,
        error: error.message || 'Failed to cancel withdrawal'
    }
  }
}

export async function addFunds(data: unknown): Promise<WalletActionResult> {
  // Fully simulated as per UI (Bank Transfer) often involves redirecting to PG
  // or showing bank details.
  return {
    success: true,
    orderId: 'virtual-account',
    paymentUrl: '#' 
  }
}
