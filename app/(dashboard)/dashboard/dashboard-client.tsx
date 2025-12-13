'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import { Tracker } from '@/components/ui/tracker'
import { SparkChart } from '@/components/ui/spark-chart'
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
import { Skeleton } from '@/components/ui/skeleton'
import { THRESHOLDS } from '@/lib/types/constants'
import type { organizations } from '@/lib/encore-client'

// Helper to format currency in compact form (₹1.5L, ₹2.3Cr)
const formatWalletAmount = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

// Calculate hours ago from a date - now takes currentTime to avoid hydration mismatch
const getHoursAgo = (date: Date | string, currentTime: number): number => {
  return Math.floor((currentTime - new Date(date).getTime()) / (1000 * 60 * 60))
}

// Format hours ago to human readable
const formatTimeAgo = (hoursAgo: number): string => {
  if (hoursAgo < 1) return 'Just now'
  if (hoursAgo < 24) return `${hoursAgo}h ago`
  const days = Math.floor(hoursAgo / 24)
  return `${days}d ago`
}

// Hook to get current time after hydration (avoids server/client mismatch)
function useHydratedTime() {
  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    setCurrentTime(Date.now())
    // Update every minute for "time ago" displays
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  return currentTime
}

// Hook to get formatted date after hydration
function useFormattedDate() {
  const [dateString, setDateString] = useState<string>('')

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
    )
  }, [])

  return dateString
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24 mt-0.5" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Skeleton className="col-span-2 sm:col-span-1 h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="lg:col-span-5 h-64 rounded-xl" />
        <Skeleton className="lg:col-span-7 h-64 rounded-xl" />
      </div>

      {/* Priority queue skeleton */}
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

interface DashboardClientProps {
  initialData: organizations.DashboardOverviewResponse
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const currentTime = useHydratedTime()
  const formattedDate = useFormattedDate()

  // Use server data directly - type-safe with Encore types
  const data = initialData

  // Map pending enrollments with hours ago calculation (only after hydration)
  // NOTE: This useMemo must be called before any early returns to maintain hooks order
  const priorityEnrollments = useMemo(() => {
    if (!data) return []
    if (!currentTime) return data.pendingEnrollments.slice(0, 3).map((e) => ({ ...e, hoursAgo: 0 }))
    return data.pendingEnrollments.slice(0, 3).map((e) => ({
      ...e,
      hoursAgo: getHoursAgo(e.createdAt, currentTime),
    }))
  }, [data, currentTime])

  // Simple loading check
  if (!data) {
    return <DashboardSkeleton />
  }

  // Transform API data to UI format - STRICT (no fallbacks, will fail if data is wrong)
  const wallet = {
    available: data.stats.walletBalance,
    held: data.stats.heldAmount,
    avgDailySpend: data.stats.avgDailySpend,
    lowBalanceThreshold: data.stats.lowBalanceThreshold,
  }

  const metrics = {
    activeCampaigns: data.stats.activeCampaigns,
    pausedCampaigns: data.stats.pausedCampaigns,
    endingSoon: data.stats.endingSoon,
    pendingTotal: data.stats.pendingEnrollments,
    pendingOverdue: data.stats.overdueEnrollments,
    pendingHigh: data.stats.highValuePending,
    totalEnrollments: data.enrollmentDistribution.total,
    approvedCount: data.enrollmentDistribution.approved,
    rejectedCount: data.enrollmentDistribution.rejected,
    pendingCount: data.enrollmentDistribution.pending,
    enrollmentsTrend: data.stats.enrollmentTrend,
    approvalRateTrend: data.stats.approvalRateTrend,
  }

  const enrollmentChartData = data.enrollmentChart.map((d) => ({ value: d.enrollments }))
  
  // Map top campaigns - use product image from API
  const topCampaigns = data.topCampaigns.slice(0, 3).map((c) => ({
    id: c.id,
    name: c.name,
    enrollments: c.enrollments,
    approvalRate: c.approvalRate,
    status: c.status,
    daysLeft: c.daysLeft,
    image: c.productImage,
  }))

  const approvalRate = metrics.totalEnrollments > 0
    ? Math.round((metrics.approvedCount / metrics.totalEnrollments) * 100)
    : 0
  const runwayDays = wallet.avgDailySpend > 0
    ? Math.floor(wallet.available / wallet.avgDailySpend)
    : 0
  const isLowBalance = wallet.available < wallet.lowBalanceThreshold
  const hasOverdue = metrics.pendingOverdue > 0

