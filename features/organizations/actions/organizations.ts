/**
 * Organizations Server Actions
 * 
 * @description
 * Server-side actions for organization operations.
 * Uses Result pattern for consistent error handling.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import type { Result } from "@/shared/lib/errors/types"
import type { Organization } from "../types"

/**
 * Create basic organization
 * 
 * @description
 * Creates a new organization with name only.
 * Advanced details can be added later in settings.
 * 
 * @param name - Organization name
 * @returns Result with created organization or error
 */
export async function createBasicOrganization(name: string): Promise<Result<Organization>> {
	const client = getEncoreClient()

	try {
		const result = await client.organizations.createOrganization({ name })

		if (!result?.id) {
			return {
				success: false,
				error: new Error("Failed to create organization"),
			}
		}

		revalidatePath("/dashboard")
		revalidatePath("/onboarding")

		return {
			success: true,
			data: result,
		}
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

/**
 * Switch active organization
 * 
 * @description
 * Updates the active organization in the session.
 * 
 * @param organizationId - Organization ID to switch to
 * @returns Result indicating success or error
 */
export async function switchOrganization(organizationId: string): Promise<Result<void>> {
	const client = getEncoreClient()

	try {
		await client.auth.setActiveOrganization({ organizationId })

		revalidatePath("/", "layout")
		revalidatePath("/dashboard")

		return { success: true, data: undefined }
	} catch (error: unknown) {
		const apiError = handleAPIError(error)
		return { success: false, error: apiError instanceof Error ? apiError : new Error(String(apiError)) }
	}
}

