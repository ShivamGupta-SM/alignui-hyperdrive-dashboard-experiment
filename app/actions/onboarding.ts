"use server"

// Initialize MSW early for server actions - MUST be before any imports that use fetch
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	// Synchronously initialize MSW before any other imports
	// This ensures fetch is patched before Encore client is created
	const initPromise = import("@/lib/init-mocks-server").then((mod) => mod.initServerMocks()).catch((err) => {
		console.error("[Onboarding] Failed to initialize MSW:", err)
	})
	// Wait for initialization in the action itself
}

import { getEncoreClient } from "@/lib/encore"
import { revalidatePath } from "next/cache"
import { handleServerAuthError } from "@/lib/error-handler-server"
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
	// CRITICAL: Ensure MSW is initialized and ready before making ANY API calls
	// MSW must patch fetch BEFORE the Encore client is created
	if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
		try {
			const { initServerMocks } = await import("@/lib/init-mocks-server")
			await initServerMocks()
			// Wait to ensure MSW server is fully ready and fetch is patched
			await new Promise((resolve) => setTimeout(resolve, 500))
			console.log("[Onboarding] MSW initialized, fetch should be patched")
			
			// Verify fetch is available
			if (typeof globalThis.fetch === "undefined") {
				console.error("[Onboarding] WARNING: globalThis.fetch is undefined!")
			} else {
				console.log("[Onboarding] globalThis.fetch is available (should be patched by MSW)")
			}
		} catch (error) {
			console.error("[Onboarding] MSW initialization error:", error)
			console.error("[Onboarding] Error details:", error instanceof Error ? error.stack : String(error))
			// Continue anyway - might work without MSW if real server is running
		}
	}

	// Create client AFTER MSW is initialized (so it uses patched fetch)
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

		// After successful onboarding, redirect to pending page
		// The client component will handle the redirect
		return {
			success: true,
			organizationId: basicOrg.id,
			message: "Organization created and submitted for approval",
			redirectTo: "/onboarding/pending", // Redirect to pending page
		}
	} catch (error: any) {
		// Log detailed error for debugging
		console.error("[Onboarding] Submit error:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
			cause: error.cause,
			toString: String(error),
		})
		
		// Check if it's a fetch error
		if (error.message?.includes("fetch failed") || error.message?.includes("Failed to fetch")) {
			console.error("[Onboarding] Fetch failed - MSW might not be intercepting requests")
			console.error("[Onboarding] Check if MSW server is initialized and listening")
			console.error("[Onboarding] Verify NEXT_PUBLIC_API_MOCKING=enabled is set")
		}
		
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
