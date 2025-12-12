/**
 * Type-Safe MSW Response Helpers
 * 
 * This module provides type-safe utilities for MSW handlers that enforce
 * Encore API response formats at compile time.
 */

import { HttpResponse } from 'msw'
import type { products, organizations, campaigns, enrollments, invoices } from '@/lib/encore-client'

// =============================================================================
// ENCORE API RESPONSE TYPES
// =============================================================================

/**
 * Standard Encore list response format
 */
export interface EncoreListResponse<T> {
  data: T[]
  total: number
  skip: number
  take: number
  hasMore: boolean
}

/**
 * Standard Encore error response format
 */
export interface EncoreErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
}

// =============================================================================
// TYPED RESPONSE HELPERS
// =============================================================================

/**
 * Create a type-safe Encore API response
 */
export function typedEncoreResponse<T extends object>(
  data: T,
  status = 200
): Response {
  return HttpResponse.json(data, { status })
}

/**
 * Create a type-safe Encore list response
 */
export function typedEncoreListResponse<T>(
  data: T[],
  total: number,
  skip: number,
  take: number
): Response {
  const response: EncoreListResponse<T> = {
    data,
    total,
    skip,
    take,
    hasMore: skip + data.length < total,
  }
  return HttpResponse.json(response)
}

/**
 * Create a type-safe error response
 */
export function typedEncoreError(
  message: string,
  status: 400 | 401 | 403 | 404 | 500 = 400,
  code?: string
): Response {
  const error: EncoreErrorResponse = {
    code: code || `ERR_${status}`,
    message,
  }
  return HttpResponse.json(error, { status })
}

// =============================================================================
// PRODUCT TYPED HELPERS
// =============================================================================

export type ProductWithStats = products.ProductWithStats
export type ProductCategory = products.ProductCategory
export type CreateProductRequest = products.CreateProductRequest

/**
 * Type-safe product response
 */
export function productResponse(product: ProductWithStats): Response {
  return typedEncoreResponse(product)
}

/**
 * Type-safe product list response
 */
export function productListResponse(
  products: ProductWithStats[],
  total: number,
  skip = 0,
  take = 20
): Response {
  return typedEncoreListResponse(products, total, skip, take)
}

// =============================================================================
// ORGANIZATION TYPED HELPERS
// =============================================================================

export type Member = organizations.Member
export type Organization = organizations.Organization

/**
 * Type-safe member response
 */
export function memberResponse(member: Member): Response {
  return typedEncoreResponse(member)
}

/**
 * Type-safe member list response
 */
export function memberListResponse(
  members: Member[],
  total: number,
  skip = 0,
  take = 20
): Response {
  return typedEncoreListResponse(members, total, skip, take)
}

// =============================================================================
// CAMPAIGN TYPED HELPERS
// =============================================================================

export type Campaign = campaigns.Campaign
export type CampaignWithStats = campaigns.CampaignWithStats

/**
 * Type-safe campaign response
 */
export function campaignResponse(campaign: CampaignWithStats): Response {
  return typedEncoreResponse(campaign)
}

/**
 * Type-safe campaign list response
 */
export function campaignListResponse(
  campaigns: CampaignWithStats[],
  total: number,
  skip = 0,
  take = 20
): Response {
  return typedEncoreListResponse(campaigns, total, skip, take)
}

// =============================================================================
// ENROLLMENT TYPED HELPERS
// =============================================================================

export type Enrollment = enrollments.EnrollmentWithRelations

/**
 * Type-safe enrollment response
 */
export function enrollmentResponse(enrollment: Enrollment): Response {
  return typedEncoreResponse(enrollment)
}

/**
 * Type-safe enrollment list response
 */
export function enrollmentListResponse(
  enrollments: Enrollment[],
  total: number,
  skip = 0,
  take = 20
): Response {
  return typedEncoreListResponse(enrollments, total, skip, take)
}

// =============================================================================
// INVOICE TYPED HELPERS
// =============================================================================

export type Invoice = invoices.Invoice

/**
 * Type-safe invoice response
 */
export function invoiceResponse(invoice: Invoice): Response {
  return typedEncoreResponse(invoice)
}

/**
 * Type-safe invoice list response
 */
export function invoiceListResponse(
  invoices: Invoice[],
  total: number,
  skip = 0,
  take = 20
): Response {
  return typedEncoreListResponse(invoices, total, skip, take)
}

// =============================================================================
// GENERIC TYPED RESPONSE
// =============================================================================

/**
 * Generic success response for operations like delete, update status, etc.
 */
export function successResponse<T extends Record<string, unknown>>(data: T): Response {
  return typedEncoreResponse(data)
}

/**
 * Delete success response
 */
export function deleteResponse(): Response {
  return typedEncoreResponse({ deleted: true })
}
