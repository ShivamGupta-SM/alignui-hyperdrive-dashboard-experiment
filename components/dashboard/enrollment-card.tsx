'use client'

import * as React from 'react'
import { cn } from '@/utils/cn'
import * as Avatar from '@/components/ui/avatar'
import * as Badge from '@/components/ui/badge'
import * as Button from '@/components/ui/button'
import * as Checkbox from '@/components/ui/checkbox'
import { RiExternalLinkLine, RiTimeLine, RiVerifiedBadgeLine, RiMoneyDollarCircleLine, RiInformationLine } from '@remixicon/react'
import type { Enrollment, EnrollmentStatus } from '@/lib/types'
import { ENROLLMENT_STATUS_CONFIG } from '@/lib/constants'

// Color palette for avatar initials based on first letter
const getAvatarColor = (name: string): 'blue' | 'purple' | 'sky' | 'yellow' | 'red' => {
  const colors: ('blue' | 'purple' | 'sky' | 'yellow' | 'red')[] = ['blue', 'purple', 'sky', 'yellow', 'red']
  const charCode = (name?.charAt(0) || 'U').toUpperCase().charCodeAt(0)
  return colors[charCode % colors.length]
}

interface EnrollmentCardProps {
  enrollment: Enrollment
  onReview?: () => void
  onView?: () => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
  showCampaign?: boolean
}

