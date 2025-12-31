"use server"

/**
 * Wallet Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 * URL-based multi-tenancy: organizationId from URL params passed to all actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas - All actions require organizationId for URL-based multi-tenancy
// =============================================================================

const withdrawalSchema = z.object({
	organizationId: z.string().min(1),
	amount: z.number().positive(),
	notes: z.string().optional(),
})

const creditRequestSchema = z.object({
	organizationId: z.string().min(1),
	amount: z.number().positive(),
	reason: z.string().optional(),
})

// =============================================================================
// Actions - Use organization-scoped endpoints for multi-tenancy
// =============================================================================

/**
 * Request withdrawal
 */
export const requestWithdrawal = authAction
	.inputSchema(withdrawalSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, amount, notes } = parsedInput

		const result = await ctx.client.organizations.createOrganizationWithdrawal(organizationId, {
			amount,
			notes,
		})

		revalidateTag("wallet")
		revalidateTag("withdrawals")
		// Also revalidate dashboard since wallet balance affects dashboard stats
		revalidateTag("dashboard")

		return { withdrawalId: result.id, success: true }
	})

/**
 * Request credit increase
 */
export const requestCredit = authAction
	.inputSchema(creditRequestSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, amount, reason } = parsedInput

		const result = await ctx.client.organizations.requestCreditIncrease(organizationId, {
			requestedAmount: amount,
			reason,
		})

		revalidateTag("wallet")
		return { requestId: result.requestId, success: result.success }
	})
