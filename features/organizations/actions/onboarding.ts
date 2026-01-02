"use server"

/**
 * Onboarding Server Actions
 *
 * Single endpoint approach for complete onboarding flow
 */

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { logInfo, logError } from "@/lib/logging"
import { getErrorMessage, BUSINESS_TYPES, VALIDATION_CONSTANTS } from "@/lib/utils"
import type { CompleteOnboardingResult } from "@/features/organizations/types"

// =============================================================================
// Schemas - SSOT: Uses constants from @/lib/utils/validations
// =============================================================================

const completeOnboardingSchema = z.object({
	// Basic Info
	name: z.string().min(1, "Organization name is required"),
	description: z.string().optional(),
	website: z.string().url().optional().or(z.literal("")),
	logo: z.string().url().optional().or(z.literal("")),

	// Business Details - SSOT: Uses BUSINESS_TYPES from validations.ts
	businessType: z.enum(BUSINESS_TYPES).optional(),
	industryCategory: z.string().optional(),
	contactPerson: z.string().optional(),
	// SSOT: Uses VALIDATION_CONSTANTS.PHONE_REGEX
	phoneNumber: z.string().regex(VALIDATION_CONSTANTS.PHONE_REGEX, "Invalid phone number"),

	// Address - SSOT: Uses VALIDATION_CONSTANTS.PIN_CODE_REGEX
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	postalCode: z.string().regex(VALIDATION_CONSTANTS.PIN_CODE_REGEX, "Invalid PIN code"),

	// GST - SSOT: Uses VALIDATION_CONSTANTS.GST_NUMBER_REGEX
	gstNumber: z.string().regex(VALIDATION_CONSTANTS.GST_NUMBER_REGEX, "Invalid GST number format"),
	gstLegalName: z.string().min(1, "GST legal name is required"),
	gstTradeName: z.string().optional(),

	// Optional
	cinNumber: z
		.string()
		.regex(/^[A-Z][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
		.optional()
		.or(z.literal("")),
})

// Schema for GST preview - no organizationId needed (clean REST design)
const verifyGSTPreviewSchema = z.object({
	gstNumber: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Complete Onboarding - Single API call for entire flow
 *
 * Uses Better Auth's createOrganization endpoint (auth/endpoints-organization.ts)
 * which handles:
 * - Create organization with all business fields via additionalFields
 * - GST duplicate check
 * - Set approvalStatus = "pending" (GST is ALWAYS pre-verified by frontend)
 * - Publish OrganizationCreated event (for async processing)
 * - Track organizationSignups metric
 *
 * Note: Wallet creation happens on admin approval, not during onboarding
 */
export const completeOnboarding = authAction
	.inputSchema(completeOnboardingSchema)
	.action(async ({ parsedInput, ctx }): Promise<CompleteOnboardingResult> => {
		logInfo("Starting complete onboarding", {
			source: "completeOnboarding",
			data: {
				name: parsedInput.name,
				gstNumber: `${parsedInput.gstNumber.substring(0, 5)}***`,
			},
		})

		try {
			// Single API call to Better Auth's createOrganization endpoint
			// GST is ALWAYS pre-verified by frontend via /gst/verify-preview
			const result = await ctx.client.auth.createOrganization({
				name: parsedInput.name,
				description: parsedInput.description || undefined,
				website: parsedInput.website || undefined,
				logo: parsedInput.logo || undefined,
				businessType: parsedInput.businessType,
				industryCategory: parsedInput.industryCategory || undefined,
				contactPerson: parsedInput.contactPerson || undefined,
				phoneNumber: parsedInput.phoneNumber,
				address: parsedInput.address,
				city: parsedInput.city,
				state: parsedInput.state,
				postalCode: parsedInput.postalCode,
				gstNumber: parsedInput.gstNumber,
				gstLegalName: parsedInput.gstLegalName,
				gstTradeName: parsedInput.gstTradeName || undefined,
				cinNumber: parsedInput.cinNumber || undefined,
			})

			logInfo("Onboarding completed successfully", {
				source: "completeOnboarding",
				data: {
					organizationId: result.id,
					approvalStatus: result.approvalStatus,
				},
			})

			// Revalidate paths
			revalidatePath("/onboarding")
			revalidatePath("/dashboard")

			return {
				success: true,
				organizationId: result.id,
				organizationName: result.name,
				approvalStatus: "pending",
				gstDuplicateFlag: result.gstDuplicateFlag,
			}
		} catch (error) {
			logError(error, {
				source: "completeOnboarding",
				data: {
					name: parsedInput.name,
					gstNumber: `${parsedInput.gstNumber.substring(0, 5)}***`,
				},
			})

			throw error
		}
	})

/**
 * Verify GST Preview - For preview/validation BEFORE organization creation
 *
 * Uses the clean /gst/verify-preview endpoint (no organizationId required)
 * This solves the chicken-and-egg problem where GST verification
 * needs to happen before org creation.
 *
 * The final GST save happens in completeOnboarding.
 */
export const verifyGST = authAction.inputSchema(verifyGSTPreviewSchema).action(async ({ parsedInput, ctx }) => {
	const { gstNumber } = parsedInput

	logInfo("GST verification preview", {
		source: "verifyGST",
		data: {
			gstNumber: `${gstNumber.substring(0, 5)}***`,
		},
	})

	try {
		// Type-safe client call using generated verifyGSTPreview method
		const result = await ctx.client.organizations.verifyGSTPreview({ gstNumber })

		logInfo("GST verification preview successful", {
			source: "verifyGST",
			data: {
				gstNumber: `${gstNumber.substring(0, 5)}***`,
				legalName: result.legalName,
				stateCode: result.stateCode,
			},
		})

		return {
			success: true,
			gstDetails: {
				gstNumber: result.gstNumber,
				legalName: result.legalName,
				tradeName: result.tradeName,
				gstStatus: result.gstStatus,
				address: result.address,
				stateCode: result.stateCode,
				isVerified: false, // Preview only - not saved to org yet
			},
		}
	} catch (error) {
		const errorMessage = getErrorMessage(error)

		logError(error, {
			source: "verifyGST",
			data: {
				gstNumber: `${gstNumber.substring(0, 5)}***`,
				error: errorMessage,
			},
		})

		throw error
	}
})
