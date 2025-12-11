/**
 * Wallet API Mock Handlers
 */

import { http } from 'msw'
import { mockWalletBalanceByOrg, mockTransactions, mockActiveHoldsByOrg } from '@/lib/mocks'
import { LIMITS } from '@/lib/types/constants'
import {
  delay,
  DELAY,
  getAuthContext,
  successResponse,
  errorResponse,
  paginatedResponse,
  calculatePagination,
  paginateArray,
} from './utils'

export const walletHandlers = [
  // GET /api/wallet
  http.get('/api/wallet', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']
    const activeHolds = mockActiveHoldsByOrg[orgId] || mockActiveHoldsByOrg['1']

    const recentTransactions = mockTransactions
      .filter(t => t.organizationId === orgId)
      .slice(0, 5)

    return successResponse({
      balance,
      recentTransactions,
      activeHolds,
    })
  }),

  // GET /api/wallet/data
  http.get('/api/wallet/data', async () => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const orgId = auth.organizationId

    const wallet = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']
    const activeHolds = mockActiveHoldsByOrg[orgId] || mockActiveHoldsByOrg['1']
    const transactions = mockTransactions.filter(t => t.organizationId === orgId)

    return successResponse({
      wallet,
      transactions,
      activeHolds,
    })
  }),

  // GET /api/wallet/transactions
  http.get('/api/wallet/transactions', async ({ request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const type = url.searchParams.get('type')

    let transactions = mockTransactions.filter(t => t.organizationId === orgId)

    if (type && type !== 'all') {
      transactions = transactions.filter(t => t.type === type)
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const total = transactions.length
    const paginatedTransactions = paginateArray(transactions, page, limit)
    const meta = calculatePagination(total, page, limit)

    return paginatedResponse(paginatedTransactions, meta)
  }),

  // POST /api/wallet/withdraw
  http.post('/api/wallet/withdraw', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { amount, bankAccountId } = body as { amount?: number; bankAccountId?: string }

    if (!amount || amount <= 0) {
      return errorResponse('Invalid withdrawal amount', 400)
    }

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    if (amount > balance.availableBalance) {
      return errorResponse('Insufficient balance', 400)
    }

    const withdrawal = {
      id: `txn-${Date.now()}`,
      organizationId: orgId,
      type: 'withdrawal',
      amount,
      description: 'Withdrawal to bank account',
      reference: `WD-${Date.now()}`,
      bankAccountId,
      status: 'processing',
      createdAt: new Date(),
    }

    return successResponse({
      withdrawal,
      message: 'Withdrawal request submitted successfully',
      newBalance: balance.availableBalance - amount,
    })
  }),

  // POST /api/wallet/add-funds
  http.post('/api/wallet/add-funds', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { amount, method } = body as { amount?: number; method?: string }

    if (!amount || amount <= 0) {
      return errorResponse('Invalid amount', 400)
    }

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    // Generate payment link for UPI/NetBanking
    const paymentRequest = {
      id: `pay-${Date.now()}`,
      amount,
      method: method || 'upi',
      status: 'pending',
      paymentLink: `https://pay.example.com/${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: new Date(),
    }

    return successResponse({
      paymentRequest,
      currentBalance: balance.availableBalance,
    })
  }),

  // POST /api/wallet/credit
  http.post('/api/wallet/credit', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    const { amount, reference, description } = body as {
      amount?: number
      reference?: string
      description?: string
    }

    if (!amount || amount <= 0) {
      return errorResponse('Invalid credit amount', 400)
    }

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    const transaction = {
      id: `txn-${Date.now()}`,
      organizationId: orgId,
      type: 'credit',
      amount,
      description: description || 'Manual credit',
      reference: reference || `CR-${Date.now()}`,
      createdAt: new Date(),
    }

    return successResponse({
      transaction,
      newBalance: balance.availableBalance + amount,
    })
  }),

  // GET /api/wallet/withdrawals - List withdrawal history
  http.get('/api/wallet/withdrawals', async ({ request }) => {
    await delay(DELAY.STANDARD)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const url = new URL(request.url)

    const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || String(LIMITS.DEFAULT_PAGE_SIZE), 10)
    const status = url.searchParams.get('status')

    // Generate mock withdrawal history
    const allWithdrawals = [
      {
        id: 'wd-1',
        organizationId: orgId,
        amount: 50000,
        status: 'completed' as const,
        bankAccountId: 'bank-1',
        bankAccountName: 'HDFC Bank',
        bankAccountLast4: '1234',
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        failureReason: null,
        referenceNumber: 'REF-123456',
      },
      {
        id: 'wd-2',
        organizationId: orgId,
        amount: 25000,
        status: 'processing' as const,
        bankAccountId: 'bank-1',
        bankAccountName: 'HDFC Bank',
        bankAccountLast4: '1234',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        failureReason: null,
        referenceNumber: null,
      },
      {
        id: 'wd-3',
        organizationId: orgId,
        amount: 75000,
        status: 'pending' as const,
        bankAccountId: 'bank-2',
        bankAccountName: 'ICICI Bank',
        bankAccountLast4: '5678',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: null,
        completedAt: null,
        failureReason: null,
        referenceNumber: null,
      },
    ]

    let withdrawals = allWithdrawals
    if (status && status !== 'all') {
      withdrawals = withdrawals.filter(w => w.status === status)
    }

    const total = withdrawals.length
    const start = (page - 1) * limit
    const paginatedWithdrawals = withdrawals.slice(start, start + limit)

    return successResponse({
      withdrawals: paginatedWithdrawals,
      total,
      page,
      limit,
    })
  }),

  // GET /api/wallet/withdrawals/:id - Get single withdrawal
  http.get('/api/wallet/withdrawals/:id', async ({ params }) => {
    await delay(DELAY.FAST)

    const auth = getAuthContext()
    const { id } = params

    const withdrawal = {
      id,
      organizationId: auth.organizationId,
      amount: 50000,
      status: 'completed' as const,
      bankAccountId: 'bank-1',
      bankAccountName: 'HDFC Bank',
      bankAccountLast4: '1234',
      requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      failureReason: null,
      referenceNumber: 'REF-123456',
    }

    return successResponse(withdrawal)
  }),

  // POST /api/wallet/withdrawals/:id/cancel - Cancel withdrawal
  http.post('/api/wallet/withdrawals/:id/cancel', async ({ params }) => {
    await delay(DELAY.MEDIUM)

    const { id } = params

    return successResponse({
      id,
      status: 'cancelled',
      message: 'Withdrawal cancelled successfully',
    })
  }),
]
