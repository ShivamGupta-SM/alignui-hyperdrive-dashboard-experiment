"use server"

import { getEncoreClient, getAuthenticatedEncoreClient, handleAPIError } from "@/lib/api/encore"
import { cookies } from "next/headers"
import { logWarn, logError, logInfo } from "@/lib/logging/error-logger-simple"
import { revalidatePath } from "next/cache"
import { handleServerAuthError } from "@/lib/errors/error-handler"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/api/encore-client"
import { mapBusinessType } from "../lib/utils"
import type { Result } from "@/shared/lib/errors/types"
import { requireAuth } from "@/lib/auth-helpers"

/**
 * Check user organizations for onboarding flow
 * 
 * @description
 * Checks if user has organizations and returns them categorized by approval status.
 * Used to determine if user should be redirected to dashboard or allowed to continue onboarding.
 * 
 * @returns Result with organizations categorized by status
 */
export async function checkUserOrganizations(): Promise<Result<{
	organizations: Array<{ id: string; name: string; approvalStatus?: string; [key: string]: unknown }>
	approvedOrgs: Array<{ id: string; name: string; approvalStatus?: string; [key: string]: unknown }>
	draftOrgs: Array<{ id: string; name: string; approvalStatus?: string; [key: string]: unknown }>
}>> {
	try {
		// CRITICAL: Check authentication before making API calls
		const auth = await requireAuth()
		
		if (!auth.success) {
			return {
				success: false,
				error: new Error("Authentication required"),
			}
		}

		// Get authenticated client
		const cookieStore = await cookies()
		const token = cookieStore.get("auth-token")?.value
		
		if (!token) {
			return {
				success: false,
				error: new Error("Authentication required"),
			}
		}

		const client = getAuthenticatedEncoreClient(token)
		const orgsResult = await client.auth.listOrganizations()
		// Type assertion: backend returns approvalStatus but type doesn't include it
		const organizations = (orgsResult.organizations || []) as unknown as Array<{ id: string; name: string; approvalStatus?: string; [key: string]: unknown }>

		// Categorize organizations by approval status
		const approvedOrgs = organizations.filter(
			(org): org is typeof org & { approvalStatus: string } => 
				'approvalStatus' in org && org.approvalStatus === "approved"
		)

		const draftOrgs = organizations.filter(
			(org): org is typeof org & { approvalStatus: string } => 
				'approvalStatus' in org && 
				(org.approvalStatus === "draft" || org.approvalStatus === "pending")
		)

		return {
			success: true,
			data: {
				organizations,
				approvedOrgs,
				draftOrgs,
			},
		}
	} catch (error: unknown) {
		// Check if it's a network/server error (502, 503, etc.) or auth error
		const errorMessage = error instanceof Error ? error.message : String(error)
		const isServerError = errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("504") || errorMessage.includes("fetch failed")
		const isAuthError = errorMessage.includes("authentication") || errorMessage.includes("401") || errorMessage.includes("credentials")
		
		// Only log unexpected errors, not expected ones (server down, auth issues)
		if (!isServerError && !isAuthError) {
			logError(error, { source: "Onboarding", data: { action: "checkUserOrganizations" } })
		} else {
			// Log as warning for expected errors
			logWarn(`Expected error in checkUserOrganizations: ${errorMessage}`, { 
				source: "Onboarding", 
				data: { 
					action: "checkUserOrganizations",
					isServerError,
					isAuthError
				} 
			})
		}
		
		const apiError = handleAPIError(error)
		// ✅ FIX: handleAPIError returns an object, not an Error instance
		// Extract the error message from the object
		const errorMessage = typeof apiError === "object" && apiError !== null && "error" in apiError
			? String(apiError.error)
			: error instanceof Error 
				? error.message 
				: String(error)
		
		return { 
			success: false, 
			error: new Error(errorMessage)
		}
	}
}

/**
 * Verify GST during onboarding
 * 
 * ✅ FIX: Backend now allows verification without organization (for pre-creation verification)
 * If organizationId is provided, it will be used; otherwise backend uses activeOrganizationId from session.
 * If neither exists, backend just verifies and returns result without saving (for onboarding flow).
 * 
 * CRITICAL FIX: Now uses authenticated client to prevent "invalid authentication credentials" errors
 */
