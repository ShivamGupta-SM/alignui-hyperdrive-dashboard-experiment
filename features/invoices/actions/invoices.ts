/**
 * Invoices Server Actions
 * 
 * @description
 * Server-side actions for invoice operations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import type { Result } from "@/shared/lib/errors/types"

/**
 * Generate invoice PDF
 * 
 * @description
 * Generates PDF for an invoice and returns download URL.
 * 
 * @param invoiceId - Invoice ID
 * @returns Result with PDF URL or error
 */
export async function generateInvoicePDF(invoiceId: string): Promise<Result<{ pdfUrl: string }>> {
	const client = getEncoreClient()

	try {
		const result = await client.invoices.generateInvoicePDF(invoiceId)

		if (!result.pdfUrl) {
			return {
				success: false,
				error: new Error("PDF not yet generated. Please try again later."),
			}
		}

		return { success: true, data: { pdfUrl: result.pdfUrl } }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(apiError.error) }
	}
}

/**
 * Download invoice PDF as blob
 * 
 * @description
 * Fetches the PDF from the URL and returns it as a buffer.
 * 
 * @param invoiceId - Invoice ID
 * @returns Result with PDF buffer or error
 */
export async function downloadInvoicePDF(
	invoiceId: string
): Promise<Result<{ buffer: Buffer; filename: string; contentType: string }>> {
	const client = getEncoreClient()

	try {
		const result = await client.invoices.generateInvoicePDF(invoiceId)

		if (!result.pdfUrl) {
			return {
				success: false,
				error: new Error("PDF not yet generated. Please try again later."),
			}
		}

		const pdfResponse = await fetch(result.pdfUrl)
		if (!pdfResponse.ok) {
			return { success: false, error: new Error("Failed to download PDF") }
		}

		const blob = await pdfResponse.blob()
		const arrayBuffer = await blob.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		return {
			success: true,
			data: {
				buffer,
				filename: `invoice-${invoiceId}.pdf`,
				contentType: "application/pdf",
			},
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(apiError.error) }
	}
}

/**
 * Get invoice enrollment IDs for export
 * 
 * @description
 * Gets enrollment IDs from invoice line items for CSV export.
 * 
 * @param invoiceId - Invoice ID
 * @returns Result with enrollment IDs and invoice metadata
 */
export async function getInvoiceEnrollmentIds(
	invoiceId: string
): Promise<Result<{
	enrollmentIds: string[]
	invoiceNumber: string
	periodStart: string
	periodEnd: string
	organizationId: string
}>> {
	const client = getEncoreClient()

	try {
		const invoice = await client.invoices.getInvoice(invoiceId)
		const lineItems = await client.invoices.getInvoiceLineItems(invoiceId)

		const enrollmentIds = lineItems.lineItems
			.map((item) => item.enrollmentId)
			.filter((id): id is string => Boolean(id))

		if (enrollmentIds.length === 0) {
			return { success: false, error: new Error("No enrollments found for this invoice") }
		}

		return {
			success: true,
			data: {
				enrollmentIds,
				invoiceNumber: invoice.invoiceNumber,
				periodStart: invoice.periodStart ?? "",
				periodEnd: invoice.periodEnd ?? "",
				organizationId: invoice.organizationId,
			},
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(apiError.error) }
	}
}

/**
 * Get enrollments by IDs
 * 
 * @description
 * Fetches enrollment data for given IDs.
 * 
 * @param enrollmentIds - Array of enrollment IDs
 * @returns Result with enrollment data or error
 */
export async function getEnrollmentsByIds(
	enrollmentIds: string[]
): Promise<Result<Array<{
	id: string
	orderId: string | null
	orderValue: number
	lockedBillRate: number | null
	lockedPlatformFee: number | null
	lockedRebatePercentage: number | null
	lockedBonusAmount: number | null
	status: string
	shopperId: string
	purchaseDate: string | null
	submittedAt: string | null
	approvedAt: string | null
	createdAt: string
}>>> {
	const client = getEncoreClient()

	try {
		// Fetch enrollments one by one (or batch if API supports it)
		const enrollments = await Promise.all(
			enrollmentIds.map(async (id) => {
				const enrollment = await client.enrollments.getEnrollment(id)
				return {
					id: enrollment.id,
					orderId: enrollment.orderId ?? null,
					orderValue: enrollment.orderValue,
					lockedBillRate: enrollment.lockedBillRate ?? null,
					lockedPlatformFee: enrollment.lockedPlatformFee ?? null,
					lockedRebatePercentage: enrollment.lockedRebatePercentage ?? null,
					lockedBonusAmount: enrollment.lockedBonusAmount ?? null,
					status: enrollment.status,
					shopperId: enrollment.shopperId,
					purchaseDate: enrollment.purchaseDate ?? null,
					submittedAt: enrollment.submittedAt ?? null,
					approvedAt: enrollment.approvedAt ?? null,
					createdAt: enrollment.createdAt,
				}
			})
		)

		return { success: true, data: enrollments }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(apiError.error) }
	}
}
