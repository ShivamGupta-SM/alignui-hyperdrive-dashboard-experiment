/**
 * Team API - Single source of truth for all team operations
 */

import { getEncoreBrowserClient } from "@/lib/api/encore-browser"
import type { auth } from "@/lib/api/encore-client"

/**
 * List team members
 * 
 * @returns List of team members (uses active organization from session)
 */
export async function listMembers() {
	const client = getEncoreBrowserClient()
	return client.auth.listMembersAuth()
}

/**
 * Invite team member
 * 
 * @param data - Invite member data
 * @returns Invitation result
 */
export async function inviteMember(data: {
	organizationId: string
	email: string
	role: "owner" | "admin" | "member"
}) {
	const client = getEncoreBrowserClient()
	return client.auth.inviteMemberAuth(data)
}

/**
 * Remove team member
 * 
 * @param data - Remove member data
 */
export async function removeMember(data: {
	organizationId: string
	memberIdOrEmail: string
}) {
	const client = getEncoreBrowserClient()
	return client.auth.removeMember(data)
}