export async function verifyGST(gstNumber: string, organizationId?: string) {
	try {
		// CRITICAL: Check authentication before making API calls
		const auth = await requireAuth()
		
		if (!auth.success) {
			logWarn("User not authenticated for GST verification", { 
				source: "verifyGST",
				data: { 
					authError: auth.error,
					gstNumber: gstNumber.substring(0, 5) + "***",
					organizationId 
				}
			})
			return {
				success: false,
				error: "Authentication required. Please sign in to verify GST.",
			}
		}

		// Get authenticated client using auth token from cookies
		const cookieStore = await cookies()
		const token = cookieStore.get("auth-token")?.value
		const betterAuthToken = cookieStore.get("better-auth.session_token")?.value
		
		logInfo("GST verification starting", {
			source: "verifyGST",
			data: {
				hasAuthToken: !!token,
				hasBetterAuthToken: !!betterAuthToken,
				tokenLength: token?.length || 0,
				gstNumber: gstNumber.substring(0, 5) + "***",
				organizationId,
			}
		})
		
		if (!token && !betterAuthToken) {
			logWarn("No auth token found for GST verification", { 
				source: "verifyGST",
				data: {
					availableCookies: cookieStore.getAll().map(c => c.name)
				}
			})
			return {
				success: false,
				error: "Authentication required. Please sign in to verify GST.",
			}
		}

		// Use auth-token if available, otherwise use better-auth.session_token
		const authToken = token || betterAuthToken
		const client = getAuthenticatedEncoreClient(authToken!)

		// If organizationId is provided, ensure it's set as active organization
		// This is needed because backend uses activeOrganizationId from session
		if (organizationId) {
			try {
				await client.auth.setActiveOrganization({ organizationId })
				logInfo("Set active organization for GST verification", {
					source: "verifyGST",
					data: { organizationId }
				})
			} catch (setActiveError) {
				// Log but don't fail - might already be set
				logWarn("Failed to set active organization", { 
					source: "verifyGST", 
					data: { 
						organizationId, 
						error: setActiveError instanceof Error ? setActiveError.message : String(setActiveError),
						errorStack: setActiveError instanceof Error ? setActiveError.stack : undefined
					} 
				})
			}
		}

		// ✅ FIX: Pass organizationId if provided (allows verification before org is set as active)
		// If not provided, backend will use activeOrganizationId from session
		// If neither exists, backend just verifies without saving (for onboarding)
		logInfo("Calling GST verification API", {
			source: "verifyGST",
			data: {
				gstNumber: gstNumber.substring(0, 5) + "***",
				organizationId,
			}
		})

		const result = await client.organizations.verifyGST({ 
			gstNumber,
			...(organizationId && { organizationId }), // Only pass if provided
		})

		logInfo("GST verification successful", {
			source: "verifyGST",
			data: {
				gstNumber: gstNumber.substring(0, 5) + "***",
				hasResult: !!result,
			}
		})

		return {
			success: true,
			gstDetails: result,
		}
	} catch (error: unknown) {
		// Enhanced error logging
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorStack = error instanceof Error ? error.stack : undefined
		
		// Check for specific error types
		const isServerError = errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("504") || errorMessage.includes("fetch failed") || errorMessage.includes("unexpected response")
		const isAuthError = errorMessage.toLowerCase().includes("authentication") || 
		            errorMessage.toLowerCase().includes("unauthorized") ||
		            errorMessage.toLowerCase().includes("credentials")
		const isNetworkError = errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("network")
		
		// Provide user-friendly error messages
		let userFriendlyError = errorMessage
		if (isServerError) {
			userFriendlyError = "Backend server is not responding. Please check if the backend server is running."
		} else if (isNetworkError) {
			userFriendlyError = "Network error. Please check your internet connection and try again."
		} else if (isAuthError) {
			userFriendlyError = "Authentication required. Please sign in to verify GST."
		} else if (errorMessage.includes("unexpected response")) {
			userFriendlyError = "Backend returned an unexpected response. The server might be down or experiencing issues."
		}
		
		// Only log unexpected errors as errors, others as warnings
		if (!isServerError && !isAuthError && !isNetworkError) {
			logError(error, {
				source: "verifyGST",
				data: {
					errorMessage,
					errorStack,
					errorName: error instanceof Error ? error.name : undefined,
					gstNumber: gstNumber.substring(0, 5) + "***",
					organizationId,
				}
			})
		} else {
			logWarn(`Expected error in verifyGST: ${errorMessage}`, {
				source: "verifyGST",
				data: {
					isServerError,
					isAuthError,
					isNetworkError,
					gstNumber: gstNumber.substring(0, 5) + "***",
					organizationId,
				}
			})
		}

		handleServerAuthError(error)
		
		// Return user-friendly error message
		return {
			success: false,
			error: userFriendlyError,
		}
	}
}

