/**
 * Generic Status Validators
 *
 * SSOT for status validation across the codebase.
 * Reduces duplicate validation logic in SSR files.
 */

import { CAMPAIGN_STATUSES, ENROLLMENT_STATUSES, INVOICE_STATUSES, ORGANIZATION_STATUSES } from "@/lib/constants"
import type { CampaignStatus } from "@/features/campaigns/types"
import type { EnrollmentStatus } from "@/features/enrollments/types"
import type { InvoiceStatus } from "@/features/invoices/types"
import type { OrganizationStatus } from "@/features/organizations/types"

/**
 * Generic status validator factory
 *
 * @example
 * const isValidCampaignStatus = createStatusValidator(CAMPAIGN_STATUSES)
 * if (isValidCampaignStatus(status)) {
 *   // status is now typed as CampaignStatus
 * }
 */
export function createStatusValidator<T extends string>(
	validStatuses: readonly T[]
): (status: string) => status is T {
	return (status: string): status is T => {
		return (validStatuses as readonly string[]).includes(status)
	}
}

// Pre-built validators for common use cases
export const isValidCampaignStatus = createStatusValidator<CampaignStatus>(CAMPAIGN_STATUSES)
export const isValidEnrollmentStatus = createStatusValidator<EnrollmentStatus>(ENROLLMENT_STATUSES)
export const isValidInvoiceStatus = createStatusValidator<InvoiceStatus>(INVOICE_STATUSES)
export const isValidOrganizationStatus = createStatusValidator<OrganizationStatus>(ORGANIZATION_STATUSES)

/**
 * Parse and validate status from URL search params
 * Returns undefined if invalid (allows for "all" filter)
 */
export function parseStatusParam<T extends string>(
	status: string | undefined | null,
	validator: (s: string) => s is T
): T | undefined {
	if (!status || status === "all") return undefined
	return validator(status) ? status : undefined
}

/**
 * Type guard for checking if a value exists and is not "all"
 */
export function isSpecificStatus(status: string | undefined | null): status is string {
	return !!status && status !== "all"
}
