// Server-side data fetching for wallet and transactions
// This file uses the Encore backend client for type-safe API calls
import 'server-only'

import { getEncoreClient, type wallets as walletsApi } from '@/lib/encore'
import { mockWalletBalance, mockTransactions, mockActiveHolds } from '@/lib/mocks'
import type { WalletBalance, Transaction, ActiveHold } from '@/lib/types'

// Feature flag to control whether to use Encore or mock data
const USE_ENCORE = !!process.env.ENCORE_API_URL

/**
 * Convert Encore Wallet to Frontend WalletBalance type
 */
function toFrontendWalletBalance(wallet: walletsApi.Wallet): WalletBalance {
  return {
    availableBalance: wallet.availableBalance,
    heldAmount: wallet.pendingBalance,
    creditLimit: wallet.creditLimit ?? 0,
    creditUtilized: wallet.creditUtilized ?? 0,
  }
}

/**
 * Convert Encore ActiveHold to Frontend ActiveHold type
 */
function toFrontendActiveHold(hold: walletsApi.ActiveHold): ActiveHold {
  return {
    campaignId: hold.campaignId,
    campaignName: hold.campaignTitle,
    enrollmentCount: 1, // Each hold is for one enrollment
    holdAmount: hold.amount,
  }
}

/**
 * Convert Encore WalletTransaction to Frontend Transaction type
 */
function toFrontendTransaction(
  tx: walletsApi.WalletTransaction,
  organizationId: string
): Transaction {
  // Map Encore transaction types to frontend types
  const typeMap: Record<string, Transaction['type']> = {
    credit: 'credit',
    debit: 'withdrawal',
    hold: 'hold_created',
    release: 'hold_voided',
    hold_committed: 'hold_committed',
  }

  return {
    id: tx.id,
    organizationId,
    type: typeMap[tx.type] || 'credit',
    amount: tx.amount,
    description: tx.description,
    reference: tx.reference,
    createdAt: new Date(tx.createdAt),
  }
}

export function getWalletBalance(): WalletBalance {
  return mockWalletBalance
}

export interface GetTransactionsParams {
  type?: string
  page?: number
  pageSize?: number
}

export function getTransactions(params?: GetTransactionsParams): Transaction[] {
  let transactions = [...mockTransactions]

  // Filter by type
  if (params?.type && params.type !== 'all') {
    transactions = transactions.filter(t => t.type === params.type)
  }

  return transactions
}

export function getActiveHolds(): ActiveHold[] {
  return mockActiveHolds
}

// Types for SSR data
export interface WalletData {
  wallet: WalletBalance
  transactions: Transaction[]
  activeHolds: ActiveHold[]
}

/**
 * Fetch wallet data from Encore backend
 */
async function fetchWalletFromEncore(organizationId: string): Promise<WalletData> {
  const client = getEncoreClient()

  const [wallet, transactionsResponse, holdsResponse] = await Promise.all([
    client.wallets.getOrganizationWallet(organizationId),
    client.wallets.getOrganizationWalletTransactions(organizationId, { take: 20 }),
    client.wallets.getWalletHolds(organizationId),
  ])

  // Group holds by campaign for the UI
  const holdsByCampaign = new Map<string, ActiveHold>()
  for (const hold of holdsResponse.holds) {
    const existing = holdsByCampaign.get(hold.campaignId)
    if (existing) {
      existing.enrollmentCount += 1
      existing.holdAmount += hold.amount
    } else {
      holdsByCampaign.set(hold.campaignId, toFrontendActiveHold(hold))
    }
  }

  return {
    wallet: toFrontendWalletBalance(wallet),
    transactions: transactionsResponse.data.map(tx =>
      toFrontendTransaction(tx, organizationId)
    ),
    activeHolds: Array.from(holdsByCampaign.values()),
  }
}

/**
 * Get all wallet data for SSR hydration
 */
export async function getWalletData(organizationId?: string): Promise<WalletData> {
  if (USE_ENCORE && organizationId) {
    try {
      return await fetchWalletFromEncore(organizationId)
    } catch (error) {
      console.error('Failed to fetch wallet from Encore, falling back to mocks:', error)
    }
  }

  // Fallback to mock data
  const [wallet, transactions, activeHolds] = await Promise.all([
    Promise.resolve(getWalletBalance()),
    Promise.resolve(getTransactions()),
    Promise.resolve(getActiveHolds()),
  ])

  return {
    wallet,
    transactions,
    activeHolds,
  }
}
