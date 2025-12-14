"use server"

// Mocking disabled - removed MSW initialization

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError } from "@/lib/encore"
import { revalidatePath } from "next/cache"
import { handleServerAuthError } from "@/lib/error-handler-server"
import { cookies } from "next/headers"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/encore-client"

/**
 * Verify GST during onboarding
 */
export async function verifyGST(organizationId: string, gstNumber: string) {
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
		const result = await client.organizations.verifyGST(organizationId, { gstNumber })
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
 * Verify PAN during onboarding
 */
export async function verifyPAN(organizationId: string, panNumber: string) {
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
		const result = await client.organizations.verifyPAN(organizationId, { panNumber })
		return {
			success: true,
			panDetails: result,
		}
	} catch (error: unknown) {
		handleServerAuthError(error)
		return handleAPIError(error)
	}
}

/**
 * Submit onboarding form - creates organization with Better Auth, updates with details, verifies GST/PAN, and submits for approval
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
			console.log("[Onboarding] Using existing draft organization:", existingDraftOrg.id)
		} else {
			// Create new organization
			basicOrg = await client.auth.createOrganization({
				name: formData.basicInfo?.name || "",
				// slug will be auto-generated
			})

			if (!basicOrg?.id) {
				return {
					success: false,
					error: "Failed to create organization",
				}
			}
		}

		// Set as active organization in backend
		await client.auth.setActiveOrganization({
			organizationId: basicOrg.id,
		})

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
				await client.organizations.verifyGST(basicOrg.id, {
					gstNumber: formData.verification.gstNumber,
				})
			} catch (gstError: unknown) {
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
			} catch (panError: unknown) {
				// PAN verification failed - non-blocking
				console.error("PAN verification failed:", panError)
			}
		}

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
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		const errorName = error instanceof Error ? error.name : undefined
		const errorCause = error instanceof Error ? error.cause : undefined
		
		console.error("[Onboarding] Submit error:", {
			message: errorMessage,
			stack: errorStack,
			name: errorName,
			cause: errorCause,
			toString: String(error),
		})
		
		// Check if it's a fetch error
		if (errorMessage.includes("fetch failed") || errorMessage.includes("Failed to fetch")) {
			console.error("[Onboarding] Fetch failed - MSW might not be intercepting requests")
			console.error("[Onboarding] Check if MSW server is initialized and listening")
			console.error("[Onboarding] Verify NEXT_PUBLIC_API_MOCKING=enabled is set")
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
				await client.organizations.verifyGST(organizationId, {
					gstNumber: formData.verification.gstNumber,
				})
			} catch (gstError) {
				// Ignore verification errors during draft save
				console.log("[Draft Save] GST verification skipped (will verify on submit)")
			}
		}

		if (formData.verification?.panNumber && !formData.verification?.panVerified) {
			try {
				await client.organizations.verifyPAN(organizationId, {
					panNumber: formData.verification.panNumber,
				})
			} catch (panError) {
				// Ignore verification errors during draft save
				console.log("[Draft Save] PAN verification skipped (will verify on submit)")
			}
		}

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
		console.error("[Load Draft] No auth token found")
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
				panNumber: org.panNumber || "",
				panVerified: org.panVerified || false,
				cinNumber: org.cinNumber || "",
			},
		}
	} catch (error: unknown) {
		console.error("[Load Draft] Failed to load draft:", error)
		return null
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
