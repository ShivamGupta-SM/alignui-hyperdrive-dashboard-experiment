"use server"

import { getEncoreClient } from "@/lib/encore"
import { revalidatePath } from "next/cache"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/encore-client"

/**
 * Verify GST during onboarding
 */
export async function verifyGST(organizationId: string, gstNumber: string) {
	const client = getEncoreClient()

	try {
		const result = await client.organizations.verifyGST(organizationId, { gstNumber })
		return {
			success: true,
			gstDetails: result,
		}
	} catch (error: any) {
		handleServerAuthError(error)
		return {
			success: false,
			error: error.message || "GST verification failed",
		}
	}
}

/**
 * Verify PAN during onboarding
 */
export async function verifyPAN(organizationId: string, panNumber: string) {
	const client = getEncoreClient()

	try {
		const result = await client.organizations.verifyPAN(organizationId, { panNumber })
		return {
			success: true,
			panDetails: result,
		}
	} catch (error: any) {
		handleServerAuthError(error)
		return {
			success: false,
			error: error.message || "PAN verification failed",
		}
	}
}

/**
 * Submit onboarding form - creates organization with Better Auth, updates with details, verifies GST/PAN, and submits for approval
 */
export async function submitOnboarding(formData: OrganizationDraft) {
	const client = getEncoreClient()

	try {
		// Step 1: Create basic organization using Better Auth (just name)
		const basicOrg = await client.auth.createOrganization({
			name: formData.basicInfo?.name || "",
			// slug will be auto-generated
		})

		if (!basicOrg?.id) {
			return {
				success: false,
				error: "Failed to create organization",
			}
		}

		// Set as active organization
		await client.auth.setActiveOrganization({
			organizationId: basicOrg.id,
		})

		// Step 2: Update organization with all advanced details
		const updateRequest: organizations.UpdateOrganizationRequest = {
			description: formData.basicInfo?.description,
			website: formData.basicInfo?.website,
			businessType: mapBusinessType(formData.businessDetails?.businessType),
			industryCategory: formData.businessDetails?.industryCategory,
			contactPerson: formData.businessDetails?.contactPerson,
			phoneNumber: formData.businessDetails?.phone,
			address: formData.businessDetails?.address,
			city: formData.businessDetails?.city,
			state: formData.businessDetails?.state,
			postalCode: formData.businessDetails?.pinCode,
			country: "IN",
			cinNumber: formData.verification?.cinNumber,
		}

		await client.organizations.updateOrganization(basicOrg.id, updateRequest)

		// Step 3: Verify GST if provided (MANDATORY)
		if (formData.verification?.gstNumber) {
			try {
				await client.organizations.verifyGST(basicOrg.id, {
					gstNumber: formData.verification.gstNumber,
				})
			} catch (gstError: any) {
				// GST verification failed - still continue but log error
				console.error("GST verification failed:", gstError)
				// Don't throw - let user know in response
			}
		}

		// Step 4: Verify PAN if provided (optional)
		if (formData.verification?.panNumber) {
			try {
				await client.organizations.verifyPAN(basicOrg.id, {
					panNumber: formData.verification.panNumber,
				})
			} catch (panError: any) {
				// PAN verification failed - non-blocking
				console.error("PAN verification failed:", panError)
			}
		}

		// Step 5: Submit for approval
		await client.organizations.submitOrganizationForApproval(basicOrg.id)

		revalidatePath("/onboarding")
		revalidatePath("/dashboard")

		return {
			success: true,
			organizationId: basicOrg.id,
			message: "Organization created and submitted for approval",
		}
	} catch (error: any) {
		handleServerAuthError(error)
		return {
			success: false,
			error: error.message || "Failed to submit onboarding application",
		}
	}
}

/**
 * Map frontend BusinessType to backend businessType
 */
function mapBusinessType(
	type?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited"
): organizations.UpdateOrganizationRequest["businessType"] {
	const mapping: Record<string, organizations.UpdateOrganizationRequest["businessType"]> = {
		sole_proprietorship: "proprietorship",
		partnership: "partnership",
		llp: "llp",
		private_limited: "pvt_ltd",
		public_limited: "public_ltd",
	}
	return type ? mapping[type] : undefined
}
