/**
 * Invoices API - Single source of truth for all invoice operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { invoices } from "@/lib/api/encore-client"

/**
 * Get invoice by ID
 * 
 * @param id - Invoice ID
 * @returns Invoice data
 */
export async function getInvoice(id: string) {
	const client = getEncoreBrowserClient()
	return client.invoices.getInvoice(id)
}

/**
 * List invoices
 * 
 * @param params - List parameters
 * @returns List of invoices
 */
export async function listInvoices(params?: invoices.ListInvoicesParams) {
	const client = getEncoreBrowserClient()
	return client.invoices.listInvoices(params || {})
}

/**
 * Generate invoice PDF
 * 
 * @param invoiceId - Invoice ID
 * @returns PDF data
 */
export async function generateInvoicePDF(invoiceId: string) {
	const client = getEncoreBrowserClient()
	return client.invoices.generateInvoicePDF(invoiceId)
}

