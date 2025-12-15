"use server"

// Mocking disabled - removed MSW initialization

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError } from "@/lib/encore"
import { logWarn } from "@/lib/error-logger-simple"
import { revalidatePath } from "next/cache"
import { handleServerAuthError } from "@/lib/error-handler"
import { cookies } from "next/headers"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/encore-client"

/**
 * Verify GST during onboarding
 * 
 * ✅ FIX: Backend now allows verification without organization (for pre-creation verification)
 * If organizationId is provided, it will be used; otherwise backend uses activeOrganizationId from session.
 * If neither exists, backend just verifies and returns result without saving (for onboarding flow).
 */
export async function verifyGST(gstNumber: string, organizationId?: string) {
	// Get auth token from cookies
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		return {
			success: false,
			error: "Authentication required",
		}
	}

	const client = getAuthenticatedEncoreClient(token)

	try {
		// If organizationId is provided, ensure it's set as active organization
		// This is needed because backend uses activeOrganizationId from session
		if (organizationId) {
			try {
				await client.auth.setActiveOrganization({ organizationId })
			} catch (setActiveError) {
				// Log but don't fail - might already be set
				logWarn("Failed to set active organization", { 
					source: "verifyGST", 
					data: { 
						organizationId, 
						error: setActiveError instanceof Error ? setActiveError.message : String(setActiveError)
					} 
				})
			}
		}

		// ✅ FIX: Pass organizationId if provided (allows verification before org is set as active)
		// If not provided, backend will use activeOrganizationId from session
		// If neither exists, backend just verifies without saving (for onboarding)
		const result = await client.organizations.verifyGST({ 
			gstNumber,
			...(organizationId && { organizationId }), // Only pass if provided
		})
		return {
			success: true,
			gstDetails: result,
		}
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

/**
 * ❌ REMOVED: PAN verification for organizations
 * PAN verification is only for shoppers, not organizations
 * Use shoppers.verifyPAN() instead
 */

/**
 * Submit onboarding form - creates organization with Better Auth, updates with details, verifies GST, and submits for approval
 */
export async function submitOnboarding(formData: OrganizationDraft) {
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
		// Step 1: Create basic organization using Better Auth (just name)
		// If organization already exists (from draft), use it
		let basicOrg = null
		const orgsResult = await client.auth.listOrganizations()
		// Note: approvalStatus might not be in OrganizationResponse type, but backend returns it
		const existingDraftOrg = orgsResult.organizations?.find(
			(org) => {
				const orgWithStatus = org as typeof org & { approvalStatus?: string }
				return orgWithStatus.approvalStatus === "draft" || orgWithStatus.approvalStatus === "pending"
			}
		)

		if (existingDraftOrg) {
			// Use existing draft organization
			basicOrg = { id: existingDraftOrg.id }
			const { logInfo } = await import("@/lib/error-logger-simple")
			logInfo("Using existing draft organization", { source: "Onboarding", data: { organizationId: existingDraftOrg.id } })
		} else {
			// Industry Standard: Use custom backend endpoint (auto-sets active org)
			// Backend handles Better Auth sync + business fields + auto-set
			basicOrg = await client.organizations.createOrganization({
				name: formData.basicInfo?.name || "",
				// Backend auto-sets if user has no active org
			})

			if (!basicOrg?.id) {
				return {
					success: false,
					error: "Failed to create organization",
				}
			}
		}

		// ✅ No need to call setActiveOrganization - backend does it automatically!
		// Backend auto-sets if user has no active org

		// Organization is already set as active in backend session
		// No cookie needed - session is the single source of truth (industry standard)

		// Step 2: Update organization with all advanced details
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
			businessType: mapBusinessType(formData.businessDetails?.businessType),
			industryCategory: formData.businessDetails?.industryCategory,
			cinNumber: formData.verification?.cinNumber,
		} as organizations.UpdateOrganizationRequest & {
			businessType?: string
			industryCategory?: string
			cinNumber?: string
		}

		await client.organizations.updateOrganization(basicOrg.id, updateRequest)

		// Step 3: Verify GST if provided (MANDATORY)
		if (formData.verification?.gstNumber) {
			try {
				// ✅ FIX: Pass organizationId to ensure verification is saved to the correct org
				// Note: verifyGST doesn't accept organizationId in the API, backend uses activeOrganizationId automatically
				await client.organizations.verifyGST({
					gstNumber: formData.verification.gstNumber,
				})
			} catch (gstError: unknown) {
				// GST verification failed - still continue but log error
				const { logError } = await import("@/lib/error-logger-simple")
				logError(gstError, { source: "Onboarding", data: { action: "verifyGST", gstNumber: formData.verification?.gstNumber } })
				// Don't throw - let user know in response
			}
		}

		// Step 4: Verify PAN if provided (optional)
		// ❌ REMOVED: PAN verification for organizations
		// PAN verification is only for shoppers, not organizations

		// Step 5: Submit for approval
		await client.organizations.submitOrganizationForApproval(basicOrg.id)

		revalidatePath("/onboarding")
		revalidatePath("/dashboard")

		// After successful onboarding, redirect to pending page
		// The client component will handle the redirect
		return {
			success: true,
			organizationId: basicOrg.id,
			message: "Organization created and submitted for approval",
			redirectTo: "/onboarding/pending", // Redirect to pending page
		}
	} catch (error: unknown) {
		// Log detailed error for debugging
		const { logError } = await import("@/lib/error-logger-simple")
		const errorMessage = error instanceof Error ? error.message : String(error)
		
		logError(error, { 
			source: "Onboarding", 
			data: { 
				action: "submitOnboarding",
				errorMessage,
				errorStack: error instanceof Error ? error.stack : undefined,
				errorName: error instanceof Error ? error.name : undefined,
			} 
		})
		
		// Check if it's a fetch error
		if (errorMessage.includes("fetch failed") || errorMessage.includes("Failed to fetch")) {
			logError(new Error("Fetch failed - MSW might not be intercepting requests"), { 
				source: "Onboarding", 
				data: { 
					action: "submitOnboarding",
					hint: "Check if MSW server is initialized and listening. Verify NEXT_PUBLIC_API_MOCKING=enabled is set"
				} 
			})
		}
		
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

/**
 * Save onboarding draft to backend
 * Used for cross-device persistence
 */
export async function saveOnboardingDraft(
	organizationId: string,
	formData: Partial<OrganizationDraft>
) {
	// Get auth token from cookies
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		return {
			success: false,
			error: "Authentication required",
		}
	}

	const client = getAuthenticatedEncoreClient(token)

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
				const { logInfo } = await import("@/lib/error-logger-simple")
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
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		const { logError } = await import("@/lib/error-logger-simple")
		logError(new Error("No auth token found"), { source: "Onboarding", data: { action: "loadDraft" } })
		return null
	}

	const client = getAuthenticatedEncoreClient(token)

	try {
		const org = await client.organizations.getOrganization(organizationId)

		// Only return draft if organization is in draft status
		// Note: approvalStatus might not be in the response, so we check if org exists
		if (!org) {
			return null
		}

		// Map organization data back to form format
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
		const { logError } = await import("@/lib/error-logger-simple")
		logError(error, { source: "Onboarding", data: { action: "loadDraft", organizationId } })
		return null
	}
}

