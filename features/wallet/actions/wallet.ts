/**
 * Wallet Server Actions
 * 
 * @description
 * Server-side actions for wallet operations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { getOrganizationIdOrNull } from "@/lib/ssr-data"
import type { Result } from "@/shared/lib/errors/types"
import { withdrawalBodySchema, creditRequestBodySchema } from "@/lib/utils/validations"
import type { Withdrawal } from "../types"

/**
 * Request withdrawal
 * 
 * @description
 * Creates a withdrawal request.
 * 
 * @param data - Withdrawal data
 * @returns Result with withdrawal ID or error
 */
export async function requestWithdrawal(data: unknown): Promise<Result<{ withdrawalId: string }>> {
	const validation = withdrawalBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: new Error(validation.error.issues[0]?.message || "Invalid input"),
		}
	}

	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	try {
		const result = await client.wallets.createOrganizationWithdrawal(orgId, {
			amount: validation.data.amount,
			notes: validation.data.notes,
		})

		revalidatePath("/dashboard/wallet")
		return {
			success: true,
			data: { withdrawalId: result.id },
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Request credit increase
 * 
 * @description
 * Submits a credit increase request.
 * 
 * @param data - Credit request data
 * @returns Result indicating success or error
 */
export async function requestCredit(data: unknown): Promise<Result<{ requestId: string }>> {
	const validation = creditRequestBodySchema.safeParse(data)
	if (!validation.success) {
		return {
			success: false,
			error: new Error(validation.error.issues[0]?.message || "Invalid input"),
		}
	}

	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	try {
		await client.organizations.requestCreditIncrease(orgId, {
			requestedAmount: validation.data.amount,
			reason: validation.data.reason,
		})

		revalidatePath("/dashboard/wallet")
		return {
			success: true,
			data: { requestId: "submitted" },
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}
