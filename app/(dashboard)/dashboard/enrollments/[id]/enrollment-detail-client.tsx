'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Avatar from '@/components/ui/avatar'
import * as Modal from '@/components/ui/modal'
import * as Textarea from '@/components/ui/textarea'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  ArrowLeft,
  Check,
  X,
  PencilSimple,
  CalendarBlank,
  Warning,
  ClockCounterClockwise,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/utils/cn'
import { ENROLLMENT_STATUS_CONFIG, REJECTION_REASONS } from '@/lib/constants'
import {
  useEnrollment,
  useApproveEnrollment,
  useRejectEnrollment,
  useRequestEnrollmentChanges,
  type Enrollment,
} from '@/hooks/use-enrollments'
import type { EnrollmentStatus } from '@/lib/types'

// Helper to calculate costs from Encore enrollment
function calculateCosts(enrollment: Enrollment) {
  const billAmount = enrollment.orderValue * (enrollment.lockedBillRate / 100)
  const gstAmount = billAmount * 0.18 // 18% GST
  const platformFee = enrollment.orderValue * (enrollment.lockedPlatformFee / 100)
  const totalCost = billAmount + gstAmount + platformFee
  return { billAmount, gstAmount, platformFee, totalCost }
}

const getStatusBadgeStatus = (status: EnrollmentStatus) => {
  switch (status) {
    case 'approved': return 'completed' as const
    case 'awaiting_review':
    case 'awaiting_submission':
    case 'changes_requested': return 'pending' as const
    case 'rejected':
    case 'withdrawn':
    case 'expired': return 'failed' as const
    default: return 'disabled' as const
  }
}

interface EnrollmentDetailClientProps {
  enrollmentId: string
}

