'use client'

import * as React from 'react'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Select from '@/components/ui/select'
import * as Modal from '@/components/ui/modal'
import * as Input from '@/components/ui/input'
import * as Textarea from '@/components/ui/textarea'
import * as ProgressCircle from '@/components/ui/progress-circle'
import { Callout } from '@/components/ui/callout'
import {
  RiAddLine,
  RiDownloadLine,
  RiWallet3Line,
  RiArrowUpLine,
  RiFileCopyLine,
  RiCheckLine,
  RiBankCardLine,
  RiExchangeDollarLine,
} from '@remixicon/react'
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, PaypalIcon, UnionPayIcon } from '@/components/claude-generated-components/payment-icons'
import { cn } from '@/utils/cn'
import type { Transaction, ActiveHold, WalletBalance } from '@/lib/types'
import { TRANSACTION_TYPE_CONFIG } from '@/lib/constants'

// Mock data
const mockWalletBalance: WalletBalance = {
  availableBalance: 245000,
  heldAmount: 85000,
  creditLimit: 500000,
  creditUtilized: 170000,
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    organizationId: '1',
    type: 'hold_created',
    amount: 2500,
    description: 'Hold for Enrollment #E-123',
    enrollmentId: 'E-123',
    createdAt: new Date('2024-12-05T10:30:00'),
  },
  {
    id: '2',
    organizationId: '1',
    type: 'hold_committed',
    amount: 1800,
    description: 'Approved Enrollment #E-119',
    enrollmentId: 'E-119',
    createdAt: new Date('2024-12-05T09:15:00'),
  },
  {
    id: '3',
    organizationId: '1',
    type: 'credit',
    amount: 50000,
    description: 'Manual funding via bank transfer',
    reference: 'TXN-123456',
    createdAt: new Date('2024-12-04T14:00:00'),
  },
  {
    id: '4',
    organizationId: '1',
    type: 'hold_voided',
    amount: 2200,
    description: 'Rejected Enrollment #E-115',
    enrollmentId: 'E-115',
    createdAt: new Date('2024-12-04T11:30:00'),
  },
  {
    id: '5',
    organizationId: '1',
    type: 'hold_created',
    amount: 3100,
    description: 'Hold for Enrollment #E-118',
    enrollmentId: 'E-118',
    createdAt: new Date('2024-12-03T16:45:00'),
  },
]

const mockActiveHolds: ActiveHold[] = [
  {
    campaignId: '1',
    campaignName: 'Nike Summer Sale',
    enrollmentCount: 24,
    holdAmount: 52000,
  },
  {
    campaignId: '2',
    campaignName: 'Samsung Galaxy Fest',
    enrollmentCount: 18,
    holdAmount: 33000,
  },
]

