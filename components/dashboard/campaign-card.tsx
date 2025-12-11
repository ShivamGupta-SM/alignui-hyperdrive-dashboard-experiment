'use client'

import * as React from 'react'
import Image from 'next/image'
import * as Badge from '@/components/ui/badge'
import * as ProgressBar from '@/components/ui/progress-bar'
import * as Dropdown from '@/components/ui/dropdown'
import {
  DotsThree,
  ChartBar,
  Copy,
  Pause,
  Play,
  Stop,
  Check,
  Archive,
  X,
  CaretRight,
  Image as ImageIcon,
  User,
} from '@phosphor-icons/react'
import type { campaigns } from '@/lib/encore-browser'
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants'
import { formatDateShort } from '@/lib/format'

// Accept both Campaign and CampaignWithStats
type CampaignData = campaigns.Campaign | campaigns.CampaignWithStats

interface CampaignCardProps {
  campaign: CampaignData
  onView?: () => void
  onManage?: () => void
  onPause?: () => void
  onResume?: () => void
  onEnd?: () => void
  onComplete?: () => void
  onArchive?: () => void
  onCancel?: () => void
  onDuplicate?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSubmitForApproval?: () => void
}

export const CampaignCard = React.memo(function CampaignCard({
  campaign,
  onView,
  onManage,
  onPause,
  onResume,
  onEnd,
  onComplete,
  onArchive,
  onCancel,
  onDuplicate,
  onEdit,
  onDelete,
  onSubmitForApproval,
}: CampaignCardProps) {
  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status]
  // Check if campaign has stats (CampaignWithStats)
  const hasStats = 'currentEnrollments' in campaign
  const currentEnrollments = hasStats ? (campaign as campaigns.CampaignWithStats).currentEnrollments : 0
  const approvedCount = hasStats ? (campaign as campaigns.CampaignWithStats).approvedCount : 0
  const pendingCount = hasStats ? (campaign as campaigns.CampaignWithStats).pendingCount : 0
  const rejectedCount = hasStats ? (campaign as campaigns.CampaignWithStats).rejectedCount : 0
  const totalPayout = hasStats ? (campaign as campaigns.CampaignWithStats).totalPayout : 0
  const product = hasStats ? (campaign as campaigns.CampaignWithStats).product : undefined

  const progress = campaign.maxEnrollments > 0
    ? Math.round((currentEnrollments / campaign.maxEnrollments) * 100)
    : 0

  const getStatusBadgeColor = (): 'yellow' | 'orange' | 'blue' | 'green' | 'red' | 'gray' => {
    return statusConfig.color
  }

  const getAvailableActions = () => {
    const actions: { label: string; icon: React.ElementType; onClick?: () => void; destructive?: boolean }[] = []

    switch (campaign.status) {
      case 'draft':
        if (onEdit) actions.push({ label: 'Edit', icon: ChartBar, onClick: onEdit })
        if (onSubmitForApproval) actions.push({ label: 'Submit for Approval', icon: Check, onClick: onSubmitForApproval })
        if (onDelete) actions.push({ label: 'Delete', icon: X, onClick: onDelete, destructive: true })
        break
      case 'pending_approval':
        break
      case 'approved':
        if (onManage) actions.push({ label: 'Activate', icon: Play, onClick: onManage })
        if (onCancel) actions.push({ label: 'Cancel', icon: X, onClick: onCancel, destructive: true })
        break
      case 'active':
        if (onPause) actions.push({ label: 'Pause', icon: Pause, onClick: onPause })
        if (onEnd) actions.push({ label: 'End Campaign', icon: Stop, onClick: onEnd })
        break
      case 'paused':
        if (onResume) actions.push({ label: 'Resume', icon: Play, onClick: onResume })
        if (onEnd) actions.push({ label: 'End Campaign', icon: Stop, onClick: onEnd })
        if (onCancel) actions.push({ label: 'Cancel', icon: X, onClick: onCancel, destructive: true })
        break
      case 'ended':
        if (onComplete) actions.push({ label: 'Complete', icon: Check, onClick: onComplete })
        if (onArchive) actions.push({ label: 'Archive', icon: Archive, onClick: onArchive })
        break
      case 'completed':
        if (onArchive) actions.push({ label: 'Archive', icon: Archive, onClick: onArchive })
        break
      case 'archived':
        if (onDuplicate) actions.push({ label: 'Duplicate', icon: Copy, onClick: onDuplicate })
        break
    }

    if (onDuplicate && campaign.status !== 'archived') {
      actions.push({ label: 'Duplicate', icon: Copy, onClick: onDuplicate })
    }

    return actions
  }

  const actions = getAvailableActions()
  const productImage = product?.productImages?.[0] || null
  const showProgress = ['active', 'paused'].includes(campaign.status)
  const showStats = ['active', 'paused', 'ended', 'completed'].includes(campaign.status)

  return (
    <div className="flex flex-col h-full rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden hover:ring-stroke-sub-300 hover:shadow-sm transition-shadow duration-200">
      {/* Header - Campaign Identity */}
      <div className="p-4 pb-3">
        <div className="flex gap-3">
          {/* Product Thumbnail */}
          <div className="shrink-0">
            {productImage ? (
              <div className="relative size-14 rounded-xl overflow-hidden bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200">
                <Image
                  src={productImage}
                  alt="Product"
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
              </div>
            ) : (
              <div className="size-14 rounded-xl bg-bg-weak-50 flex items-center justify-center ring-1 ring-inset ring-stroke-soft-200">
                <ImageIcon className="size-6 text-text-soft-400" />
              </div>
            )}
          </div>

          {/* Title & Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-label-md text-text-strong-950 font-semibold truncate">
                  {campaign.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge.Root
                    color={getStatusBadgeColor()}
                    variant="lighter"
                    size="small"
                  >
                    {statusConfig.label}
                  </Badge.Root>
                  <span className="text-paragraph-xs text-text-soft-400">
                    {formatDateShort(campaign.startDate)} – {formatDateShort(campaign.endDate)}
                  </span>
                </div>
              </div>
              
              {actions.length > 0 && (
                <Dropdown.Root>
                  <Dropdown.Trigger asChild>
                    <button type="button" className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base -mr-1">
                      <DotsThree weight="bold" className="size-5" />
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Content align="end">
                    {actions.map((action, index) => (
                      <React.Fragment key={action.label}>
                        {index > 0 && action.destructive && <Dropdown.Separator />}
                        <Dropdown.Item
                          onClick={action.onClick}
                          className={action.destructive ? 'text-error-base' : undefined}
                        >
                          <Dropdown.ItemIcon as={action.icon} />
                          {action.label}
                        </Dropdown.Item>
                      </React.Fragment>
                    ))}
                  </Dropdown.Content>
                </Dropdown.Root>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Key Metrics */}
      {showStats && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-bg-weak-50">
            <div className="text-center">
              <div className="text-title-h6 text-text-strong-950 font-semibold">
                {currentEnrollments}
              </div>
              <div className="text-label-xs text-text-soft-400 uppercase tracking-wide">Enrolled</div>
            </div>
            <div className="text-center border-x border-stroke-soft-200">
              <div className="text-title-h6 text-warning-base font-semibold">
                {pendingCount}
              </div>
              <div className="text-label-xs text-text-soft-400 uppercase tracking-wide">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-title-h6 text-success-base font-semibold">
                {approvedCount}
              </div>
              <div className="text-label-xs text-text-soft-400 uppercase tracking-wide">Approved</div>
            </div>
          </div>
          
          {/* Progress Bar - integrated */}
          {showProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-paragraph-xs text-text-sub-600">Capacity</span>
                <span className="text-label-xs text-text-strong-950 font-medium">{currentEnrollments}/{campaign.maxEnrollments}</span>
              </div>
              <ProgressBar.Root value={progress} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Non-stats state - for draft/pending campaigns */}
      {!showStats && (
        <div className="px-4 pb-4 flex-1">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-weak-50">
            <div className="flex items-center gap-2">
              <User className="size-4 text-text-soft-400" />
              <span className="text-paragraph-sm text-text-sub-600">
                <span className="font-medium text-text-strong-950">{campaign.maxEnrollments}</span> max enrollments
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-stroke-soft-200 mt-auto">
        <div className="text-paragraph-xs min-w-0">
          {campaign.status === 'draft' ? (
            <span className="text-warning-base font-medium">Complete setup to launch</span>
          ) : campaign.status === 'pending_approval' ? (
            <span className="text-information-base font-medium">Under review</span>
          ) : campaign.status === 'active' ? (
            <span className="text-success-base font-medium">Accepting enrollments</span>
          ) : campaign.status === 'paused' ? (
            <span className="text-text-soft-400 font-medium">Paused</span>
          ) : campaign.status === 'completed' ? (
            <span className="text-text-sub-600">Campaign ended</span>
          ) : (
            <span className="text-text-soft-400">—</span>
          )}
        </div>
        
        <button
          type="button"
          onClick={onView}
          className="flex items-center gap-0.5 text-label-sm text-primary-base hover:text-primary-darker font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded"
        >
          View Details
          <CaretRight weight="bold" className="size-4" />
        </button>
      </div>
    </div>
  )
})

// Compact version for lists
interface CampaignListItemProps {
  campaign: CampaignData
  onView?: () => void
  onAction?: () => void
  actionLabel?: string
}

export const CampaignListItem = React.memo(function CampaignListItem({
  campaign,
  onAction,
  actionLabel = 'Review',
}: CampaignListItemProps) {
  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status]
  // Get product from CampaignWithStats if available
  const campaignProduct = 'product' in campaign ? campaign.product : undefined
  const productImage = campaignProduct?.productImages?.[0] || null

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stroke-soft-200 last:border-0">
      {productImage ? (
        <div className="relative size-10 rounded-lg overflow-hidden bg-bg-weak-50">
          <Image
            src={productImage}
            alt="Product"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center">
          <ImageIcon className="size-4 text-text-soft-400" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-text-strong-950 truncate">
            {campaign.title}
          </span>
          <Badge.Root
            color={statusConfig.color as 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'yellow'}
            variant="lighter"
            size="small"
          >
            {statusConfig.label}
          </Badge.Root>
        </div>
        <div className="text-paragraph-xs text-text-sub-600 mt-0.5">
          {'currentEnrollments' in campaign ? campaign.currentEnrollments : 0} enrollments · {'pendingCount' in campaign ? campaign.pendingCount : 0} pending
        </div>
      </div>
      
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-label-sm text-primary-base hover:text-primary-darker font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 rounded"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
})
