// Enrollment Types

import type { Campaign } from './campaign'

export type EnrollmentStatus =
  | 'enrolled'
  | 'awaiting_submission'
  | 'awaiting_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'expired'

export interface Enrollment {
  id: string
  organizationId: string
  campaignId: string
  shopperId: string

  status: EnrollmentStatus

  // Order details
  orderId: string
  orderValue: number
  orderDate: Date
  platform: string

  // Deadlines
  submissionDeadline: Date

  // Billing (calculated)
  billAmount: number
  platformFee: number
  gstAmount: number
  totalCost: number

  // OCR verification
  ocrData?: {
    extractedOrderId?: string
    extractedAmount?: number
    extractedDate?: string
    extractedProduct?: string
    confidence: number
    isVerified: boolean
  }

  // Relations
  campaign?: Campaign
  shopper?: {
    id: string
    name: string
    email: string
    avatar?: string
    previousEnrollments: number
    approvalRate: number
  }
  submissions?: EnrollmentSubmission[]
  history?: EnrollmentHistoryItem[]

  createdAt: Date
  updatedAt: Date
}

export interface EnrollmentSubmission {
  id: string
  enrollmentId: string
  deliverableId: string
  fileUrl: string
  fileType: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
}

export interface EnrollmentHistoryItem {
  id: string
  enrollmentId: string
  action: string
  description: string
  performedBy?: string
  performedAt: Date
}
