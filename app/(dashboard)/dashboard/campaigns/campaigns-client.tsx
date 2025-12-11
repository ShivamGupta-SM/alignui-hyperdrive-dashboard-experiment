'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'
import * as Button from '@/components/ui/button'
import * as Tooltip from '@/components/ui/tooltip'
import { CampaignCard } from '@/components/dashboard/campaign-card'
import * as EmptyState from '@/components/claude-generated-components/empty-state'
import { Callout } from '@/components/ui/callout'
import { Plus, Megaphone, Play, Clock, User, DownloadSimple, MagnifyingGlass, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { updateCampaignStatus, deleteCampaign, duplicateCampaign } from '@/app/actions'
import { useCampaignSearchParams } from '@/hooks'
import { useCampaignsData, useSearchCampaigns } from '@/hooks/use-campaigns'
import { exportCampaigns } from '@/lib/excel'
import type { CampaignStatus } from '@/lib/types'

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

interface CampaignsClientProps {
  initialStatus?: string
}

export function CampaignsClient({ initialStatus = 'all' }: CampaignsClientProps) {
  const router = useRouter()
  const [, startTransition] = React.useTransition()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  // nuqs: URL state management for filters
  const [searchParams, setSearchParams] = useCampaignSearchParams()
  const statusFilter = searchParams.status || initialStatus

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // React Query hook - data is already hydrated from server
  const { data } = useCampaignsData(statusFilter)

  // Search hook - only active when there's a search query
  const { data: searchResults, isLoading: isSearching } = useSearchCampaigns({
    q: debouncedQuery,
    status: statusFilter !== 'all' ? statusFilter as CampaignStatus : undefined,
  })

  // Extract data with fallbacks - use search results when searching
  const isSearchActive = debouncedQuery.length >= 2
  const campaigns = isSearchActive ? (searchResults?.data ?? []) : (data?.campaigns ?? [])
  const allCampaigns = data?.allCampaigns ?? []
  const stats = data?.stats ?? {
    total: 0,
    active: 0,
    endingSoon: 0,
    draft: 0,
    pending: 0,
    completed: 0,
    totalEnrollments: 0,
    totalPayout: 0,
  }

  const handleStatusChange = (campaignId: string, status: CampaignStatus) => {
    startTransition(async () => {
      await updateCampaignStatus(campaignId, status)
      router.refresh()
    })
  }

  const handleDelete = (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    startTransition(async () => {
      await deleteCampaign(campaignId)
      router.refresh()
    })
  }

  const handleDuplicate = (campaignId: string) => {
    startTransition(async () => {
      const result = await duplicateCampaign(campaignId)
      if (result.success && result.newId) {
        router.push(`/dashboard/campaigns/${result.newId}`)
      }
      router.refresh()
    })
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return stats.total
    if (status === 'draft') return stats.draft
    if (status === 'pending_approval') return stats.pending
    if (status === 'active') return stats.active
    if (status === 'completed') return stats.completed
    return 0
  }

  // nuqs: Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ status: value as typeof statusFilter, page: 1 })
  }

  // Excel export handler
  const handleExport = () => {
    try {
      exportCampaigns(allCampaigns)
      toast.success('Campaigns exported to Excel')
    } catch {
      toast.error('Failed to export campaigns')
    }
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
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button.Root variant="basic" size="small" onClick={handleExport}>
                  <Button.Icon as={DownloadSimple} />
                  <span className="hidden sm:inline">Export</span>
                </Button.Root>
              </Tooltip.Trigger>
              <Tooltip.Content>Export campaigns to Excel</Tooltip.Content>
            </Tooltip.Root>
            <Button.Root variant="primary" size="small" onClick={() => router.push('/dashboard/campaigns/create')}>
              <Button.Icon as={Plus} />
              <span className="hidden sm:inline">Create Campaign</span>
              <span className="sm:hidden">Create</span>
            </Button.Root>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
            <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600 transition-colors">
              <Megaphone weight="duotone" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Total</span>
              <span className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold">{stats.total}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
            <div className="flex size-9 items-center justify-center rounded-lg bg-success-lighter text-success-base transition-colors">
              <Play weight="fill" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Active</span>
              <span className="text-label-lg sm:text-title-h5 text-success-base font-semibold">{stats.active}</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-3 rounded-xl p-3 sm:p-4 ring-1 ring-inset transition-all duration-200 hover:shadow-sm",
            stats.endingSoon > 0
              ? "bg-warning-lighter/50 ring-warning-base/20 hover:ring-warning-base/40"
              : "bg-bg-white-0 ring-stroke-soft-200 hover:ring-stroke-sub-300"
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
          <div className="flex items-center gap-3 rounded-xl bg-bg-white-0 p-3 sm:p-4 ring-1 ring-inset ring-stroke-soft-200 transition-all duration-200 hover:ring-stroke-sub-300 hover:shadow-sm">
            <div className="flex size-9 items-center justify-center rounded-lg bg-information-lighter text-information-base transition-colors">
              <User weight="fill" className="size-4" />
            </div>
            <div>
              <span className="block text-paragraph-xs text-text-soft-400">Enrollments</span>
              <span className="text-label-lg sm:text-title-h5 text-text-strong-950 font-semibold">{stats.totalEnrollments.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Search and Status Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-soft-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-bg-white-0 text-paragraph-sm text-text-strong-950 placeholder:text-text-soft-400 ring-1 ring-inset ring-stroke-soft-200 focus:outline-none focus:ring-2 focus:ring-primary-base transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-weak-50 text-text-soft-400 hover:text-text-sub-600 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="size-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {statusTabs.map((tab) => {
              const count = getStatusCount(tab.value)
              const isActive = statusFilter === tab.value
              return (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-label-xs sm:text-label-sm font-medium transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-primary-base text-white shadow-sm'
                      : 'bg-bg-white-0 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 active:scale-95'
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
        </div>

        {/* Campaign Tips */}
        {campaigns.length > 0 && statusFilter === 'all' && (
          <div className="hidden sm:block">
            <Callout variant="tip" size="sm" dismissible>
              <strong>Tip:</strong> Set clear campaign goals and deadlines to maximize enrollment quality.
            </Callout>
          </div>
        )}

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
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
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onView={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                onManage={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                onPause={() => handleStatusChange(campaign.id, 'paused')}
                onResume={() => handleStatusChange(campaign.id, 'active')}
                onEnd={() => handleStatusChange(campaign.id, 'ended')}
                onComplete={() => handleStatusChange(campaign.id, 'completed')}
                onArchive={() => handleStatusChange(campaign.id, 'archived')}
                onCancel={() => handleStatusChange(campaign.id, 'cancelled')}
                onDuplicate={() => handleDuplicate(campaign.id)}
                onEdit={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                onDelete={() => handleDelete(campaign.id)}
                onSubmitForApproval={() => handleStatusChange(campaign.id, 'pending_approval')}
              />
            ))}
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
}
