"use server"

/**
 * Invoices Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const invoiceIdSchema = z.object({
	invoiceId: z.string().min(1),
})

const enrollmentIdsSchema = z.object({
	enrollmentIds: z.array(z.string().min(1)).min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Generate invoice PDF
 */
export const generateInvoicePDF = authAction
	.inputSchema(invoiceIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.invoices.generateInvoicePDF(parsedInput.invoiceId)

		if (!result.pdfUrl) {
			throw new Error("PDF not yet generated. Please try again later.")
		}

		return { pdfUrl: result.pdfUrl }
	})

/**
 * Download invoice PDF as blob
 */
export const downloadInvoicePDF = authAction
	.inputSchema(invoiceIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.invoices.generateInvoicePDF(parsedInput.invoiceId)

		if (!result.pdfUrl) {
			throw new Error("PDF not yet generated. Please try again later.")
		}

		const pdfResponse = await fetch(result.pdfUrl)
		if (!pdfResponse.ok) {
			throw new Error("Failed to download PDF")
		}

		const blob = await pdfResponse.blob()
		const arrayBuffer = await blob.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		return {
			buffer,
			filename: `invoice-${parsedInput.invoiceId}.pdf`,
			contentType: "application/pdf",
		}
	})

/**
 * Get invoice enrollment IDs for export
 */
export const getInvoiceEnrollmentIds = authAction
	.inputSchema(invoiceIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const invoice = await ctx.client.invoices.getInvoice(parsedInput.invoiceId)
		const lineItems = await ctx.client.invoices.getInvoiceLineItems(parsedInput.invoiceId)

		const enrollmentIds = lineItems.lineItems
			.map((item) => item.enrollmentId)
			.filter((id): id is string => Boolean(id))

		if (enrollmentIds.length === 0) {
			throw new Error("No enrollments found for this invoice")
		}

		return {
			enrollmentIds,
			invoiceNumber: invoice.invoiceNumber,
			periodStart: invoice.periodStart ?? "",
			periodEnd: invoice.periodEnd ?? "",
			organizationId: invoice.organizationId,
		}
	})

/**
 * Get enrollments by IDs
 */
export const getEnrollmentsByIds = authAction
	.inputSchema(enrollmentIdsSchema)
	.action(async ({ parsedInput, ctx }) => {
		const enrollments = await Promise.all(
			parsedInput.enrollmentIds.map(async (id) => {
				const enrollment = await ctx.client.enrollments.getEnrollment(id)
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

		return enrollments
	})