export default function WalletPage() {
  const [isFundModalOpen, setIsFundModalOpen] = React.useState(false)
  const [isCreditRequestModalOpen, setIsCreditRequestModalOpen] = React.useState(false)
  const [transactionFilter, setTransactionFilter] = React.useState('all')

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const creditUtilization = React.useMemo(() => {
    if (!mockWalletBalance.creditLimit) return 0
    return Math.round(
      (mockWalletBalance.creditUtilized / mockWalletBalance.creditLimit) * 100
    )
  }, [])

  const filteredTransactions = React.useMemo(() => {
    if (transactionFilter === 'all') return mockTransactions
    return mockTransactions.filter((t) => t.type === transactionFilter)
  }, [transactionFilter])

  const getTransactionStatus = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
      case 'hold_voided':
      case 'refund':
        return 'completed' as const
      case 'hold_created':
        return 'pending' as const
      case 'hold_committed':
      case 'withdrawal':
        return 'failed' as const
      default:
        return 'disabled' as const
    }
  }

  const totalHeld = mockActiveHolds.reduce((acc, h) => acc + h.holdAmount, 0)

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting transactions...')
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Wallet</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Manage your balance and transactions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button.Root variant="basic" size="small" onClick={() => setIsCreditRequestModalOpen(true)} className="hidden sm:inline-flex">
            <Button.Icon as={RiArrowUpLine} />
            Request Credit
          </Button.Root>
          <Button.Root variant="primary" size="small" onClick={() => setIsFundModalOpen(true)}>
            <Button.Icon as={RiAddLine} />
            Fund Wallet
          </Button.Root>
        </div>
      </div>

      {/* Low Balance Warning */}
      {mockWalletBalance.availableBalance < 50000 && (
        <Callout variant="warning" dismissible>
          <strong>Low Balance:</strong> Your wallet balance is below ₹50,000. Add funds to continue accepting enrollments.
        </Callout>
      )}

      {/* Balance Overview - Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-base to-primary-darker p-5 sm:p-8 text-white">
        <div className="flex items-start justify-between mb-5 sm:mb-6">
          <div>
            <p className="text-paragraph-sm text-white/70 mb-1">Total Balance</p>
            <h2 className="text-title-h3 sm:text-title-h1 font-bold tracking-tight">
              {formatCurrency(mockWalletBalance.availableBalance + mockWalletBalance.heldAmount)}
            </h2>
          </div>
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-white/10">
            <RiWallet3Line className="size-5 sm:size-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-paragraph-xs text-white/60 mb-1">Available</p>
            <p className="text-label-lg sm:text-title-h4 font-semibold">{formatCurrency(mockWalletBalance.availableBalance)}</p>
          </div>
          <div>
            <p className="text-paragraph-xs text-white/60 mb-1">Held</p>
            <p className="text-label-lg sm:text-title-h4 font-semibold">{formatCurrency(mockWalletBalance.heldAmount)}</p>
          </div>
        </div>
      </div>

      {/* Credit & Payment Info Row */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
        {/* Credit Limit Card */}
        <div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-information-lighter text-information-base">
                  <RiArrowUpLine className="size-4" />
                </div>
                <span className="text-label-sm text-text-sub-600">Credit Limit</span>
              </div>
              <p className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold mt-2">
                {formatCurrency(mockWalletBalance.creditLimit)}
              </p>
            </div>
            <ProgressCircle.Root value={creditUtilization} size="48" className="hidden sm:flex">
              <span className="text-label-xs text-text-strong-950 font-semibold">{creditUtilization}%</span>
            </ProgressCircle.Root>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stroke-soft-200">
            <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
              {formatCurrency(mockWalletBalance.creditUtilized)} utilized
            </p>
            <button 
              onClick={() => setIsCreditRequestModalOpen(true)}
              className="text-label-xs font-medium text-primary-base hover:text-primary-darker transition-colors"
            >
              Increase →
            </button>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="rounded-xl bg-bg-white-0 p-4 sm:p-5 ring-1 ring-inset ring-stroke-soft-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-bg-soft-200 text-text-sub-600">
              <RiBankCardLine className="size-4" />
            </div>
            <span className="text-label-sm text-text-sub-600">Payment Methods</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 opacity-70 hover:opacity-100 transition-opacity">
            <VisaIcon className="h-5 sm:h-6 w-auto" />
            <MastercardIcon className="h-5 sm:h-6 w-auto" />
            <AmexIcon className="h-5 sm:h-6 w-auto" />
            <DiscoverIcon className="h-5 sm:h-6 w-auto" />
            <PaypalIcon className="h-5 sm:h-6 w-auto" />
            <UnionPayIcon className="h-5 sm:h-6 w-auto" />
          </div>
          <p className="text-paragraph-xs text-text-soft-400 mt-2 sm:mt-3">
            Instant credit on bank transfer
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Transaction Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-label-md text-text-strong-950">Transactions</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select.Root value={transactionFilter} onValueChange={setTransactionFilter} size="small">
                <Select.Trigger className="flex-1 sm:flex-none sm:w-40">
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
              <Button.Root variant="basic" size="small" onClick={handleExport}>
                <Button.Icon as={RiDownloadLine} />
                <span className="hidden sm:inline">Export</span>
              </Button.Root>
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
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex size-10 sm:size-11 items-center justify-center rounded-full shrink-0",
                      isCredit ? "bg-success-lighter" : "bg-bg-soft-200"
                    )}>
                      {isCredit ? (
                        <RiArrowUpLine className={cn("size-5 rotate-180", isCredit ? "text-success-base" : "text-text-sub-600")} />
                      ) : (
                        <RiArrowUpLine className="size-5 text-text-sub-600" />
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
                            <StatusBadge.Root status={getTransactionStatus(transaction.type)} variant="light" className="hidden sm:inline-flex">
                              {config.label}
                            </StatusBadge.Root>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-label-md font-semibold tabular-nums",
                            isCredit ? "text-success-base" : "text-text-strong-950"
                          )}>
                            {config.sign}{formatCurrency(transaction.amount)}
                          </p>
                          <StatusBadge.Root status={getTransactionStatus(transaction.type)} variant="light" className="sm:hidden mt-1">
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
                  <RiExchangeDollarLine className="size-6 text-text-soft-400" />
                </div>
                <p className="text-label-sm text-text-strong-950">No transactions</p>
                <p className="text-paragraph-xs text-text-sub-600 mt-1">
                  Transactions will appear here once you start using your wallet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active Holds */}
        <div className="space-y-3 sm:space-y-4">
          {/* Header - matches Transactions header style */}
          <div className="flex items-center justify-between">
            <h2 className="text-label-md text-text-strong-950">Active Holds</h2>
            <span className="text-paragraph-xs text-text-soft-400">
              {mockActiveHolds.length} campaigns
            </span>
          </div>
          
          {/* Holds List - matches Transactions card style */}
          <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
            {/* Summary Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stroke-soft-200 bg-bg-weak-50">
              <div className="flex items-center gap-3">
                <div className="size-10 sm:size-11 rounded-full bg-warning-lighter flex items-center justify-center text-warning-base shrink-0">
                  <RiExchangeDollarLine className="size-5" />
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
              {mockActiveHolds.map((hold) => (
                <div 
                  key={hold.campaignId} 
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-bg-weak-50 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-bg-soft-200 shrink-0">
                    <RiArrowUpLine className="size-5 text-text-sub-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-label-sm text-text-strong-950 truncate">
                          {hold.campaignName}
                        </p>
                        <p className="text-paragraph-xs text-text-soft-400 mt-0.5">
                          {hold.enrollmentCount} pending enrollments
                        </p>
                      </div>
                      <p className="text-label-md text-warning-base font-semibold tabular-nums shrink-0">
                        {formatCurrencyShort(hold.holdAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {mockActiveHolds.length === 0 && (
              <div className="p-12 text-center">
                <div className="size-12 mx-auto mb-3 rounded-full bg-bg-soft-200 flex items-center justify-center">
                  <RiExchangeDollarLine className="size-6 text-text-soft-400" />
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
  )
}

function FundWalletModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
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
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Fund Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-paragraph-sm text-text-sub-600 mb-4">
            Add funds via bank transfer to the virtual account below.
          </p>

          <div className="rounded-lg bg-bg-weak-50 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <RiBankCardLine className="size-4 text-text-soft-400" />
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
                  <button onClick={() => handleCopy(bankDetails.accountNumber, 'account')} className="text-text-soft-400 hover:text-text-sub-600">
                    {copied === 'account' ? <RiCheckLine className="size-4 text-success-base" /> : <RiFileCopyLine className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-paragraph-xs text-text-sub-600">IFSC Code</span>
                <div className="flex items-center gap-2">
                  <span className="text-label-sm text-text-strong-950 font-mono">{bankDetails.ifscCode}</span>
                  <button onClick={() => handleCopy(bankDetails.ifscCode, 'ifsc')} className="text-text-soft-400 hover:text-text-sub-600">
                    {copied === 'ifsc' ? <RiCheckLine className="size-4 text-success-base" /> : <RiFileCopyLine className="size-4" />}
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
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
            Close
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

function CreditRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [requestedLimit, setRequestedLimit] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Request Credit Limit Increase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-weak-50 mb-4">
            <span className="text-paragraph-sm text-text-sub-600">Current Credit Limit</span>
            <span className="text-label-md text-text-strong-950 font-semibold">₹5,00,000</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-label-sm text-text-strong-950 mb-1.5">
                Requested Credit Limit <span className="text-error-base">*</span>
              </label>
              <Input.Root>
                <Input.Wrapper>
                  <span className="text-text-sub-600">₹</span>
                  <Input.El
                    type="number"
                    placeholder="2,50,000"
                    value={requestedLimit}
                    onChange={(e) => setRequestedLimit(e.target.value)}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>

            <div>
              <label className="block text-label-sm text-text-strong-950 mb-1.5">
                Reason for Request <span className="text-error-base">*</span>
              </label>
              <Textarea.Root
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
        </Modal.Body>
        <Modal.Footer>
          <Button.Root variant="basic" onClick={() => onOpenChange(false)}>
            Cancel
          </Button.Root>
          <Button.Root
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !requestedLimit || !reason}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
