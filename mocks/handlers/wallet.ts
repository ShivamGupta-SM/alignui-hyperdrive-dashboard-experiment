/**
 * Wallet API Mock Handlers - Type-Safe, DB Only
 *
 * Uses MSW Data database - NO lib/mocks
 */

import { http } from "msw"
import { db } from "@/mocks/db"
import {
	getAuthContext,
	encoreUrl,
	encoreResponse,
	encoreListResponse,
	encoreErrorResponse,
} from "./utils"
import { delay, DELAY } from "@/mocks/utils/delay"

export const walletHandlers = [
	// GET /organizations/:orgId/wallet - Get wallet balance
	http.get(encoreUrl("/organizations/:orgId/wallet"), async ({ params }) => {
		const rawOrgId = params.orgId as string
		const orgId = rawOrgId === "default" || !rawOrgId ? "1" : rawOrgId

		const wallet =
			db.walletBalances.findFirst((q) => q.where({ organizationId: orgId })) ||
			db.walletBalances.findFirst((q) => q.where({ organizationId: "1" }))

		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		// Return full Wallet type as expected by Encore client
		return encoreResponse({
			id: `wallet-${orgId}`,
			holderId: orgId,
			holderType: "organization" as const,
			currency: "INR",
			balance: wallet.availableBalance + wallet.heldAmount,
			pendingBalance: wallet.heldAmount,
			availableBalance: wallet.availableBalance,
			creditLimit: wallet.creditLimit,
			creditUtilized: wallet.creditUtilized,
			createdAt: new Date().toISOString(),
		})
	}),

	// GET /wallets/me - Encore client uses this
	http.get(encoreUrl("/wallets/me"), async () => {
		const auth = getAuthContext()
		const orgId = auth.organizationId || "1"

		const wallet =
			db.walletBalances.findFirst((q) => q.where({ organizationId: orgId })) ||
			db.walletBalances.findFirst((q) => q.where({ organizationId: "1" }))

		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		return encoreResponse({
			id: `wallet-${orgId}`,
			holderId: orgId,
			holderType: "organization" as const,
			currency: "INR",
			balance: wallet.availableBalance + wallet.heldAmount,
			pendingBalance: wallet.heldAmount,
			availableBalance: wallet.availableBalance,
			creditLimit: wallet.creditLimit,
			creditUtilized: wallet.creditUtilized,
			createdAt: new Date().toISOString(),
		})
	}),

	// GET /wallets/me/transactions
	http.get(encoreUrl("/wallets/me/transactions"), async ({ request }) => {
		const auth = getAuthContext()
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const transactions = db.transactions.findMany((q) =>
			q.where({ organizationId: auth.organizationId })
		)
		const total = transactions.length
		const paginatedTransactions = transactions.slice(skip, skip + take)

		return encoreListResponse(
			paginatedTransactions.map((t) => ({
				...t,
				createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
			})),
			total,
			skip,
			take
		)
	}),

	// GET /organizations/:orgId/wallet/transactions
	http.get(encoreUrl("/organizations/:orgId/wallet/transactions"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const transactions = db.transactions.findMany((q) => q.where({ organizationId: orgId }))
		const total = transactions.length
		const paginatedTransactions = transactions.slice(skip, skip + take)

		return encoreListResponse(
			paginatedTransactions.map((t) => ({
				...t,
				createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
			})),
			total,
			skip,
			take
		)
	}),

	// GET /organizations/:orgId/wallet/holds
	http.get(encoreUrl("/organizations/:orgId/wallet/holds"), async ({ params }) => {
		const { orgId } = params as { orgId: string }
		const holds = db.activeHolds.findMany((q) => q.where({ walletId: `wallet-${orgId}` }))

		return encoreResponse({
			holds: holds.map((h) => ({
				...h,
				createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : h.createdAt,
			})),
		})
	}),

	// POST /organizations/:orgId/wallet/top-up
	http.post(encoreUrl("/organizations/:orgId/wallet/top-up"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as { amount: number }

		const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		const newBalance = wallet.availableBalance + body.amount

		return encoreResponse({
			success: true,
			newBalance,
			transactionId: `txn-${Date.now()}`,
		})
	}),

	// POST /organizations/:orgId/wallet/withdraw
	http.post(encoreUrl("/organizations/:orgId/wallet/withdraw"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const body = (await request.json()) as { amount: number; notes?: string }

		const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		if (body.amount > wallet.availableBalance) {
			return encoreErrorResponse("Insufficient balance")
		}

		return encoreResponse({
			id: `wd-${Date.now()}`,
			amount: body.amount,
			status: "pending",
			createdAt: new Date().toISOString(),
		})
	}),

	// GET /organizations/:orgId/withdrawals
	http.get(encoreUrl("/organizations/:orgId/withdrawals"), async ({ params, request }) => {
		const { orgId } = params as { orgId: string }
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		// Get withdrawals from database
		let withdrawals = db.withdrawals.findMany((q) =>
			q.where({ organizationId: orgId as string })
		)

		// Sort by requestedAt descending
		withdrawals.sort(
			(a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
		)

		const total = withdrawals.length
		const paginatedWithdrawals = withdrawals.slice(skip, skip + take)

		return encoreListResponse(paginatedWithdrawals, total, skip, take)
	}),

	// GET /withdrawals/:id
	http.get(encoreUrl("/withdrawals/:id"), async ({ params }) => {
		const { id } = params as { id: string }

		const withdrawal = db.withdrawals.findFirst((q) => q.where({ id: id as string }))

		if (!withdrawal) {
			return encoreNotFoundResponse("Withdrawal")
		}

		return encoreResponse(withdrawal)
	}),

	// GET /withdrawals/stats
	http.get(encoreUrl("/withdrawals/stats"), async () => {
		return encoreResponse({
			totalWithdrawn: 250000,
			pendingWithdrawals: 25000,
			thisMonthWithdrawn: 75000,
			lastWithdrawalDate: new Date().toISOString(),
			totalCount: 10,
			totalAmount: 275000,
			pendingApprovalCount: 2,
			countByStatus: { completed: 8, pending: 2 },
		})
	}),

	// POST /withdrawals/:id/cancel
	http.post(encoreUrl("/withdrawals/:id/cancel"), async ({ params }) => {
		const { id } = params as { id: string }

		const withdrawal = db.withdrawals.findFirst((q) => q.where({ id: id as string }))
		if (!withdrawal) {
			return encoreNotFoundResponse("Withdrawal")
		}

		// Only pending withdrawals can be cancelled
		if (withdrawal.status !== "pending") {
			return encoreErrorResponse("Only pending withdrawals can be cancelled", 400)
		}

		// Update withdrawal status
		const updated = db.withdrawals.update({
			where: { id: id as string },
			data: {
				status: "cancelled",
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// POST /withdrawals - Create withdrawal
	http.post(encoreUrl("/withdrawals"), async ({ request }) => {
		const auth = getAuthContext()
		const body = (await request.json()) as {
			amount: number
			withdrawalMethodId?: string
			bankAccountId?: string
			notes?: string
		}

		if (!body.amount || body.amount <= 0) {
			return encoreErrorResponse("amount must be greater than 0", 400)
		}

		const orgId = auth.organizationId || "1"

		// Check wallet balance
		const wallet = db.walletBalances.findFirst((q) => q.where({ organizationId: orgId }))
		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		if (body.amount > wallet.availableBalance) {
			return encoreErrorResponse("Insufficient balance", 400)
		}

		const now = new Date().toISOString()
		const newWithdrawal = {
			id: `wd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			holderType: "organization" as const,
			holderId: orgId,
			organizationId: orgId,
			shopperId: undefined,
			amount: body.amount,
			status: "pending" as const,
			requestedAt: now,
			processedAt: undefined,
			requiresApproval: body.amount > 10000, // Require approval for large amounts
			approvedBy: undefined,
			approvedAt: undefined,
			rejectionReason: undefined,
			rejectedBy: undefined,
			withdrawalMethodId: body.withdrawalMethodId,
			bankAccountId: body.bankAccountId,
			notes: body.notes,
			createdAt: now,
			updatedAt: now,
		}

		// Save to database
		db.withdrawals.create(newWithdrawal)

		// Update wallet balance (hold the amount)
		db.walletBalances.update({
			where: { organizationId: orgId },
			data: {
				availableBalance: wallet.availableBalance - body.amount,
				heldAmount: wallet.heldAmount + body.amount,
				updatedAt: now,
			},
		})

		return encoreResponse(newWithdrawal)
	}),

	// PUT /withdrawals/:id - Update withdrawal
	http.put(encoreUrl("/withdrawals/:id"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as {
			status?: "pending" | "processing" | "completed" | "failed" | "cancelled" | "rejected"
			notes?: string
		}

		const withdrawal = db.withdrawals.findFirst((q) => q.where({ id: id as string }))
		if (!withdrawal) {
			return encoreNotFoundResponse("Withdrawal")
		}

		// Update withdrawal in database
		const updated = db.withdrawals.update({
			where: { id: id as string },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// PATCH /withdrawals/:id - Partial update withdrawal
	http.patch(encoreUrl("/withdrawals/:id"), async ({ params, request }) => {
		const { id } = params as { id: string }
		const body = (await request.json()) as Record<string, unknown>

		const withdrawal = db.withdrawals.findFirst((q) => q.where({ id: id as string }))
		if (!withdrawal) {
			return encoreNotFoundResponse("Withdrawal")
		}

		// Update withdrawal in database
		const updated = db.withdrawals.update({
			where: { id: id as string },
			data: {
				...body,
				updatedAt: new Date().toISOString(),
			},
		})

		return encoreResponse(updated)
	}),

	// GET /wallet/balance (legacy)
	http.get(encoreUrl("/wallet/balance"), async () => {
		await delay(DELAY.FAST)

		const auth = getAuthContext()
		const wallet =
			db.walletBalances.findFirst((q) => q.where({ organizationId: auth.organizationId })) ||
			db.walletBalances.findFirst((q) => q.where({ organizationId: "1" }))

		if (!wallet) {
			return encoreErrorResponse("Wallet not found", 404)
		}

		return encoreResponse({
			availableBalance: wallet.availableBalance,
			heldAmount: wallet.heldAmount,
			creditLimit: wallet.creditLimit,
			creditUtilized: wallet.creditUtilized,
		})
	}),

	// GET /wallet/transactions (legacy)
	http.get(encoreUrl("/wallet/transactions"), async ({ request }) => {
		const auth = getAuthContext()
		const url = new URL(request.url)

		const skip = Number.parseInt(url.searchParams.get("skip") || "0", 10)
		const take = Number.parseInt(url.searchParams.get("take") || "20", 10)

		const transactions = db.transactions.findMany((q) =>
			q.where({ organizationId: auth.organizationId })
		)
		const total = transactions.length
		const paginatedTransactions = transactions.slice(skip, skip + take)

		return encoreListResponse(
			paginatedTransactions.map((t) => ({
				...t,
				createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
			})),
			total,
			skip,
			take
		)
	}),
]

