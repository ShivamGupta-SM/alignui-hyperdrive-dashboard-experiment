/**
 * Invoices Feature Types
 *
 * @description
 * Single source of truth for all invoice-related types.
 * Note: Invoice types are in 'organizations' namespace in brand client
 */

import type { organizations, shared } from "@/brand-client"
import type { BaseFilters, BaseStats } from "@/lib/types/base"

// Re-export from Encore client (organizations namespace)
export type Invoice = organizations.Invoice
export type InvoiceLineItem = organizations.InvoiceLineItem
export type InvoiceStatus = shared.InvoiceStatus

// Request/Response types
export type ListInvoicesParams = organizations.ListInvoicesParams
export type InvoiceLineItemsResponse = organizations.InvoiceLineItemsResponse

// Feature-specific types
export interface InvoiceFilters extends BaseFilters {
	status?: InvoiceStatus
}

export interface InvoiceStats extends BaseStats {
	paid: number
	pending: number
	overdue: number
	totalAmount: number
	totalAmountDecimal: string
}
