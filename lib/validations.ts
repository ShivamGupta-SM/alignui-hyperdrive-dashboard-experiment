import { z } from 'zod'

/**
 * Form Validation Schemas
 * Centralized Zod schemas for form validation
 */

// ==========================================
// EMAIL VALIDATION
// ==========================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// ==========================================
// PASSWORD VALIDATION
// ==========================================

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const simplePasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

// ==========================================
// ORGANIZATION SCHEMAS
// ==========================================

export const organizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

// ==========================================
// PRODUCT SCHEMAS
// ==========================================

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Product name must be at least 2 characters')
    .max(200, 'Product name must be less than 200 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  platform: z.string().min(1, 'Platform is required'),
  productUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

// ==========================================
// CAMPAIGN SCHEMAS
// ==========================================

export const campaignSchema = z.object({
  title: z
    .string()
    .min(1, 'Campaign title is required')
    .min(3, 'Campaign title must be at least 3 characters')
    .max(200, 'Campaign title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  productId: z.string().min(1, 'Product is required'),
  type: z.enum(['cashback', 'barter', 'hybrid']),
  startDate: z.date({ message: 'Start date is required' }),
  endDate: z.date({ message: 'End date is required' }),
  maxEnrollments: z
    .number()
    .min(1, 'Maximum enrollments must be at least 1')
    .max(100000, 'Maximum enrollments must be less than 100,000'),
  billRate: z
    .number()
    .min(0, 'Bill rate must be positive')
    .max(100, 'Bill rate must be less than 100%')
    .optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// ==========================================
// API REQUEST BODY SCHEMAS
// ==========================================

export const campaignStatusSchema = z.enum([
  'draft', 'pending_approval', 'rejected', 'approved', 'active',
  'paused', 'ended', 'expired', 'completed', 'cancelled', 'archived'
])

export const enrollmentStatusSchema = z.enum([
  'enrolled', 'awaiting_submission', 'awaiting_review',
  'changes_requested', 'approved', 'rejected', 'withdrawn', 'expired'
])

export const createCampaignBodySchema = z.object({
  title: z
    .string()
    .min(1, 'Campaign title is required')
    .min(3, 'Campaign title must be at least 3 characters')
    .max(200, 'Campaign title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  productId: z.string().min(1, 'Product is required'),
  type: z.enum(['cashback', 'barter', 'hybrid']),
  isPublic: z.boolean(),
  maxEnrollments: z
    .number()
    .int()
    .min(1, 'Maximum enrollments must be at least 1')
    .max(100000, 'Maximum enrollments must be less than 100,000'),
  submissionDeadlineDays: z
    .number()
    .int()
    .min(1, 'Submission deadline must be at least 1 day')
    .max(90, 'Submission deadline must be less than 90 days'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

export const updateCampaignBodySchema = createCampaignBodySchema.partial().extend({
  status: campaignStatusSchema.optional(),
})

export const updateEnrollmentBodySchema = z.object({
  status: enrollmentStatusSchema,
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
})

export const bulkUpdateEnrollmentBodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one enrollment ID is required'),
  status: enrollmentStatusSchema,
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
})

// Wallet schemas for API
export const withdrawalBodySchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal amount is ₹1,000'),
  bankAccountId: z.string().min(1, 'Bank account is required'),
})

export const addFundsBodySchema = z.object({
  amount: z.number().min(100, 'Minimum amount is ₹100'),
  paymentMethod: z.enum(['upi', 'netbanking', 'card']),
})

export const creditRequestBodySchema = z.object({
  amount: z.number().min(10000, 'Minimum credit request is ₹10,000').max(500000, 'Maximum credit request is ₹5,00,000'),
  reason: z.string().min(10, 'Please provide a reason').max(500, 'Reason must be less than 500 characters'),
})

// Settings schemas for API
export const updateProfileBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
})

export const updateOrganizationBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  industry: z.string().optional(),
})

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const bankAccountBodySchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(9, 'Invalid account number').max(18, 'Invalid account number'),
  accountHolder: z.string().min(2, 'Account holder name is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  isDefault: z.boolean().optional(),
})

export const verify2FABodySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
})

// Type exports for API schemas
export type CreateCampaignBody = z.infer<typeof createCampaignBodySchema>
export type UpdateCampaignBody = z.infer<typeof updateCampaignBodySchema>
export type UpdateEnrollmentBody = z.infer<typeof updateEnrollmentBodySchema>
export type BulkUpdateEnrollmentBody = z.infer<typeof bulkUpdateEnrollmentBodySchema>
export type WithdrawalBody = z.infer<typeof withdrawalBodySchema>
export type AddFundsBody = z.infer<typeof addFundsBodySchema>
export type CreditRequestBody = z.infer<typeof creditRequestBodySchema>
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBodySchema>
export type UpdatePasswordBody = z.infer<typeof updatePasswordBodySchema>
export type BankAccountBody = z.infer<typeof bankAccountBodySchema>
export type Verify2FABody = z.infer<typeof verify2FABodySchema>

// ==========================================
// WALLET SCHEMAS
// ==========================================

export const creditRequestSchema = z.object({
  requestedLimit: z
    .number()
    .min(100000, 'Minimum credit limit request is ₹1,00,000')
    .max(10000000, 'Maximum credit limit request is ₹1,00,00,000'),
  reason: z
    .string()
    .min(20, 'Please provide a detailed reason (at least 20 characters)')
    .max(1000, 'Reason must be less than 1000 characters'),
})

// ==========================================
// PROFILE SCHEMAS
// ==========================================

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
})

// ==========================================
// UTILITY TYPES
// ==========================================

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type OrganizationFormData = z.infer<typeof organizationSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type CampaignFormData = z.infer<typeof campaignSchema>
export type CreditRequestFormData = z.infer<typeof creditRequestSchema>
export type ProfileFormData = z.infer<typeof profileSchema>

// ==========================================
// API QUERY PARAMETER SCHEMAS
// ==========================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const campaignQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'draft', 'pending_approval', 'rejected', 'approved', 'active', 'paused', 'ended', 'expired', 'completed', 'cancelled', 'archived']).optional(),
  search: z.string().optional(),
})

export const enrollmentQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'enrolled', 'awaiting_submission', 'awaiting_review', 'changes_requested', 'approved', 'rejected', 'withdrawn', 'expired']).optional(),
  campaignId: z.string().optional(),
  search: z.string().optional(),
})

export const invoiceQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'pending', 'paid', 'overdue', 'cancelled']).optional(),
})

export const walletQuerySchema = paginationSchema.extend({
  type: z.enum(['all', 'credit', 'hold_created', 'hold_committed', 'hold_voided', 'withdrawal', 'refund']).optional(),
})

/**
 * Parse and validate query parameters from URLSearchParams
 */
export function parseQueryParams<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params = Object.fromEntries(searchParams.entries())
  return schema.parse(params)
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate a value against a schema and return errors
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: boolean; error?: string } {
  const result = schema.safeParse(value)
  if (result.success) {
    return { valid: true }
  }
  return { valid: false, error: result.error.issues?.[0]?.message ?? result.error.message }
}

/**
 * Get password strength
 */
export function getPasswordStrength(password: string): {
  score: number
  label: 'weak' | 'fair' | 'good' | 'strong'
  color: 'red' | 'orange' | 'yellow' | 'green'
} {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score <= 2) return { score, label: 'weak', color: 'red' }
  if (score <= 3) return { score, label: 'fair', color: 'orange' }
  if (score <= 4) return { score, label: 'good', color: 'yellow' }
  return { score, label: 'strong', color: 'green' }
}
