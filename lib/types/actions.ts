// Server Action Return Types

import type { Campaign, CampaignStatus } from './campaign'
import type { EnrollmentStatus } from './enrollment'

// Base action result - all server actions return this structure
export interface ActionResult<T = void> {
  success: boolean
  error?: string
  data?: T
}

// Specific action result types for different operations
export interface CreateActionResult<T> extends ActionResult<T> {
  success: true
  data: T
}

export interface UpdateActionResult extends ActionResult {
  success: true
  id?: string
}

export interface DeleteActionResult extends ActionResult {
  success: true
}

// Campaign-specific action results
export interface CampaignActionResult extends ActionResult<Partial<Campaign>> {
  campaign?: Partial<Campaign>
  status?: CampaignStatus
  newId?: string
}

// Enrollment-specific action results
export interface EnrollmentActionResult extends ActionResult {
  status?: EnrollmentStatus
  updatedCount?: number
  downloadUrl?: string
}

// Wallet-specific action results
export interface WalletActionResult extends ActionResult {
  withdrawalId?: string
  orderId?: string
  requestId?: string
  paymentUrl?: string
  receiptUrl?: string
  message?: string
}

// Settings-specific action results
export interface SettingsActionResult extends ActionResult {
  accountId?: string
  secret?: string
  qrCodeUrl?: string
  message?: string
}

// Generic error result helper type
export interface ActionErrorResult {
  success: false
  error: string
}
