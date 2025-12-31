"use server"

/**
 * Organization Approval Server Actions
 *
 * NOTE: submitOrganizationForApproval removed - completeOnboarding handles submit automatically
 * Only resubmitOrganizationForApproval remains for rejected orgs to reset to draft
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
 * Resubmit organization for approval (after rejection)
 * Resets organization status from rejected to draft so user can edit and resubmit
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
