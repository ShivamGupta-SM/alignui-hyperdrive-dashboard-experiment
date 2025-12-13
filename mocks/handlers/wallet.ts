/**
 * Wallet API Mock Handlers - Type-Safe, DB Only
 * 
 * Uses MSW Data database - NO lib/mocks
 */

import { http } from 'msw'
import { db } from '@/mocks/db'
import {
  getAuthContext,
  encoreUrl,
  encoreResponse,
  encoreListResponse,
  encoreErrorResponse,
} from './utils'
import { delay, DELAY } from '@/mocks/utils/delay'

export const walletHandlers = [
  // GET /organizations/:orgId/wallet - Get wallet balance
  http.get(encoreUrl('/organizations/:orgId/wallet'), async ({ params }) => {
    const rawOrgId = params.orgId as string
    const orgId = (rawOrgId === 'default' || !rawOrgId) ? '1' : rawOrgId

    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
      || db.walletBalances.findFirst((q) => q.where({ organizationId: '1' }))

    if (!wallet) {
      return encoreErrorResponse('Wallet not found', 404)
    }

    // Return full Wallet type as expected by Encore client
    return encoreResponse({
      id: `wallet-${orgId}`,
      holderId: orgId,
      holderType: 'organization' as const,
      currency: 'INR',
      balance: wallet.availableBalance + wallet.heldAmount,
      pendingBalance: wallet.heldAmount,
      availableBalance: wallet.availableBalance,
      creditLimit: wallet.creditLimit,
      creditUtilized: wallet.creditUtilized,
      createdAt: new Date().toISOString(),
    })
  }),

  // GET /wallets/me - Encore client uses this
  http.get(encoreUrl('/wallets/me'), async () => {
    const auth = getAuthContext()
    const orgId = auth.organizationId || '1'

    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
      || db.walletBalances.findFirst((q) => q.where({ organizationId: '1' }))

    if (!wallet) {
      return encoreErrorResponse('Wallet not found', 404)
    }

    return encoreResponse({
      id: `wallet-${orgId}`,
      holderId: orgId,
      holderType: 'organization' as const,
      currency: 'INR',
      balance: wallet.availableBalance + wallet.heldAmount,
      pendingBalance: wallet.heldAmount,
      availableBalance: wallet.availableBalance,
      creditLimit: wallet.creditLimit,
      creditUtilized: wallet.creditUtilized,
      createdAt: new Date().toISOString(),
    })
  }),

  // GET /wallets/me/transactions
  http.get(encoreUrl('/wallets/me/transactions'), async ({ request }) => {
    const auth = getAuthContext()
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const transactions = db.transactions.findMany((q) => q.where({ organizationId: auth.organizationId }))
    const total = transactions.length
    const paginatedTransactions = transactions.slice(skip, skip + take)

    return encoreListResponse(
      paginatedTransactions.map(t => ({
        ...t,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      })),
      total,
      skip,
      take
    )
  }),

  // GET /organizations/:orgId/wallet/transactions
  http.get(encoreUrl('/organizations/:orgId/wallet/transactions'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const transactions = db.transactions.findMany((q) => q.where({ organizationId: orgId }))
    const total = transactions.length
    const paginatedTransactions = transactions.slice(skip, skip + take)

    return encoreListResponse(
      paginatedTransactions.map(t => ({
        ...t,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      })),
      total,
      skip,
      take
    )
  }),

  // GET /organizations/:orgId/wallet/holds
  http.get(encoreUrl('/organizations/:orgId/wallet/holds'), async ({ params }) => {
    const { orgId } = params as { orgId: string }
    const holds = db.activeHolds.findMany((q) => q.where({ walletId: `wallet-${orgId}` }))

    return encoreResponse({
      holds: holds.map(h => ({
        ...h,
        createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : h.createdAt,
      })),
    })
  }),

  // POST /organizations/:orgId/wallet/top-up
  http.post(encoreUrl('/organizations/:orgId/wallet/top-up'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const body = await request.json() as { amount: number }

    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
    if (!wallet) {
      return encoreErrorResponse('Wallet not found', 404)
    }

    const newBalance = wallet.availableBalance + body.amount

    return encoreResponse({
      success: true,
      newBalance,
      transactionId: `txn-${Date.now()}`,
    })
  }),

  // POST /organizations/:orgId/wallet/withdraw
  http.post(encoreUrl('/organizations/:orgId/wallet/withdraw'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const body = await request.json() as { amount: number; notes?: string }

    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
    if (!wallet) {
      return encoreErrorResponse('Wallet not found', 404)
    }

    if (body.amount > wallet.availableBalance) {
      return encoreErrorResponse('Insufficient balance')
    }

    return encoreResponse({
      id: `wd-${Date.now()}`,
      amount: body.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
  }),

  // GET /organizations/:orgId/withdrawals
  http.get(encoreUrl('/organizations/:orgId/withdrawals'), async ({ params, request }) => {
    const { orgId } = params as { orgId: string }
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    // Mock withdrawals
    const withdrawals = [
      { id: 'wd-1', organizationId: orgId, amount: 50000, status: 'completed', createdAt: new Date().toISOString() },
      { id: 'wd-2', organizationId: orgId, amount: 25000, status: 'processing', createdAt: new Date().toISOString() },
    ]

    return encoreListResponse(withdrawals.slice(skip, skip + take), withdrawals.length, skip, take)
  }),

  // GET /withdrawals/:id
  http.get(encoreUrl('/withdrawals/:id'), async ({ params }) => {
    const { id } = params as { id: string }

    return encoreResponse({
      id,
      organizationId: '1',
      amount: 50000,
      status: 'completed',
      bankAccountId: 'bank-1',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    })
  }),

  // GET /withdrawals/stats
  http.get(encoreUrl('/withdrawals/stats'), async () => {
    return encoreResponse({
      totalWithdrawn: 250000,
      pendingWithdrawals: 25000,
      thisMonthWithdrawn: 75000,
      lastWithdrawalDate: new Date().toISOString(),
      totalCount: 10,
      totalAmount: 275000,
      pendingApprovalCount: 2,
      countByStatus: { completed: 8, pending: 2 },
    })
  }),

  // POST /withdrawals/:id/cancel
  http.post(encoreUrl('/withdrawals/:id/cancel'), async ({ params }) => {
    const { id } = params as { id: string }

    return encoreResponse({
      id,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
  }),

  // GET /wallet/balance (legacy)
  http.get(encoreUrl('/wallet/balance'), async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: auth.organizationId }))
      || db.walletBalances.findFirst((q) => q.where({ organizationId: '1' }))

    if (!wallet) {
      return encoreErrorResponse('Wallet not found', 404)
    }

    return encoreResponse({
      availableBalance: wallet.availableBalance,
      heldAmount: wallet.heldAmount,
      creditLimit: wallet.creditLimit,
      creditUtilized: wallet.creditUtilized,
    })
  }),

  // GET /wallet/transactions (legacy)
  http.get(encoreUrl('/wallet/transactions'), async ({ request }) => {
    const auth = getAuthContext()
    const url = new URL(request.url)

    const skip = Number.parseInt(url.searchParams.get('skip') || '0', 10)
    const take = Number.parseInt(url.searchParams.get('take') || '20', 10)

    const transactions = db.transactions.findMany((q) => q.where({ organizationId: auth.organizationId }))
    const total = transactions.length
    const paginatedTransactions = transactions.slice(skip, skip + take)

    return encoreListResponse(
      paginatedTransactions.map(t => ({
        ...t,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      })),
      total,
      skip,
      take
    )
  }),
]
