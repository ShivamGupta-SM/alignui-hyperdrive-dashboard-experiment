/**
 * MSW Handler Utilities - Type-Safe Edition (Strict Mode)
 *
 * NO defensive coding - if data is wrong, it MUST fail immediately.
 * NO legacy responses - use typed helpers only.
 *
 * All response helpers enforce Encore types for end-to-end type safety.
 */

import { HttpResponse } from 'msw'

// Import Encore types for type safety
import type {
  wallets,
  organizations,
  campaigns,
  enrollments,
  products,
  invoices,
  notifications,
} from '@/lib/encore-browser'

// =============================================================================
// ENCORE URL HELPER
// =============================================================================

export const ENCORE_BASE_URL = process.env.NEXT_PUBLIC_ENCORE_URL || 'http://localhost:4000'

export function encoreUrl(path: string): string {
  return `${ENCORE_BASE_URL}${path}`
}

// =============================================================================
// DELAYS - Removed artificial delays
// =============================================================================
// Note: MSW handlers can use mswDelay directly if needed for testing
// For production, remove all delays for faster responses

// =============================================================================
// AUTH CONTEXT
// =============================================================================

export interface AuthContext {
  userId: string
  organizationId: string
  role: 'admin' | 'member' | 'manager'
}

export function getAuthContext(): AuthContext {
  return {
    userId: '1',
    organizationId: '1',
    role: 'admin',
  }
}

// =============================================================================
// TYPE-SAFE RESPONSE HELPERS (STRICT - NO FALLBACKS)
// =============================================================================

/**
 * Generic typed response - data MUST be valid object
 */
export function encoreResponse<T extends object>(data: T) {
  return HttpResponse.json(data)
}

/**
 * Type-safe list response - STRICT pagination (no defaults)
 */
export function encoreListResponse<T>(
  data: T[],
  total: number,
  skip: number,
  take: number
) {
  return HttpResponse.json({
    data,
    total,
    skip,
    take,
    hasMore: skip + data.length < total,
  })
}

/**
 * Error responses
 */
export function encoreErrorResponse(message: string, status = 400) {
  return HttpResponse.json({ error: message, code: 'invalid_argument' }, { status })
}

export function encoreNotFoundResponse(entity: string) {
  return HttpResponse.json({ error: `${entity} not found`, code: 'not_found' }, { status: 404 })
}

export function encoreUnauthorizedResponse(message: string) {
  return HttpResponse.json({ error: message, code: 'unauthenticated' }, { status: 401 })
}

// =============================================================================
// STRICTLY TYPED RESPONSE HELPERS
// These enforce EXACT Encore types at compile time - NO EXCEPTIONS
// =============================================================================

/** Type-safe Wallet response */
export function typedWalletResponse(wallet: wallets.Wallet) {
  return HttpResponse.json(wallet)
}

/** Type-safe WalletTransaction list */
export function typedTransactionListResponse(
  data: wallets.WalletTransaction[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe ActiveHold list */
export function typedHoldsResponse(holds: { holds: wallets.ActiveHold[] }) {
  return HttpResponse.json(holds)
}

/** Type-safe Dashboard response */
export function typedDashboardResponse(data: organizations.DashboardOverviewResponse) {
  return HttpResponse.json(data)
}

/** Type-safe Organization response */
export function typedOrganizationResponse(org: organizations.Organization) {
  return HttpResponse.json(org)
}

/** Type-safe Organization list */
export function typedOrganizationListResponse(
  data: organizations.Organization[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe Campaign response */
export function typedCampaignResponse(campaign: campaigns.CampaignWithStats) {
  return HttpResponse.json(campaign)
}

/** Type-safe Campaign list */
export function typedCampaignListResponse(
  data: campaigns.CampaignWithStats[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe Enrollment response */
export function typedEnrollmentResponse(enrollment: enrollments.EnrollmentWithRelations) {
  return HttpResponse.json(enrollment)
}

/** Type-safe Enrollment list */
export function typedEnrollmentListResponse(
  data: enrollments.EnrollmentWithRelations[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe Product response */
export function typedProductResponse(product: products.ProductWithStats) {
  return HttpResponse.json(product)
}

/** Type-safe Product list */
export function typedProductListResponse(
  data: products.ProductWithStats[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe Invoice response */
export function typedInvoiceResponse(invoice: invoices.Invoice) {
  return HttpResponse.json(invoice)
}

/** Type-safe Invoice list */
export function typedInvoiceListResponse(
  data: invoices.Invoice[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

/** Type-safe Notification response */
export function typedNotificationResponse(notification: notifications.Notification) {
  return HttpResponse.json(notification)
}

/** Type-safe Notification list */
export function typedNotificationListResponse(
  data: notifications.Notification[],
  total: number,
  skip: number,
  take: number
) {
  return encoreListResponse(data, total, skip, take)
}

// =============================================================================
// TYPE RE-EXPORTS
// =============================================================================

export type {
  wallets,
  organizations,
  campaigns,
  enrollments,
  products,
  invoices,
  notifications,
}
