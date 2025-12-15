/**
 * Invoices API Mock Handlers
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreNotFoundResponse,
	encoreErrorResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const invoicesHandlers = [
	// GET /invoices
	http.get(encoreUrl("/invoices"), async ({ request }) => {
		const auth = getAuthContext()
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)
		const status = url.searchParams.get("status")

		let invoices = db.invoices.findMany((q) =>
			q.where({ organizationId: auth.organizationId || "1" })
		)

		if (status && status !== "all") {
			invoices = invoices.filter((i) => i.status === status)
		}

		invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		return encoreListResponse(
			invoices.slice(skip, skip + take).map((i) => ({
				id: i.id,
				organizationId: i.organizationId,
				invoiceNumber: i.invoiceNumber,
				issuedAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
				dueDate: i.dueDate instanceof Date ? i.dueDate.toISOString() : i.dueDate,
				periodStart: undefined,
				periodEnd: undefined,
				subtotal: i.totalAmount * 0.9,
				gstAmount: i.totalAmount * 0.1,
				gstPercent: 10,
				tdsPercentage: 0,
				tdsAmount: 0,
				totalAmount: i.totalAmount,
				amountPaid: i.paidAmount || 0,
				status: i.status as "pending" | "paid" | "overdue" | "cancelled",
				pdfUrl: undefined,
				notes: undefined,
				createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
			})),
			invoices.length,
			skip,
			take
		)
	}),

	// GET /invoices/:id
	http.get(encoreUrl("/invoices/:id"), async ({ params }) => {
		const auth = getAuthContext()
		const { id } = params
		const invoiceId = Array.isArray(id) ? id[0] : id
		if (!invoiceId) {
			return encoreNotFoundResponse("Invoice")
		}

		const invoice = db.invoices.findFirst((q) =>
			q.where({ id: invoiceId as string, organizationId: auth.organizationId || "1" })
		)
		if (!invoice) return encoreNotFoundResponse("Invoice")

		return encoreResponse({
			id: invoice.id,
			organizationId: invoice.organizationId,
			invoiceNumber: invoice.invoiceNumber,
			issuedAt:
				invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
			dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
			periodStart: undefined,
			periodEnd: undefined,
			subtotal: invoice.totalAmount * 0.9,
			gstAmount: invoice.totalAmount * 0.1,
			gstPercent: 10,
			tdsPercentage: 0,
			tdsAmount: 0,
			totalAmount: invoice.totalAmount,
			amountPaid: invoice.paidAmount || 0,
			status: invoice.status as "pending" | "paid" | "overdue" | "cancelled",
			pdfUrl: undefined,
			notes: undefined,
			createdAt:
				invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
		})
	}),

	// GET /organizations/:orgId/invoices
	http.get(encoreUrl("/organizations/:orgId/invoices"), async ({ params, request }) => {
		await delay(DELAY.STANDARD)

		const { orgId } = params as { orgId: string }
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const invoices = db.invoices.findMany((q) => q.where({ organizationId: orgId || "1" }))

		return encoreListResponse(
			invoices.slice(skip, skip + take).map((i) => ({
				id: i.id,
				organizationId: i.organizationId,
				invoiceNumber: i.invoiceNumber,
				issuedAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
				dueDate: i.dueDate instanceof Date ? i.dueDate.toISOString() : i.dueDate,
				periodStart: undefined,
				periodEnd: undefined,
				subtotal: i.totalAmount * 0.9,
				gstAmount: i.totalAmount * 0.1,
				gstPercent: 10,
				tdsPercentage: 0,
				tdsAmount: 0,
				totalAmount: i.totalAmount,
				amountPaid: i.paidAmount || 0,
				status: i.status as "pending" | "paid" | "overdue" | "cancelled",
				pdfUrl: undefined,
				notes: undefined,
				createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
			})),
			invoices.length,
			skip,
			take
		)
	}),

	// POST /invoices - Create invoice
	http.post(encoreUrl("/invoices"), async ({ request }) => {
		const auth = getAuthContext()
		const body = (await request.json()) as {
			organizationId?: string
			totalAmount: number
			dueDate?: string
			notes?: string
		}

		if (!body.totalAmount || body.totalAmount <= 0) {
			return encoreErrorResponse("totalAmount must be greater than 0", 400)
		}

		const now = new Date().toISOString()
		const dueDate = body.dueDate
			? new Date(body.dueDate).toISOString()
			: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

		const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

		const newInvoice = {
			id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			organizationId: body.organizationId || auth.organizationId || "1",
			invoiceNumber,
			totalAmount: body.totalAmount,
			paidAmount: 0,
			dueDate,
			status: "pending" as const,
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.invoices.create(newInvoice)

		return encoreResponse({
			id: newInvoice.id,
			organizationId: newInvoice.organizationId,
			invoiceNumber: newInvoice.invoiceNumber,
			issuedAt: newInvoice.createdAt,
			dueDate: newInvoice.dueDate,
			periodStart: undefined,
			periodEnd: undefined,
			subtotal: newInvoice.totalAmount * 0.9,
			gstAmount: newInvoice.totalAmount * 0.1,
			gstPercent: 10,
			tdsPercentage: 0,
			tdsAmount: 0,
			totalAmount: newInvoice.totalAmount,
			amountPaid: 0,
			status: "pending" as const,
			pdfUrl: undefined,
			notes: body.notes,
			createdAt: newInvoice.createdAt,
		})
	}),

	// PUT /invoices/:id - Update invoice
	http.put(encoreUrl("/invoices/:id"), async ({ params, request }) => {
		const auth = getAuthContext()
		const { id } = params
		const invoiceId = Array.isArray(id) ? id[0] : id
		if (!invoiceId) {
			return encoreNotFoundResponse("Invoice")
		}
		const body = (await request.json()) as {
			totalAmount?: number
			paidAmount?: number
			dueDate?: string
			status?: "pending" | "paid" | "overdue" | "cancelled"
			notes?: string
		}

		const invoice = db.invoices.findFirst((q) =>
			q.where({ id: invoiceId as string, organizationId: auth.organizationId || "1" })
		)
		if (!invoice) {
			return encoreNotFoundResponse("Invoice")
		}

		// Update invoice in database - use findFirst + manual update pattern
		const updated = { ...invoice, ...body, updatedAt: new Date().toISOString() }
		db.invoices.delete((q) => q.where({ id: invoiceId as string }))
		db.invoices.create(updated)

		return encoreResponse({
			id: updated.id,
			organizationId: updated.organizationId,
			invoiceNumber: updated.invoiceNumber,
			issuedAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
			dueDate: updated.dueDate instanceof Date ? updated.dueDate.toISOString() : updated.dueDate,
			periodStart: undefined,
			periodEnd: undefined,
			subtotal: updated.totalAmount * 0.9,
			gstAmount: updated.totalAmount * 0.1,
			gstPercent: 10,
			tdsPercentage: 0,
			tdsAmount: 0,
			totalAmount: updated.totalAmount,
			amountPaid: updated.paidAmount || 0,
			status: (updated.status || "pending") as "pending" | "paid" | "overdue" | "cancelled",
			pdfUrl: undefined,
			notes: body.notes,
			createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
		})
	}),

	// PATCH /invoices/:id - Partial update invoice
	http.patch(encoreUrl("/invoices/:id"), async ({ params, request }) => {
		const auth = getAuthContext()
		const { id } = params
		const invoiceId = Array.isArray(id) ? id[0] : id
		if (!invoiceId) {
			return encoreNotFoundResponse("Invoice")
		}
		const body = (await request.json()) as Record<string, unknown>

		const invoice = db.invoices.findFirst((q) =>
			q.where({ id: invoiceId as string, organizationId: auth.organizationId || "1" })
		)
		if (!invoice) {
			return encoreNotFoundResponse("Invoice")
		}

		// Update invoice in database - use findFirst + manual update pattern
		const updated = { ...invoice, ...body, updatedAt: new Date().toISOString() }
		db.invoices.delete((q) => q.where({ id: invoiceId as string }))
		db.invoices.create(updated)

		return encoreResponse({
			id: updated.id,
			organizationId: updated.organizationId,
			invoiceNumber: updated.invoiceNumber,
			issuedAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
			dueDate: updated.dueDate instanceof Date ? updated.dueDate.toISOString() : updated.dueDate,
			periodStart: undefined,
			periodEnd: undefined,
			subtotal: updated.totalAmount * 0.9,
			gstAmount: updated.totalAmount * 0.1,
			gstPercent: 10,
			tdsPercentage: 0,
			tdsAmount: 0,
			totalAmount: updated.totalAmount,
			amountPaid: updated.paidAmount || 0,
			status: (updated.status || "pending") as "pending" | "paid" | "overdue" | "cancelled",
			pdfUrl: undefined,
			notes: undefined,
			createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
		})
	}),

	// DELETE /invoices/:id - Delete invoice
	http.delete(encoreUrl("/invoices/:id"), async ({ params }) => {
		const auth = getAuthContext()
		const { id } = params
		const invoiceId = Array.isArray(id) ? id[0] : id
		if (!invoiceId) {
			return encoreNotFoundResponse("Invoice")
		}

		const invoice = db.invoices.findFirst((q) =>
			q.where({ id: invoiceId as string, organizationId: auth.organizationId || "1" })
		)
		if (!invoice) {
			return encoreNotFoundResponse("Invoice")
		}

		// Cannot delete paid invoices
		if (invoice.status === "paid") {
			return encoreErrorResponse("Cannot delete paid invoice", 400)
		}

		// Delete invoice from database
		db.invoices.delete((q) => q.where({ id: invoiceId as string }))

		return encoreResponse({ deleted: true })
	}),
]

