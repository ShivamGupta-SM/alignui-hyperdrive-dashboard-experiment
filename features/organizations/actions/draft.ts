"use server"

/**
 * Organization Draft Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 */

import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { logInfo, logError } from "@/lib/logging/error-logger-simple"
import type { OrganizationDraft, BusinessType, IndustryCategory } from "@/lib/types"
import type { organizations } from "@/lib/api/encore-client"

// =============================================================================
// Schemas
// =============================================================================

const saveDraftSchema = z.object({
	organizationId: z.string().min(1),
	formData: z.object({
		step: z.number().optional(),
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
	}),
})

const loadDraftSchema = z.object({
	organizationId: z.string().min(1),
})

// =============================================================================
// Actions
// =============================================================================

/**
 * Save onboarding draft to backend
 * Used for cross-device persistence
 */
export const saveOnboardingDraft = authAction
	.inputSchema(saveDraftSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { organizationId, formData } = parsedInput

		// Map formData to organization update request
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

		// Update organization with draft data
		await ctx.client.organizations.updateOrganization(organizationId, updateRequest)

		// If GST provided, verify them (non-blocking)
		if (formData.verification?.gstNumber && !formData.verification?.gstVerified) {
			try {
				await ctx.client.organizations.verifyGST(organizationId, {
					gstNumber: formData.verification.gstNumber,
				})
			} catch {
				logInfo("GST verification skipped during draft save (will verify on submit)", {
					source: "Onboarding",
					data: { action: "saveDraft" },
				})
			}
		}

		return { success: true }
	})

/**
 * Load onboarding draft from backend
 * Returns null if no draft found
 */
export const loadOnboardingDraft = authAction
	.inputSchema(loadDraftSchema)
	.action(async ({ parsedInput, ctx }): Promise<OrganizationDraft | null> => {
		try {
			const org = await ctx.client.organizations.getOrganization(parsedInput.organizationId)

			if (!org) {
				return null
			}

			// Map organization data back to form format
			return {
				step: 4,
				basicInfo: {
					name: org.name || "",
					description: org.description || undefined,
					website: org.website || undefined,
					logo: org.logo || undefined,
				},
				businessDetails: {
					businessType: ((org as typeof org & { businessType?: string }).businessType || "pvt_ltd") as BusinessType,
					industryCategory: ((org as typeof org & { industryCategory?: string }).industryCategory ||
						"electronics") as IndustryCategory,
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
					cinNumber: org.cinNumber || "",
				},
			}
		} catch (error) {
			logError(error, {
				source: "Onboarding",
				data: { action: "loadDraft", organizationId: parsedInput.organizationId },
			})
			return null
		}
	})
