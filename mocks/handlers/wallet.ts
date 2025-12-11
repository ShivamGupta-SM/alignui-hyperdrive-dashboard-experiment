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
  // Matches Encore wallets.createOrganizationWithdrawal: { amount, notes? }
  // Returns wallets.Withdrawal type
  http.post('/api/wallet/withdraw', async ({ request }) => {
    await delay(DELAY.SLOW)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    // Match Encore's createOrganizationWithdrawal params: { amount, notes? }
    const { amount, notes } = body as { amount?: number; notes?: string }

    if (!amount || amount < 1000) {
      return errorResponse('Minimum withdrawal amount is ₹1,000', 400)
    }

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    if (amount > balance.availableBalance) {
      return errorResponse('Insufficient balance', 400)
    }

    // Return wallets.Withdrawal type matching Encore
    const withdrawal = {
      id: `wd-${Date.now()}`,
      holderId: orgId,
      holderType: 'organization' as const,
      amount,
      status: 'pending' as const,
      withdrawalMethodId: undefined,
      requiresApproval: amount >= 100000,
      approvedBy: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
      utr: undefined,
      requestedAt: new Date().toISOString(),
      processedAt: undefined,
      notes,
    }

    return successResponse(withdrawal)
  }),

  // POST /api/wallet/add-funds
  // Matches addFundsBodySchema: { amount, paymentMethod: 'upi' | 'netbanking' | 'card' }
  http.post('/api/wallet/add-funds', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    // Match schema: paymentMethod (not method)
    const { amount, paymentMethod } = body as {
      amount?: number
      paymentMethod?: 'upi' | 'netbanking' | 'card'
    }

    if (!amount || amount < 100) {
      return errorResponse('Minimum amount is ₹100', 400)
    }

    if (!paymentMethod || !['upi', 'netbanking', 'card'].includes(paymentMethod)) {
      return errorResponse('Invalid payment method', 400)
    }

    const balance = mockWalletBalanceByOrg[orgId] || mockWalletBalanceByOrg['1']

    // Generate payment link for UPI/NetBanking
    const paymentRequest = {
      id: `pay-${Date.now()}`,
      amount,
      paymentMethod,
      status: 'pending',
      paymentLink: `https://pay.example.com/${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }

    return successResponse({
      paymentRequest,
      currentBalance: balance.availableBalance,
    })
  }),

  // POST /api/wallet/credit
  // Matches creditRequestBodySchema: { amount, reason }
  // This is for credit increase requests, not direct credit
  http.post('/api/wallet/credit', async ({ request }) => {
    await delay(DELAY.MEDIUM)

    const auth = getAuthContext()
    const orgId = auth.organizationId
    const body = await request.json() as Record<string, unknown>

    // Match schema: reason (not description)
    const { amount, reason } = body as {
      amount?: number
      reason?: string
    }

    if (!amount || amount < 10000) {
      return errorResponse('Minimum credit request is ₹10,000', 400)
    }

    if (amount > 500000) {
      return errorResponse('Maximum credit request is ₹5,00,000', 400)
    }

    if (!reason || reason.length < 10) {
      return errorResponse('Please provide a reason (at least 10 characters)', 400)
    }

    // Return credit request response matching organizations.requestCreditIncrease
    return successResponse({
      success: true,
      requestId: `cr-${Date.now()}`,
      organizationId: orgId,
      requestedAmount: amount,
      reason,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
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

  // GET /api/wallet/withdrawals/stats - Get withdrawal statistics
  http.get('/api/wallet/withdrawals/stats', async () => {
    await delay(DELAY.FAST)

    const stats = {
      totalWithdrawals: 12,
      totalAmount: 425000,
      pendingCount: 1,
      pendingAmount: 25000,
      processingCount: 0,
      processingAmount: 0,
      completedCount: 10,
      completedAmount: 385000,
      failedCount: 1,
      failedAmount: 15000,
      cancelledCount: 0,
      cancelledAmount: 0,
      thisMonthCount: 2,
      thisMonthAmount: 75000,
      lastMonthCount: 3,
      lastMonthAmount: 125000,
      averageWithdrawalAmount: 35417,
      averageProcessingTime: 48,
      successRate: 91,
    }

    return successResponse(stats)
  }),
]
