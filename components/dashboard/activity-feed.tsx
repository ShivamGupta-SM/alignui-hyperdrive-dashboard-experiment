'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import { useOrganizationActivity, type OrganizationActivity, type OrganizationActivityType } from '@/hooks/use-settings'
import * as Avatar from '@/components/ui/avatar'
import * as Button from '@/components/ui/button'
import {
  Megaphone,
  CheckCircle,
  XCircle,
  Money,
  UserPlus,
  UserMinus,
  Receipt,
  Package,
  Gear,
  Play,
  Pause,
  Flag,
  Spinner,
  CaretDown,
} from '@phosphor-icons/react'

interface ActivityFeedProps {
  organizationId: string
  className?: string
  limit?: number
  showLoadMore?: boolean
}

// Activity type to icon/color mapping
const activityConfig: Record<OrganizationActivityType, { icon: React.ElementType; color: string; bgColor: string }> = {
  campaign_created: { icon: Megaphone, color: 'text-primary-base', bgColor: 'bg-primary-alpha-10' },
  campaign_activated: { icon: Play, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  campaign_paused: { icon: Pause, color: 'text-warning-base', bgColor: 'bg-warning-lighter' },
  campaign_completed: { icon: Flag, color: 'text-information-base', bgColor: 'bg-information-lighter' },
  enrollment_approved: { icon: CheckCircle, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  enrollment_rejected: { icon: XCircle, color: 'text-error-base', bgColor: 'bg-error-lighter' },
  enrollment_bulk_approved: { icon: CheckCircle, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  withdrawal_requested: { icon: Money, color: 'text-warning-base', bgColor: 'bg-warning-lighter' },
  withdrawal_completed: { icon: Money, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  member_invited: { icon: UserPlus, color: 'text-information-base', bgColor: 'bg-information-lighter' },
  member_joined: { icon: UserPlus, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  member_removed: { icon: UserMinus, color: 'text-error-base', bgColor: 'bg-error-lighter' },
  invoice_generated: { icon: Receipt, color: 'text-information-base', bgColor: 'bg-information-lighter' },
  product_created: { icon: Package, color: 'text-primary-base', bgColor: 'bg-primary-alpha-10' },
  settings_updated: { icon: Gear, color: 'text-text-sub-600', bgColor: 'bg-bg-weak-50' },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function ActivityItem({ activity }: { activity: OrganizationActivity }) {
  const config = activityConfig[activity.type] || { icon: Gear, color: 'text-text-sub-600', bgColor: 'bg-bg-weak-50' }
  const Icon = config.icon

  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      {/* Icon or Avatar */}
      {activity.actorAvatar ? (
        <Avatar.Root size="32">
          <Avatar.Image src={activity.actorAvatar} alt={activity.actorName} />
          <Avatar.Indicator position="bottom">
            <div className={cn('size-4 rounded-full flex items-center justify-center', config.bgColor)}>
              <Icon weight="fill" className={cn('size-2.5', config.color)} />
            </div>
          </Avatar.Indicator>
        </Avatar.Root>
      ) : (
        <div className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          config.bgColor
        )}>
          <Icon weight="fill" className={cn('size-4', config.color)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-paragraph-sm text-text-strong-950 line-clamp-2">
          <span className="font-medium">{activity.actorName}</span>
          {' '}
          <span className="text-text-sub-600">{activity.description}</span>
        </p>
        <p className="text-paragraph-xs text-text-soft-400 mt-0.5">
          {formatTimeAgo(activity.createdAt)}
        </p>
      </div>
    </div>
  )
}

export function ActivityFeed({
  organizationId,
  className,
  limit = 10,
  showLoadMore = true,
}: ActivityFeedProps) {
  const [page, setPage] = React.useState(0)
  const { data, isLoading, error } = useOrganizationActivity(organizationId, page * limit, limit)

  if (isLoading && page === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Spinner className="size-6 text-primary-base animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-paragraph-sm text-text-soft-400">
          Failed to load activity
        </p>
      </div>
    )
  }

  if (!data?.data?.length) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-paragraph-sm text-text-soft-400">
          No activity yet
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="divide-y divide-stroke-soft-200">
        {data.data.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {showLoadMore && data.hasMore && (
        <div className="mt-4 pt-4 border-t border-stroke-soft-200">
          <Button.Root
            variant="basic"
            size="small"
            className="w-full"
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="size-4 animate-spin" />
            ) : (
              <>
                <Button.Icon as={CaretDown} />
                Load More
              </>
            )}
          </Button.Root>
        </div>
      )}
    </div>
  )
}

// Compact version for dashboard widgets
export function ActivityFeedCompact({
  organizationId,
  className,
  limit = 5,
}: Omit<ActivityFeedProps, 'showLoadMore'>) {
  const { data, isLoading } = useOrganizationActivity(organizationId, 0, limit)

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="size-8 rounded-full bg-bg-weak-50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-weak-50 rounded w-3/4" />
              <div className="h-3 bg-bg-weak-50 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data?.data?.length) {
    return (
      <p className={cn('text-paragraph-sm text-text-soft-400 text-center py-4', className)}>
        No recent activity
      </p>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {data.data.map((activity) => {
        const config = activityConfig[activity.type] || { icon: Gear, color: 'text-text-sub-600', bgColor: 'bg-bg-weak-50' }
        const Icon = config.icon

        return (
          <div key={activity.id} className="flex gap-2.5">
            <div className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full',
              config.bgColor
            )}>
              <Icon weight="fill" className={cn('size-3', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-paragraph-xs text-text-sub-600 line-clamp-1">
                {activity.description}
              </p>
              <p className="text-paragraph-xs text-text-soft-400">
                {formatTimeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
