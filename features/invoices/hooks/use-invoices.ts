/**
 * Invoices React Query Hooks
 *
 * Clean pattern: Direct client usage for queries
 */

"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import { STALE_TIME } from "@/lib/utils/query-config"
import type { shared } from "@/lib/api/encore-client"
import * as actions from "../actions/invoices"
import type { InvoiceFilters } from "../types"

// ============================================
// Client Instance
// ============================================
const client = getEncoreBrowserClient()

// ============================================
// Query Keys
// ============================================
export const invoiceKeys = {
	all: (orgId: string) => ["invoices", orgId] as const,
	lists: (orgId: string) => [...invoiceKeys.all(orgId), "list"] as const,
	list: (orgId: string, filters: InvoiceFilters) => [...invoiceKeys.lists(orgId), filters] as const,
	details: (orgId: string) => [...invoiceKeys.all(orgId), "detail"] as const,
	detail: (id: string) => ["invoices", "detail", id] as const,
	lineItems: (id: string) => ["invoices", "lineItems", id] as const,
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
			client.invoices.listInvoices({
				organizationId,
				skip: filters.skip ?? 0,
				take: filters.take ?? 10,
				status: filters.status as shared.InvoiceStatus | undefined,
			}),
		enabled: !!organizationId,
		staleTime: STALE_TIME.SHORT,
	})
}

/**
 * Get single invoice
 */
export function useInvoice(id: string) {
	return useQuery({
		queryKey: invoiceKeys.detail(id),
		queryFn: () => client.invoices.getInvoice(id),
		enabled: !!id,
	})
}

/**
 * Get invoice line items
 */
export function useInvoiceLineItems(id: string) {
	return useQuery({
		queryKey: invoiceKeys.lineItems(id),
		queryFn: () => client.invoices.getInvoiceLineItems(id),
		enabled: !!id,
	})
}

// ============================================
// MUTATIONS - Via Server Actions
// ============================================

/**
 * Generate invoice PDF
 */
export function useGenerateInvoicePDF() {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.generateInvoicePDF({ invoiceId }),
	})
}

/**
 * Download invoice PDF
 */
export function useDownloadInvoicePDF() {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.downloadInvoicePDF({ invoiceId }),
	})
}

/**
 * Get invoice enrollment IDs for export
 */
export function useGetInvoiceEnrollmentIds() {
	return useMutation({
		mutationFn: (invoiceId: string) => actions.getInvoiceEnrollmentIds({ invoiceId }),
	})
}

/**
 * Get enrollments by IDs
 */
export function useGetEnrollmentsByIds() {
	return useMutation({
		mutationFn: (enrollmentIds: string[]) => actions.getEnrollmentsByIds({ enrollmentIds }),
	})
}

// Re-export types
export type * from "../types"
