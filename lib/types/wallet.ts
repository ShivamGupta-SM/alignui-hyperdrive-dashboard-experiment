// Wallet & Transaction Types

export type TransactionType =
  | 'credit'
  | 'hold_created'
  | 'hold_committed'
  | 'hold_voided'
  | 'withdrawal'
  | 'refund'

export interface WalletBalance {
  availableBalance: number
  heldAmount: number
  creditLimit: number
  creditUtilized: number
}

export interface Transaction {
  id: string
  organizationId: string
  type: TransactionType
  amount: number
  description: string
  reference?: string
  enrollmentId?: string
  createdAt: Date
}

export interface ActiveHold {
  campaignId: string
  campaignName: string
  enrollmentCount: number
  holdAmount: number
}

export interface WalletSummary {
  balance: WalletBalance
  recentTransactions: Transaction[]
  activeHolds: ActiveHold[]
}
