"use server"

/**
 * Organizations Server Actions
 *
 * Uses next-safe-action for type-safe, error-handled server actions
 *
 * NOTE: Organization creation happens through completeOnboarding action
 * in @/features/organizations/actions/onboarding.ts which requires GST details.
 */

import { z } from "zod"

import { authAction } from "@/lib/safe-action"
import { logInfo } from "@/lib/logging"
import { STATUS_CHECKS } from "@/lib/utils/validations"
import type { CreateOrgActionResponse } from "../types"

// =============================================================================
// Actions
// =============================================================================

/**
 * Get existing draft/pending organization (if any)
 *
 * For brand onboarding, use completeOnboarding from @/features/organizations/actions/onboarding
 * which creates the org with all required fields (GST, business details, etc.)
 *
 * This function only checks if user already has a draft/pending org to resume.
 */
export const getExistingDraftOrganization = authAction
	.inputSchema(z.object({}))
	.action(async ({ ctx }): Promise<CreateOrgActionResponse | null> => {
		logInfo("Checking for existing draft organization", {
			source: "getExistingDraftOrganization",
		})

		const orgs = await ctx.client.auth.listOrganizations()
		// SSOT: Using STATUS_CHECKS helpers from @/lib/utils/validations
		const existing = orgs.organizations.find(
			(o) => STATUS_CHECKS.isDraft(o.approvalStatus) || STATUS_CHECKS.isPending(o.approvalStatus)
		)

		if (existing) {
			const status = (existing.approvalStatus ?? "draft") as "draft" | "pending" | "approved" | "rejected" | "banned"
			logInfo("Found existing draft/pending organization", {
				source: "getExistingDraftOrganization",
				data: { organizationId: existing.id, approvalStatus: status },
			})
			return {
				id: existing.id,
				name: existing.name,
				isNew: false,
				approvalStatus: status,
			}
		}

		return null
	})

