/**
 * Organization utility functions
 * 
 * @description
 * Helper functions for organization data transformation
 */

/**
 * Map backend businessType to frontend BusinessType
 */
export function mapBackendBusinessType(
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
export function mapBusinessType(
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