  const trackerData = [
    { status: 'success' as const, count: metrics.approvedCount },
    { status: 'warning' as const, count: metrics.pendingCount },
    { status: 'error' as const, count: metrics.rejectedCount },
  ]

  const isEnrollmentOverdue = (hoursAgo: number) => hoursAgo > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5 min-h-[1.25rem]">
            {formattedDate || <span className="invisible">Loading...</span>}
          </p>
        </div>
        <Button.Root variant="primary" size="small" asChild className="shrink-0">
          <Link href="/dashboard/campaigns/create">
            <Button.Icon as={Plus} />
            <span className="hidden sm:inline">New Campaign</span>
          </Link>
        </Button.Root>
      </div>

      {/* ALERT BAR */}
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
                ? `${metrics.pendingOverdue} enrollments overdue`
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

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* WALLET */}
        <Link
          href="/dashboard/wallet"
          className={cn(
            "col-span-2 sm:col-span-1 rounded-xl p-4 ring-1 ring-inset transition-shadow hover:shadow-md",
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
                  {formatWalletAmount(wallet.available)}
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
              <div className="text-label-xs text-text-soft-400">runway</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-text-soft-400">{formatWalletAmount(wallet.held)} held</span>
            {isLowBalance && (
              <span className="text-label-xs font-medium text-warning-base bg-warning-base/10 px-2 py-0.5 rounded-full uppercase">
                Low Balance
              </span>
            )}
          </div>
        </Link>

        {/* PENDING */}
        <Link
          href="/dashboard/enrollments?status=awaiting_review"
          className={cn(
            "rounded-xl p-4 ring-1 ring-inset transition-shadow hover:shadow-md",
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
              <span className="text-label-xs font-medium text-error-base bg-error-base/10 px-2 py-0.5 rounded-full uppercase">
                {metrics.pendingOverdue} overdue
              </span>
            )}
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {metrics.pendingTotal}
          </div>
          <div className="text-paragraph-xs text-text-sub-600">Pending</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-text-soft-400">{metrics.pendingHigh} high value</span>
            <span className="text-success-base flex items-center gap-0.5 font-medium bg-success-base/10 px-1.5 py-0.5 rounded-full text-label-xs">
              <TrendUp weight="bold" className="size-3" />
              {metrics.enrollmentsTrend}%
            </span>
          </div>
        </Link>

        {/* APPROVAL RATE */}
        <div className="rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-lighter text-primary-base">
              <CheckCircle weight="duotone" className="size-5" />
            </div>
            <span className={cn(
              "text-label-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-full",
              metrics.approvalRateTrend >= 0
                ? "text-success-base bg-success-base/10"
                : "text-error-base bg-error-base/10"
            )}>
              {metrics.approvalRateTrend >= 0 ? <TrendUp weight="bold" className="size-3" /> : <TrendDown weight="bold" className="size-3" />}
              {Math.abs(metrics.approvalRateTrend)}%
            </span>
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {approvalRate}%
          </div>
          <div className="text-paragraph-xs text-text-sub-600">Approval Rate</div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stroke-soft-200/60 text-paragraph-xs">
            <span className="text-success-base font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success-base" />
              {metrics.approvedCount} approved
            </span>
            <span className="text-error-base flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-error-base" />
              {metrics.rejectedCount} rejected
            </span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
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

          <div className="grid grid-cols-3 border-b border-stroke-soft-200">
            <div className="p-3 text-center border-r border-stroke-soft-200">
              <div className="text-label-lg text-success-base font-semibold">{metrics.activeCampaigns}</div>
              <div className="text-label-xs text-text-sub-600 uppercase tracking-wide">Active</div>
            </div>
            <div className="p-3 text-center border-r border-stroke-soft-200">
              <div className="text-label-lg text-warning-base font-semibold">{metrics.endingSoon}</div>
              <div className="text-label-xs text-text-sub-600 uppercase tracking-wide">Ending</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-label-lg text-text-soft-400 font-semibold">{metrics.pausedCampaigns}</div>
              <div className="text-label-xs text-text-sub-600 uppercase tracking-wide">Paused</div>
            </div>
          </div>

          <div className="divide-y divide-stroke-soft-200">
            {topCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="flex items-center gap-3 p-3 hover:bg-bg-weak-50 transition-colors group"
              >
                <div className="relative size-10 rounded-lg overflow-hidden shrink-0 ring-1 ring-inset ring-stroke-soft-200 bg-bg-weak-50">
                  {campaign.image ? (
                    <Image src={campaign.image} alt={campaign.name} fill sizes="40px" className="object-contain p-0.5" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-text-soft-400">
                      <Megaphone className="size-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label-xs text-text-strong-950 group-hover:text-primary-base transition-colors truncate">
                    {campaign.name}
                  </div>
                  <div className="flex items-center gap-2 text-label-xs text-text-sub-600 mt-0.5">
                    <span>{campaign.enrollments} enrolled</span>
                    <span>•</span>
                    <span className="text-success-base">{campaign.approvalRate}%</span>
                  </div>
                </div>
                {campaign.status === 'ending' ? (
                  <span className="text-label-xs font-medium text-warning-base bg-warning-lighter px-2 py-0.5 rounded-full shrink-0">
                    {campaign.daysLeft}d left
                  </span>
                ) : (
                  <CaretRight className="size-4 text-text-soft-400 opacity-0 group-hover:opacity-100 group-hover:text-text-sub-600 transition-opacity shrink-0" />
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
            <span className="text-label-xs text-text-soft-400 uppercase tracking-wide">14 days</span>
          </div>

          <div className="p-4">
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

            <SparkChart
              data={enrollmentChartData}
              variant="area"
              size="lg"
              color="var(--color-primary-base)"
              className="w-full h-20 sm:h-24"
            />
          </div>

          <div className="grid grid-cols-4 border-t border-stroke-soft-200">
            <div className="p-3 text-center">
              <div className="text-label-md text-text-strong-950 font-semibold">{metrics.totalEnrollments}</div>
              <div className="text-label-xs text-text-soft-400">Total</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-success-base font-semibold">{metrics.approvedCount}</div>
              <div className="text-label-xs text-text-soft-400">Approved</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-error-base font-semibold">{metrics.rejectedCount}</div>
              <div className="text-label-xs text-text-soft-400">Rejected</div>
            </div>
            <div className="p-3 text-center border-l border-stroke-soft-200">
              <div className="text-label-md text-warning-base font-semibold">{metrics.pendingCount}</div>
              <div className="text-label-xs text-text-soft-400">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* PRIORITY QUEUE */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <div className="flex items-center gap-2">
            <h2 className="text-label-sm text-text-strong-950 font-medium">Priority Reviews</h2>
            <span className={cn(
              "text-label-xs font-medium px-2 py-0.5 rounded-full",
              hasOverdue ? "bg-error-lighter text-error-base" : "bg-warning-lighter text-warning-base"
            )}>
              {metrics.pendingTotal}
            </span>
          </div>
          <Link href="/dashboard/enrollments?status=awaiting_review" className="text-paragraph-xs text-primary-base hover:underline">
            View all
          </Link>
        </div>

        <div className="divide-y divide-stroke-soft-200">
          {priorityEnrollments.map((enrollment) => {
            const overdue = isEnrollmentOverdue(enrollment.hoursAgo)
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
                      <Image src={enrollment.campaign.product.image} alt="" fill sizes="48px" className="object-contain p-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-label-xs text-text-strong-950 truncate">
                        {enrollment.campaign?.title}
                      </span>
                      {overdue && (
                        <span className="text-label-xs font-medium text-error-base bg-error-lighter px-1.5 py-0.5 rounded">
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
                      <span className="text-label-xs text-text-soft-400">{formatTimeAgo(enrollment.hoursAgo)}</span>
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
                      <Image src={enrollment.campaign.product.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
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
                        <span className="text-label-xs font-medium text-information-base bg-information-lighter px-1.5 py-0.5 rounded shrink-0">
                          High Value
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-paragraph-xs text-text-sub-600 mt-0.5">
                      <span>{enrollment.shopper?.name}</span>
                      <span>•</span>
                      <span className="text-text-soft-400">{formatTimeAgo(enrollment.hoursAgo)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-label-sm text-text-strong-950 font-medium">
                      ₹{(enrollment.orderValue || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-label-xs text-text-soft-400 font-mono">
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

        {metrics.pendingTotal > 3 && (
          <Link
            href="/dashboard/enrollments?status=awaiting_review"
            className="flex items-center justify-center gap-2 p-3 text-paragraph-xs text-primary-base hover:bg-bg-weak-50 transition-colors border-t border-stroke-soft-200"
          >
            View all {metrics.pendingTotal} pending
            <ArrowRight weight="bold" className="size-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
