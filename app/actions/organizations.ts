"use server"

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError } from "@/lib/encore"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

/**
 * Create basic organization using Better Auth (name only)
 * Advanced details (GST, PAN, etc.) can be added later in settings
 */
export async function createBasicOrganization(name: string) {
	// Get auth token from cookies
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		return {
			success: false,
			error: "Authentication required. Please sign in again.",
		}
	}

	const client = getAuthenticatedEncoreClient(token)

	try {
		// Industry Standard: Use custom backend endpoint (auto-sets active org)
		// Backend handles Better Auth sync + business fields + auto-set
		const result = await client.organizations.createOrganization({
			name,
			// Backend auto-sets if user has no active org
		})

		if (!result?.id) {
			return {
				success: false,
				error: "Failed to create organization",
			}
		}

		// ✅ No need to call setActiveOrganization - backend does it automatically!

		// Revalidate paths to refresh server components with new org context
		revalidatePath("/dashboard")
		revalidatePath("/onboarding")

		return {
			success: true,
			organizationId: result.id,
			organization: result,
		}
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}

/**
 * Switch active organization
 * Updates both backend (Better Auth) and frontend cookie
 */
export async function switchOrganization(organizationId: string) {
	// Get auth token from cookies
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		return {
			success: false,
			error: "Authentication required. Please sign in again.",
		}
	}

	const client = getAuthenticatedEncoreClient(token)

	try {
		// Update backend (Better Auth session) - single source of truth
		// Better Auth updates session.activeOrganizationId synchronously in database
		await client.auth.setActiveOrganization({
			organizationId,
		})

		// Revalidate paths to refresh server components with new org context
		// Better Auth's setActiveOrganization completes synchronously, so no delay needed
		revalidatePath("/", "layout")
		revalidatePath("/dashboard")

		return { success: true }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}
