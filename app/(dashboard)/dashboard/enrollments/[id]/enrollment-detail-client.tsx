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
  useApproveEnrollment,
  useRejectEnrollment,
  useRequestEnrollmentChanges,
  type Enrollment,
} from '@/hooks/use-enrollments'
import { updateEnrollmentStatus, requestEnrollmentChanges } from '@/app/actions/enrollments'
import type { EnrollmentStatus } from '@/lib/types'
import { EnrollmentTimeline } from '@/components/dashboard/enrollment-timeline'
import type { enrollments, campaigns, integrations } from '@/lib/encore-client'

// Helper to calculate costs from Encore enrollment
function calculateCosts(enrollment: Enrollment | enrollments.EnrollmentDetail) {
  const billAmount = enrollment.orderValue * ((enrollment as any).lockedBillRate / 100)
  const gstAmount = billAmount * 0.18 // 18% GST
  const platformFee = enrollment.orderValue * ((enrollment as any).lockedPlatformFee / 100)
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
  initialData?: (enrollments.EnrollmentDetail & {
    platforms?: integrations.Platform[]
    campaignDeliverables?: campaigns.CampaignDeliverableResponse[]
  }) | unknown
}

export function EnrollmentDetailClient({ enrollmentId, initialData }: EnrollmentDetailClientProps) {
  const router = useRouter()

  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false)
  const [isChangesModalOpen, setIsChangesModalOpen] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [changesComment, setChangesComment] = React.useState('')

  // Fetch enrollment data from API (hydrated from SSR)
  // React Query hook removed - using server data via initialData
  // const { data: enrollment, isLoading: isLoadingEnrollment, error } = useEnrollment(enrollmentId)
  
  const enrollmentDetail = initialData as enrollments.EnrollmentDetail | undefined
  // Use enrollmentDetail directly - it has all the fields we need
  const enrollment = enrollmentDetail as unknown as Enrollment & enrollments.EnrollmentDetail
  const isLoadingEnrollment = !enrollmentDetail
  const error = null

  // Action handlers
  const statusConfig = enrollmentDetail ? ENROLLMENT_STATUS_CONFIG[enrollmentDetail.status] : null
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  const isLoading = false // pure server actions don't track loading state this way automatically, could use useTransition

  const handleApprove = async () => {
    try {
      const result = await updateEnrollmentStatus(enrollmentId, 'approved')
      if (result.success) {
        toast.success('Enrollment approved successfully')
        setIsApproveModalOpen(false)
        router.push('/dashboard/enrollments')
      } else {
        toast.error(result.error || 'Failed to approve enrollment')
      }
    } catch (error) {
       toast.error('An unexpected error occurred')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) return

    try {
      const result = await updateEnrollmentStatus(enrollmentId, 'rejected', rejectionReason)
      if (result.success) {
        toast.success('Enrollment rejected')
        setIsRejectModalOpen(false)
        router.push('/dashboard/enrollments')
      } else {
        toast.error(result.error || 'Failed to reject enrollment')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleRequestChanges = async () => {
    if (!changesComment.trim()) return

    try {
      const result = await requestEnrollmentChanges(enrollmentId, changesComment.trim())
      if (result.success) {
        toast.success('Changes requested from shopper')
        setIsChangesModalOpen(false)
        router.push('/dashboard/enrollments')
      } else {
        toast.error(result.error || 'Failed to request changes')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  // Loading state
  if (isLoadingEnrollment) {
    return (
      <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
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
      <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-error-lighter border border-error-base/20 p-4 sm:p-5 text-center">
          <Warning className="size-8 text-error-base mx-auto mb-2" />
          <p className="text-label-md text-error-base mb-1">Failed to load enrollment</p>
          <p className="text-paragraph-sm text-text-sub-600">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
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
      <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
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
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-0">
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

          <StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="lighter">
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

      {/* Required Deliverables - Categorized by Platform */}
      {enrollmentDetail?.submissions && enrollmentDetail.submissions.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <ListChecks weight="duotone" className="size-5 text-primary-base" />
            Required Deliverables
          </h2>
          {(() => {
            const platforms = (enrollmentDetail as any).platforms || []
            const campaignDeliverables = (enrollmentDetail as any).campaignDeliverables || []
            
            // Create platform map for quick lookup
            const platformMap = new Map(platforms.map((p: integrations.Platform) => [p.id, p.name]))
            
            // Create deliverable map to get platformId from campaignDeliverableId
            const deliverablePlatformMap = new Map(
              campaignDeliverables.map((cd: campaigns.CampaignDeliverableResponse) => [
                cd.id,
                cd.deliverable?.platformId || 'general'
              ])
            )
            
            // Group submissions by platform
            const groupedByPlatform = enrollmentDetail.submissions.reduce((acc, submission) => {
              const platformId = deliverablePlatformMap.get(submission.campaignDeliverableId) || 'general'
              const platformName = platformId === 'general' 
                ? 'General' 
                : (platformMap.get(platformId) || 'Unknown Platform')
              
              if (!acc[platformName]) {
                acc[platformName] = []
              }
              acc[platformName].push(submission)
              return acc
            }, {} as Record<string, typeof enrollmentDetail.submissions>)
            
            // Sort platforms: General last, others alphabetically
            const sortedPlatforms = Object.keys(groupedByPlatform).sort((a, b) => {
              if (a === 'General') return 1
              if (b === 'General') return -1
              return a.localeCompare(b)
            })
            
            return (
              <div className="space-y-4">
                {sortedPlatforms.map((platformName) => {
                  const platformSubmissions = groupedByPlatform[platformName]
                  return (
                    <div key={platformName} className="space-y-3">
                      <h4 className="text-label-sm text-text-sub-600 font-medium flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary-base" />
                        {platformName}
                      </h4>
                      <div className="space-y-2 pl-4 border-l-2 border-stroke-soft-200">
                        {platformSubmissions.map((submission, index) => {
                          const DeliverableIcon = getDeliverableIcon(submission.deliverableName)
                          const isSubmitted = !!submission.submittedAt
                          const hasLink = !!submission.proofLink
                          const hasScreenshot = !!submission.proofScreenshot
                          
                          return (
                            <div
                              key={submission.id}
                              className={cn(
                                "flex items-start gap-3 p-3 sm:p-4 rounded-xl border",
                                isSubmitted
                                  ? "bg-success-lighter/30 border-success-base/20"
                                  : "bg-bg-weak-50 border-stroke-soft-200"
                              )}
                            >
                              <div className={cn(
                                "size-10 sm:size-12 rounded-xl flex items-center justify-center shrink-0",
                                isSubmitted
                                  ? "bg-success-lighter"
                                  : "bg-primary-alpha-10"
                              )}>
                                <DeliverableIcon 
                                  weight="duotone" 
                                  className={cn(
                                    "size-5 sm:size-6",
                                    isSubmitted ? "text-success-base" : "text-primary-base"
                                  )} 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-label-sm sm:text-label-md text-text-strong-950">
                                    {index + 1}. {submission.deliverableName}
                                  </span>
                                  {submission.isRequired ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-lighter text-error-base text-[10px] sm:text-xs font-medium">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-soft-200 text-text-sub-600 text-[10px] sm:text-xs font-medium">
                                      Optional
                                    </span>
                                  )}
                                  {isSubmitted && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-lighter text-success-base text-[10px] sm:text-xs font-medium">
                                      <Check weight="bold" className="size-3" />
                                      Submitted
                                    </span>
                                  )}
                                </div>
                                {submission.deliverableDescription && (
                                  <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 mb-1">
                                    {submission.deliverableDescription}
                                  </p>
                                )}
                                {submission.instructions && (
                                  <p className="text-paragraph-xs text-text-soft-400 flex items-start gap-1 mb-2">
                                    <Info weight="fill" className="size-3.5 shrink-0 mt-0.5" />
                                    {submission.instructions}
                                  </p>
                                )}
                                {isSubmitted && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {hasLink && submission.proofLink && (
                                      <a
                                        href={submission.proofLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-alpha-10 text-primary-base text-paragraph-xs hover:bg-primary-alpha-20 transition-colors"
                                      >
                                        <LinkIcon weight="duotone" className="size-3.5" />
                                        View Link
                                      </a>
                                    )}
                                    {hasScreenshot && submission.proofScreenshot && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Open screenshot in modal or new tab
                                          window.open(submission.proofScreenshot, '_blank')
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-alpha-10 text-primary-base text-paragraph-xs hover:bg-primary-alpha-20 transition-colors"
                                      >
                                        <ImageIcon weight="duotone" className="size-3.5" />
                                        View Screenshot
                                      </button>
                                    )}
                                    {submission.submittedAt && (
                                      <span className="text-paragraph-xs text-text-soft-400">
                                        Submitted: {formatDate(new Date(submission.submittedAt))}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0">
                                {isSubmitted ? (
                                  <CheckCircle weight="duotone" className="size-5 text-success-base" />
                                ) : (
                                  <ClockCounterClockwise weight="duotone" className="size-5 text-text-soft-400" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}

      {/* Status Timeline - Using EnrollmentTimeline component with history from API */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
        <EnrollmentTimeline 
          enrollmentId={enrollmentId}
          history={enrollmentDetail?.history}
        />
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

// Helper function to get deliverable icon based on name/category
function getDeliverableIcon(name: string) {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('screenshot') || lowerName.includes('image') || lowerName.includes('photo')) {
    return ImageIcon
  }
  if (lowerName.includes('link') || lowerName.includes('url')) {
    return LinkIcon
  }
  if (lowerName.includes('video')) {
    return VideoCamera
  }
  if (lowerName.includes('review') || lowerName.includes('rating') || lowerName.includes('star')) {
    return Star
  }
  if (lowerName.includes('share') || lowerName.includes('social')) {
    return ShareNetwork
  }
  if (lowerName.includes('text') || lowerName.includes('description')) {
    return ClipboardText
  }
  return ListChecks
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
