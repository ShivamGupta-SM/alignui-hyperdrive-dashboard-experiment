"use server"

/**
 * Onboarding Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { logWarn, logError, logInfo } from "@/lib/logging/error-logger-simple"
import { getErrorMessageForLog } from "@/lib/utils/format"
import type { OrganizationDraft } from "@/lib/types"
import type { organizations } from "@/lib/api/encore-client"

// Organization with approval status type
type OrganizationWithStatus = { id: string; name: string; approvalStatus?: string; [key: string]: unknown }

// =============================================================================
// Schemas
// =============================================================================

const verifyGSTSchema = z.object({
	gstNumber: z.string().min(1),
	organizationId: z.string().optional(),
})

const submitOnboardingSchema = z.object({
	basicInfo: z
		.object({
			name: z.string().optional(),
			description: z.string().optional(),
			website: z.string().optional(),
			logo: z.string().optional(),
		})
		.optional(),
	businessDetails: z
		.object({
			businessType: z.string().optional(),
			industryCategory: z.string().optional(),
			contactPerson: z.string().optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
			city: z.string().optional(),
			state: z.string().optional(),
			pinCode: z.string().optional(),
		})
		.optional(),
	verification: z
		.object({
			gstNumber: z.string().optional(),
			gstVerified: z.boolean().optional(),
			cinNumber: z.string().optional(),
		})
		.optional(),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Check user organizations for onboarding flow
 */
export const checkUserOrganizations = authAction.inputSchema(z.object({})).action(async ({ ctx }): Promise<{
	organizations: OrganizationWithStatus[]
	approvedOrgs: OrganizationWithStatus[]
	draftOrgs: OrganizationWithStatus[]
}> => {
	const orgsResult = await ctx.client.auth.listOrganizations()
	const organizations = (orgsResult.organizations || []) as unknown as OrganizationWithStatus[]

	const approvedOrgs = organizations.filter(
		(org): org is typeof org & { approvalStatus: string } =>
			"approvalStatus" in org && org.approvalStatus === "approved"
	)

	const draftOrgs = organizations.filter(
		(org): org is typeof org & { approvalStatus: string } =>
			"approvalStatus" in org && (org.approvalStatus === "draft" || org.approvalStatus === "pending")
	)

	return { organizations, approvedOrgs, draftOrgs }
})

/**
 * Verify GST during onboarding
 */
export const verifyGST = authAction.inputSchema(verifyGSTSchema).action(async ({ parsedInput, ctx }) => {
	const { gstNumber, organizationId } = parsedInput

	logInfo("GST verification starting", {
		source: "verifyGST",
		data: {
			gstNumber: `${gstNumber.substring(0, 5)}***`,
			organizationId,
		},
	})

	// If organizationId is provided, ensure it's set as active organization
	if (organizationId) {
		try {
			await ctx.client.auth.setActiveOrganization({ organizationId })
			logInfo("Set active organization for GST verification", {
				source: "verifyGST",
				data: { organizationId },
			})
		} catch (setActiveError) {
			logWarn("Failed to set active organization", {
				source: "verifyGST",
				data: {
					organizationId,
					error: getErrorMessageForLog(setActiveError),
				},
			})
		}
	}

	// URL-based multi-tenancy: organizationId is required in URL path
	// Use "verify-only" for onboarding before org creation
	const orgIdForVerification = organizationId || "verify-only"

	logInfo("Calling GST verification API", {
		source: "verifyGST",
		data: {
			gstNumber: `${gstNumber.substring(0, 5)}***`,
			organizationId: orgIdForVerification,
		},
	})

	const result = await ctx.client.organizations.verifyGST(orgIdForVerification, { gstNumber })

	logInfo("GST verification successful", {
		source: "verifyGST",
		data: {
			gstNumber: `${gstNumber.substring(0, 5)}***`,
			hasResult: !!result,
		},
	})

	return { success: true, gstDetails: result }
})

