'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import * as SegmentedControl from '@/components/ui/segmented-control'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Tooltip from '@/components/ui/tooltip'
import { CampaignCard } from '@/components/dashboard/campaign-card'
import { Tracker } from '@/components/ui/tracker'
import { Metric } from '@/components/ui/metric'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import { Callout } from '@/components/ui/callout'
import { Plus, Megaphone, Funnel, Lightbulb, Info, Play, Clock, User, Wallet } from '@phosphor-icons/react'
import type { Campaign, CampaignStatus } from '@/lib/types'

// Mock data
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    organizationId: '1',
    productId: '1',
    product: {
        id: '1',
        organizationId: '1',
        name: 'Nike Air Max',
        category: 'Fashion',
        platform: 'Amazon',
        campaignCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: '/images/nike-shoe-product.png'
    },
    title: 'Nike Summer Sale 2024',
    description: 'Summer collection promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 234,
    billRate: 18,
    platformFee: 50,
    approvedCount: 198,
    rejectedCount: 24,
    pendingCount: 12,
    totalPayout: 45000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    organizationId: '1',
    productId: '2',
    title: 'New Year Special 2025',
    description: 'New year promotion',
    type: 'cashback',
    status: 'draft',
    isPublic: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    submissionDeadlineDays: 45,
    maxEnrollments: 1000,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    organizationId: '1',
    productId: '3',
    product: {
        id: '3',
        organizationId: '1',
        name: 'Samsung Galaxy S24',
        category: 'Electronics',
        platform: 'Amazon',
        campaignCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: '/images/samsung-phone-product.png'
    },
    title: 'Samsung Galaxy Fest',
    description: 'Galaxy series promotion',
    type: 'cashback',
    status: 'active',
    isPublic: true,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-12-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 300,
    currentEnrollments: 189,
    billRate: 18,
    platformFee: 50,
    approvedCount: 156,
    rejectedCount: 18,
    pendingCount: 15,
    totalPayout: 33000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    organizationId: '1',
    productId: '4',
    title: 'Winter Collection',
    description: 'Winter apparel promotion',
    type: 'cashback',
    status: 'pending_approval',
    isPublic: true,
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-01-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 200,
    currentEnrollments: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    totalPayout: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    organizationId: '1',
    productId: '5',
    title: 'Diwali Special 2024',
    description: 'Diwali promotion',
    type: 'cashback',
    status: 'completed',
    isPublic: true,
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-11-15'),
    submissionDeadlineDays: 45,
    maxEnrollments: 500,
    currentEnrollments: 456,
    billRate: 18,
    platformFee: 50,
    approvedCount: 412,
    rejectedCount: 32,
    pendingCount: 0,
    totalPayout: 85000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

