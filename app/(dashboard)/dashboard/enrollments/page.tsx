'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Avatar from '@/components/ui/avatar'
import * as Checkbox from '@/components/ui/checkbox'
import { Tracker } from '@/components/ui/tracker'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  MagnifyingGlass,
  Check,
  X,
  DownloadSimple,
  ListChecks,
  SquaresFour,
  ArrowRight,
  Clock,
  User,
  Warning,
  Star,
  Funnel,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import type { Enrollment, EnrollmentStatus, Campaign } from '@/lib/types'

// Helper functions
const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

const isOverdue = (date: Date): boolean => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  return diffMs > 48 * 60 * 60 * 1000 // >48 hours
}

// Mock data
const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    campaignId: '1',
    shopperId: '1',
    status: 'awaiting_review',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    orderDate: new Date('2024-12-03'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-19'),
    billAmount: 2340,
    platformFee: 50,
    gstAmount: 421,
    totalCost: 2811,
    shopper: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      previousEnrollments: 5,
      approvalRate: 100,
    },
    campaign: { id: '1', title: 'Nike Summer Sale' } as Campaign,
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '2',
    campaignId: '1',
    shopperId: '2',
    status: 'awaiting_review',
    orderId: 'FLK-9876543210',
    orderValue: 8499,
    orderDate: new Date('2024-12-04'),
    platform: 'Flipkart',
    submissionDeadline: new Date('2025-01-20'),
    billAmount: 1530,
    platformFee: 50,
    gstAmount: 275,
    totalCost: 1855,
    shopper: {
      id: '2',
      name: 'Sarah K.',
      email: 'sarah@example.com',
      previousEnrollments: 3,
      approvalRate: 100,
    },
    campaign: { id: '1', title: 'Nike Summer Sale' } as Campaign,
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '3',
    campaignId: '2',
    shopperId: '3',
    status: 'approved',
    orderId: 'AMZ-5678901234',
    orderValue: 15999,
    orderDate: new Date('2024-12-01'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-16'),
    billAmount: 2880,
    platformFee: 50,
    gstAmount: 518,
    totalCost: 3448,
    shopper: {
      id: '3',
      name: 'Mike R.',
      email: 'mike@example.com',
      previousEnrollments: 8,
      approvalRate: 87,
    },
    campaign: { id: '2', title: 'Samsung Galaxy Fest' } as Campaign,
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-04'),
  },
  {
    id: '4',
    campaignId: '1',
    shopperId: '4',
    status: 'changes_requested',
    orderId: 'AMZ-2345678901',
    orderValue: 9999,
    orderDate: new Date('2024-12-02'),
    platform: 'Amazon',
    submissionDeadline: new Date('2025-01-18'),
    billAmount: 1800,
    platformFee: 50,
    gstAmount: 324,
    totalCost: 2174,
    shopper: {
      id: '4',
      name: 'Emily T.',
      email: 'emily@example.com',
      previousEnrollments: 2,
      approvalRate: 50,
    },
    campaign: { id: '1', title: 'Nike Summer Sale' } as Campaign,
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-05'),
  },
  {
    id: '5',
    campaignId: '1',
    shopperId: '5',
    status: 'rejected',
    orderId: 'FLK-3456789012',
    orderValue: 6999,
    orderDate: new Date('2024-11-30'),
    platform: 'Flipkart',
    submissionDeadline: new Date('2025-01-15'),
    billAmount: 1260,
    platformFee: 50,
    gstAmount: 227,
    totalCost: 1537,
    shopper: {
      id: '5',
      name: 'Anna W.',
      email: 'anna@example.com',
      previousEnrollments: 1,
      approvalRate: 0,
    },
    campaign: { id: '1', title: 'Nike Summer Sale' } as Campaign,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-03'),
  },
]

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'awaiting_review', label: 'Pending' },
  { value: 'changes_requested', label: 'Changes' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const getStatusBadgeStatus = (status: EnrollmentStatus) => {
  switch (status) {
    case 'approved': return 'completed' as const
    case 'awaiting_review':
    case 'awaiting_submission':
    case 'changes_requested': return 'pending' as const
    case 'rejected':
    case 'withdrawn':
    case 'expired': return 'failed' as const
    default: return 'disabled' as const
  }
}

const getStatusLabel = (status: EnrollmentStatus) => {
  switch (status) {
    case 'awaiting_review': return 'Pending'
    case 'awaiting_submission': return 'Awaiting'
    case 'changes_requested': return 'Changes'
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    case 'withdrawn': return 'Withdrawn'
    case 'expired': return 'Expired'
    default: return status
  }
}

function EnrollmentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusFilter = searchParams.get('status') || 'all'
  const [search, setSearch] = React.useState('')
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [viewMode, setViewMode] = React.useState<'list' | 'compact'>('list')

  const filteredEnrollments = React.useMemo(() => {
    let result = mockEnrollments

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.shopper?.name.toLowerCase().includes(searchLower) ||
          e.orderId.toLowerCase().includes(searchLower)
      )
    }

    return result
  }, [statusFilter, search])

  const stats = React.useMemo(() => {
    const pendingEnrollments = mockEnrollments.filter(e => e.status === 'awaiting_review')
    const overdueEnrollments = pendingEnrollments.filter(e => isOverdue(e.createdAt))
    return {
      total: mockEnrollments.length,
      pending: pendingEnrollments.length,
      overdue: overdueEnrollments.length,
      approved: mockEnrollments.filter(e => e.status === 'approved').length,
      rejected: mockEnrollments.filter(e => e.status === 'rejected').length,
      totalValue: mockEnrollments.reduce((acc, e) => acc + e.orderValue, 0),
    }
  }, [])

  // Tracker data
  const trackerData = React.useMemo(() => {
    return mockEnrollments.map(e => {
      switch (e.status) {
        case 'approved': return { status: 'success' as const, tooltip: e.shopper?.name }
        case 'awaiting_review':
        case 'awaiting_submission':
        case 'changes_requested': return { status: 'warning' as const, tooltip: e.shopper?.name }
        case 'rejected':
        case 'withdrawn':
        case 'expired': return { status: 'error' as const, tooltip: e.shopper?.name }
        default: return { status: 'neutral' as const, tooltip: e.shopper?.name }
      }
    })
  }, [])

  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'all') {
      url.searchParams.delete('status')
    } else {
      url.searchParams.set('status', value)
    }
    router.push(url.pathname + url.search)
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEnrollments.filter(e => e.status === 'awaiting_review').map((e) => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return mockEnrollments.length
    return mockEnrollments.filter((e) => e.status === status).length
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-error-lighter to-error-lighter/50 p-3 ring-1 ring-inset ring-error-base/20">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-error-base text-white">
            <Warning weight="fill" className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-sm text-error-base font-medium">
              {stats.overdue} enrollment{stats.overdue > 1 ? 's' : ''} overdue
            </p>
            <p className="text-paragraph-xs text-text-sub-600 hidden sm:block">
              Reviews pending for more than 48 hours
            </p>
          </div>
          <Button.Root variant="error" size="xsmall" onClick={() => handleTabChange('awaiting_review')} className="shrink-0">
            Review Now
          </Button.Root>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Enrollments</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Review and manage campaign enrollments
          </p>
        </div>
        <Button.Root variant="basic" size="small" className="shrink-0">
          <Button.Icon as={DownloadSimple} />
          <span className="hidden sm:inline">Export</span>
        </Button.Root>
      </div>

      {/* Stats + Tracker */}
      <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-paragraph-xs text-text-sub-600">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-success-base" /> Approved
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-warning-base" /> Pending / Changes
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-error-base" /> Rejected
          </span>
        </div>
        <Tracker data={trackerData} size="lg" className="mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-4 border-t border-stroke-soft-200">
          <div>
            <span className="text-paragraph-xs text-text-soft-400 block">Total</span>
            <span className="text-label-lg text-text-strong-950 font-semibold">{stats.total}</span>
          </div>
          <div>
            <span className="text-paragraph-xs text-text-soft-400 block">Pending</span>
            <span className="text-label-lg text-warning-base font-semibold">{stats.pending}</span>
          </div>
          <div>
            <span className="text-paragraph-xs text-text-soft-400 block">Overdue</span>
            <span className={cn("text-label-lg font-semibold", stats.overdue > 0 ? "text-error-base" : "text-text-soft-400")}>{stats.overdue}</span>
          </div>
          <div>
            <span className="text-paragraph-xs text-text-soft-400 block">Approved</span>
            <span className="text-label-lg text-success-base font-semibold">{stats.approved}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-paragraph-xs text-text-soft-400 block">Total Value</span>
            <span className="text-label-lg text-text-strong-950 font-semibold">{formatCurrency(stats.totalValue)}</span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-1">
            {statusTabs.map((tab) => {
              const count = getStatusCount(tab.value)
              const isActive = statusFilter === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-xs sm:text-label-sm font-medium transition-colors whitespace-nowrap',
                    isActive 
                      ? 'bg-primary-base text-white' 
                      : 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'inline-flex items-center justify-center size-4 sm:size-5 rounded-full text-[10px] sm:text-label-xs font-medium',
                    isActive ? 'bg-white/20 text-white' : 'bg-bg-soft-200 text-text-sub-600'
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search + View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-3 py-1.5 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-weak-50">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list' ? 'bg-bg-white-0 shadow-sm' : 'hover:bg-bg-soft-200'
              )}
            >
              <ListChecks className="size-4 text-text-sub-600" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'compact' ? 'bg-bg-white-0 shadow-sm' : 'hover:bg-bg-soft-200'
              )}
            >
              <SquaresFour className="size-4 text-text-sub-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-lighter">
          <span className="text-label-sm text-primary-base">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button.Root variant="primary" size="xsmall">
              <Button.Icon as={Check} />
              Approve All
            </Button.Root>
            <Button.Root variant="basic" size="xsmall">
              <Button.Icon as={X} />
              Reject All
            </Button.Root>
          </div>
        </div>
      )}

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-8 sm:p-12 text-center">
          <div className="size-12 mx-auto mb-4 rounded-full bg-success-lighter flex items-center justify-center">
            <Check className="size-6 text-success-base" />
          </div>
          <h3 className="text-label-md text-text-strong-950 mb-1">All caught up!</h3>
          <p className="text-paragraph-sm text-text-sub-600">
            No enrollments match your current filters.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2 sm:space-y-3">
          {filteredEnrollments.map((enrollment) => (
            <EnrollmentListItem
              key={enrollment.id}
              enrollment={enrollment}
              formatCurrency={formatCurrency}
              selected={selectedIds.includes(enrollment.id)}
              onSelect={(checked) => handleSelect(enrollment.id, checked)}
              onClick={() => router.push(`/dashboard/enrollments/${enrollment.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredEnrollments.map((enrollment) => (
            <EnrollmentCardItem
              key={enrollment.id}
              enrollment={enrollment}
              formatCurrency={formatCurrency}
              onClick={() => router.push(`/dashboard/enrollments/${enrollment.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {filteredEnrollments.length > 0 && (
        <div className="text-center text-paragraph-xs text-text-sub-600">
          Showing {filteredEnrollments.length} of {mockEnrollments.length} enrollments
        </div>
      )}
    </div>
  )
}

// List view item
interface EnrollmentListItemProps {
  enrollment: Enrollment
  formatCurrency: (amount: number) => string
  selected: boolean
  onSelect: (checked: boolean) => void
  onClick: () => void
}

function EnrollmentListItem({ enrollment, formatCurrency, selected, onSelect, onClick }: EnrollmentListItemProps) {
  const canSelect = enrollment.status === 'awaiting_review'
  const enrollmentOverdue = enrollment.status === 'awaiting_review' && isOverdue(enrollment.createdAt)
  const shopperRate = enrollment.shopper?.approvalRate ?? 0
  const prevEnrollments = enrollment.shopper?.previousEnrollments ?? 0
  const isTrustedShopper = shopperRate >= 90 && prevEnrollments >= 3
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-bg-white-0 ring-1 ring-inset p-3 sm:p-4 transition-colors group",
        selected 
          ? "ring-primary-base bg-primary-lighter"
          : enrollmentOverdue
            ? "ring-error-base/50 bg-error-lighter/30"
            : "ring-stroke-soft-200 hover:ring-stroke-sub-300"
      )}
    >
      {/* Checkbox */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        {canSelect ? (
          <Checkbox.Root
            checked={selected}
            onCheckedChange={onSelect}
          />
        ) : (
          <span className="size-2 rounded-full bg-transparent" />
        )}
      </div>

      {/* Clickable area */}
      <button onClick={onClick} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 text-left">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar.Root size="40" color={getAvatarColor(enrollment.shopper?.name || '')}>
            {enrollment.shopper?.name?.charAt(0) || '?'}
          </Avatar.Root>
          {isTrustedShopper && (
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-success-base text-white flex items-center justify-center">
              <Star weight="fill" className="size-2.5" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-label-sm text-text-strong-950 truncate">
              {enrollment.shopper?.name}
            </span>
            <StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
              {getStatusLabel(enrollment.status)}
            </StatusBadge.Root>
            {enrollmentOverdue && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-error-base bg-error-base/10 px-1.5 py-0.5 rounded-full">
                <Warning weight="fill" className="size-3" />
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600">
            <span className="truncate">{enrollment.campaign?.title}</span>
            <span className="text-text-soft-400">•</span>
            <span className="text-text-soft-400">{getTimeAgo(enrollment.createdAt)}</span>
            {prevEnrollments > 0 && (
              <>
                <span className="hidden sm:inline text-text-soft-400">•</span>
                <span className="hidden sm:inline text-text-soft-400">
                  {shopperRate}% rate · {prevEnrollments} prev
                </span>
              </>
            )}
          </div>
        </div>

        {/* Value + Arrow */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
            <span className="text-label-sm sm:text-label-md text-text-strong-950 font-semibold block">
              {formatCurrency(enrollment.orderValue)}
            </span>
            <span className="text-paragraph-xs text-text-sub-600 hidden sm:block">{enrollment.platform}</span>
          </div>
          <ArrowRight className="size-4 text-text-soft-400 group-hover:text-text-sub-600 transition-colors" />
        </div>
      </button>
    </div>
  )
}

// Card view item
interface EnrollmentCardItemProps {
  enrollment: Enrollment
  formatCurrency: (amount: number) => string
  onClick: () => void
}

function EnrollmentCardItem({ enrollment, formatCurrency, onClick }: EnrollmentCardItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 hover:bg-bg-weak-50 hover:ring-stroke-sub-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar.Root size="40" color={getAvatarColor(enrollment.shopper?.name || '')} className="shrink-0">
            {enrollment.shopper?.name?.charAt(0) || '?'}
          </Avatar.Root>
          <div>
            <span className="text-label-sm text-text-strong-950 block truncate">
              {enrollment.shopper?.name}
            </span>
            <span className="text-paragraph-xs text-text-sub-600">{enrollment.campaign?.title}</span>
          </div>
        </div>
        <StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
          {getStatusLabel(enrollment.status)}
        </StatusBadge.Root>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-bg-weak-50 p-2">
          <span className="text-paragraph-xs text-text-soft-400 block">Order Value</span>
          <span className="text-label-sm text-text-strong-950 font-semibold">{formatCurrency(enrollment.orderValue)}</span>
        </div>
        <div className="rounded-lg bg-bg-weak-50 p-2">
          <span className="text-paragraph-xs text-text-soft-400 block">Platform</span>
          <span className="text-label-sm text-text-strong-950">{enrollment.platform}</span>
        </div>
      </div>
    </button>
  )
}

function EnrollmentsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-bg-weak-50 rounded animate-pulse" />
      <div className="h-32 bg-bg-weak-50 rounded-2xl animate-pulse" />
      <div className="h-10 bg-bg-weak-50 rounded animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-bg-weak-50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={<EnrollmentsLoading />}>
      <EnrollmentsContent />
    </Suspense>
  )
}