/**
 * Submit onboarding form - creates organization with Better Auth, updates with details, verifies GST, and submits for approval
 */
export const submitOnboarding = authAction.inputSchema(submitOnboardingSchema).action(async ({ parsedInput, ctx }) => {
	const formData = parsedInput as OrganizationDraft

	// Step 1: Create basic organization using Better Auth (just name)
	// If organization already exists (from draft), use it
	let basicOrg = null
	const orgsResult = await ctx.client.auth.listOrganizations()
	const existingDraftOrg = orgsResult.organizations?.find((org) => {
		const orgWithStatus = org as typeof org & { approvalStatus?: string }
		return orgWithStatus.approvalStatus === "draft" || orgWithStatus.approvalStatus === "pending"
	})

	if (existingDraftOrg) {
		basicOrg = { id: existingDraftOrg.id }
		logInfo("Using existing draft organization", { source: "Onboarding", data: { organizationId: existingDraftOrg.id } })
	} else {
		basicOrg = await ctx.client.organizations.createOrganization({
			name: formData.basicInfo?.name || "",
		})

		if (!basicOrg?.id) {
			throw new Error("Failed to create organization")
		}
	}

	// Step 2: Update organization with all advanced details
	const updateRequest = {
		description: formData.basicInfo?.description,
		website: formData.basicInfo?.website,
		contactPerson: formData.businessDetails?.contactPerson,
		phoneNumber: formData.businessDetails?.phone,
		address: formData.businessDetails?.address,
		city: formData.businessDetails?.city,
		state: formData.businessDetails?.state,
		postalCode: formData.businessDetails?.pinCode,
		businessType: formData.businessDetails?.businessType,
		industryCategory: formData.businessDetails?.industryCategory,
		cinNumber: formData.verification?.cinNumber,
	} as organizations.UpdateOrganizationRequest & {
		businessType?: string
		industryCategory?: string
		cinNumber?: string
	}

	await ctx.client.organizations.updateOrganization(basicOrg.id, updateRequest)

	// Step 3: Verify GST (MANDATORY before submission)
	try {
		const orgDetails = await ctx.client.organizations.getOrganization(basicOrg.id)

		if (orgDetails.gstVerified && orgDetails.gstNumber) {
			logInfo("GST already verified for organization, skipping verification", {
				source: "Onboarding",
				data: {
					organizationId: basicOrg.id,
					gstNumber: `${orgDetails.gstNumber?.substring(0, 5)}***`,
				},
			})
		} else {
			if (!formData.verification?.gstNumber) {
				throw new Error("GST verification is required before submitting for approval. Please verify your GST number first.")
			}

			await ctx.client.organizations.verifyGST(basicOrg.id, {
				gstNumber: formData.verification.gstNumber,
			})

			logInfo("GST verified successfully during submission", {
				source: "Onboarding",
				data: {
					organizationId: basicOrg.id,
					gstNumber: `${formData.verification.gstNumber.substring(0, 5)}***`,
				},
			})
		}
	} catch (gstError: unknown) {
		const errorMessage = getErrorMessageForLog(gstError)

		if (errorMessage.includes("GST verification is required")) {
			logError(gstError, {
				source: "Onboarding",
				data: {
					action: "checkGSTVerification",
					organizationId: basicOrg.id,
					errorMessage,
				},
			})
			throw gstError
		}

		logError(gstError, {
			source: "Onboarding",
			data: {
				action: "verifyGST",
				organizationId: basicOrg.id,
				gstNumber: `${formData.verification?.gstNumber?.substring(0, 5)}***`,
				errorMessage,
			},
		})
		throw new Error(`GST verification failed: ${errorMessage}`)
	}

	// Step 4: Submit for approval
	await ctx.client.organizations.submitOrganizationForApproval(basicOrg.id)

	revalidatePath("/onboarding")
	revalidatePath("/dashboard")

	return {
		success: true,
		organizationId: basicOrg.id,
		message: "Organization created and submitted for approval",
		redirectTo: "/onboarding/pending",
	}
})
