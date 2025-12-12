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
} from '@phosphor-icons/react/dist/ssr'
import { THRESHOLDS } from '@/lib/types/constants'
import { getDashboardData } from '@/lib/ssr-data'
import { DashboardHeader, PriorityEnrollmentItem } from './components/dashboard-client-islands'

// Helper to format currency in compact form (₹1.5L, ₹2.3Cr)
const formatWalletAmount = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export default async function DashboardPage() {
  // Direct server fetch - no React Query needed!
  const data = await getDashboardData()

  // Transform API data to UI format
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

  const enrollmentChartData = data.enrollmentChart.map((d: { enrollments: number }) => ({ value: d.enrollments }))

  // Map top campaigns
  const topCampaigns = data.topCampaigns.slice(0, 3).map((c) => ({
    id: c.id,
    name: c.name,
    enrollments: c.enrollments,
    approvalRate: c.approvalRate,
    status: c.status,
    daysLeft: c.daysLeft,
    image: c.productImage,
  }))

  // Map pending enrollments
  const priorityEnrollments = data.pendingEnrollments.slice(0, 3)

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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* HEADER - Client Island for date formatting */}
      <DashboardHeader />

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
          {priorityEnrollments.map((enrollment) => (
            <PriorityEnrollmentItem key={enrollment.id} enrollment={enrollment} />
          ))}
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