// Stats summary
const getStats = (campaigns: Campaign[]) => {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const endingSoon = activeCampaigns.filter(c => new Date(c.endDate) <= sevenDaysFromNow)
  
  return {
    total: campaigns.length,
    active: activeCampaigns.length,
    endingSoon: endingSoon.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    pending: campaigns.filter(c => c.status === 'pending_approval').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalEnrollments: campaigns.reduce((acc, c) => acc + c.currentEnrollments, 0),
    totalPayout: campaigns.reduce((acc, c) => acc + c.totalPayout, 0),
  }
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const statusFilter = searchParams.get('status') || 'all'

  const filteredCampaigns = React.useMemo(() => {
    if (statusFilter === 'all') return mockCampaigns
    return mockCampaigns.filter((c) => c.status === statusFilter)
  }, [statusFilter])

  const stats = React.useMemo(() => getStats(mockCampaigns), [])

  const getStatusCount = (status: string) => {
    if (status === 'all') return mockCampaigns.length
    return mockCampaigns.filter((c) => c.status === status).length
  }

  const handleTabChange = (value: string) => {
    if (value === 'all') {
      router.push('/dashboard/campaigns')
    } else {
      router.push(`/dashboard/campaigns?status=${value}`)
    }
  }

  // Generate tracker data for campaign status distribution
  const trackerData = React.useMemo(() => {
    const total = mockCampaigns.length
    if (total === 0) return []
    
    return mockCampaigns.map(c => {
      switch (c.status) {
        case 'active': return { status: 'success' as const, tooltip: c.title }
        case 'draft': return { status: 'warning' as const, tooltip: c.title }
        case 'pending_approval': return { status: 'info' as const, tooltip: c.title }
        case 'completed': return { status: 'primary' as const, tooltip: c.title }
        default: return { status: 'neutral' as const, tooltip: c.title }
      }
    })
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  return (
    <Tooltip.Provider>
      <div className="space-y-4 sm:space-y-5">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950">Campaigns</h1>
            <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mt-0.5">
              Manage your influencer marketing campaigns
            </p>
          </div>
          <Button.Root variant="primary" size="small" onClick={() => router.push('/dashboard/campaigns/create')} className="shrink-0">
            <Button.Icon as={Plus} />
            <span className="hidden sm:inline">Create Campaign</span>
            <span className="sm:hidden">Create</span>
          </Button.Root>
        </div>

        {/* Stats Overview - Responsive grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
            <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
              <Megaphone weight="duotone" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Total</span>
              <span className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold">{stats.total}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
            <div className="flex size-9 items-center justify-center rounded-lg bg-success-lighter text-success-base">
              <Play weight="fill" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Active</span>
              <span className="text-label-lg sm:text-title-h5 text-success-base font-semibold">{stats.active}</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-3 rounded-xl p-3 sm:p-4 ring-1 ring-inset",
            stats.endingSoon > 0 
              ? "bg-warning-lighter/50 ring-warning-base/20" 
              : "bg-bg-white-0 ring-stroke-soft-200"
          )}>
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              stats.endingSoon > 0 ? "bg-warning-base text-white" : "bg-bg-weak-50 text-text-sub-600"
            )}>
              <Clock weight="fill" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Ending Soon</span>
              <span className={cn(
                "text-label-lg sm:text-title-h5 font-semibold",
                stats.endingSoon > 0 ? "text-warning-base" : "text-text-soft-400"
              )}>{stats.endingSoon}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200">
            <div className="flex size-9 items-center justify-center rounded-lg bg-information-lighter text-information-base">
              <User weight="fill" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Enrollments</span>
              <span className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold">{stats.totalEnrollments.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status Filter - Horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {statusTabs.map((tab) => {
              const count = getStatusCount(tab.value)
              const isActive = statusFilter === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-label-xs sm:text-label-sm font-medium transition-colors whitespace-nowrap',
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

        {/* Campaign Tips - Only show on desktop */}
        {filteredCampaigns.length > 0 && statusFilter === 'all' && (
          <div className="hidden sm:block">
            <Callout variant="tip" size="sm" dismissible>
              <strong>Tip:</strong> Set clear campaign goals and deadlines to maximize enrollment quality.
            </Callout>
          </div>
        )}

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <EmptyState.Root size="large">
            <EmptyState.Header>
              <EmptyState.Icon color="gray">
                <Megaphone weight="duotone" className="size-full" />
              </EmptyState.Icon>
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No campaigns found</EmptyState.Title>
              <EmptyState.Description>
                {statusFilter === 'all' 
                  ? 'Create your first campaign to start accepting enrollments from shoppers.'
                  : `No campaigns with "${statusTabs.find(t => t.value === statusFilter)?.label}" status.`
                }
              </EmptyState.Description>
            </EmptyState.Content>
            <EmptyState.Footer>
              {statusFilter === 'all' ? (
                <Button.Root variant="primary" asChild>
                  <Link href="/dashboard/campaigns/create">
                    <Button.Icon as={Plus} />
                    Create First Campaign
                  </Link>
                </Button.Root>
              ) : (
                <Button.Root variant="basic" asChild>
                  <Link href="/dashboard/campaigns">
                    View All Campaigns
                  </Link>
                </Button.Root>
              )}
            </EmptyState.Footer>
          </EmptyState.Root>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 items-stretch">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onView={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                onManage={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                onPause={() => {}}
                onResume={() => {}}
                onEnd={() => {}}
                onComplete={() => {}}
                onArchive={() => {}}
                onCancel={() => {}}
                onDuplicate={() => {}}
                onEdit={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                onDelete={() => {}}
                onSubmitForApproval={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
}

function CampaignsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-bg-weak-50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-bg-weak-50 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 bg-bg-weak-50 rounded-10 animate-pulse" />
      </div>
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-5">
        <div className="h-3 w-full bg-bg-weak-50 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-bg-weak-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-bg-weak-50 rounded-10 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-bg-weak-50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoading />}>
      <CampaignsContent />
    </Suspense>
  )
}