export function EnrollmentCard({
  enrollment,
  onReview,
  onView,
  selected,
  onSelect,
  showCampaign = false,
}: EnrollmentCardProps) {
  const statusConfig = ENROLLMENT_STATUS_CONFIG[enrollment.status]
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isReviewable = enrollment.status === 'awaiting_review'
  const shopperName = enrollment.shopper?.name || 'Unknown'

  return (
    <div className={cn(
      'rounded-20 bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 p-4',
      'transition-all duration-200',
      selected && 'ring-2 ring-primary-base',
    )}>
      <div className="flex items-start gap-4">
        {/* Checkbox for bulk actions */}
        {onSelect && (
          <div className="pt-1">
            <Checkbox.Root
              checked={selected}
              onCheckedChange={onSelect}
            />
          </div>
        )}

        {/* Shopper Avatar */}
        {enrollment.shopper?.avatar ? (
          <Avatar.Root size="40">
            <Avatar.Image src={enrollment.shopper.avatar} alt={shopperName} />
          </Avatar.Root>
        ) : (
          <Avatar.Root size="40" color={getAvatarColor(shopperName)}>
            {shopperName.charAt(0).toUpperCase()}
          </Avatar.Root>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-label-md text-text-strong-950">
                {enrollment.shopper?.name || 'Unknown Shopper'}
              </span>
              {enrollment.shopper && enrollment.shopper.approvalRate >= 90 && (
                <RiVerifiedBadgeLine className="size-4 text-success-base" />
              )}
            </div>
            <Badge.Root
              color={statusConfig.color as 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'yellow'}
              variant="light"
              size="small"
            >
              {statusConfig.label}
            </Badge.Root>
          </div>

          {/* Order Info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-paragraph-sm text-text-sub-600">
            <span className="font-mono">{enrollment.orderId}</span>
            <span className="text-stroke-soft-200">•</span>
            <span>{formatCurrency(enrollment.orderValue)}</span>
            <span className="text-stroke-soft-200">•</span>
            <span>{enrollment.platform}</span>
          </div>

          {/* Campaign Name (optional) */}
          {showCampaign && enrollment.campaign && (
            <div className="text-paragraph-xs text-text-soft-400 mt-1">
              {enrollment.campaign.title}
            </div>
          )}

          {/* OCR Verification Status */}
          {enrollment.ocrData && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-paragraph-xs',
              enrollment.ocrData.isVerified ? 'text-success-base' : 'text-warning-base'
            )}>
              {enrollment.ocrData.isVerified ? (
                <>
                  <RiVerifiedBadgeLine className="size-3.5" />
                  <span>OCR Verified ({enrollment.ocrData.confidence}% confidence)</span>
                </>
              ) : (
                <>
                  <RiTimeLine className="size-3.5" />
                  <span>Pending verification</span>
                </>
              )}
            </div>
          )}

          {/* Shopper Stats */}
          {enrollment.shopper && (
            <div className="text-paragraph-xs text-text-soft-400 mt-2">
              Previous: {enrollment.shopper.previousEnrollments} • 
              Approval rate: {enrollment.shopper.approvalRate}%
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isReviewable && onReview && (
            <Button.Root variant="primary" size="small" onClick={onReview}>
              Review
            </Button.Root>
          )}
          {!isReviewable && onView && (
            <Button.Root variant="basic" size="small" onClick={onView}>
              View
            </Button.Root>
          )}
        </div>
      </div>

      {/* Billing Preview (for review) */}
      {isReviewable && (
        <div className="mt-4 pt-4 border-t border-stroke-soft-200">
          <div className="flex items-center justify-between text-paragraph-sm">
            <span className="text-text-sub-600">Your cost for this enrollment:</span>
            <span className="text-label-sm text-text-strong-950">
              {formatCurrency(enrollment.totalCost)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Table row version
interface EnrollmentTableRowProps {
  enrollment: Enrollment
  onReview?: () => void
  onView?: () => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function EnrollmentTableRow({
  enrollment,
  onReview,
  onView,
  selected,
  onSelect,
}: EnrollmentTableRowProps) {
  const statusConfig = ENROLLMENT_STATUS_CONFIG[enrollment.status]
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const isReviewable = enrollment.status === 'awaiting_review'

  return (
    <tr className={cn(
      'border-b border-stroke-soft-200 last:border-0',
      selected && 'bg-primary-alpha-10',
    )}>
      {onSelect && (
        <td className="py-3 px-4">
          <Checkbox.Root
            checked={selected}
            onCheckedChange={onSelect}
          />
        </td>
      )}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {enrollment.shopper?.avatar ? (
            <Avatar.Root size="32">
              <Avatar.Image src={enrollment.shopper.avatar} alt={enrollment.shopper?.name || 'Unknown'} />
            </Avatar.Root>
          ) : (
            <Avatar.Root size="32" color={getAvatarColor(enrollment.shopper?.name || 'U')}>
              {(enrollment.shopper?.name || 'U').charAt(0).toUpperCase()}
            </Avatar.Root>
          )}
          <span className="text-label-sm text-text-strong-950">
            {enrollment.shopper?.name || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-paragraph-sm text-text-sub-600">
          {enrollment.orderId}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-paragraph-sm text-text-strong-950">
          {formatCurrency(enrollment.orderValue)}
        </span>
      </td>
      <td className="py-3 px-4">
        <Badge.Root color={statusConfig.color as 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'yellow'} variant="light" size="small">
          {statusConfig.label}
        </Badge.Root>
      </td>
      <td className="py-3 px-4">
        {isReviewable && onReview ? (
          <Button.Root variant="primary" size="xsmall" onClick={onReview}>
            Review
          </Button.Root>
        ) : onView ? (
          <Button.Root variant="basic" size="xsmall" onClick={onView}>
            View
          </Button.Root>
        ) : null}
      </td>
    </tr>
  )
}

// Billing breakdown component
interface BillingBreakdownProps {
  orderValue: number
  billRate: number
  platformFee: number
  gstRate?: number
  className?: string
}

export function BillingBreakdown({
  orderValue,
  billRate,
  platformFee,
  gstRate = 18,
  className,
}: BillingBreakdownProps) {
  const billAmount = orderValue * (billRate / 100)
  const gstAmount = billAmount * (gstRate / 100)
  const total = billAmount + gstAmount + platformFee

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className={cn('rounded-20 bg-bg-weak-50 p-4', className)}>
      <h4 className="flex items-center gap-2 text-label-sm text-text-strong-950 mb-3">
        <RiMoneyDollarCircleLine className="size-4 text-primary-base" />
        Your Billing for this Enrollment
      </h4>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-paragraph-xs text-text-sub-600">Order Value</div>
          <div className="text-label-lg text-text-strong-950">{formatCurrency(orderValue)}</div>
        </div>
        <div className="text-right">
          <div className="text-paragraph-xs text-text-sub-600">Your Total Cost</div>
          <div className="text-label-lg text-primary-base">{formatCurrency(total)}</div>
        </div>
      </div>

      <div className="space-y-2 text-paragraph-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Bill Rate @ {billRate}%</span>
          <span className="text-text-strong-950">{formatCurrency(billAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">GST @ {gstRate}%</span>
          <span className="text-text-strong-950">{formatCurrency(gstAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-sub-600">Platform Fee</span>
          <span className="text-text-strong-950">{formatCurrency(platformFee)}</span>
        </div>
        <div className="border-t border-stroke-soft-200 pt-2 mt-2">
          <div className="flex items-center justify-between font-medium">
            <span className="text-text-strong-950">Total</span>
            <span className="text-primary-base">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-paragraph-xs text-text-soft-400">
        <RiInformationLine className="size-3.5" />
        Shopper payouts are determined and managed by Hypedrive platform.
      </div>
    </div>
  )
}

