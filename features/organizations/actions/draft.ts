"use server"

import { getEncoreClient, handleAPIError } from "@/lib/api/encore"
import { handleServerAuthError } from "@/lib/errors/error-handler"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/api/encore-client"
import { mapBusinessType, mapBackendBusinessType } from "../lib/utils"
import { logInfo } from "@/lib/logging/error-logger-simple"

/**
 * Save onboarding draft to backend
 * Used for cross-device persistence
 */
export async function saveOnboardingDraft(
	organizationId: string,
	formData: Partial<OrganizationDraft>
) {
	const client = getEncoreClient()

	try {
		// Map formData to organization update request
		// Note: businessType and industryCategory are not in UpdateOrganizationRequest type
		// but backend accepts them. Using type assertion to include them.
		const updateRequest = {
			description: formData.basicInfo?.description,
			website: formData.basicInfo?.website,
			contactPerson: formData.businessDetails?.contactPerson,
			phoneNumber: formData.businessDetails?.phone,
			address: formData.businessDetails?.address,
			city: formData.businessDetails?.city,
			state: formData.businessDetails?.state,
			postalCode: formData.businessDetails?.pinCode,
			// These fields are supported by backend but not in generated type
			businessType: formData.businessDetails?.businessType
				? mapBusinessType(formData.businessDetails.businessType)
				: undefined,
			industryCategory: formData.businessDetails?.industryCategory,
			cinNumber: formData.verification?.cinNumber,
		} as organizations.UpdateOrganizationRequest & {
			businessType?: string
			industryCategory?: string
			cinNumber?: string
		}

		// Update organization with draft data
		await client.organizations.updateOrganization(organizationId, updateRequest)

		// If GST/PAN provided, verify them (non-blocking)
		if (formData.verification?.gstNumber && !formData.verification?.gstVerified) {
			try {
				// ✅ FIX: Pass organizationId to ensure verification is saved to the correct org
				// Note: verifyGST doesn't accept organizationId in the API, backend uses activeOrganizationId automatically
				await client.organizations.verifyGST({
					gstNumber: formData.verification.gstNumber,
				})
			} catch (gstError) {
				// Ignore verification errors during draft save
				logInfo("GST verification skipped during draft save (will verify on submit)", { source: "Onboarding", data: { action: "saveDraft" } })
			}
		}

		// ❌ REMOVED: PAN verification for organizations
		// PAN verification is only for shoppers, not organizations

		return { success: true }
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

/**
 * Load onboarding draft from backend
 * Returns null if no draft found
 */
export async function loadOnboardingDraft(organizationId: string): Promise<OrganizationDraft | null> {
	// Get auth token from cookies
	const client = getEncoreClient()

	try {
		const org = await client.organizations.getOrganization(organizationId)

		// Only return draft if organization is in draft status
		// Note: approvalStatus might not be in the response, so we check if org exists
		if (!org) {
			return null
		}

		// Map organization data back to form format
		// mapBackendBusinessType is already imported at the top
		return {
			step: 4, // Assume step 4 if loading from backend (user can navigate)
			basicInfo: {
				name: org.name || "",
				description: org.description || undefined,
				website: org.website || undefined,
				logo: org.logo || undefined,
			},
			businessDetails: {
				businessType: mapBackendBusinessType(
					(org as typeof org & { businessType?: string }).businessType
				) || "private_limited",
				industryCategory: ((org as typeof org & { industryCategory?: string }).industryCategory || "electronics") as import("@/lib/types").IndustryCategory,
				contactPerson: org.contactPerson || "",
				phone: org.phoneNumber || "",
				address: org.address || "",
				city: org.city || "",
				state: org.state || "",
				pinCode: org.postalCode || "",
			},
			verification: {
				gstNumber: org.gstNumber || "",
				gstVerified: org.gstVerified || false,
				// ❌ REMOVED: PAN fields - PAN is only for shoppers, not organizations
				cinNumber: org.cinNumber || "",
			},
		}
	} catch (error: unknown) {
		const { logError } = await import("@/lib/logging/error-logger-simple")
		logError(error, { source: "Onboarding", data: { action: "loadDraft", organizationId } })
		return null
	}
}

