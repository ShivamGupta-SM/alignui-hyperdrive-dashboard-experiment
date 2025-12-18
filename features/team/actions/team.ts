"use server"

/**
 * Team Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidateTag } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"

// =============================================================================
// Schemas
// =============================================================================

const inviteMemberSchema = z.object({
	organizationId: z.string().min(1),
	email: z.string().email(),
	role: z.string().min(1),
})

const removeMemberSchema = z.object({
	organizationId: z.string().min(1),
	memberId: z.string().min(1),
})

const cancelInvitationSchema = z.object({
	organizationId: z.string().min(1),
	invitationId: z.string().min(1),
})

const updateRoleSchema = z.object({
	organizationId: z.string().min(1),
	memberId: z.string().min(1),
	role: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Invite team member
 */
export const inviteMember = authAction
	.inputSchema(inviteMemberSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, email, role } = parsedInput

		// Map frontend roles to Better Auth roles
		const authRole = role === "manager" || role === "viewer" ? "member" : (role as "owner" | "admin" | "member")

		const result = await ctx.client.auth.inviteMemberAuth({
			organizationId,
			email,
			role: authRole,
		})

		revalidateTag("team")
		return { invitationId: result.invitation.id }
	})

/**
 * Remove team member
 */
export const removeMember = authAction
	.inputSchema(removeMemberSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, memberId } = parsedInput
		await ctx.client.organizations.removeMember(organizationId, memberId)
		revalidateTag("team")
		return { success: true }
	})

/**
 * Cancel invitation
 */
export const cancelInvitation = authAction
	.inputSchema(cancelInvitationSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.auth.cancelInvitation({ invitationId: parsedInput.invitationId })
		revalidateTag("team")
		return { success: true }
	})

/**
 * Update member role
 */
export const updateMemberRole = authAction
	.inputSchema(updateRoleSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, memberId, role } = parsedInput
		const authRole = role === "manager" || role === "viewer" ? "member" : (role as "owner" | "admin" | "member")

		await ctx.client.auth.updateMemberRole({
			organizationId,
			memberId,
			role: authRole,
		})

		revalidateTag("team")
		return { success: true }
	})