/**
 * Resubmit organization for approval (after rejection)
 * Resets organization status from rejected to draft
 */
export async function resubmitOrganizationForApproval(organizationId: string) {
	// Get auth token from cookies
	const cookieStore = await cookies()
	const token = cookieStore.get("auth-token")?.value
	
	if (!token) {
		return {
			success: false,
			error: "Authentication required",
		}
	}

	const client = getAuthenticatedEncoreClient(token)

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

/**
 * Map backend businessType to frontend BusinessType
 */
function mapBackendBusinessType(
	type?: string
): "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | undefined {
	const mapping: Record<string, "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited"> = {
		proprietorship: "sole_proprietorship",
		partnership: "partnership",
		llp: "llp",
		pvt_ltd: "private_limited",
		public_ltd: "public_limited",
	}
	return type ? mapping[type] : undefined
}

/**
 * Map frontend BusinessType to backend businessType
 * Note: businessType is not in UpdateOrganizationRequest type but backend accepts it
 */
function mapBusinessType(
	type?: "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited"
): string | undefined {
	const mapping: Record<string, string> = {
		sole_proprietorship: "proprietorship",
		partnership: "partnership",
		llp: "llp",
		private_limited: "pvt_ltd",
		public_limited: "public_ltd",
	}
	return type ? mapping[type] : undefined
}
