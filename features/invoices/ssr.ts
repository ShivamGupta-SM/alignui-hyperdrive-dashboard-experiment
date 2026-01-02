/**
 * Invoices SSR Data Fetching
 *
 * Server-side data fetching for invoice pages.
 * Uses ssrFetch helper for standardized error handling.
 */

import { ssrFetch } from "@/lib/api/server"
import { logSSRError } from "@/lib/logging/error-logger-simple"
import { SSR_PAGE_SIZE } from "@/lib/utils/query-config"

// Default fallback for invoices data
const EMPTY_INVOICES_RESPONSE = {
	invoices: [],
	data: [],
	total: 0,
	organization: null,
}

/**
 * Get invoices list for organization
 * Uses ssrFetch for standardized error handling
 */
export async function getInvoicesData(organizationId: string) {
	return ssrFetch(
		{
			source: "getInvoicesData",
			feature: "invoices",
			context: { organizationId },
		},
		async (client) => {
			const results = await Promise.allSettled([
				client.organizations.listInvoices(organizationId, {
					skip: 0,
					take: SSR_PAGE_SIZE.DEFAULT,
				}),
				client.auth.getFullOrganization(organizationId, {}),
				client.organizations.getGSTDetails(organizationId),
			])

			const invoicesResponse = results[0].status === "fulfilled" ? results[0].value : { data: [], total: 0 }
			const orgResult = results[1].status === "fulfilled" ? results[1].value : null
			const gstResult = results[2].status === "fulfilled" ? results[2].value : null

			// Log errors for failed promises
			results.forEach((result, index) => {
				if (result.status === "rejected") {
					const names = ["invoices", "organization", "gst-details"]
					logSSRError(result.reason, "getInvoicesData", `invoices-${names[index]}`, {
						data: { organizationId },
					})
				}
			})

			// ✅ FIX Bug 16: Explicit return instead of spread to avoid exposing internal fields
			return {
				invoices: invoicesResponse.data || [],
				data: invoicesResponse.data || [],
				total: invoicesResponse.total ?? 0,
				organization: orgResult
					? {
							id: orgResult.id,
							name: orgResult.name,
							gstNumber: gstResult?.gstDetails?.gstNumber,
							gstLegalName: gstResult?.gstDetails?.legalName,
						}
					: null,
			}
		},
		EMPTY_INVOICES_RESPONSE
	)
}
