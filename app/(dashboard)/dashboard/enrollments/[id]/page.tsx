'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import * as Button from '@/components/ui/button'
import * as StatusBadge from '@/components/ui/status-badge'
import * as Avatar from '@/components/ui/avatar'
import * as Modal from '@/components/ui/modal'
import * as Textarea from '@/components/ui/textarea'
import { getAvatarColor } from '@/utils/avatar-color'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiVerifiedBadgeLine,
  RiImageLine,
  RiCalendarLine,
  RiAlertLine,
  RiTimeLine,
  RiHistoryLine,
  RiShieldCheckLine,
  RiExternalLinkLine,
} from '@remixicon/react'
import { cn } from '@/utils/cn'
import { ENROLLMENT_STATUS_CONFIG, REJECTION_REASONS } from '@/lib/constants'
import type { Enrollment, EnrollmentStatus, Campaign } from '@/lib/types'

// Mock data
const mockEnrollment: Enrollment = {
  id: '1',
  campaignId: '1',
  shopperId: '1',
  status: 'awaiting_review',
  orderId: 'AMZ-1234567890',
  orderValue: 12999,
  orderDate: new Date('2024-12-03'),
  platform: 'Amazon',
  submissionDeadline: new Date('2025-01-19'),
  billAmount: 2340,
  platformFee: 50,
  gstAmount: 421,
  totalCost: 2811,
  shopper: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    previousEnrollments: 5,
    approvalRate: 100,
  },
  campaign: {
    id: '1',
    title: 'Nike Summer Sale',
    billRate: 18,
    platformFee: 50,
    product: {
      id: '1',
      name: 'Nike Air Max 2024',
      image: '/images/nike-shoe-product.png',
      category: 'Footwear',
      platform: 'Amazon',
      organizationId: '1',
      campaignCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } as Campaign,
  ocrData: {
    extractedOrderId: 'AMZ-1234567890',
    extractedAmount: 12999,
    extractedDate: 'Dec 3, 2024',
    extractedProduct: 'Nike Air Max 2024',
    confidence: 95,
    isVerified: true,
  },
  history: [
    {
      id: '1',
      enrollmentId: '1',
      action: 'Submission received',
      description: 'Shopper submitted order proof',
      performedAt: new Date('2024-12-05T10:30:00'),
    },
    {
      id: '2',
      enrollmentId: '1',
      action: 'OCR verification',
      description: 'Automated verification passed (95% confidence)',
      performedAt: new Date('2024-12-05T10:31:00'),
    },
    {
      id: '3',
      enrollmentId: '1',
      action: 'Pending review',
      description: 'Awaiting manual approval',
      performedAt: new Date('2024-12-05T10:31:00'),
    },
  ],
  createdAt: new Date('2024-12-05'),
  updatedAt: new Date('2024-12-05'),
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

export default function EnrollmentReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false)
  const [isChangesModalOpen, setIsChangesModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [changesComment, setChangesComment] = React.useState('')

  const enrollment = mockEnrollment
  const statusConfig = ENROLLMENT_STATUS_CONFIG[enrollment.status]

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatTime = (date: Date) => new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsApproveModalOpen(false)
      router.push('/dashboard/enrollments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsRejectModalOpen(false)
      router.push('/dashboard/enrollments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestChanges = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsChangesModalOpen(false)
      router.push('/dashboard/enrollments')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5 max-w-4xl mx-auto pb-24 sm:pb-0">
      {/* Header Card */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Top row: Back + Actions + Status */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-text-sub-600 hover:text-text-strong-950 transition-colors"
          >
            <RiArrowLeftLine className="size-4" />
            <span className="text-label-sm">Back</span>
          </button>
          
          <StatusBadge.Root status={getStatusBadgeStatus(enrollment.status)} variant="light">
            <StatusBadge.Dot />
            {statusConfig.label}
          </StatusBadge.Root>
        </div>

        {/* Shopper Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar.Root size="48" color={getAvatarColor(enrollment.shopper?.name || 'U')}>
            {(enrollment.shopper?.name || 'U').charAt(0).toUpperCase()}
          </Avatar.Root>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-label-md sm:text-title-h5 text-text-strong-950 truncate">
                {enrollment.shopper?.name}
              </span>
              {enrollment.shopper && enrollment.shopper.approvalRate >= 90 && (
                <RiVerifiedBadgeLine className="size-4 text-success-base shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {enrollment.campaign?.product?.image && (
                <div className="relative size-5 rounded overflow-hidden flex-shrink-0">
                   <Image 
                     src={enrollment.campaign.product.image} 
                     alt={enrollment.campaign.product.name}
                     fill
                     className="object-cover"
                   />
                </div>
              )}
              <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600 truncate">
                {enrollment.campaign?.title} • {enrollment.platform}
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Order Value" value={formatCurrency(enrollment.orderValue)} />
        <StatCard label="Your Cost" value={formatCurrency(enrollment.totalCost)} highlight />
        <StatCard 
          label="OCR Confidence" 
          value={`${enrollment.ocrData?.confidence || 0}%`}
          valueColor={(enrollment.ocrData?.confidence || 0) >= 90 ? 'text-green-600' : 'text-amber-600'}
        />
        <StatCard 
          label="Shopper Rate" 
          value={`${enrollment.shopper?.approvalRate || 0}%`}
          valueColor={(enrollment.shopper?.approvalRate || 0) >= 80 ? 'text-green-600' : 'text-amber-600'}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Order Details */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RiCalendarLine className="size-4 text-gray-500" />
            Order Details
          </h2>
          <div className="space-y-2">
            <DetailRow label="Order ID" value={enrollment.orderId} mono />
            <DetailRow label="Order Date" value={formatDate(enrollment.orderDate)} />
            <DetailRow label="Platform" value={enrollment.platform} />
            <DetailRow label="Enrolled" value={formatDate(enrollment.createdAt)} />
            <DetailRow label="Deadline" value={formatDate(enrollment.submissionDeadline)} />
          </div>
        </div>

        {/* OCR Verification */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RiShieldCheckLine className="size-4 text-gray-500" />
            OCR Verification
          </h2>
          <div className="space-y-2">
            <DetailRow 
              label="Order ID Match" 
              value={enrollment.ocrData?.extractedOrderId === enrollment.orderId ? '✓ Verified' : '✗ Mismatch'}
              valueColor={enrollment.ocrData?.extractedOrderId === enrollment.orderId ? 'text-green-600' : 'text-red-600'}
            />
            <DetailRow 
              label="Amount Match" 
              value={enrollment.ocrData?.extractedAmount === enrollment.orderValue ? '✓ Verified' : '✗ Mismatch'}
              valueColor={enrollment.ocrData?.extractedAmount === enrollment.orderValue ? 'text-green-600' : 'text-red-600'}
            />
            <DetailRow label="Extracted Date" value={enrollment.ocrData?.extractedDate || '-'} />
            <DetailRow label="Extracted Product" value={enrollment.ocrData?.extractedProduct || '-'} />
            <DetailRow 
              label="Confidence" 
              value={`${enrollment.ocrData?.confidence || 0}%`}
              valueColor={(enrollment.ocrData?.confidence || 0) >= 90 ? 'text-green-600' : 'text-amber-600'}
            />
          </div>
        </div>
      </div>

      {/* Billing Breakdown */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Billing Breakdown</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <DetailRow label={`Bill Rate (${enrollment.campaign?.billRate || 18}%)`} value={formatCurrency(enrollment.billAmount)} />
            <DetailRow label="GST (18%)" value={formatCurrency(enrollment.gstAmount)} />
            <DetailRow label="Platform Fee" value={formatCurrency(enrollment.platformFee)} />
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-blue-700 mb-1">Total Cost to You</span>
            <span className="text-2xl text-blue-600 font-bold">{formatCurrency(enrollment.totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Order Proof */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <RiImageLine className="size-4 text-gray-500" />
          Order Proof
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-video relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity group">
            <Image 
              src="/images/receipt-mock.png" 
              alt="Order Screenshot" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <RiImageLine className="size-8 text-white mb-2" />
               <span className="text-xs text-white font-medium">View Screenshot</span>
            </div>
          </div>
          <div className="aspect-video relative rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity group">
             <Image 
              src="/images/delivery-package-mock.png" 
              alt="Delivery Photo" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <RiImageLine className="size-8 text-white mb-2" />
               <span className="text-xs text-white font-medium">View Photo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <RiHistoryLine className="size-4 text-gray-500" />
          Activity Timeline
        </h2>
        <div className="space-y-3">
          {enrollment.history?.map((item, index) => (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "size-2 rounded-full",
                  index === 0 ? "bg-blue-500" : "bg-gray-300"
                )} />
                {index < (enrollment.history?.length || 0) - 1 && (
                  <div className="w-px flex-1 bg-gray-200" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.action}</span>
                  <span className="text-xs text-gray-400">{formatTime(item.performedAt)}</span>
                </div>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
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
                  Approve to pay <strong className="text-primary-base">{formatCurrency(enrollment.totalCost)}</strong> to the shopper
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button.Root
                  variant="basic"
                  size="small"
                  onClick={() => setIsChangesModalOpen(true)}
                >
                  <Button.Icon as={RiEditLine} />
                  Request Changes
                </Button.Root>
                <Button.Root
                  variant="error"
                  size="small"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  <Button.Icon as={RiCloseLine} />
                  Reject
                </Button.Root>
                <Button.Root
                  variant="primary"
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  <Button.Icon as={RiCheckLine} />
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
                <Button.Icon as={RiEditLine} />
                Changes
              </Button.Root>
              <Button.Root
                variant="error"
                size="small"
                className="flex-1"
                onClick={() => setIsRejectModalOpen(true)}
              >
                <Button.Icon as={RiCloseLine} />
                Reject
              </Button.Root>
              <Button.Root
                variant="primary"
                className="flex-[1.5]"
                onClick={() => setIsApproveModalOpen(true)}
              >
                <Button.Icon as={RiCheckLine} />
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
            <div className="text-center mb-4">
              <div className="size-14 rounded-full bg-success-lighter flex items-center justify-center mx-auto mb-3">
                <RiCheckLine className="size-7 text-success-base" />
              </div>
              <p className="text-paragraph-sm text-text-sub-600 mb-4">
                Approve this enrollment and pay <strong className="text-text-strong-950">{formatCurrency(enrollment.totalCost)}</strong> to {enrollment.shopper?.name}?
              </p>
              <div className="text-left rounded-xl bg-bg-weak-50 p-3 space-y-1 text-paragraph-xs">
                <div className="flex justify-between">
                  <span className="text-text-sub-600">Bill Amount</span>
                  <span className="text-text-strong-950">{formatCurrency(enrollment.billAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub-600">GST</span>
                  <span className="text-text-strong-950">{formatCurrency(enrollment.gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub-600">Platform Fee</span>
                  <span className="text-text-strong-950">{formatCurrency(enrollment.platformFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stroke-soft-200 font-semibold">
                  <span className="text-text-strong-950">Total</span>
                  <span className="text-primary-base">{formatCurrency(enrollment.totalCost)}</span>
                </div>
              </div>
            </div>
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
              <RiAlertLine className="size-4 text-warning-base shrink-0 mt-0.5" />
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
