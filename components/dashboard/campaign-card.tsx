'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import * as Badge from '@/components/ui/badge'
import * as ProgressBar from '@/components/ui/progress-bar'
import * as Dropdown from '@/components/ui/dropdown'
import { 
  RiMoreLine, 
  RiBarChartBoxLine, 
  RiFileCopyLine,
  RiPauseLine,
  RiPlayLine,
  RiStopLine,
  RiCheckLine,
  RiArchiveLine,
  RiCloseLine,
  RiCalendarLine,
  RiUserLine,
  RiArrowRightSLine,
  RiImage2Line,
} from '@remixicon/react'
import type { Campaign, CampaignStatus } from '@/lib/types'
import { CAMPAIGN_STATUS_CONFIG } from '@/lib/constants'

interface CampaignCardProps {
  campaign: Campaign
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

// Mock product images
const productImages: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',
  '2': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop',
  '3': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=120&h=120&fit=crop',
  '4': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=120&h=120&fit=crop',
  '5': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=120&h=120&fit=crop',
}

export function CampaignCard({
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
  const progress = campaign.maxEnrollments > 0 
    ? Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100) 
    : 0

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusBadgeColor = (): 'yellow' | 'orange' | 'blue' | 'green' | 'red' | 'gray' => {
    return statusConfig.color
  }

  const getAvailableActions = () => {
    const actions: { label: string; icon: React.ElementType; onClick?: () => void; destructive?: boolean }[] = []

    switch (campaign.status) {
      case 'draft':
        if (onEdit) actions.push({ label: 'Edit', icon: RiBarChartBoxLine, onClick: onEdit })
        if (onSubmitForApproval) actions.push({ label: 'Submit for Approval', icon: RiCheckLine, onClick: onSubmitForApproval })
        if (onDelete) actions.push({ label: 'Delete', icon: RiCloseLine, onClick: onDelete, destructive: true })
        break
      case 'pending_approval':
        break
      case 'approved':
        if (onManage) actions.push({ label: 'Activate', icon: RiPlayLine, onClick: onManage })
        if (onCancel) actions.push({ label: 'Cancel', icon: RiCloseLine, onClick: onCancel, destructive: true })
        break
      case 'active':
        if (onPause) actions.push({ label: 'Pause', icon: RiPauseLine, onClick: onPause })
        if (onEnd) actions.push({ label: 'End Campaign', icon: RiStopLine, onClick: onEnd })
        break
      case 'paused':
        if (onResume) actions.push({ label: 'Resume', icon: RiPlayLine, onClick: onResume })
        if (onEnd) actions.push({ label: 'End Campaign', icon: RiStopLine, onClick: onEnd })
        if (onCancel) actions.push({ label: 'Cancel', icon: RiCloseLine, onClick: onCancel, destructive: true })
        break
      case 'ended':
        if (onComplete) actions.push({ label: 'Complete', icon: RiCheckLine, onClick: onComplete })
        if (onArchive) actions.push({ label: 'Archive', icon: RiArchiveLine, onClick: onArchive })
        break
      case 'completed':
        if (onArchive) actions.push({ label: 'Archive', icon: RiArchiveLine, onClick: onArchive })
        break
      case 'archived':
        if (onDuplicate) actions.push({ label: 'Duplicate', icon: RiFileCopyLine, onClick: onDuplicate })
        break
    }

    if (onDuplicate && campaign.status !== 'archived') {
      actions.push({ label: 'Duplicate', icon: RiFileCopyLine, onClick: onDuplicate })
    }

    return actions
  }

  const actions = getAvailableActions()
  const productImage = campaign.product?.image || productImages[campaign.productId] || null
  const showProgress = ['active', 'paused'].includes(campaign.status)
  const showStats = ['active', 'paused', 'ended', 'completed'].includes(campaign.status)

  return (
    <div className="flex flex-col h-full rounded-2xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 overflow-hidden hover:ring-stroke-sub-300">
      {/* Main Content */}
      <div className="flex-1 p-4 min-h-[140px]">
        <div className="flex gap-3">
          {/* Product Thumbnail */}
          <div className="shrink-0">
            {productImage ? (
              <img 
                src={productImage} 
                alt="Product" 
                className="size-14 rounded-xl object-cover bg-bg-weak-50"
              />
            ) : (
              <div className="size-14 rounded-xl bg-bg-weak-50 flex items-center justify-center">
                <RiImage2Line className="size-6 text-text-soft-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-label-md text-text-strong-950 font-semibold truncate leading-tight">
                  {campaign.title}
                </h3>
                <Badge.Root
                  color={getStatusBadgeColor()}
                  variant="lighter"
                  size="small"
                  className="mt-1"
                >
                  {statusConfig.label}
                </Badge.Root>
              </div>
              
              {actions.length > 0 && (
                <Dropdown.Root>
                  <Dropdown.Trigger asChild>
                    <button className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-soft-400 hover:text-text-strong-950 hover:bg-bg-weak-50">
                      <RiMoreLine className="size-5" />
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

            {/* Meta Info */}
            <div className="flex items-center gap-3 mt-2 text-paragraph-xs text-text-sub-600">
              <span className="flex items-center gap-1">
                <RiCalendarLine className="size-3.5 text-text-soft-400" />
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <RiUserLine className="size-3.5 text-text-soft-400" />
                {campaign.currentEnrollments}/{campaign.maxEnrollments}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-paragraph-xs text-text-soft-400">Enrollment Progress</span>
              <span className="text-label-xs text-text-sub-600">{progress}%</span>
            </div>
            <ProgressBar.Root value={progress} size="sm" />
          </div>
        )}
      </div>

      {/* Footer - Always visible with consistent content */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-weak-50 border-t border-stroke-soft-200">
        <div className="text-paragraph-xs">
          {showStats ? (
            <span className="text-text-sub-600">
              <span className="text-warning-base font-medium">{campaign.pendingCount}</span> pending · <span className="text-success-base font-medium">{campaign.approvedCount}</span> approved
            </span>
          ) : campaign.status === 'draft' ? (
            <span className="text-warning-base font-medium">Complete setup to launch</span>
          ) : campaign.status === 'pending_approval' ? (
            <span className="text-information-base font-medium">Under review</span>
          ) : (
            <span className="text-text-soft-400">—</span>
          )}
        </div>
        
        <button 
          onClick={onView} 
          className="flex items-center gap-0.5 text-label-sm text-primary-base hover:text-primary-darker font-medium"
        >
          View
          <RiArrowRightSLine className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Compact version for lists
interface CampaignListItemProps {
  campaign: Campaign
  onView?: () => void
  onAction?: () => void
  actionLabel?: string
}

export function CampaignListItem({
  campaign,
  onView,
  onAction,
  actionLabel = 'Review',
}: CampaignListItemProps) {
  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status]
  const productImage = productImages[campaign.productId] || null

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stroke-soft-200 last:border-0">
      {productImage ? (
        <img 
          src={productImage} 
          alt="Product" 
          className="size-10 rounded-lg object-cover bg-bg-weak-50"
        />
      ) : (
        <div className="size-10 rounded-lg bg-bg-weak-50 flex items-center justify-center">
          <RiImage2Line className="size-4 text-text-soft-400" />
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
          {campaign.currentEnrollments} enrollments · {campaign.pendingCount} pending
        </div>
      </div>
      
      {onAction && (
        <button 
          onClick={onAction}
          className="text-label-sm text-primary-base hover:text-primary-darker font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
