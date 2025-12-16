"use client"

import { useQuery } from "@tanstack/react-query"
import { listInvoices, getInvoice } from "../lib/api"
import { invoiceQueryKeys } from "../lib/query-keys"
import type { InvoiceFilters } from "../types"

/**
 * Hook: Fetch invoices with filters
 */
export function useInvoices(filters: InvoiceFilters = {}) {
	return useQuery({
		queryKey: invoiceQueryKeys.list(filters),
		queryFn: () => listInvoices({
			skip: ((filters.page || 1) - 1) * (filters.limit || 10),
			take: filters.limit || 10,
			status: filters.status as any,
		}),
		staleTime: 60 * 1000,
	})
}

/**
 * Hook: Fetch single invoice
 */
export function useInvoice(id: string) {
	return useQuery({
		queryKey: invoiceQueryKeys.detail(id),
		queryFn: () => getInvoice(id),
		enabled: !!id,
	})
}

// Re-export types for convenience
export type * from '../types'
