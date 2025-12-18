"use server"

/**
 * Organizations Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const createOrgSchema = z.object({
	name: z.string().min(1),
})

const switchOrgSchema = z.object({
	organizationId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Create basic organization
 *
 * Creates a new organization with name only.
 * Advanced details can be added later in settings.
 */
export const createBasicOrganization = authAction
	.inputSchema(createOrgSchema)
	.action(async ({ parsedInput, ctx }) => {
		const result = await ctx.client.organizations.createOrganization({ name: parsedInput.name })

		if (!result?.id) {
			throw new Error("Failed to create organization")
		}

		revalidatePath("/dashboard")
		revalidatePath("/onboarding")

		return result
	})

/**
 * Switch active organization
 *
 * Updates the active organization in the session.
 */
export const switchOrganization = authAction
	.inputSchema(switchOrgSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.auth.setActiveOrganization({ organizationId: parsedInput.organizationId })

		revalidatePath("/", "layout")
		revalidatePath("/dashboard")

		return { success: true }
	})
