"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient } from "@/lib/encore"
import { cookies } from "next/headers"

async function getOrganizationId(): Promise<string> {
	const cookieStore = await cookies()
	return cookieStore.get("active-organization-id")?.value || ""
}

// Original function (kept for backward compatibility)
export async function inviteMember(email: string, role: string) {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	if (!orgId) {
		return { success: false, error: "Organization ID not found" }
	}

	// Map frontend roles to Better Auth roles
	// Frontend: 'owner' | 'admin' | 'manager' | 'viewer' | 'member'
	// Better Auth: 'owner' | 'admin' | 'member'
	const authRole =
		role === "manager" || role === "viewer" ? "member" : (role as "owner" | "admin" | "member")

	try {
		// Use Better Auth endpoint for invitations
		const result = await client.auth.inviteMemberAuth({
			organizationId: orgId,
			email,
			role: authRole,
		})

		revalidatePath("/dashboard/team")
		return {
			success: true,
			message: "Invitation sent successfully",
			invitationId: result.invitation.id,
		}
	} catch (error: any) {
		return { success: false, error: error.message || "Failed to invite member" }
	}
}

// React 19 useActionState compatible wrapper (accepts FormData)
export async function inviteMemberAction(
	prevState: { success?: boolean; error?: string; message?: string } | null,
	formData: FormData
) {
	const email = formData.get("email") as string
	const role = formData.get("role") as string
	const message = formData.get("message") as string | null

	if (!email || !role) {
		return { success: false, error: "Email and role are required" }
	}

	const result = await inviteMember(email, role)

	if (result.success) {
		return { success: true, message: result.message || "Invitation sent successfully" }
	}

	return { success: false, error: result.error || "Failed to send invitation" }
}

export async function removeMember(memberId: string) {
	const client = getEncoreClient()
	const orgId = await getOrganizationId()

	try {
		// client.organizations.removeMember(orgId, memberId)
		await client.organizations.removeMember(orgId, memberId)
		revalidatePath("/dashboard/team")
		return { success: true, message: "Member removed" }
	} catch (error: any) {
		return { success: false, error: error.message || "Failed to remove member" }
	}
}
