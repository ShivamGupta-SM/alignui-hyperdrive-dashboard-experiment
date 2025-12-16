"use server"

import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { handleServerAuthError } from "@/lib/errors/error-handler"
import { revalidatePath } from "next/cache"

/**
 * Resubmit organization for approval (after rejection)
 * Resets organization status from rejected to draft
 */
export async function resubmitOrganizationForApproval(organizationId: string) {
	const client = getEncoreClient()

	try {
		const result = await client.organizations.resubmitOrganizationForApproval(organizationId)

		revalidatePath("/onboarding")
		revalidatePath("/dashboard")

		return {
			success: true,
			message: result.message || "Organization reset to draft. You can now edit and resubmit for approval.",
		}
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

