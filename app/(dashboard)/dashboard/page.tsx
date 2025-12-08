'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import * as Avatar from '@/components/ui/avatar'
import * as StatusBadge from '@/components/ui/status-badge'
import { SparkChart } from '@/components/ui/spark-chart'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  RiWallet3Line,
  RiMegaphoneLine,
  RiUserFollowLine,
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiArrowRightLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckLine,
  RiTeamLine,
  RiTimeLine,
  RiFileList3Line,
} from '@remixicon/react'
import type { Campaign, Enrollment } from '@/lib/types'

// Mock data - matches spec
const mockStats = {
  walletBalance: 245000,
  heldAmount: 50000,
  activeCampaigns: 8,
  draftCampaigns: 3,
  pendingEnrollments: 45,
  pendingTrend: 12,
  monthlyPayouts: 156000,
  paidCount: 156,
}

// 30-day enrollment data for chart
const enrollmentChartData = [
  { value: 18 }, { value: 22 }, { value: 19 }, { value: 25 }, { value: 28 },
  { value: 24 }, { value: 31 }, { value: 35 }, { value: 29 }, { value: 38 },
  { value: 42 }, { value: 36 }, { value: 45 }, { value: 48 }, { value: 41 },
  { value: 52 }, { value: 55 }, { value: 49 }, { value: 58 }, { value: 62 },
  { value: 56 }, { value: 65 }, { value: 68 }, { value: 61 }, { value: 72 },
  { value: 75 }, { value: 69 }, { value: 78 }, { value: 82 }, { value: 89 },
]

const enrollmentStats = {
  total: 856,
  approved: 678,
  rejected: 89,
  pending: 89,
}

const mockPendingEnrollments: Partial<Enrollment>[] = [
  {
    id: '1',
    orderId: 'AMZ-1234567890',
    orderValue: 12999,
    shopper: { id: '1', name: 'John D.', email: 'john@example.com', previousEnrollments: 5, approvalRate: 100 },
    campaign: { 
      title: 'Nike Summer Sale',
      product: { image: '/images/nike-shoe-product.png' }
    } as Campaign,
  },
  {
    id: '2',
    orderId: 'FLK-9876543210',
    orderValue: 69999,
    shopper: { id: '2', name: 'Sarah K.', email: 'sarah@example.com', previousEnrollments: 3, approvalRate: 100 },
    campaign: { 
      title: 'Samsung Galaxy Fest',
      product: { image: '/images/samsung-phone-product.png' }
    } as Campaign,
  },
  {
    id: '3',
    orderId: 'AMZ-5678901234',
    orderValue: 8499,
    shopper: { id: '3', name: 'Mike R.', email: 'mike@example.com', previousEnrollments: 8, approvalRate: 87 },
    campaign: { 
      title: 'Nike Summer Sale',
      product: { image: '/images/nike-shoe-product.png' }
    } as Campaign,
  },
  {
    id: '4',
    orderId: 'FLK-2345678901',
    orderValue: 24999,
    shopper: { id: '4', name: 'Lisa M.', email: 'lisa@example.com', previousEnrollments: 12, approvalRate: 95 },
    campaign: { 
      title: 'Sony Audio Week',
      product: { image: '/images/sony-headphones-product.png' }
    } as Campaign,
  },
]

const mockTopCampaigns = [
  { id: '1', name: 'Nike Summer Sale', enrollments: 234, approvalRate: 92, image: '/images/nike-shoe-product.png' },
  { id: '2', name: 'Samsung Galaxy Fest', enrollments: 189, approvalRate: 88, image: '/images/samsung-phone-product.png' },
  { id: '3', name: 'Sony Audio Week', enrollments: 145, approvalRate: 95, image: '/images/sony-headphones-product.png' },
]

