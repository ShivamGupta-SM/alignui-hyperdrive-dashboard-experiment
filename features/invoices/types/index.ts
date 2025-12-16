/**
 * Invoices Feature Types
 */

import type { invoices, shared } from "@/lib/api/encore-client"

// Re-export from Encore client
export type Invoice = invoices.Invoice
export type InvoiceLineItem = invoices.InvoiceLineItem
export type InvoiceStatus = shared.InvoiceStatus

// Feature-specific types
export interface InvoiceFilters {
	status?: string
	page?: number
	limit?: number
	[key: string]: string | number | undefined
}

