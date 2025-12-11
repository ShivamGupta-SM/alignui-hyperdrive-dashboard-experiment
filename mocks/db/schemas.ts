/**
 * MSW Data Schemas (Zod)
 *
 * Defines all database schemas using Zod for type-safe data modeling.
 * These schemas are used by @msw/data Collection instances.
 */

import { z } from 'zod'

// =============================================================================
// ENUM SCHEMAS
// =============================================================================

export const CampaignStatusSchema = z.enum([
  'draft',
  'pending_approval',
  'rejected',
  'approved',
  'active',
  'paused',
  'ended',
  'expired',
  'completed',
  'cancelled',
  'archived',
])

export const CampaignTypeSchema = z.enum(['cashback', 'barter', 'hybrid'])

export const EnrollmentStatusSchema = z.enum([
  'enrolled',
  'awaiting_submission',
  'awaiting_review',
  'changes_requested',
  'approved',
  'rejected',
  'withdrawn',
  'expired',
])

export const TransactionTypeSchema = z.enum([
  'credit',
  'hold_created',
  'hold_committed',
  'hold_voided',
  'withdrawal',
  'refund',
])

export const InvoiceStatusSchema = z.enum(['pending', 'paid', 'overdue', 'cancelled'])

export const DeliverableTypeSchema = z.enum([
  'order_screenshot',
  'delivery_photo',
  'product_review',
  'social_media_post',
  'unboxing_video',
  'custom',
])

export const UserRoleSchema = z.enum(['owner', 'admin', 'manager', 'viewer'])

export const InvitationStatusSchema = z.enum(['pending', 'accepted', 'expired'])

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

export const CampaignSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  productId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: CampaignTypeSchema,
  status: CampaignStatusSchema,
  isPublic: z.boolean(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  submissionDeadlineDays: z.number(),
  maxEnrollments: z.number(),
  currentEnrollments: z.number(),
  billRate: z.number().optional(),
  platformFee: z.number().optional(),
  approvedCount: z.number(),
  rejectedCount: z.number(),
  pendingCount: z.number(),
  totalPayout: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CampaignDeliverableSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  type: DeliverableTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  isRequired: z.boolean(),
  sortOrder: z.number(),
})

export const ShopperSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  previousEnrollments: z.number(),
  approvalRate: z.number(),
})

export const OcrDataSchema = z.object({
  extractedOrderId: z.string().optional(),
  extractedAmount: z.number().optional(),
  extractedDate: z.string().optional(),
  extractedProduct: z.string().optional(),
  confidence: z.number(),
  isVerified: z.boolean(),
})

export const EnrollmentSubmissionSchema = z.object({
  id: z.string(),
  enrollmentId: z.string(),
  deliverableId: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  submittedAt: z.coerce.date(),
})

export const EnrollmentHistoryItemSchema = z.object({
  id: z.string(),
  enrollmentId: z.string(),
  action: z.string(),
  description: z.string(),
  performedBy: z.string().optional(),
  performedAt: z.coerce.date(),
})

export const EnrollmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  campaignId: z.string(),
  shopperId: z.string(),
  status: EnrollmentStatusSchema,
  orderId: z.string(),
  orderValue: z.number(),
  orderDate: z.coerce.date(),
  platform: z.string(),
  submissionDeadline: z.coerce.date(),
  billAmount: z.number(),
  platformFee: z.number(),
  gstAmount: z.number(),
  totalCost: z.number(),
  payoutAmount: z.number(),
  ocrData: OcrDataSchema.optional(),
  shopper: ShopperSchema.optional(),
  submissions: z.array(EnrollmentSubmissionSchema).optional(),
  history: z.array(EnrollmentHistoryItemSchema).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const ProductSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  mrp: z.number().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const InvoiceLineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
})

export const InvoiceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  invoiceNumber: z.string(),
  status: InvoiceStatusSchema,
  dueDate: z.coerce.date(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  lineItems: z.array(InvoiceLineItemSchema).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const TransactionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  type: TransactionTypeSchema,
  amount: z.number(),
  description: z.string(),
  reference: z.string().optional(),
  enrollmentId: z.string().optional(),
  createdAt: z.coerce.date(),
})

export const WalletBalanceSchema = z.object({
  organizationId: z.string(),
  availableBalance: z.number(),
  heldAmount: z.number(),
  creditLimit: z.number(),
  creditUtilized: z.number(),
})

export const ActiveHoldSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  campaignId: z.string(),
  campaignName: z.string(),
  enrollmentCount: z.number(),
  holdAmount: z.number(),
})

export const TeamMemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  avatar: z.string().optional(),
  joinedAt: z.coerce.date(),
  lastActive: z.coerce.date().optional(),
})

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  message: z.string().optional(),
  invitedBy: z.string(),
  status: InvitationStatusSchema,
  sentAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
})

export const NotificationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  title: z.string(),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
})

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
})

export const PlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().optional(),
})

export const OrganizationSettingsSchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
})

export const BankAccountSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  ifscCode: z.string(),
  bankName: z.string(),
  branch: z.string().optional(),
  isPrimary: z.boolean(),
})

export const GstDetailsSchema = z.object({
  organizationId: z.string(),
  gstNumber: z.string(),
  legalName: z.string(),
  tradeName: z.string().optional(),
  gstStatus: z.string(),
  address: z.string().optional(),
})

export const DashboardStatsSchema = z.object({
  organizationId: z.string(),
  activeCampaigns: z.number(),
  totalEnrollments: z.number(),
  pendingReviews: z.number(),
  totalPayout: z.number(),
  walletBalance: z.number(),
  monthlyGrowth: z.number(),
})

export const RecentActivitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  type: z.enum(['campaign', 'enrollment', 'wallet', 'team']),
  message: z.string(),
  time: z.string(),
  timestamp: z.coerce.date(),
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Campaign = z.infer<typeof CampaignSchema>
export type CampaignDeliverable = z.infer<typeof CampaignDeliverableSchema>
export type Enrollment = z.infer<typeof EnrollmentSchema>
export type Product = z.infer<typeof ProductSchema>
export type Invoice = z.infer<typeof InvoiceSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type WalletBalance = z.infer<typeof WalletBalanceSchema>
export type ActiveHold = z.infer<typeof ActiveHoldSchema>
export type TeamMember = z.infer<typeof TeamMemberSchema>
export type Invitation = z.infer<typeof InvitationSchema>
export type Notification = z.infer<typeof NotificationSchema>
export type Category = z.infer<typeof CategorySchema>
export type Platform = z.infer<typeof PlatformSchema>
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
export type GstDetails = z.infer<typeof GstDetailsSchema>
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type RecentActivity = z.infer<typeof RecentActivitySchema>