const mockRecentActivity = [
  { id: '1', type: 'campaign_approved', text: 'Campaign "Winter Sale" approved by admin', time: '2 hours ago' },
  { id: '2', type: 'enrollments', text: '15 new enrollments received', time: 'Today' },
  { id: '3', type: 'credit', text: '₹50,000 credited to wallet', time: 'Yesterday' },
  { id: '4', type: 'team', text: 'Team member "Sarah" joined', time: '2 days ago' },
  { id: '5', type: 'payout', text: '₹32,000 payout processed', time: '3 days ago' },
]

export default function DashboardPage() {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatCurrencyFull = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_approved': return <RiCheckLine className="size-4 text-success-base" />
      case 'enrollments': return <RiUserFollowLine className="size-4 text-primary-base" />
      case 'credit': return <RiArrowDownLine className="size-4 text-success-base" />
      case 'team': return <RiTeamLine className="size-4 text-information-base" />
      case 'payout': return <RiArrowUpLine className="size-4 text-warning-base" />
      default: return <RiTimeLine className="size-4 text-text-soft-400" />
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Dashboard</h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
            Organization overview
          </p>
        </div>
        <Button.Root variant="primary" size="small" asChild className="hidden sm:flex">
          <Link href="/dashboard/campaigns/create">
            <Button.Icon as={RiAddLine} />
            New Campaign
          </Link>
        </Button.Root>
      </div>

      {/* Stat Cards - 4 cards as per spec */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Wallet Balance */}
        <Link 
          href="/dashboard/wallet" 
          className="group flex flex-col rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 hover:ring-stroke-sub-300 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-success-lighter text-success-base">
              <RiWallet3Line className="size-4" />
            </div>
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {formatCurrency(mockStats.walletBalance)}
          </div>
          <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
            Wallet Balance
          </div>
          <div className="text-paragraph-xs text-text-soft-400 mt-1">
            +{formatCurrency(mockStats.heldAmount)} held
          </div>
          <Button.Root variant="basic" size="xsmall" className="mt-3 w-full">
            Add Funds
          </Button.Root>
        </Link>

        {/* Active Campaigns */}
        <Link 
          href="/dashboard/campaigns" 
          className="group flex flex-col rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200 hover:ring-stroke-sub-300 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-information-lighter text-information-base">
              <RiMegaphoneLine className="size-4" />
            </div>
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {mockStats.activeCampaigns}
          </div>
          <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
            Active Campaigns
          </div>
          <div className="text-paragraph-xs text-text-soft-400 mt-1">
            {mockStats.draftCampaigns} draft
          </div>
          <Button.Root variant="basic" size="xsmall" className="mt-3 w-full">
            View All
          </Button.Root>
        </Link>

        {/* Pending Enrollments */}
        <Link 
          href="/dashboard/enrollments?status=awaiting_review" 
          className={cn(
            "group flex flex-col rounded-xl p-4 ring-1 ring-inset transition-all",
            mockStats.pendingEnrollments > 20 
              ? "bg-warning-lighter ring-warning-base/20" 
              : "bg-bg-white-0 ring-stroke-soft-200 hover:ring-stroke-sub-300"
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "flex size-8 items-center justify-center rounded-full",
              mockStats.pendingEnrollments > 20 ? "bg-warning-base text-white" : "bg-warning-lighter text-warning-base"
            )}>
              <RiUserFollowLine className="size-4" />
            </div>
          </div>
          <div className={cn(
            "text-title-h5 font-semibold",
            mockStats.pendingEnrollments > 20 ? "text-warning-dark" : "text-text-strong-950"
          )}>
            {mockStats.pendingEnrollments}
          </div>
          <div className={cn(
            "text-paragraph-xs mt-0.5",
            mockStats.pendingEnrollments > 20 ? "text-warning-base" : "text-text-sub-600"
          )}>
            Pending Enrollments
          </div>
          <div className="text-paragraph-xs text-success-base mt-1">
            ↑{mockStats.pendingTrend}% vs last week
          </div>
          <Button.Root variant={mockStats.pendingEnrollments > 20 ? "primary" : "basic"} size="xsmall" className="mt-3 w-full">
            Review
          </Button.Root>
        </Link>

        {/* Monthly Payouts */}
        <div className="flex flex-col rounded-xl bg-bg-white-0 p-4 ring-1 ring-inset ring-stroke-soft-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-lighter text-primary-base">
              <RiMoneyDollarCircleLine className="size-4" />
            </div>
          </div>
          <div className="text-title-h5 text-text-strong-950 font-semibold">
            {formatCurrency(mockStats.monthlyPayouts)}
          </div>
          <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
            This Month
          </div>
          <div className="text-paragraph-xs text-text-soft-400 mt-1">
            {mockStats.paidCount} paid
          </div>
          <Button.Root variant="basic" size="xsmall" className="mt-3 w-full" asChild>
            <Link href="/dashboard/invoices">Details</Link>
          </Button.Root>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <h2 className="text-label-sm text-text-sub-600 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link 
            href="/dashboard/campaigns/create"
            className="inline-flex items-center justify-start gap-3 h-9 px-3 rounded-lg text-label-sm bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent transition-colors"
          >
            <RiAddLine className="size-5 -mx-1" />
            Create Campaign
          </Link>
          <Link 
            href="/dashboard/enrollments?status=awaiting_review"
            className="inline-flex items-center justify-start gap-3 h-9 px-3 rounded-lg text-label-sm bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent transition-colors"
          >
            <RiFileList3Line className="size-5 -mx-1" />
            Review Submissions
          </Link>
          <Link 
            href="/dashboard/wallet"
            className="inline-flex items-center justify-start gap-3 h-9 px-3 rounded-lg text-label-sm bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent transition-colors"
          >
            <RiWallet3Line className="size-5 -mx-1" />
            Fund Wallet
          </Link>
          <Link 
            href="/dashboard/team"
            className="inline-flex items-center justify-start gap-3 h-9 px-3 rounded-lg text-label-sm bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-transparent transition-colors"
          >
            <RiTeamLine className="size-5 -mx-1" />
            Invite Team
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Enrollment Overview - 30 Days */}
        <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-label-md text-text-strong-950">Enrollment Overview</h2>
            <span className="text-paragraph-xs text-text-sub-600">30 Days</span>
          </div>
          
          <SparkChart 
            data={enrollmentChartData} 
            variant="area" 
            size="lg"
            color="var(--color-primary-base)"
            className="w-full h-28 mb-4"
          />
          
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-stroke-soft-200">
            <div>
              <span className="text-paragraph-xs text-text-soft-400 block">Total</span>
              <span className="text-label-md text-text-strong-950 font-semibold">{enrollmentStats.total}</span>
            </div>
            <div>
              <span className="text-paragraph-xs text-text-soft-400 block">Approved</span>
              <span className="text-label-md text-success-base font-semibold">{enrollmentStats.approved}</span>
            </div>
            <div>
              <span className="text-paragraph-xs text-text-soft-400 block">Rejected</span>
              <span className="text-label-md text-error-base font-semibold">{enrollmentStats.rejected}</span>
            </div>
            <div>
              <span className="text-paragraph-xs text-text-soft-400 block">Pending</span>
              <span className="text-label-md text-warning-base font-semibold">{enrollmentStats.pending}</span>
            </div>
          </div>
        </div>

        {/* Top Performing Campaigns */}
        <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-label-md text-text-strong-950">Top Performing Campaigns</h2>
          </div>

          <div className="space-y-4">
            {mockTopCampaigns.map((campaign, index) => (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-stroke-soft-200">
                  <Image 
                    src={campaign.image} 
                    alt={campaign.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-label-sm text-text-strong-950 group-hover:text-primary-base transition-colors truncate">
                    {campaign.name}
                  </div>
                  <div className="flex items-center gap-3 text-paragraph-xs text-text-sub-600 mt-0.5">
                    <span>{campaign.enrollments} enrollments</span>
                    <span className="text-success-base">{campaign.approvalRate}% approval</span>
                  </div>
                </div>
                <RiArrowRightLine className="size-4 text-text-soft-400 group-hover:text-text-sub-600 transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <Button.Root variant="ghost" size="xsmall" asChild className="w-full mt-4">
            <Link href="/dashboard/campaigns">View All Campaigns</Link>
          </Button.Root>
        </div>
      </div>

      {/* Enrollments Requiring Action */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <div className="flex items-center gap-3">
            <h2 className="text-label-md text-text-strong-950">Enrollments Requiring Action</h2>
            {mockStats.pendingEnrollments > 0 && (
              <StatusBadge.Root status="pending" variant="light">
                {mockStats.pendingEnrollments}
              </StatusBadge.Root>
            )}
          </div>
          <Button.Root variant="ghost" size="xsmall" asChild>
            <Link href="/dashboard/enrollments?status=awaiting_review">
              View All
            </Link>
          </Button.Root>
        </div>
        
        {/* Table Header - Desktop */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 bg-bg-weak-50 text-paragraph-xs text-text-sub-600 font-medium">
          <div className="col-span-3">Campaign</div>
          <div className="col-span-3">Shopper</div>
          <div className="col-span-3">Order</div>
          <div className="col-span-3 text-right">Action</div>
        </div>

        <div className="divide-y divide-stroke-soft-200">
          {mockPendingEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center gap-3 sm:grid sm:grid-cols-12 sm:gap-4 p-4 hover:bg-bg-weak-50 transition-colors"
            >
              {/* Mobile: Avatar */}
              <Avatar.Root size="40" color={getAvatarColor(enrollment.shopper?.name || '')} className="shrink-0 sm:hidden">
                {enrollment.shopper?.name?.charAt(0) || '?'}
              </Avatar.Root>

              {/* Campaign */}
              <div className="sm:col-span-3 flex-1 sm:flex-none min-w-0 flex items-center gap-3">
                {enrollment.campaign?.product?.image && (
                  <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-stroke-soft-200">
                    <Image 
                      src={enrollment.campaign.product.image} 
                      alt="" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-label-sm text-text-strong-950 truncate">
                    {enrollment.campaign?.title}
                  </div>
                  <div className="text-paragraph-xs text-text-sub-600 sm:hidden">
                    {enrollment.shopper?.name}
                  </div>
                </div>
              </div>

              {/* Shopper - Desktop */}
              <div className="hidden sm:flex sm:col-span-3 items-center gap-2">
                <Avatar.Root size="32" color={getAvatarColor(enrollment.shopper?.name || '')} className="shrink-0">
                  {enrollment.shopper?.name?.charAt(0) || '?'}
                </Avatar.Root>
                <span className="text-paragraph-sm text-text-strong-950 truncate">
                  {enrollment.shopper?.name}
                </span>
              </div>

              {/* Order */}
              <div className="sm:col-span-3 text-right sm:text-left shrink-0">
                <div className="text-label-sm text-text-strong-950 font-medium">
                  {formatCurrencyFull(enrollment.orderValue || 0)}
                </div>
                <div className="text-paragraph-xs text-text-soft-400 font-mono hidden sm:block">
                  {enrollment.orderId}
                </div>
              </div>

              {/* Action */}
              <div className="sm:col-span-3 sm:text-right shrink-0">
                <Button.Root variant="primary" size="xsmall" asChild>
                  <Link href={`/dashboard/enrollments/${enrollment.id}`}>
                    Review
                  </Link>
                </Button.Root>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stroke-soft-200">
          <h2 className="text-label-md text-text-strong-950">Recent Activity</h2>
        </div>
        
        <div className="divide-y divide-stroke-soft-200">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-bg-weak-50 shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-paragraph-sm text-text-strong-950">
                  {activity.text}
                </span>
              </div>
              <span className="text-paragraph-xs text-text-soft-400 shrink-0">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
