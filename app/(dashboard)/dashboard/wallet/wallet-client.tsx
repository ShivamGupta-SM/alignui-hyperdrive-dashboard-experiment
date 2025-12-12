'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Select from '@/components/ui/select'
import * as Modal from '@/components/ui/modal'
import * as BottomSheet from '@/components/ui/bottom-sheet'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as ProgressCircle from '@/components/ui/progress-circle'
import * as Tooltip from '@/components/ui/tooltip'
import { Callout } from '@/components/ui/callout'
import {
  Plus,
  DownloadSimple,
  Wallet,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  CreditCard,
  CurrencyCircleDollar,
  X,
  Clock,
  Bank,
  XCircle,
  CheckCircle,
  SpinnerGap,
} from '@phosphor-icons/react/dist/ssr'
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, PaypalIcon, UnionPayIcon } from '@/components/claude-generated-components/payment-icons'
import { cn } from '@/utils/cn'
import { useWalletSearchParams } from '@/hooks'
import { useWalletData, useWithdrawals, useCancelWithdrawal, useWithdrawalStats } from '@/hooks/use-wallet'
import type { Withdrawal, WalletTransaction, Wallet as WalletData } from '@/hooks/use-wallet'
import { useRequestCreditIncrease, useCurrentOrganization } from '@/hooks/use-organizations'
import { useMediaQuery } from 'usehooks-ts'
import { THRESHOLDS } from '@/lib/types/constants'
import { exportTransactions } from '@/lib/excel'
import { TRANSACTION_TYPE_CONFIG } from '@/lib/constants'
import { toast } from 'sonner'

const defaultWallet: WalletData = {
  id: '',
  holderId: '',
  holderType: 'organization',
  currency: 'INR',
  balance: 0,
  pendingBalance: 0,
  availableBalance: 0,
  createdAt: new Date().toISOString(),
  creditLimit: 0,
  creditUtilized: 0,
}

