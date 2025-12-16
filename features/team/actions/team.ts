/**
 * Team Server Actions
 * 
 * @description
 * Server-side actions for team operations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { getOrganizationIdOrNull } from "@/lib/ssr-data"
import type { Result } from "@/shared/lib/errors/types"
import type { Invitation } from "../types"

/**
 * Invite team member
 * 
 * @description
 * Sends an invitation to join the team.
 * 
 * @param email - Member email
 * @param role - Member role
 * @returns Result with invitation ID or error
 */
export async function inviteMember(
	email: string,
	role: string
): Promise<Result<{ invitationId: string }>> {
	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	// Map frontend roles to Better Auth roles
	const authRole =
		role === "manager" || role === "viewer" ? "member" : (role as "owner" | "admin" | "member")

	try {
		const result = await client.auth.inviteMemberAuth({
			organizationId: orgId,
			email,
			role: authRole,
		})

		revalidatePath("/dashboard/team")
		return {
			success: true,
			data: { invitationId: result.invitation.id },
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Remove team member
 * 
 * @description
 * Removes a member from the team.
 * 
 * @param memberId - Member ID
 * @returns Result indicating success or error
 */
export async function removeMember(memberId: string): Promise<Result<void>> {
	const client = getEncoreClient()
	const orgId = await getOrganizationIdOrNull()

	if (!orgId) {
		return { success: false, error: new Error("Organization ID not found") }
	}

	try {
		await client.organizations.removeMember(orgId, memberId)
		revalidatePath("/dashboard/team")
		return { success: true, data: undefined }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}
