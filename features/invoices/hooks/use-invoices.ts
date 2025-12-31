/**
 * Invoices React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 * URL-based multi-tenancy: organizationId from URL params
 */

"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { client } from "@/lib/api/client"
import { STALE_TIME, GC_TIME, PAGE_SIZE, DEFAULT_RETRY_CONFIG, createMutationErrorHandler, createQueryKeyFactory } from "@/lib/utils/query-config"
import * as actions from "../actions/invoices"
import type { InvoiceFilters } from "../types"

// ============================================
// Query Keys - Using factory + custom extensions
// ============================================
const baseKeys = createQueryKeyFactory("invoices")

export const invoiceKeys = {
	...baseKeys,
	// Override list to include invoice-specific filters
	list: (orgId: string, filters: InvoiceFilters) =>
		[...baseKeys.lists(orgId), filters?.status ?? "all", filters?.skip ?? 0, filters?.take ?? 10] as const,
	lineItems: (orgId: string, id: string) => [...baseKeys.detail(orgId, id), "lineItems"] as const,
}

// ============================================
// QUERIES - Direct Client Usage
// ============================================

/**
 * Get invoices with filters
 */
export function useInvoices(organizationId: string, filters: InvoiceFilters = {}) {
	return useQuery({
		queryKey: invoiceKeys.list(organizationId, filters),
		queryFn: () =>
			client.organizations.listInvoices(organizationId, {
				skip: filters.skip ?? 0,
				take: filters.take ?? PAGE_SIZE.DEFAULT,
				status: filters.status,
			}),
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get single invoice
 */
export function useInvoice(orgId: string, id: string) {
	return useQuery({
		queryKey: invoiceKeys.detail(orgId, id),
		queryFn: () => client.organizations.getInvoice(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

/**
 * Get invoice line items
 */
export function useInvoiceLineItems(orgId: string, id: string) {
	return useQuery({
		queryKey: invoiceKeys.lineItems(orgId, id),
		queryFn: () => client.organizations.getInvoiceLineItems(orgId, id),
		enabled: !!orgId && !!id,
		staleTime: STALE_TIME.SHORT,
		gcTime: GC_TIME.MEDIUM,
		...DEFAULT_RETRY_CONFIG,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Generate invoice PDF
 */
export function useGenerateInvoicePDF(orgId: string) {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.generateInvoicePDF({ organizationId: orgId, invoiceId }),
		onError: createMutationErrorHandler("generate invoice PDF"),
	})
}

/**
 * Download invoice PDF
 * Requires both invoiceId and pdfUrl (get pdfUrl from useGenerateInvoicePDF first)
 */
export function useDownloadInvoicePDF(orgId: string) {
	return useMutation({
		mutationFn: ({ invoiceId, pdfUrl }: { invoiceId: string; pdfUrl: string }) =>
			actions.downloadInvoicePDF({ organizationId: orgId, invoiceId, pdfUrl }),
		onError: createMutationErrorHandler("download invoice PDF"),
	})
}

/**
 * Get invoice enrollment IDs for export
 */
export function useGetInvoiceEnrollmentIds(orgId: string) {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.getInvoiceEnrollmentIds({ organizationId: orgId, invoiceId }),
		onError: createMutationErrorHandler("get invoice enrollment IDs"),
	})
}

/**
 * Get enrollments by IDs
 */
export function useGetEnrollmentsByIds(orgId: string) {
	return useMutation({
		mutationFn: (enrollmentIds: string[]) => actions.getEnrollmentsByIds({ organizationId: orgId, enrollmentIds }),
		onError: createMutationErrorHandler("get enrollments by IDs"),
	})
}

/**
 * Mark invoice as viewed
 * Tracks when brand views an invoice - uses server action for consistency
 */
export function useMarkInvoiceViewed(orgId: string) {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.markInvoiceViewed({ organizationId: orgId, invoiceId }),
		onError: createMutationErrorHandler("mark invoice as viewed"),
	})
}

// Types are exported from @/features/invoices (feature index)