export function WalletClient() {
  const [isFundModalOpen, setIsFundModalOpen] = React.useState(false)
  const [isCreditRequestModalOpen, setIsCreditRequestModalOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<'transactions' | 'withdrawals'>('transactions')

  // nuqs: URL state management for filters
  const [searchParams, setSearchParams] = useWalletSearchParams()
  const transactionFilter = searchParams.type

  // React Query hook - data is already hydrated from server
  const { data } = useWalletData()
  const { data: withdrawalsData } = useWithdrawals()
  const { data: withdrawalStats } = useWithdrawalStats()
  const cancelWithdrawal = useCancelWithdrawal()

  // Extract data with fallbacks
  const wallet = data?.wallet ?? defaultWallet
  const transactions = data?.transactions ?? []
  const activeHolds = data?.activeHolds ?? []
  const withdrawals = withdrawalsData?.withdrawals ?? []

  // nuqs: Update URL when filter changes
  const handleFilterChange = (value: string) => {
    setSearchParams({ type: value as typeof transactionFilter, page: 1 })
  }

  // Excel export handler
  const handleExport = () => {
    try {
      exportTransactions(transactions)
      toast.success('Transactions exported to Excel')
    } catch {
      toast.error('Failed to export transactions')
    }
  }

  const formatCurrency = (amount: number | undefined | null) => `₹${(amount ?? 0).toLocaleString('en-IN')}`

  const formatCurrencyShort = (amount: number | undefined | null) => {
    const value = amount ?? 0
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
    return `₹${value.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const creditUtilization = React.useMemo(() => {
    if (!wallet.creditLimit) return 0
    return Math.round(((wallet.creditUtilized ?? 0) / wallet.creditLimit) * 100)
  }, [wallet.creditLimit, wallet.creditUtilized])

  const filteredTransactions = React.useMemo(() => {
    if (transactionFilter === 'all') return transactions
    return transactions.filter((t) => t.type === transactionFilter)
  }, [transactions, transactionFilter])

  const getTransactionStatus = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'credit':
      case 'release':
        return 'completed' as const
      case 'hold':
        return 'pending' as const
      case 'hold_committed':
      case 'debit':
        return 'disabled' as const
      default:
        return 'disabled' as const
    }
  }

  const totalHeld = activeHolds.reduce((acc, h) => acc + h.amount, 0)

  return (
    <Tooltip.Provider>
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Manage your balance and transactions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button.Root variant="basic" size="small" onClick={() => setIsCreditRequestModalOpen(true)} className="flex-1 sm:flex-none">
            <Button.Icon as={ArrowUp} />
            <span className="sm:inline">Request Credit</span>
          </Button.Root>
          <Button.Root variant="primary" size="small" onClick={() => setIsFundModalOpen(true)} className="flex-1 sm:flex-none">
            <Button.Icon as={Plus} />
            <span className="sm:inline">Fund Wallet</span>
          </Button.Root>
        </div>
      </div>

      {/* Low Balance Warning */}
      {wallet.availableBalance < THRESHOLDS.LOW_BALANCE_WARNING && (
        <Callout variant="warning" dismissible>
          <strong>Low Balance:</strong> Your wallet balance is below ₹{THRESHOLDS.LOW_BALANCE_WARNING.toLocaleString('en-IN')}. Add funds to continue accepting enrollments.
        </Callout>
      )}

      {/* Balance Overview - Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-base to-primary-darker p-5 sm:p-8 text-white shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-paragraph-sm text-white/80 mb-1.5">Total Balance</p>
            <h2 className="text-title-h2 sm:text-[42px] font-bold tracking-tight leading-none">
              {formatCurrency(wallet.availableBalance + wallet.pendingBalance)}
            </h2>
          </div>
          <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Wallet weight="fill" className="size-5 sm:size-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-5 border-t border-white/15">
          <div>
            <p className="text-[11px] text-white/60 uppercase tracking-wider mb-1">Available</p>
            <p className="text-label-lg sm:text-title-h5 font-semibold">{formatCurrency(wallet.availableBalance)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60 uppercase tracking-wider mb-1">On Hold</p>
            <p className="text-label-lg sm:text-title-h5 font-semibold">{formatCurrency(wallet.pendingBalance)}</p>
          </div>
        </div>
      </div>

      {/* Credit & Payment Info Row */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
        {/* Credit Limit Card */}
        <div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200 flex flex-col transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-information-lighter text-information-base shrink-0">
                  <ArrowUp weight="bold" className="size-4" />
                </div>
                <span className="text-label-sm text-text-sub-600">Credit Limit</span>
              </div>
              <p className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold mt-2">
                {formatCurrency(wallet.creditLimit ?? 0)}
              </p>
            </div>
            <ProgressCircle.Root value={creditUtilization} size="48" className="shrink-0">
              <span className="text-label-xs text-text-strong-950 font-semibold">{creditUtilization}%</span>
            </ProgressCircle.Root>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200 mt-auto">
            <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
              {formatCurrency(wallet.creditUtilized ?? 0)} utilized
            </p>
            <button
              type="button"
              onClick={() => setIsCreditRequestModalOpen(true)}
              className="text-label-xs font-medium text-primary-base hover:text-primary-darker transition-all duration-200 shrink-0"
            >
              Increase →
            </button>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200 flex flex-col transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-bg-soft-200 text-text-sub-600 shrink-0">
              <CreditCard weight="duotone" className="size-4" />
            </div>
            <span className="text-label-sm text-text-sub-600">Payment Methods</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 opacity-70 hover:opacity-100 transition-opacity">
            <VisaIcon className="h-5 sm:h-6 w-auto" />
            <MastercardIcon className="h-5 sm:h-6 w-auto" />
            <AmexIcon className="h-5 sm:h-6 w-auto" />
            <DiscoverIcon className="h-5 sm:h-6 w-auto" />
            <PaypalIcon className="h-5 sm:h-6 w-auto" />
            <UnionPayIcon className="h-5 sm:h-6 w-auto" />
          </div>
          <p className="text-paragraph-xs text-text-soft-400 mt-auto pt-2 sm:pt-3">
            Instant credit on bank transfer
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Section Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-bg-weak-50 w-fit mb-4">
            <button
              type="button"
              onClick={() => setActiveSection('transactions')}
              className={cn(
                'px-3 py-1.5 rounded-md text-label-sm font-medium transition-all duration-200',
                activeSection === 'transactions'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-sm'
                  : 'text-text-sub-600 hover:text-text-strong-950'
              )}
            >
              Transactions
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('withdrawals')}
              className={cn(
                'px-3 py-1.5 rounded-md text-label-sm font-medium transition-all duration-200',
                activeSection === 'withdrawals'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-sm'
                  : 'text-text-sub-600 hover:text-text-strong-950'
              )}
            >
              Withdrawals
              {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center size-5 rounded-full bg-warning-base text-white text-[10px] font-medium">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Transaction Section */}
          {activeSection === 'transactions' && (
            <>
              {/* Transaction Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-label-md text-text-strong-950">Transactions</h2>
                <div className="flex items-center gap-2">
                  <Select.Root value={transactionFilter} onValueChange={handleFilterChange} size="small">
                    <Select.Trigger className="min-w-[140px] flex-1 sm:flex-none sm:w-40">
                      <Select.Value placeholder="All Transactions" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">All Transactions</Select.Item>
                      <Select.Item value="credit">Credits</Select.Item>
                      <Select.Item value="hold_created">Holds Created</Select.Item>
                      <Select.Item value="hold_committed">Holds Committed</Select.Item>
                      <Select.Item value="hold_voided">Holds Released</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Button.Root variant="basic" size="small" onClick={handleExport} className="shrink-0">
                        <Button.Icon as={DownloadSimple} />
                        <span className="hidden sm:inline">Export</span>
                      </Button.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Export transactions to Excel</Tooltip.Content>
                  </Tooltip.Root>
                </div>
              </div>

              {/* Transaction List */}
              <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
                <div className="divide-y divide-stroke-soft-200">
                  {filteredTransactions.map((transaction) => {
                    const config = TRANSACTION_TYPE_CONFIG[transaction.type]
                    const isCredit = config.sign === '+'
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group"
                      >
                        {/* Icon - Down arrow for credits (money in), Up arrow for debits (money out) */}
                        <div className={cn(
                          "flex size-10 sm:size-11 items-center justify-center rounded-full shrink-0",
                          isCredit ? "bg-success-lighter" : "bg-warning-lighter"
                        )}>
                          {isCredit ? (
                            <ArrowDown weight="bold" className="size-5 text-success-base" />
                          ) : (
                            <ArrowUp weight="bold" className="size-5 text-warning-base" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-label-sm text-text-strong-950 truncate">
                                {transaction.description}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-paragraph-xs text-text-soft-400">
                                  {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                                </span>
                                <StatusBadge.Root status={getTransactionStatus(transaction.type)} variant="stroke" className="hidden sm:inline-flex">
                                  {config.label}
                                </StatusBadge.Root>
                              </div>
                            </div>
                            <div className="text-right shrink-0 min-w-[100px]">
                              <p className={cn(
                                "text-label-md font-semibold tabular-nums",
                                isCredit ? "text-success-base" : "text-text-strong-950"
                              )}>
                                {config.sign}{formatCurrency(transaction.amount)}
                              </p>
                              <StatusBadge.Root status={getTransactionStatus(transaction.type)} variant="stroke" className="sm:hidden mt-1 inline-flex">
                                {config.label}
                              </StatusBadge.Root>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
                      <CurrencyCircleDollar weight="duotone" className="size-6 text-text-soft-400" />
                    </div>
                    <p className="text-label-sm text-text-strong-950">No transactions</p>
                    <p className="text-paragraph-xs text-text-sub-600 mt-1">
                      Transactions will appear here once you start using your wallet.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Withdrawals Section */}
          {activeSection === 'withdrawals' && (
            <>
              {/* Withdrawal Stats Overview */}
              {withdrawalStats && (() => {
                // Extract counts from countByStatus map
                const completedCount = withdrawalStats.countByStatus?.completed ?? 0
                const pendingCount = withdrawalStats.pendingApprovalCount ?? 0
                const successRate = withdrawalStats.totalCount > 0
                  ? Math.round((completedCount / withdrawalStats.totalCount) * 100)
                  : 0

                return (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4 mb-4">
                  <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-success-lighter text-success-base">
                      <CheckCircle weight="fill" className="size-4" />
                    </div>
                    <div>
                      <span className="block text-paragraph-xs text-text-soft-400">Completed</span>
                      <span className="text-label-lg text-success-base font-semibold">{completedCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-warning-lighter text-warning-base">
                      <Clock weight="fill" className="size-4" />
                    </div>
                    <div>
                      <span className="block text-paragraph-xs text-text-soft-400">Pending</span>
                      <span className="text-label-lg text-warning-base font-semibold">{pendingCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
                      <Bank weight="duotone" className="size-4" />
                    </div>
                    <div>
                      <span className="block text-paragraph-xs text-text-soft-400">Total Amount</span>
                      <span className="text-label-lg text-text-strong-950 font-semibold">₹{(withdrawalStats.totalAmount / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      successRate >= 90 ? "bg-success-lighter text-success-base" : "bg-warning-lighter text-warning-base"
                    )}>
                      <ArrowUp weight="bold" className="size-4" />
                    </div>
                    <div>
                      <span className="block text-paragraph-xs text-text-soft-400">Success Rate</span>
                      <span className={cn(
                        "text-label-lg font-semibold",
                        successRate >= 90 ? "text-success-base" : "text-warning-base"
                      )}>{successRate}%</span>
                    </div>
                  </div>
                </div>
                )
              })()}

              {/* Withdrawals Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-label-md text-text-strong-950">Withdrawal History</h2>
                <span className="text-paragraph-xs text-text-sub-600">
                  {withdrawals.length} total withdrawal{withdrawals.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Withdrawals List */}
              <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
                <div className="divide-y divide-stroke-soft-200">
                  {withdrawals.map((withdrawal) => (
                    <WithdrawalItem
                      key={withdrawal.id}
                      withdrawal={withdrawal}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      onCancel={() => {
                        cancelWithdrawal.mutate(withdrawal.id, {
                          onSuccess: () => {
                            toast.success('Withdrawal cancelled successfully')
                          },
                          onError: () => {
                            toast.error('Failed to cancel withdrawal')
                          },
                        })
                      }}
                      isCancelling={cancelWithdrawal.isPending}
                    />
                  ))}
                </div>

                {withdrawals.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
                      <Bank weight="duotone" className="size-6 text-text-soft-400" />
                    </div>
                    <p className="text-label-sm text-text-strong-950">No withdrawals yet</p>
                    <p className="text-paragraph-xs text-text-sub-600 mt-1">
                      Your withdrawal history will appear here.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Active Holds */}
        <div className="space-y-3 sm:space-y-4">
          {/* Header - matches Transactions header style */}
          <div className="flex items-center justify-between">
            <h2 className="text-label-md text-text-strong-950">Active Holds</h2>
            <span className="text-paragraph-xs text-text-soft-400">
              {activeHolds.length} campaigns
            </span>
          </div>

          {/* Holds List - matches Transactions card style */}
          <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
            {/* Summary Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stroke-soft-200 bg-bg-weak-50">
              <div className="flex items-center gap-3">
                <div className="size-10 sm:size-11 rounded-full bg-warning-lighter flex items-center justify-center text-warning-base shrink-0">
                  <CurrencyCircleDollar weight="duotone" className="size-5" />
                </div>
                <div>
                  <p className="text-paragraph-xs text-text-sub-600">Total Held</p>
                  <p className="text-label-lg text-text-strong-950 font-semibold">
                    {formatCurrency(totalHeld)}
                  </p>
                </div>
              </div>
            </div>

            {/* Holds List - matches Transaction items style */}
            <div className="divide-y divide-stroke-soft-200">
              {activeHolds.map((hold) => (
                <div
                  key={hold.campaignId}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-all duration-200 cursor-pointer group"
                >
                  {/* Icon - Up arrow for holds (money held/out) */}
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-warning-lighter shrink-0">
                    <ArrowUp weight="bold" className="size-5 text-warning-base" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-label-sm text-text-strong-950 truncate">
                          {hold.campaignTitle}
                        </p>
                        <p className="text-paragraph-xs text-text-soft-400 mt-0.5">
                          Enrollment: {hold.enrollmentId?.slice(-8) ?? 'N/A'}
                        </p>
                      </div>
                      <p className="text-label-md text-text-strong-950 font-semibold tabular-nums shrink-0 min-w-[60px] text-right">
                        {formatCurrencyShort(hold.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeHolds.length === 0 && (
              <div className="p-12 text-center">
                <div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
                  <CurrencyCircleDollar weight="duotone" className="size-6 text-text-soft-400" />
                </div>
                <p className="text-label-sm text-text-strong-950">No active holds</p>
                <p className="text-paragraph-xs text-text-sub-600 mt-1">
                  Holds will appear when enrollments are pending review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FundWalletModal open={isFundModalOpen} onOpenChange={setIsFundModalOpen} />
      <CreditRequestModal open={isCreditRequestModalOpen} onOpenChange={setIsCreditRequestModalOpen} />
    </div>
    </Tooltip.Provider>
  )
}

// Shared Fund Wallet Content
function FundWalletContent({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = React.useState<string | null>(null)

  const bankDetails = {
    accountName: 'Nike India - Hypedrive VA',
    accountNumber: '9876543210123456',
    ifscCode: 'RATN0VAAPIS',
    bank: 'RBL Bank (via RazorpayX)',
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      <p className="text-paragraph-sm text-text-sub-600 mb-4">
        Add funds via bank transfer to the virtual account below.
      </p>

      <div className="rounded-lg bg-bg-weak-50 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard weight="duotone" className="size-4 text-text-soft-400" />
          <h3 className="text-label-sm text-text-strong-950">Virtual Account Details</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-paragraph-xs text-text-sub-600">Account Name</span>
            <span className="text-label-sm text-text-strong-950">{bankDetails.accountName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-paragraph-xs text-text-sub-600">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-text-strong-950 font-mono">{bankDetails.accountNumber}</span>
              <button type="button" onClick={() => handleCopy(bankDetails.accountNumber, 'account')} className="text-text-soft-400 hover:text-text-sub-600 transition-colors">
                {copied === 'account' ? <Check weight="bold" className="size-4 text-success-base" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-paragraph-xs text-text-sub-600">IFSC Code</span>
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-text-strong-950 font-mono">{bankDetails.ifscCode}</span>
              <button type="button" onClick={() => handleCopy(bankDetails.ifscCode, 'ifsc')} className="text-text-soft-400 hover:text-text-sub-600 transition-colors">
                {copied === 'ifsc' ? <Check weight="bold" className="size-4 text-success-base" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-paragraph-xs text-text-sub-600">Bank</span>
            <span className="text-label-sm text-text-strong-950">{bankDetails.bank}</span>
          </div>
        </div>
      </div>

      <Callout variant="info" size="sm" className="mt-4">
        Funds credited instantly after successful transfer
      </Callout>

      <div className="flex justify-end mt-4">
        <Button.Root variant="basic" onClick={onClose}>
          Close
        </Button.Root>
      </div>
    </>
  )
}

// Responsive Fund Wallet Modal - Bottom Sheet on mobile, Modal on desktop
function FundWalletModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const isMobile = useMediaQuery('(max-width: 639px)')

  // Mobile: Use vaul BottomSheet for swipe-to-dismiss
  if (isMobile) {
    return (
      <BottomSheet.Root open={open} onOpenChange={onOpenChange}>
        <BottomSheet.Content showClose={false}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-label-md text-text-strong-950 font-medium">Fund Wallet</h2>
            <BottomSheet.Close asChild>
              <Button.Root variant="ghost" size="xsmall">
                <Button.Icon as={X} />
              </Button.Root>
            </BottomSheet.Close>
          </div>
          <div className="px-4 pb-4">
            <FundWalletContent onClose={() => onOpenChange(false)} />
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    )
  }

  // Desktop: Use Modal
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Fund Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FundWalletContent onClose={() => onOpenChange(false)} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

// Shared Credit Request Content
function CreditRequestContent({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [requestedLimit, setRequestedLimit] = React.useState('')
  const [reason, setReason] = React.useState('')
  const creditLimitId = React.useId()
  const reasonId = React.useId()

  // Get current organization for the credit increase request
  const { data: currentOrganization } = useCurrentOrganization()
  const requestCreditIncrease = useRequestCreditIncrease()

  const handleSubmit = () => {
    if (!currentOrganization?.id) {
      toast.error('Organization not found. Please try again.')
      return
    }

    requestCreditIncrease.mutate(
      {
        organizationId: currentOrganization.id,
        requestedAmount: Number(requestedLimit),
        reason,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success('Credit request submitted successfully')
            setRequestedLimit('')
            setReason('')
            onSuccess()
          }
        },
        onError: () => {
          toast.error('Failed to submit credit request')
        },
      }
    )
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg bg-bg-weak-50 mb-4">
        <span className="text-paragraph-sm text-text-sub-600">Current Credit Limit</span>
        <span className="text-label-md text-text-strong-950 font-semibold">₹5,00,000</span>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={creditLimitId} className="block text-label-sm text-text-strong-950 mb-1.5">
            Requested Credit Limit <span className="text-error-base">*</span>
          </label>
          <Input.Root>
            <Input.Wrapper>
              <span className="text-text-sub-600">₹</span>
              <Input.El
                id={creditLimitId}
                type="number"
                placeholder="2,50,000"
                value={requestedLimit}
                onChange={(e) => setRequestedLimit(e.target.value)}
              />
            </Input.Wrapper>
          </Input.Root>
        </div>

        <div>
          <label htmlFor={reasonId} className="block text-label-sm text-text-strong-950 mb-1.5">
            Reason for Request <span className="text-error-base">*</span>
          </label>
          <Textarea.Root
            id={reasonId}
            placeholder="Explain why you need a higher credit limit..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <Callout variant="neutral" size="sm" className="mt-4">
        Credit limit increases are reviewed within 2-3 business days.
      </Callout>

      <div className="flex items-center justify-end gap-2 mt-4">
        <Button.Root variant="basic" onClick={onClose}>
          Cancel
        </Button.Root>
        <Button.Root
          variant="primary"
          onClick={handleSubmit}
          disabled={requestCreditIncrease.isPending || !requestedLimit || !reason}
        >
          {requestCreditIncrease.isPending ? 'Submitting...' : 'Submit Request'}
        </Button.Root>
      </div>
    </>
  )
}

// Responsive Credit Request Modal - Bottom Sheet on mobile, Modal on desktop
function CreditRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const isMobile = useMediaQuery('(max-width: 639px)')

  // Mobile: Use vaul BottomSheet for swipe-to-dismiss
  if (isMobile) {
    return (
      <BottomSheet.Root open={open} onOpenChange={onOpenChange}>
        <BottomSheet.Content showClose={false}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-label-md text-text-strong-950 font-medium">Request Credit Increase</h2>
            <BottomSheet.Close asChild>
              <Button.Root variant="ghost" size="xsmall">
                <Button.Icon as={X} />
              </Button.Root>
            </BottomSheet.Close>
          </div>
          <div className="px-4 pb-4">
            <CreditRequestContent
              onClose={() => onOpenChange(false)}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </BottomSheet.Content>
      </BottomSheet.Root>
    )
  }

  // Desktop: Use Modal
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Request Credit Limit Increase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreditRequestContent
            onClose={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

// Withdrawal item component
function WithdrawalItem({
  withdrawal,
  formatCurrency,
  formatDate,
  formatTime,
  onCancel,
  isCancelling,
}: {
  withdrawal: Withdrawal
  formatCurrency: (amount: number) => string
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
  onCancel: () => void
  isCancelling: boolean
}) {
  const getStatusConfig = (status: Withdrawal['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-warning-lighter',
          iconColor: 'text-warning-base',
          label: 'Pending',
          badgeStatus: 'pending' as const,
        }
      case 'processing':
        return {
          icon: SpinnerGap,
          bgColor: 'bg-information-lighter',
          iconColor: 'text-information-base',
          label: 'Processing',
          badgeStatus: 'active' as const,
        }
      case 'completed':
        return {
          icon: CheckCircle,
          bgColor: 'bg-success-lighter',
          iconColor: 'text-success-base',
          label: 'Completed',
          badgeStatus: 'completed' as const,
        }
      case 'failed':
        return {
          icon: XCircle,
          bgColor: 'bg-error-lighter',
          iconColor: 'text-error-base',
          label: 'Failed',
          badgeStatus: 'failed' as const,
        }
      case 'cancelled':
        return {
          icon: XCircle,
          bgColor: 'bg-bg-soft-200',
          iconColor: 'text-text-soft-400',
          label: 'Cancelled',
          badgeStatus: 'disabled' as const,
        }
      default:
        return {
          icon: Clock,
          bgColor: 'bg-bg-soft-200',
          iconColor: 'text-text-soft-400',
          label: status,
          badgeStatus: 'disabled' as const,
        }
    }
  }

  const config = getStatusConfig(withdrawal.status)
  const StatusIcon = config.icon
  const canCancel = withdrawal.status === 'pending'

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-all duration-200">
      {/* Status Icon */}
      <div className={cn(
        "flex size-10 sm:size-11 items-center justify-center rounded-full shrink-0",
        config.bgColor
      )}>
        <StatusIcon
          weight={withdrawal.status === 'processing' ? 'bold' : 'fill'}
          className={cn("size-5", config.iconColor, withdrawal.status === 'processing' && 'animate-spin')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-label-sm text-text-strong-950">
              Withdrawal to Bank
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-paragraph-xs text-text-soft-400">
                {formatDate(new Date(withdrawal.requestedAt))} • {formatTime(new Date(withdrawal.requestedAt))}
              </span>
              <StatusBadge.Root status={config.badgeStatus} variant="stroke" className="hidden sm:inline-flex">
                {config.label}
              </StatusBadge.Root>
            </div>
            {withdrawal.withdrawalMethodId && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Bank weight="duotone" className="size-3.5 text-text-soft-400 shrink-0" />
                <span className="text-paragraph-xs text-text-sub-600 truncate">
                  Bank Transfer
                </span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0 min-w-[100px]">
            <p className="text-label-md font-semibold tabular-nums text-text-strong-950">
              {formatCurrency(withdrawal.amount)}
            </p>
            <StatusBadge.Root status={config.badgeStatus} variant="stroke" className="sm:hidden mt-1 inline-flex">
              {config.label}
            </StatusBadge.Root>
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="mt-1.5 text-label-xs text-error-base hover:text-error-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
