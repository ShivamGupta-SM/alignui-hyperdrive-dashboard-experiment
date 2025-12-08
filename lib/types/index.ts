// Hypedrive Brand Dashboard - Core Types

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember extends User {
  role: UserRole
  joinedAt: Date
  organizationId: string
}

export interface Invitation {
  id: string
  email: string
  role: UserRole
  sentAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export type OrganizationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type BusinessType = 
  | 'sole_proprietorship' 
  | 'partnership' 
  | 'llp' 
  | 'private_limited' 
  | 'public_limited'

export type IndustryCategory = 
  | 'electronics' 
  | 'fashion' 
  | 'fmcg' 
  | 'beauty' 
  | 'home_appliances'
  | 'sports'
  | 'automotive'
  | 'other'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  status: OrganizationStatus
  
  // Business details
  businessType?: BusinessType
  industryCategory?: IndustryCategory
  contactPerson?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pinCode?: string
  
  // Verification
  gstNumber?: string
  gstVerified: boolean
  panNumber?: string
  panVerified: boolean
  cinNumber?: string
  
  // Billing
  creditLimit: number
  billRate: number
  platformFee: number
  
  // Stats
  campaignCount: number
  
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationDraft {
  step: 1 | 2 | 3 | 4
  basicInfo?: {
    name: string
    description?: string
    website?: string
    logo?: string
  }
  businessDetails?: {
    businessType: BusinessType
    industryCategory: IndustryCategory
    contactPerson: string
    phone: string
    address: string
    city: string
    state: string
    pinCode: string
  }
  verification?: {
    gstNumber: string
    gstVerified: boolean
    panNumber?: string
    panVerified?: boolean
    cinNumber?: string
  }
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export type CampaignStatus = 
  | 'draft'
  | 'pending_approval'
  | 'rejected'
  | 'approved'
  | 'active'
  | 'paused'
  | 'ended'
  | 'expired'
  | 'completed'
  | 'cancelled'
  | 'archived'

export type CampaignType = 'cashback' | 'barter' | 'hybrid'

export interface Campaign {
  id: string
  organizationId: string
  productId: string
  
  title: string
  description?: string
  type: CampaignType
  status: CampaignStatus
  isPublic: boolean
  
  // Dates
  startDate: Date
  endDate: Date
  submissionDeadlineDays: number
  
  // Limits
  maxEnrollments: number
  currentEnrollments: number
  
  // Billing (set by admin)
  billRate?: number
  platformFee?: number
  
  // Stats
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  totalPayout: number
  
  // Relations
  product?: Product
  deliverables?: CampaignDeliverable[]
  
  createdAt: Date
  updatedAt: Date
}

export type DeliverableType = 
  | 'order_screenshot'
  | 'delivery_photo'
  | 'product_review'
  | 'social_media_post'
  | 'unboxing_video'
  | 'custom'

export interface CampaignDeliverable {
  id: string
  campaignId: string
  type: DeliverableType
  title: string
  description?: string
  instructions?: string
  isRequired: boolean
  sortOrder: number
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string
  organizationId: string
  name: string
  description?: string
  image?: string
  category: string
  platform: string
  productUrl?: string
  campaignCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ENROLLMENT TYPES
// ============================================================================

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

// ============================================================================
// WALLET & TRANSACTION TYPES
// ============================================================================

export type TransactionType = 
  | 'credit'
  | 'hold_created'
  | 'hold_committed'
  | 'hold_voided'
  | 'withdrawal'
  | 'refund'

export interface WalletBalance {
  availableBalance: number
  heldAmount: number
  creditLimit: number
  creditUtilized: number
}

export interface Transaction {
  id: string
  organizationId: string
  type: TransactionType
  amount: number
  description: string
  reference?: string
  enrollmentId?: string
  createdAt: Date
}

export interface ActiveHold {
  campaignId: string
  campaignName: string
  enrollmentCount: number
  holdAmount: number
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  organizationId: string
  
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  
  status: InvoiceStatus
  
  subtotal: number
  gstAmount: number
  totalAmount: number
  
  enrollmentCount: number
  
  lineItems?: InvoiceLineItem[]
  
  createdAt: Date
  paidAt?: Date
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  campaignId: string
  campaignName: string
  enrollmentCount: number
  billAmount: number
  platformFeeAmount: number
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'enrollment_new'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'wallet_credit'
  | 'wallet_low_balance'
  | 'team_member_joined'
  | 'invoice_generated'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  createdAt: Date
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CampaignFormData {
  // Step 1: Basic Info
  productId: string
  title: string
  description?: string
  type: CampaignType
  isPublic: boolean
  
  // Step 2: Dates & Limits
  startDate: Date
  endDate: Date
  maxEnrollments: number
  submissionDeadlineDays: number
  
  // Step 3: Deliverables
  deliverables: {
    type: DeliverableType
    title: string
    instructions?: string
    isRequired: boolean
  }[]
  
  // Step 4: Terms
  terms: string[]
  minOrderValue?: number
}

