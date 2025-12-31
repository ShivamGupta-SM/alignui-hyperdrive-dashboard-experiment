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
// Role Mapping
// =============================================================================

/**
 * Better Auth's invite/updateMemberRole API only accepts these base roles
 * Custom roles (campaignManager, financeManager, productManager) are defined
 * in backend access-control.ts but API only accepts owner/admin/member
 */
type AuthRole = "owner" | "admin" | "member"

/**
 * Map frontend role names to Better Auth API-compatible roles
 * Custom roles are mapped to their closest base role
 */
function mapToAuthRole(role: string): AuthRole {
	const roleMap: Record<string, AuthRole> = {
		// Direct mappings
		owner: "owner",
		admin: "admin",
		member: "member",
		// Custom roles -> map to appropriate base role
		// These are defined in backend access-control.ts with same permissions as member
		campaignManager: "member",
		financeManager: "member",
		productManager: "member",
		// Legacy/alternative names
		manager: "admin",
		viewer: "member",
		campaign_manager: "member",
		finance_manager: "member",
		product_manager: "member",
	}
	return roleMap[role] || "member"
}

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

		// Map frontend roles to Better Auth roles using centralized mapping
		const authRole = mapToAuthRole(role)

		const result = await ctx.client.auth.inviteMemberAuth(organizationId, {
			email,
			role: authRole,
		})

		revalidateTag("team")
		return { invitationId: result.invitation.id }
	})

/**
 * Remove team member
 * Uses auth.removeMember (not organizations)
 */
export const removeMember = authAction
	.inputSchema(removeMemberSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, memberId } = parsedInput
		await ctx.client.auth.removeMember(organizationId, memberId)
		revalidateTag("team")
		return { success: true }
	})

/**
 * Cancel invitation
 */
export const cancelInvitation = authAction
	.inputSchema(cancelInvitationSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.client.auth.cancelInvitation(parsedInput.organizationId, parsedInput.invitationId)
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

		// Map frontend roles to Better Auth roles using centralized mapping
		const authRole = mapToAuthRole(role)

		await ctx.client.auth.updateMemberRole(organizationId, memberId, {
			role: authRole,
		})

		revalidateTag("team")
		return { success: true }
	})
