/**
 * Invoices SSR Data Fetching
 *
 * Server-side data fetching for invoice pages.
 * Organized by feature for clean architecture.
 */

import { getAuthClient } from "@/lib/auth/server"
import { logError } from "@/lib/logging/error-logger-simple"

const DEFAULT_INVOICE_PAGE_SIZE = 50

/**
 * Get invoices list for organization
 */
export async function getInvoicesData(organizationId: string) {
	try {
		const client = await getAuthClient()

		// URL-based multi-tenancy: pass organizationId to backend
		const response = await client.invoices.listInvoices({
			organizationId,
			skip: 0,
			take: DEFAULT_INVOICE_PAGE_SIZE,
		})

		// Return with 'invoices' key for InvoicesClient compatibility
		return { invoices: response.data || [], ...response }
	} catch (error) {
		logError(error, { source: "getInvoicesData", data: { action: "fetch invoices", organizationId } })
		return { invoices: [], data: [], total: 0 }
	}
}