export function EnrollmentDetailClient({ enrollmentId }: EnrollmentDetailClientProps) {
  const router = useRouter()

  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false)
  const [isChangesModalOpen, setIsChangesModalOpen] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [changesComment, setChangesComment] = React.useState('')

  // Fetch enrollment data from API (hydrated from SSR)
  const { data: enrollment, isLoading: isLoadingEnrollment, error } = useEnrollment(enrollmentId)

  // Action mutations
  const approveEnrollment = useApproveEnrollment(enrollmentId)
  const rejectEnrollment = useRejectEnrollment(enrollmentId)
  const requestChanges = useRequestEnrollmentChanges(enrollmentId)

  const statusConfig = enrollment ? ENROLLMENT_STATUS_CONFIG[enrollment.status] : null

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  const isLoading = approveEnrollment.isPending || rejectEnrollment.isPending || requestChanges.isPending

  const handleApprove = async () => {
    approveEnrollment.mutate(undefined, {
      onSuccess: () => {
        toast.success('Enrollment approved successfully')
        setIsApproveModalOpen(false)
        router.push('/dashboard/enrollments')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to approve enrollment')
      },
    })
  }

  const handleReject = async () => {
    if (!rejectionReason) return

    rejectEnrollment.mutate(
      { reasons: [rejectionReason], notes: '' },
      {
        onSuccess: () => {
          toast.success('Enrollment rejected')
          setIsRejectModalOpen(false)
          router.push('/dashboard/enrollments')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to reject enrollment')
        },
      }
    )
  }

  const handleRequestChanges = async () => {
    if (!changesComment.trim()) return

    requestChanges.mutate(
      { requestedChanges: [changesComment.trim()] },
      {
        onSuccess: () => {
          toast.success('Changes requested from shopper')
          setIsChangesModalOpen(false)
          router.push('/dashboard/enrollments')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to request changes')
        },
      }
    )
  }

  // Loading state
  if (isLoadingEnrollment) {
    return (
      <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-error-lighter border border-error-base/20 p-4 sm:p-5 text-center">
          <Warning className="size-8 text-error-base mx-auto mb-2" />
          <p className="text-label-md text-error-base mb-1">Failed to load enrollment</p>
          <p className="text-paragraph-sm text-text-sub-600">{error.message}</p>
          <Button.Root variant="basic" className="mt-4" onClick={() => router.back()}>
            <Button.Icon as={ArrowLeft} />
            Go Back
          </Button.Root>
        </div>
      </div>
    )
  }

  // No enrollment data
  if (!enrollment || !statusConfig) {
    return (
      <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-warning-lighter border border-warning-base/20 p-4 sm:p-5 text-center">
          <Warning className="size-8 text-warning-base mx-auto mb-2" />
          <p className="text-label-md text-warning-base mb-1">Enrollment not found</p>
          <p className="text-paragraph-sm text-text-sub-600">The requested enrollment could not be found.</p>
          <Button.Root variant="basic" className="mt-4" onClick={() => router.back()}>
            <Button.Icon as={ArrowLeft} />
            Go Back
          </Button.Root>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto pb-24 sm:pb-0">
      {/* Header Card */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Top row: Back + Actions + Status */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
          >
            <ArrowLeft weight="bold" className="size-4" />
            <span className="text-label-sm">Back</span>
          </button>

          <StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
            <StatusBadge.Dot />
            {statusConfig.label}
          </StatusBadge.Root>
        </div>

        {/* Enrollment Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar.Root size="48" color={getAvatarColor(enrollment.shopperId || 'U')}>
            {(enrollment.shopperId || 'U').charAt(0).toUpperCase()}
          </Avatar.Root>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-label-md sm:text-title-h5 text-text-strong-950 truncate">
                Shopper #{enrollment.shopperId.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 truncate">
                Order #{enrollment.orderId}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-title-h5 text-text-strong-950 font-semibold block">{formatCurrency(enrollment.orderValue)}</span>
            <span className="text-paragraph-xs text-text-sub-600">Order Value</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {(() => {
        const costs = calculateCosts(enrollment)
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Order Value" value={formatCurrency(enrollment.orderValue)} />
            <StatCard label="Your Cost" value={formatCurrency(costs.totalCost)} highlight />
            <StatCard
              label="Rebate"
              value={`${enrollment.lockedRebatePercentage}%`}
            />
            <StatCard
              label="Rejections"
              value={`${enrollment.rejectionCount}`}
              valueColor={enrollment.rejectionCount > 0 ? 'text-amber-600' : 'text-green-600'}
            />
          </div>
        )
      })()}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Order Details */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CalendarBlank weight="duotone" className="size-4 text-gray-500" />
            Order Details
          </h2>
          <div className="space-y-2">
            <DetailRow label="Order ID" value={enrollment.orderId} mono />
            <DetailRow label="Purchase Date" value={enrollment.purchaseDate ? formatDate(new Date(enrollment.purchaseDate)) : '-'} />
            <DetailRow label="Enrolled" value={formatDate(new Date(enrollment.createdAt))} />
            <DetailRow label="Expires" value={enrollment.expiresAt ? formatDate(new Date(enrollment.expiresAt)) : '-'} />
            <DetailRow label="Can Resubmit" value={enrollment.canResubmit ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* Rate Details */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <ShieldCheck weight="duotone" className="size-4 text-gray-500" />
            Rate Details
          </h2>
          <div className="space-y-2">
            <DetailRow label="Rebate Percentage" value={`${enrollment.lockedRebatePercentage}%`} />
            <DetailRow label="Bill Rate" value={`${enrollment.lockedBillRate}%`} />
            <DetailRow label="Platform Fee" value={`${enrollment.lockedPlatformFee}%`} />
            {enrollment.lockedBonusAmount && (
              <DetailRow label="Bonus Amount" value={formatCurrency(enrollment.lockedBonusAmount)} />
            )}
            <DetailRow label="Status" value={enrollment.status} />
          </div>
        </div>
      </div>

      {/* Billing Breakdown */}
      {(() => {
        const costs = calculateCosts(enrollment)
        return (
          <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Billing Breakdown</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <DetailRow label={`Bill Rate (${enrollment.lockedBillRate}%)`} value={formatCurrency(costs.billAmount)} />
                <DetailRow label="GST (18%)" value={formatCurrency(costs.gstAmount)} />
                <DetailRow label={`Platform Fee (${enrollment.lockedPlatformFee}%)`} value={formatCurrency(costs.platformFee)} />
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex flex-col items-center justify-center">
                <span className="text-sm text-blue-700 mb-1">Total Cost to You</span>
                <span className="text-2xl text-blue-600 font-bold">{formatCurrency(costs.totalCost)}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Status Info */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ClockCounterClockwise weight="duotone" className="size-4 text-gray-500" />
          Status Timeline
        </h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="size-2 rounded-full bg-blue-500" />
              <div className="w-px flex-1 bg-gray-200" />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">Created</span>
                <span className="text-xs text-gray-400">{formatDate(new Date(enrollment.createdAt))}</span>
              </div>
              <p className="text-xs text-gray-500">Enrollment created</p>
            </div>
          </div>
          {enrollment.submittedAt && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-2 rounded-full bg-green-500" />
                <div className="w-px flex-1 bg-gray-200" />
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">Submitted</span>
                  <span className="text-xs text-gray-400">{formatDate(new Date(enrollment.submittedAt))}</span>
                </div>
                <p className="text-xs text-gray-500">Deliverables submitted for review</p>
              </div>
            </div>
          )}
          {enrollment.approvedAt && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="size-2 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">Approved</span>
                  <span className="text-xs text-gray-400">{formatDate(new Date(enrollment.approvedAt))}</span>
                </div>
                <p className="text-xs text-gray-500">Enrollment approved for payout</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {enrollment.status === 'awaiting_review' && (
        <>
          {/* Desktop: Card with centered buttons */}
          <div className="hidden sm:block rounded-2xl bg-gradient-to-r from-primary-lighter to-bg-white-0 ring-1 ring-inset ring-primary-light p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-label-md text-text-strong-950 mb-1">Ready to Review</h3>
                <p className="text-paragraph-sm text-text-sub-600">
                  Approve to pay <strong className="text-primary-base">{formatCurrency(calculateCosts(enrollment).totalCost)}</strong> to the shopper
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button.Root
                  variant="basic"
                  size="small"
                  onClick={() => setIsChangesModalOpen(true)}
                >
                  <Button.Icon as={PencilSimple} />
                  Request Changes
                </Button.Root>
                <Button.Root
                  variant="error"
                  size="small"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  <Button.Icon as={X} />
                  Reject
                </Button.Root>
                <Button.Root
                  variant="primary"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  <Button.Icon as={Check} />
                  Approve & Pay
                </Button.Root>
              </div>
            </div>
          </div>

          {/* Mobile: Fixed bottom bar */}
          <div className="sm:hidden fixed bottom-0 inset-x-0 p-3 pb-safe bg-bg-white-0 border-t border-stroke-soft-200 z-20">
            <div className="flex items-center gap-2">
              <Button.Root
                variant="basic"
                size="small"
                className="flex-1"
                onClick={() => setIsChangesModalOpen(true)}
              >
                <Button.Icon as={PencilSimple} />
                Changes
              </Button.Root>
              <Button.Root
                variant="error"
                size="small"
                className="flex-1"
                onClick={() => setIsRejectModalOpen(true)}
              >
                <Button.Icon as={X} />
                Reject
              </Button.Root>
              <Button.Root
                variant="primary"
                className="flex-[1.5]"
                onClick={() => setIsApproveModalOpen(true)}
              >
                <Button.Icon as={Check} />
                Approve
              </Button.Root>
            </div>
          </div>

          {/* Bottom padding for fixed buttons on mobile */}
          <div className="h-24 sm:hidden" />
        </>
      )}

      {/* Approve Modal */}
      <Modal.Root open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Approve Enrollment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(() => {
              const costs = calculateCosts(enrollment)
              return (
                <div className="text-center mb-4">
                  <div className="size-14 rounded-full bg-success-lighter flex items-center justify-center mx-auto mb-3">
                    <Check className="size-7 text-success-base" />
                  </div>
                  <p className="text-paragraph-sm text-text-sub-600 mb-4">
                    Approve this enrollment and pay <strong className="text-text-strong-950">{formatCurrency(costs.totalCost)}</strong> to the shopper?
                  </p>
                  <div className="text-left rounded-xl bg-bg-weak-50 p-3 space-y-1 text-paragraph-xs">
                    <div className="flex justify-between">
                      <span className="text-text-sub-600">Bill Amount</span>
                      <span className="text-text-strong-950">{formatCurrency(costs.billAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-sub-600">GST</span>
                      <span className="text-text-strong-950">{formatCurrency(costs.gstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-sub-600">Platform Fee</span>
                      <span className="text-text-strong-950">{formatCurrency(costs.platformFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-stroke-soft-200 font-semibold">
                      <span className="text-text-strong-950">Total</span>
                      <span className="text-primary-base">{formatCurrency(costs.totalCost)}</span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </Modal.Body>
          <Modal.Footer>
            <Button.Root variant="basic" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button.Root>
            <Button.Root variant="primary" onClick={handleApprove} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Approve & Pay'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Reject Modal */}
      <Modal.Root open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Reject Enrollment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-lighter mb-4">
              <Warning className="size-4 text-warning-base shrink-0 mt-0.5" />
              <span className="text-paragraph-sm text-warning-dark">
                This action cannot be undone. The shopper will be notified.
              </span>
            </div>
            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">Reason for rejection</label>
              <select
                className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason.id} value={reason.id}>{reason.label}</option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root variant="basic" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button.Root>
            <Button.Root variant="error" onClick={handleReject} disabled={isLoading || !rejectionReason}>
              {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Request Changes Modal */}
      <Modal.Root open={isChangesModalOpen} onOpenChange={setIsChangesModalOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Request Changes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-paragraph-sm text-text-sub-600 mb-4">
              Describe what changes the shopper needs to make. They will be notified and can resubmit.
            </p>
            <div>
              <label className="block text-label-sm text-text-strong-950 mb-2">Required changes</label>
              <Textarea.Root
                placeholder="e.g., Please provide a clearer screenshot showing the order total..."
                value={changesComment}
                onChange={(e) => setChangesComment(e.target.value)}
                rows={4}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root variant="basic" onClick={() => setIsChangesModalOpen(false)}>
              Cancel
            </Button.Root>
            <Button.Root variant="primary" onClick={handleRequestChanges} disabled={isLoading || !changesComment.trim()}>
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  highlight = false,
  valueColor = 'text-text-strong-950'
}: {
  label: string
  value: string
  highlight?: boolean
  valueColor?: string
}) {
  return (
    <div className={cn(
      "rounded-xl p-3 text-center border",
      highlight
        ? "bg-blue-50 border-blue-200"
        : "bg-white border-gray-200"
    )}>
      <span className={cn(
        "text-xs block mb-0.5",
        highlight ? "text-blue-600" : "text-gray-500"
      )}>{label}</span>
      <span className={cn(
        "text-base sm:text-lg font-semibold",
        highlight ? "text-blue-600" : valueColor
      )}>{value}</span>
    </div>
  )
}

// Helper component for detail rows
function DetailRow({
  label,
  value,
  mono = false,
  valueColor = 'text-gray-900'
}: {
  label: string
  value: string
  mono?: boolean
  valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={cn(
        "text-sm font-medium",
        valueColor,
        mono && "font-mono"
      )}>
        {value}
      </span>
    </div>
  )
}
