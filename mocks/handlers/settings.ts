/**
 * Settings API Mock Handlers
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import { getAuthContext, encoreUrl, encoreResponse, encoreErrorResponse } from "./utils"

export const settingsHandlers = [
	// GET /organizations/:orgId/settings
	http.get(encoreUrl("/organizations/:orgId/settings"), async ({ params }) => {
		const { orgId } = params as { orgId: string }
		const settings = db.organizationSettings.findFirst((q) =>
			q.where({ organizationId: orgId || "1" })
		)
		if (!settings) return encoreErrorResponse("Settings not found", 404)
		return encoreResponse(settings)
	}),

	// PUT /organizations/:orgId/settings
	http.put(encoreUrl("/organizations/:orgId/settings"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as Record<string, unknown>
		const settings = db.organizationSettings.findFirst((q) =>
			q.where({ organizationId: orgId || "1" })
		)
		if (!settings) return encoreErrorResponse("Settings not found", 404)
		return encoreResponse({ ...(settings as Record<string, unknown>), ...(body as Record<string, unknown>) })
	}),

	// GET /organizations/:orgId/bank-accounts
	http.get(encoreUrl("/organizations/:orgId/bank-accounts"), async ({ params }) => {
		const { orgId } = params as { orgId: string }
		const accounts = db.bankAccounts.findMany((q) => q.where({ organizationId: orgId || "1" }))
		return encoreResponse({ accounts })
	}),

	// POST /organizations/:orgId/bank-accounts
	http.post(encoreUrl("/organizations/:orgId/bank-accounts"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as {
			accountNumber: string
			ifscCode: string
			accountName: string
			bankName?: string
			branch?: string
		}

		if (!body.accountNumber || !body.ifscCode || !body.accountName) {
			return encoreErrorResponse("Account number, IFSC code, and account name are required", 400)
		}

		const now = new Date().toISOString()
		const newBankAccount = {
			id: `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			organizationId: orgId || "1",
			accountName: body.accountName,
			accountNumber: body.accountNumber,
			ifscCode: body.ifscCode,
			bankName: body.bankName || "Unknown Bank",
			branch: body.branch || "Unknown Branch",
			isPrimary: false,
		}

		// Save to database
		db.bankAccounts.create(newBankAccount)

		return encoreResponse(newBankAccount)
	}),

	// PUT /organizations/:orgId/bank-accounts/:id - Update bank account
	http.put(encoreUrl("/organizations/:orgId/bank-accounts/:id"), async ({ params, request }) => {
		const { orgId, id } = params as { orgId: string; id: string }
		const body = (await request.json()) as {
			accountName?: string
			accountNumber?: string
			ifscCode?: string
			bankName?: string
			branch?: string
			isPrimary?: boolean
		}

		const bankAccount = db.bankAccounts.findFirst((q) =>
			q.where({ id: id, organizationId: orgId || "1" })
		)
		if (!bankAccount) {
			return encoreErrorResponse("Bank account not found", 404)
		}

		// Update bank account in database - use findFirst + manual update pattern
		const updated = { ...bankAccount, ...body }
		db.bankAccounts.delete((q) => q.where({ id: id }))
		db.bankAccounts.create(updated)

		return encoreResponse(updated)
	}),

	// PATCH /organizations/:orgId/bank-accounts/:id - Partial update bank account
	http.patch(encoreUrl("/organizations/:orgId/bank-accounts/:id"), async ({ params, request }) => {
		const { orgId, id } = params as { orgId: string; id: string }
		const body = (await request.json()) as Record<string, unknown>

		const bankAccount = db.bankAccounts.findFirst((q) =>
			q.where({ id: id, organizationId: orgId || "1" })
		)
		if (!bankAccount) {
			return encoreErrorResponse("Bank account not found", 404)
		}

		// Update bank account in database - use findFirst + manual update pattern
		const updated = { ...bankAccount, ...body }
		db.bankAccounts.delete((q) => q.where({ id: id }))
		db.bankAccounts.create(updated)

		return encoreResponse(updated)
	}),

	// DELETE /organizations/:orgId/bank-accounts/:id - Delete bank account
	http.delete(encoreUrl("/organizations/:orgId/bank-accounts/:id"), async ({ params }) => {
		const { orgId, id } = params as { orgId: string; id: string }

		const bankAccount = db.bankAccounts.findFirst((q) =>
			q.where({ id: id, organizationId: orgId || "1" })
		)
		if (!bankAccount) {
			return encoreErrorResponse("Bank account not found", 404)
		}

		// Cannot delete primary bank account
		if (bankAccount.isPrimary) {
			return encoreErrorResponse("Cannot delete primary bank account", 400)
		}

		// Delete bank account from database
		db.bankAccounts.delete((q) => q.where({ id: id }))

		return encoreResponse({ deleted: true })
	}),

	// GET /organizations/:orgId/gst
	http.get(encoreUrl("/organizations/:orgId/gst"), async ({ params }) => {
		const { orgId } = params as { orgId: string }
		const gst = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || "1" }))
		if (!gst) return encoreErrorResponse("GST details not found", 404)
		return encoreResponse({
			...gst,
			registrationDate: new Date().toISOString(), // Not in schema, use current time
		})
	}),

	// PUT /organizations/:orgId/gst
	http.put(encoreUrl("/organizations/:orgId/gst"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as Record<string, unknown>
		const gst = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || "1" }))
		if (!gst) return encoreErrorResponse("GST details not found", 404)

		// Update GST details in database - use findFirst + manual update pattern
		const updated = { ...(gst as Record<string, unknown>), ...body }
		db.gstDetails.delete((q) => q.where({ organizationId: orgId || "1" }))
		db.gstDetails.create(updated as typeof gst)

		return encoreResponse({
			...updated,
			registrationDate: new Date().toISOString(), // Not in schema, use current time
		})
	}),

	// POST /organizations/:orgId/gst - Create GST details
	http.post(encoreUrl("/organizations/:orgId/gst"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as {
			gstNumber: string
			legalName?: string
			tradeName?: string
			address?: string
		}

		if (!body.gstNumber) {
			return encoreErrorResponse("GST number is required", 400)
		}

		// Check if GST already exists
		const existing = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || "1" }))
		if (existing) {
			return encoreErrorResponse("GST details already exist for this organization", 400)
		}

		const newGstDetails = {
			organizationId: orgId || "1",
			gstNumber: body.gstNumber,
			legalName: body.legalName || "",
			tradeName: body.tradeName || "",
			address: body.address || "",
			gstStatus: "pending", // Required by schema
		}

		// Save to database
		db.gstDetails.create(newGstDetails)

		return encoreResponse({
			...newGstDetails,
			registrationDate: new Date().toISOString(), // Not in schema, use current time
		})
	}),

	// DELETE /organizations/:orgId/gst - Delete GST details
	http.delete(encoreUrl("/organizations/:orgId/gst"), async ({ params }) => {
		const { orgId } = params as { orgId: string }

		const gst = db.gstDetails.findFirst((q) => q.where({ organizationId: orgId || "1" }))
		if (!gst) {
			return encoreErrorResponse("GST details not found", 404)
		}

		// Delete GST details from database
		db.gstDetails.delete((q) => q.where({ organizationId: orgId || "1" }))

		return encoreResponse({ deleted: true })
	}),
]

