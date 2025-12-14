"use server"

import { getEncoreClient } from "@/lib/encore"
import { revalidatePath } from "next/cache"

/**
 * Create basic organization using Better Auth (name only)
 * Advanced details (GST, PAN, etc.) can be added later in settings
 */
export async function createBasicOrganization(name: string) {
	const client = getEncoreClient()

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

		// Set as active organization
		await client.auth.setActiveOrganization({
			organizationId: result.id,
		})

		revalidatePath("/dashboard")
		revalidatePath("/onboarding")

		return {
			success: true,
			organizationId: result.id,
			organization: result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || "Failed to create organization",
		}
	}
}

/**
 * Switch active organization
 */
export async function switchOrganization(organizationId: string) {
	const client = getEncoreClient()

	try {
		await client.auth.setActiveOrganization({
			organizationId,
		})

		revalidatePath("/dashboard")

		return { success: true }
	} catch (error: any) {
		return {
			success: false,
			error: error.message || "Failed to switch organization",
		}
	}
}