/**
 * Submit onboarding form - creates organization with Better Auth, updates with details, verifies GST, and submits for approval
 */
export async function submitOnboarding(formData: OrganizationDraft) {
	try {
		// CRITICAL: Check authentication before making API calls
		const auth = await requireAuth()
		
		if (!auth.success) {
			return {
				success: false,
				error: "Authentication required. Please sign in to complete onboarding.",
			}
		}

		// Get authenticated client
		const cookieStore = await cookies()
		const token = cookieStore.get("auth-token")?.value
		
		if (!token) {
			return {
				success: false,
				error: "Authentication required. Please sign in to complete onboarding.",
			}
		}

		const client = getAuthenticatedEncoreClient(token)
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

		// Step 3: Verify GST (MANDATORY before submission)
		// ✅ FIX: First check if GST is already verified for this organization
		// If already verified, skip verification (avoid duplicate API calls)
		// If not verified, verify now with explicit organizationId
		try {
			const orgDetails = await client.organizations.getOrganization(basicOrg.id)
			
			// Check if GST is already verified
			if (orgDetails.gstVerified && orgDetails.gstNumber) {
				logInfo("GST already verified for organization, skipping verification", {
					source: "Onboarding",
					data: { 
						organizationId: basicOrg.id,
						gstNumber: orgDetails.gstNumber?.substring(0, 5) + "***"
					}
				})
			} else {
				// GST not verified yet - verify now
				if (!formData.verification?.gstNumber) {
					throw new Error("GST verification is required before submitting for approval. Please verify your GST number first.")
				}
				
				// ✅ CRITICAL FIX: Pass organizationId explicitly to ensure verification is saved to the correct org
				// Backend accepts organizationId parameter (see organizations.ts:1179)
				await client.organizations.verifyGST({
					gstNumber: formData.verification.gstNumber,
					organizationId: basicOrg.id, // ✅ Pass organizationId explicitly
				})
				
				logInfo("GST verified successfully during submission", {
					source: "Onboarding",
					data: { 
						organizationId: basicOrg.id, 
						gstNumber: formData.verification.gstNumber.substring(0, 5) + "***" 
					}
				})
			}
		} catch (gstError: unknown) {
			// GST verification failed or check failed - this is critical, throw error
			const errorMessage = gstError instanceof Error ? gstError.message : String(gstError)
			
			// Check if it's the "not verified" error we threw
			if (errorMessage.includes("GST verification is required")) {
				logError(gstError, { 
					source: "Onboarding", 
					data: { 
						action: "checkGSTVerification", 
						organizationId: basicOrg.id,
						errorMessage
					} 
				})
				throw gstError // Re-throw our custom error
			}
			
			// Otherwise, it's a verification API error
			logError(gstError, { 
				source: "Onboarding", 
				data: { 
					action: "verifyGST", 
					organizationId: basicOrg.id,
					gstNumber: formData.verification?.gstNumber?.substring(0, 5) + "***",
					errorMessage
				} 
			})
			// ✅ FIX: Throw error instead of silently continuing
			// GST verification is mandatory for submission
			throw new Error(`GST verification failed: ${errorMessage}`)
		}

		// Step 4: Submit for approval
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

