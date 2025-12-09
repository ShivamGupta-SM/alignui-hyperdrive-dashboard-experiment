'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import * as Avatar from '@/components/ui/avatar'
import * as StatusBadge from '@/components/ui/status-badge'
import { Tracker } from '@/components/ui/tracker'
import { SparkChart } from '@/components/ui/spark-chart'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  Wallet,
  Megaphone,
  Plus,
  ArrowRight,
  Clock,
  Warning,
  TrendUp,
  TrendDown,
  CheckCircle,
  Lightning,
  CaretRight,
} from '@phosphor-icons/react'
import type { Campaign, Enrollment } from '@/lib/types'

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWallet = {
  available: 245000,
  held: 85000,
  avgDailySpend: 12000,
  lowBalanceThreshold: 50000,
}

const mockMetrics = {
  activeCampaigns: 8,
  pausedCampaigns: 1,
  endingSoon: 2,
  pendingTotal: 45,
  pendingOverdue: 8,
  pendingHigh: 12,
  totalEnrollments: 234,
  approvedCount: 198,
  rejectedCount: 23,
  pendingCount: 13,
  enrollmentsTrend: 18,
  approvalRateTrend: 3,
}

const enrollmentChartData = [
  { value: 12 }, { value: 15 }, { value: 18 }, { value: 14 }, { value: 22 },
  { value: 19 }, { value: 25 }, { value: 28 }, { value: 24 }, { value: 31 },
  { value: 35 }, { value: 29 }, { value: 38 }, { value: 42 },
]

const trackerData = [
  { status: 'success' as const, count: mockMetrics.approvedCount },
  { status: 'warning' as const, count: mockMetrics.pendingCount },
  { status: 'error' as const, count: mockMetrics.rejectedCount },
]

const priorityEnrollments: Partial<Enrollment>[] = [
  {
    id: '1',
    orderId: 'AMZ-1234567890',
    orderValue: 69999,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    shopper: { id: '1', name: 'Sarah K.', email: 'sarah@example.com', previousEnrollments: 12, approvalRate: 100 },
    campaign: { title: 'Samsung Galaxy Fest', product: { image: '/images/samsung-phone-product.png' } } as Campaign,
  },
  {
    id: '2',
    orderId: 'FLK-9876543210',
    orderValue: 45999,
    createdAt: new Date(Date.now() - 52 * 60 * 60 * 1000),
    shopper: { id: '2', name: 'Mike R.', email: 'mike@example.com', previousEnrollments: 8, approvalRate: 95 },
    campaign: { title: 'Sony Audio Week', product: { image: '/images/sony-headphones-product.png' } } as Campaign,
  },
  {
    id: '3',
    orderId: 'AMZ-5678901234',
    orderValue: 24999,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    shopper: { id: '3', name: 'John D.', email: 'john@example.com', previousEnrollments: 5, approvalRate: 100 },
    campaign: { title: 'Nike Summer Sale', product: { image: '/images/nike-shoe-product.png' } } as Campaign,
  },
]

