"use server"

/**
 * Invoices Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 * URL-based multi-tenancy: organizationId from URL params passed to all actions
 */

import { z } from "zod"
import { revalidateTag } from "next/cache"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas - All actions require organizationId for URL-based multi-tenancy
// =============================================================================

const invoiceIdSchema = z.object({
	organizationId: z.string().min(1),
	invoiceId: z.string().min(1),
})

const enrollmentIdsSchema = z.object({
	organizationId: z.string().min(1),
	enrollmentIds: z.array(z.string().min(1)).min(1),
})


// =============================================================================
// Actions - Use organization-scoped endpoints for multi-tenancy
// =============================================================================

/**
 * Generate invoice PDF
 */
export const generateInvoicePDF = authAction
	.inputSchema(invoiceIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, invoiceId } = parsedInput
		const result = await ctx.client.organizations.generateInvoicePDF(organizationId, invoiceId)

		if (!result.pdfUrl) {
			throw new Error("PDF not yet generated. Please try again later.")
		}

		return { pdfUrl: result.pdfUrl }
	})

const downloadPdfSchema = z.object({
	organizationId: z.string().min(1),
	invoiceId: z.string().min(1),
	pdfUrl: z.string().url(),
})

/**
 * Download invoice PDF as blob
 * Requires pdfUrl to be passed (get it from generateInvoicePDF first)
 */
export const downloadInvoicePDF = authAction
	.inputSchema(downloadPdfSchema)
	.action(async ({ parsedInput }) => {
		const pdfResponse = await fetch(parsedInput.pdfUrl)
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
		const { organizationId, invoiceId } = parsedInput
		const invoice = await ctx.client.organizations.getInvoice(organizationId, invoiceId)
		const lineItems = await ctx.client.organizations.getInvoiceLineItems(organizationId, invoiceId)

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
 * Get enrollments by IDs for invoice export
 * Uses listOrganizationEnrollments and filters by IDs
 */
export const getEnrollmentsByIds = authAction
	.inputSchema(enrollmentIdsSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, enrollmentIds } = parsedInput

		// Fetch all enrollments for the organization (in batches if needed)
		// This is a workaround since there's no bulk getByIds endpoint
		const result = await ctx.client.organizations.listOrganizationEnrollments(organizationId, {
			skip: 0,
			take: 1000, // Large batch to get all relevant enrollments
		})

		// Filter to only the requested enrollment IDs
		const enrollmentIdSet = new Set(enrollmentIds)
		const enrollments = (result.data || [])
			.filter((e) => enrollmentIdSet.has(e.id))
			.map((enrollment) => ({
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
			}))

		return enrollments
	})

/**
 * Mark invoice as viewed
 * Tracks when brand views an invoice - wrapped in server action for consistency
 */
export const markInvoiceViewed = authAction
	.inputSchema(invoiceIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, invoiceId } = parsedInput
		await ctx.client.organizations.markInvoiceViewed(organizationId, invoiceId)
		// RESTful: Add cache revalidation for invoice data consistency
		revalidateTag("invoices")
		return { success: true }
	})
