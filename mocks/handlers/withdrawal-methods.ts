/**
 * Withdrawal Methods API Mock Handlers
 *
 * Intercepts Encore API calls for withdrawal methods (bank, UPI, wallet)
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreErrorResponse,
	encoreNotFoundResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const withdrawalMethodsHandlers = [
	// GET /withdrawal-methods - List withdrawal methods
	http.get(encoreUrl("/withdrawal-methods"), async ({ request }) => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const url = new URL(request.url)
		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		// For organizations, we might not have shopperId, so get all methods
		// In real app, this would be filtered by organization
		const methods = db.withdrawalMethods.findMany()

		// Sort by createdAt descending
		methods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		const total = methods.length
		const paginatedMethods = methods.slice(skip, skip + take)

		return encoreListResponse(paginatedMethods, total, skip, take)
	}),

	// GET /withdrawal-methods/:id - Get withdrawal method by ID
	http.get(encoreUrl("/withdrawal-methods/:id"), async ({ params }) => {
		await delay(DELAY.FAST)

		const { id } = params
		const methodId = Array.isArray(id) ? id[0] : id

		if (!methodId) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		const method = db.withdrawalMethods.findFirst((q) => q.where({ id: methodId as string }))

		if (!method) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		return encoreResponse(method)
	}),

	// POST /withdrawal-methods - Create withdrawal method
	http.post(encoreUrl("/withdrawal-methods"), async ({ request }) => {
		await delay(DELAY.MEDIUM)

		const auth = getAuthContext()
		const body = (await request.json()) as {
			accountType: "bank" | "upi" | "wallet"
			accountHolderName?: string
			accountNumber?: string
			bankName?: string
			ifscCode?: string
			upiId?: string
			walletProvider?: string
			walletAddress?: string
			isDefault?: boolean
		}

		if (!body.accountType) {
			return encoreErrorResponse("accountType is required", 400)
		}

		// Validate based on account type
		if (body.accountType === "bank") {
			if (!body.accountNumber || !body.ifscCode || !body.bankName) {
				return encoreErrorResponse("accountNumber, ifscCode, and bankName are required for bank accounts", 400)
			}
		} else if (body.accountType === "upi") {
			if (!body.upiId) {
				return encoreErrorResponse("upiId is required for UPI accounts", 400)
			}
		} else if (body.accountType === "wallet") {
			if (!body.walletProvider || !body.walletAddress) {
				return encoreErrorResponse("walletProvider and walletAddress are required for wallet accounts", 400)
			}
		}

		const now = new Date().toISOString()
		const newMethod = {
			id: `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			shopperId: auth.userId || `shopper-${Date.now()}`,
			accountType: body.accountType,
			accountHolderName: body.accountHolderName,
			accountNumber: body.accountNumber,
			bankName: body.bankName,
			ifscCode: body.ifscCode,
			upiId: body.upiId,
			walletProvider: body.walletProvider,
			walletAddress: body.walletAddress,
			isVerified: false,
			verificationMethod: undefined,
			verifiedAt: undefined,
			verificationDetails: undefined,
			isDefault: body.isDefault ?? false,
			createdAt: now,
			updatedAt: now,
		}

		// If this is set as default, unset other defaults
		if (newMethod.isDefault) {
			const existingDefaults = db.withdrawalMethods.findMany((q) =>
				q.where({ shopperId: newMethod.shopperId })
			)
			for (const method of existingDefaults) {
				if (method.isDefault) {
					db.withdrawalMethods.update({
						where: { id: method.id },
						data: { isDefault: false },
					})
				}
			}
		}

		// Save to database
		db.withdrawalMethods.create(newMethod)

		return encoreResponse(newMethod)
	}),

	// PUT /withdrawal-methods/:id - Update withdrawal method
	http.put(encoreUrl("/withdrawal-methods/:id"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const { id } = params
		const methodId = Array.isArray(id) ? id[0] : id

		if (!methodId) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		const body = (await request.json()) as {
			accountHolderName?: string
			accountNumber?: string
			bankName?: string
			ifscCode?: string
			upiId?: string
			walletProvider?: string
			walletAddress?: string
			isDefault?: boolean
		}

		const method = db.withdrawalMethods.findFirst((q) => q.where({ id: methodId as string }))

		if (!method) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		// If setting as default, unset other defaults
		if (body.isDefault === true) {
			const existingDefaults = db.withdrawalMethods.findMany((q) =>
				q.where({ shopperId: method.shopperId })
			)
			for (const existing of existingDefaults) {
				if (existing.id !== methodId && existing.isDefault) {
					db.withdrawalMethods.update({
						where: { id: existing.id },
						data: { isDefault: false },
					})
				}
			}
		}

		// Update method in database
		const updated = db.withdrawalMethods.update({
			where: { id: methodId as string },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// PATCH /withdrawal-methods/:id - Partial update withdrawal method
	http.patch(encoreUrl("/withdrawal-methods/:id"), async ({ params, request }) => {
		await delay(DELAY.MEDIUM)

		const { id } = params
		const methodId = Array.isArray(id) ? id[0] : id

		if (!methodId) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		const body = (await request.json()) as Record<string, unknown>

		const method = db.withdrawalMethods.findFirst((q) => q.where({ id: methodId as string }))

		if (!method) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		// If setting as default, unset other defaults
		if (body.isDefault === true) {
			const existingDefaults = db.withdrawalMethods.findMany((q) =>
				q.where({ shopperId: method.shopperId })
			)
			for (const existing of existingDefaults) {
				if (existing.id !== methodId && existing.isDefault) {
					db.withdrawalMethods.update({
						where: { id: existing.id },
						data: { isDefault: false },
					})
				}
			}
		}

		// Update method in database
		const updated = db.withdrawalMethods.update({
			where: { id: methodId as string },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// DELETE /withdrawal-methods/:id - Delete withdrawal method
	http.delete(encoreUrl("/withdrawal-methods/:id"), async ({ params }) => {
		await delay(DELAY.MEDIUM)

		const { id } = params
		const methodId = Array.isArray(id) ? id[0] : id

		if (!methodId) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		const method = db.withdrawalMethods.findFirst((q) => q.where({ id: methodId as string }))

		if (!method) {
			return encoreNotFoundResponse("WithdrawalMethod")
		}

		// Check if method is used in any withdrawals
		const withdrawals = db.withdrawals.findMany((q) =>
			q.where({ withdrawalMethodId: methodId as string })
		)
		if (withdrawals.length > 0) {
			return encoreErrorResponse("Cannot delete withdrawal method used in withdrawals", 400)
		}

		// Delete method from database
		db.withdrawalMethods.delete({ where: { id: methodId as string } })

		return encoreResponse({ deleted: true })
	}),
]
