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
		// Use Better Auth's createOrganization - only needs name
		const result = await client.auth.createOrganization({
			name,
			// slug will be auto-generated
			// logo can be added later
		})

		if (!result?.id) {
			return {
				success: false,
				error: "Failed to create organization",
			}
		}

		// Better Auth's createOrganization does NOT auto-set as active by default.
		// Our backend endpoint (organizations/organizations.ts:createOrganization) does auto-set,
		// but we're calling Better Auth directly here, so we need to set it manually.
		// This ensures the organization is immediately available for use.
		await client.auth.setActiveOrganization({
			organizationId: result.id,
		})

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
		// Backend updates session.activeOrganizationId automatically
		// No cookie needed - session is the source of truth (industry standard)
		await client.auth.setActiveOrganization({
			organizationId,
		})

		// Revalidate all paths to refresh server components with new org context
		revalidatePath("/", "layout")
		revalidatePath("/dashboard")

		return { success: true }
	} catch (error: unknown) {
		return handleAPIError(error)
	}
}
