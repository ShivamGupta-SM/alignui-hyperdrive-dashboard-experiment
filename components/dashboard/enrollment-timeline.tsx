'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import { useEnrollmentTransitions, type EnrollmentTransitionHistoryItem } from '@/hooks/use-enrollments'
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Robot,
  Warning,
  Spinner,
} from '@phosphor-icons/react'

interface EnrollmentTimelineProps {
  enrollmentId: string
  className?: string
}

// Status to icon/color mapping
const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  enrolled: { icon: CheckCircle, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  awaiting_submission: { icon: Clock, color: 'text-warning-base', bgColor: 'bg-warning-lighter' },
  awaiting_review: { icon: Clock, color: 'text-information-base', bgColor: 'bg-information-lighter' },
  changes_requested: { icon: Warning, color: 'text-warning-base', bgColor: 'bg-warning-lighter' },
  approved: { icon: CheckCircle, color: 'text-success-base', bgColor: 'bg-success-lighter' },
  rejected: { icon: XCircle, color: 'text-error-base', bgColor: 'bg-error-lighter' },
  withdrawn: { icon: XCircle, color: 'text-text-soft-400', bgColor: 'bg-bg-weak-50' },
  expired: { icon: Clock, color: 'text-text-soft-400', bgColor: 'bg-bg-weak-50' },
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    enrolled: 'Enrolled',
    awaiting_submission: 'Awaiting Submission',
    awaiting_review: 'Awaiting Review',
    changes_requested: 'Changes Requested',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    expired: 'Expired',
  }
  return labels[status] || status
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function TimelineItem({ item, isLast }: { item: EnrollmentTransitionHistoryItem; isLast: boolean }) {
  const config = statusConfig[item.toStatus] || { icon: ArrowRight, color: 'text-text-sub-600', bgColor: 'bg-bg-weak-50' }
  const Icon = config.icon
  const isSystem = item.triggeredBy === 'system'

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-px bg-stroke-soft-200" />
      )}

      {/* Icon */}
      <div className={cn(
        'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
        config.bgColor
      )}>
        <Icon weight="fill" className={cn('size-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label-sm text-text-strong-950">
              {getStatusLabel(item.toStatus)}
            </p>
            {item.reason && (
              <p className="text-paragraph-xs text-text-sub-600 mt-0.5">
                {item.reason}
              </p>
            )}
          </div>
          <span className="text-paragraph-xs text-text-soft-400 whitespace-nowrap">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Actor */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {isSystem ? (
            <Robot weight="fill" className="size-3.5 text-text-soft-400" />
          ) : (
            <User weight="fill" className="size-3.5 text-text-soft-400" />
          )}
          <span className="text-paragraph-xs text-text-soft-400">
            {item.triggeredByName}
          </span>
        </div>
      </div>
    </div>
  )
}

export function EnrollmentTimeline({ enrollmentId, className }: EnrollmentTimelineProps) {
  const { data, isLoading, error } = useEnrollmentTransitions(enrollmentId)

  if (isLoading) {
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
          Failed to load timeline
        </p>
      </div>
    )
  }

  if (!data?.history?.length) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-paragraph-sm text-text-soft-400">
          No history available
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      <h3 className="text-label-md text-text-strong-950 mb-4">Status History</h3>
      <div>
        {data.history.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            isLast={index === data.history.length - 1}
          />
        ))}
      </div>

      {/* Allowed transitions info */}
      {data.allowedTransitions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stroke-soft-200">
          <p className="text-paragraph-xs text-text-soft-400">
            Available actions: {data.allowedTransitions.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
