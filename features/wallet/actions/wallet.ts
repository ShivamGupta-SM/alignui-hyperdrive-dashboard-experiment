"use server"

/**
 * Wallet Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const withdrawalSchema = z.object({
	organizationId: z.string().min(1),
	amount: z.number().positive(),
	notes: z.string().optional(),
})

const cancelWithdrawalSchema = z.object({
	withdrawalId: z.string().min(1),
})

const creditRequestSchema = z.object({
	organizationId: z.string().min(1),
	amount: z.number().positive(),
	reason: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Request withdrawal
 */
export const requestWithdrawal = authAction
	.inputSchema(withdrawalSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, amount, notes } = parsedInput

		const result = await ctx.client.wallets.createOrganizationWithdrawal(organizationId, {
			amount,
			notes,
		})

		revalidateTag("wallet")
		revalidateTag("withdrawals")

		return { withdrawalId: result.id }
	})

/**
 * Cancel withdrawal
 */
export const cancelWithdrawal = authAction
	.inputSchema(cancelWithdrawalSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.wallets.cancelWithdrawal(parsedInput.withdrawalId)
		revalidateTag("wallet")
		revalidateTag("withdrawals")
		return { success: true }
	})

/**
 * Request credit increase
 */
export const requestCredit = authAction
	.inputSchema(creditRequestSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, amount, reason } = parsedInput

		await ctx.client.organizations.requestCreditIncrease(organizationId, {
			requestedAmount: amount,
			reason,
		})

		revalidateTag("wallet")
		return { requestId: "submitted" }
	})