const topCampaigns = [
  { id: '1', name: 'Nike Summer Sale', enrollments: 89, approvalRate: 94, status: 'active' as const, daysLeft: 12, image: '/images/nike-shoe-product.png' },
  { id: '2', name: 'Samsung Galaxy Fest', enrollments: 67, approvalRate: 91, status: 'active' as const, daysLeft: 5, image: '/images/samsung-phone-product.png' },
  { id: '3', name: 'Sony Audio Week', enrollments: 45, approvalRate: 88, status: 'ending' as const, daysLeft: 2, image: '/images/sony-headphones-product.png' },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function DashboardPage() {
  const approvalRate = Math.round((mockMetrics.approvedCount / mockMetrics.totalEnrollments) * 100)
  const runwayDays = Math.floor(mockWallet.available / mockWallet.avgDailySpend)
  const isLowBalance = mockWallet.available < mockWallet.lowBalanceThreshold
  const hasOverdue = mockMetrics.pendingOverdue > 0
  
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const isEnrollmentOverdue = (date: Date) => (Date.now() - date.getTime()) / (1000 * 60 * 60) > 48

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
          <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <Button.Root variant="primary" size="small" asChild className="shrink-0">
          <Link href="/dashboard/campaigns/create">
            <Button.Icon as={Plus} />
            <span className="hidden sm:inline">New Campaign</span>
          </Link>
        </Button.Root>
      </div>

      {/* ================================================================== */}
      {/* ALERT BAR - Conditional */}
      {/* ================================================================== */}
      {(hasOverdue || isLowBalance) && (
        <div className={cn(
          "rounded-xl p-3 flex items-start sm:items-center gap-3",
          hasOverdue 
            ? "bg-gradient-to-r from-error-lighter to-error-lighter/50 ring-1 ring-inset ring-error-base/20" 
            : "bg-gradient-to-r from-warning-lighter to-warning-lighter/50 ring-1 ring-inset ring-warning-base/20"
        )}>
          <div className={cn(
            "flex size-9 sm:size-10 items-center justify-center rounded-full shrink-0",
            hasOverdue ? "bg-error-base text-white" : "bg-warning-base text-white"
          )}>
            <Warning weight="fill" className="size-4 sm:size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-label-xs sm:text-label-sm font-medium",
              hasOverdue ? "text-error-dark" : "text-warning-dark"
            )}>
              {hasOverdue 
                ? `${mockMetrics.pendingOverdue} enrollments overdue`
                : `Low balance · ${runwayDays} days runway`
              }
            </p>
            <p className="text-paragraph-xs text-text-sub-600 mt-0.5 line-clamp-1">
              {hasOverdue 
                ? "Reviews pending over 48 hours"
                : "Add funds to keep campaigns running"
              }
            </p>
          </div>
          <Button.Root variant={hasOverdue ? "error" : "primary"} size="xsmall" asChild className="shrink-0">
            <Link href={hasOverdue ? "/dashboard/enrollments?status=awaiting_review" : "/dashboard/wallet"}>
              {hasOverdue ? "Review" : "Add Funds"}
            </Link>
          </Button.Root>
        </div>
      )}

      {/* ================================================================== */}
      {/* METRICS - Grid layout */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* WALLET - Full width on mobile */}
        <Link 
          href="/dashboard/wallet" 
          className={cn(
            "col-span-2 sm:col-span-1 rounded-xl p-4 ring-1 ring-inset transition-all hover:shadow-md",
            isLowBalance 
              ? "bg-warning-lighter/50 ring-warning-base/20" 
              : "bg-bg-white-0 ring-stroke-soft-200 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                isLowBalance ? "bg-warning-base text-white" : "bg-success-lighter text-success-base"
              )}>
                <Wallet weight="duotone" className="size-5" />
              </div>
              <div>
                <div className="text-title-h5 text-text-strong-950 font-semibold">
                  {formatCurrency(mockWallet.available)}
                </div>
                <div className="text-paragraph-xs text-text-sub-600">Available</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-label-sm font-medium",
                runwayDays < 7 ? "text-warning-base" : "text-success-base"
              )}>
                {runwayDays}d
              </div>
              <div className="text-[10px] text-text-soft-400">runway</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-text-soft-400">{formatCurrency(mockWallet.held)} held</span>
            {isLowBalance && (
              <span className="text-[10px] font-medium text-warning-base bg-warning-base/10 px-2 py-0.5 rounded-full uppercase">
                Low Balance
              </span>
            )}
          </div>
        </Link>

        {/* PENDING */}
        <Link 
          href="/dashboard/enrollments?status=awaiting_review" 
          className={cn(
            "rounded-xl p-4 ring-1 ring-inset transition-all hover:shadow-md",
            hasOverdue
              ? "bg-error-lighter/50 ring-error-base/20"
              : "bg-bg-white-0 ring-stroke-soft-200 shadow-sm"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              hasOverdue ? "bg-error-base text-white" : "bg-information-lighter text-information-base"
            )}>
              <Clock weight="duotone" className="size-5" />
            </div>
            {hasOverdue && (
              <span className="text-[10px] font-medium text-error-base bg-error-base/10 px-2 py-0.5 rounded-full uppercase">
                {mockMetrics.pendingOverdue} overdue
              </span>
            )}
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {mockMetrics.pendingTotal}
          </div>
          <div className="text-paragraph-xs text-text-sub-600">Pending</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-text-soft-400">{mockMetrics.pendingHigh} high value</span>
            <span className="text-success-base flex items-center gap-0.5 font-medium bg-success-base/10 px-1.5 py-0.5 rounded-full text-[10px]">
              <TrendUp weight="bold" className="size-3" />
              {mockMetrics.enrollmentsTrend}%
            </span>
          </div>
        </Link>

        {/* APPROVAL RATE */}
        <div className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-lighter text-primary-base">
              <CheckCircle weight="duotone" className="size-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-full",
              mockMetrics.approvalRateTrend >= 0 
                ? "text-success-base bg-success-base/10" 
                : "text-error-base bg-error-base/10"
            )}>
              {mockMetrics.approvalRateTrend >= 0 ? <TrendUp weight="bold" className="size-3" /> : <TrendDown weight="bold" className="size-3" />}
              {Math.abs(mockMetrics.approvalRateTrend)}%
            </span>
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {approvalRate}%
          </div>
          <div className="text-paragraph-xs text-text-sub-600">Approval Rate</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-success-base font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success-base" />
              {mockMetrics.approvedCount} approved
            </span>
            <span className="text-error-base flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-error-base" />
              {mockMetrics.rejectedCount} rejected
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN GRID - Campaigns + Trend */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* CAMPAIGNS */}
        <div className="lg:col-span-5 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
            <div className="flex items-center gap-2">
              <Megaphone weight="duotone" className="size-5 text-primary-base" />
              <h2 className="text-label-sm text-text-strong-950 font-medium">Campaigns</h2>
            </div>
            <Link href="/dashboard/campaigns" className="text-paragraph-xs text-primary-base hover:underline">
              View all
            </Link>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 border-b border-stroke-soft-200">
            <div className="p-3 text-center border-r border-stroke-soft-200">
              <div className="text-label-lg text-success-base font-semibold">{mockMetrics.activeCampaigns}</div>
              <div className="text-[10px] text-text-sub-600 uppercase tracking-wide">Active</div>
            </div>
            <div className="p-3 text-center border-r border-stroke-soft-200">
              <div className="text-label-lg text-warning-base font-semibold">{mockMetrics.endingSoon}</div>
              <div className="text-[10px] text-text-sub-600 uppercase tracking-wide">Ending</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-label-lg text-text-soft-400 font-semibold">{mockMetrics.pausedCampaigns}</div>
              <div className="text-[10px] text-text-sub-600 uppercase tracking-wide">Paused</div>
            </div>
          </div>

          {/* Campaign list */}
          <div className="divide-y divide-stroke-soft-200">
            {topCampaigns.map((campaign) => (
              <Link 
                key={campaign.id} 
                href={`/dashboard/campaigns/${campaign.id}`}
                className="flex items-center gap-3 p-3 hover:bg-bg-weak-50 transition-colors group"
              >
                <div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
                  <Image src={campaign.image} alt={campaign.name} fill className="object-contain p-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label-xs text-text-strong-950 group-hover:text-primary-base transition-colors truncate">
                    {campaign.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-sub-600 mt-0.5">
                    <span>{campaign.enrollments} enrolled</span>
                    <span>•</span>
                    <span className="text-success-base">{campaign.approvalRate}%</span>
                  </div>
                </div>
                {campaign.status === 'ending' ? (
                  <span className="text-[10px] font-medium text-warning-base bg-warning-lighter px-2 py-0.5 rounded-full shrink-0">
                    {campaign.daysLeft}d left
                  </span>
                ) : (
                  <CaretRight className="size-4 text-text-soft-400 opacity-0 group-hover:opacity-100 group-hover:text-text-sub-600 transition-all shrink-0" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ENROLLMENT TREND */}
        <div className="lg:col-span-7 rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
            <div className="flex items-center gap-2">
              <Lightning weight="duotone" className="size-5 text-primary-base" />
              <h2 className="text-label-sm text-text-strong-950 font-medium">Enrollment Trend</h2>
            </div>
            <span className="text-[10px] text-text-soft-400 uppercase tracking-wide">14 days</span>
          </div>

          <div className="p-4">
            {/* Legend + Tracker */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-paragraph-xs text-text-sub-600">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-success-base" /> Approved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-warning-base" /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-error-base" /> Rejected
              </span>
            </div>
            <Tracker data={trackerData} size="lg" className="mb-4" />
            
            {/* Chart */}
            <SparkChart 
              data={enrollmentChartData} 
              variant="area" 
              size="lg"
              color="var(--color-primary-base)"
              className="w-full h-20 sm:h-24"
            />
          </div>

          {/* Stats footer */}
          <div className="grid grid-cols-4 border-t border-stroke-soft-200">
            <div className="p-3 text-center">
              <div className="text-label-md text-text-strong-950 font-semibold">{mockMetrics.totalEnrollments}</div>
              <div className="text-[10px] text-text-soft-400">Total</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-success-base font-semibold">{mockMetrics.approvedCount}</div>
              <div className="text-[10px] text-text-soft-400">Approved</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-error-base font-semibold">{mockMetrics.rejectedCount}</div>
              <div className="text-[10px] text-text-soft-400">Rejected</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-warning-base font-semibold">{mockMetrics.pendingCount}</div>
              <div className="text-[10px] text-text-soft-400">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PRIORITY QUEUE */}
      {/* ================================================================== */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <div className="flex items-center gap-2">
            <h2 className="text-label-sm text-text-strong-950 font-medium">Priority Reviews</h2>
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              hasOverdue ? "bg-error-lighter text-error-base" : "bg-warning-lighter text-warning-base"
            )}>
              {mockMetrics.pendingTotal}
            </span>
          </div>
          <Link href="/dashboard/enrollments?status=awaiting_review" className="text-paragraph-xs text-primary-base hover:underline">
            View all
          </Link>
        </div>
        
        {/* Mobile cards / Desktop rows */}
        <div className="divide-y divide-stroke-soft-200">
          {priorityEnrollments.map((enrollment) => {
            const overdue = isEnrollmentOverdue(enrollment.createdAt!)
            const highValue = (enrollment.orderValue || 0) >= 25000
            
            return (
              <div
                key={enrollment.id}
                className={cn(
                  "p-3 sm:p-4 transition-colors hover:bg-bg-weak-50",
                  overdue && "bg-error-lighter/20"
                )}
              >
                {/* Mobile layout */}
                <div className="flex items-start gap-3 sm:hidden">
                  <div className="relative size-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
                    {enrollment.campaign?.product?.image && (
                      <Image src={enrollment.campaign.product.image} alt="" fill className="object-contain p-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-label-xs text-text-strong-950 truncate">
                        {enrollment.campaign?.title}
                      </span>
                      {overdue && (
                        <span className="text-[10px] font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-1">
                      <span>{enrollment.shopper?.name}</span>
                      <span>•</span>
                      <span className="font-medium text-text-strong-950">₹{(enrollment.orderValue || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-text-soft-400">{getTimeAgo(enrollment.createdAt!)}</span>
                      <Button.Root variant="primary" size="xsmall" asChild>
                        <Link href={`/dashboard/enrollments/${enrollment.id}`}>Review</Link>
                      </Button.Root>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
                    {enrollment.campaign?.product?.image && (
                      <Image src={enrollment.campaign.product.image} alt="" fill className="object-contain p-0.5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm text-text-strong-950 truncate">
                        {enrollment.campaign?.title}
                      </span>
                      {overdue && (
                        <span className="text-[10px] font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded shrink-0">
                          Overdue
                        </span>
                      )}
                      {highValue && !overdue && (
                        <span className="text-[10px] font-medium text-information-base bg-information-lighter px-1.5 py-0.5 rounded shrink-0">
                          High Value
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-0.5">
                      <span>{enrollment.shopper?.name}</span>
                      <span>•</span>
                      <span className="text-text-soft-400">{getTimeAgo(enrollment.createdAt!)}</span>
                      {enrollment.shopper?.approvalRate === 100 && (
                        <>
                          <span>•</span>
                          <span className="text-success-base">100%</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-label-sm text-text-strong-950 font-medium">
                      ₹{(enrollment.orderValue || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-text-soft-400 font-mono">
                      {enrollment.orderId}
                    </div>
                  </div>

                  <Button.Root variant="primary" size="xsmall" asChild className="shrink-0">
                    <Link href={`/dashboard/enrollments/${enrollment.id}`}>Review</Link>
                  </Button.Root>
                </div>
              </div>
            )
          })}
        </div>

        {mockMetrics.pendingTotal > 3 && (
          <Link 
            href="/dashboard/enrollments?status=awaiting_review"
            className="flex items-center justify-center gap-2 p-3 text-paragraph-xs text-primary-base hover:bg-bg-weak-50 transition-colors border-t border-stroke-soft-200"
          >
            View all {mockMetrics.pendingTotal} pending
            <ArrowRight weight="bold" className="size-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
