"use server"

/**
 * Organization Approval Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const organizationIdSchema = z.object({
	organizationId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Submit organization for approval
 */
export const submitOrganizationForApproval = authAction
	.inputSchema(organizationIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.organizations.submitOrganizationForApproval(parsedInput.organizationId)

		revalidatePath("/onboarding")
		revalidatePath("/dashboard")

		return {
			success: true,
			message: "Organization submitted for approval.",
		}
	})

/**
 * Resubmit organization for approval (after rejection)
 * Resets organization status from rejected to draft
 */
export const resubmitOrganizationForApproval = authAction
	.inputSchema(organizationIdSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.organizations.resubmitOrganizationForApproval(parsedInput.organizationId)

		revalidatePath("/onboarding")
		revalidatePath("/dashboard")

		return {
			success: true,
			message: result.message || "Organization reset to draft. You can now edit and resubmit for approval.",
		}
	})
