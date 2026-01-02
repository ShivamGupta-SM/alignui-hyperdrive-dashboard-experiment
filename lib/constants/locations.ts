/**
 * India Location Data
 *
 * State/City data and GST codes for India.
 */

import { State, City } from "country-state-city"

// ============================================================================
// INDIA LOCATION DATA
// ============================================================================

export const INDIA_ISO_CODE = "IN"

/**
 * Get all Indian states sorted alphabetically
 */
export const INDIAN_STATES = State.getStatesOfCountry(INDIA_ISO_CODE)
	.map((state) => state.name)
	.sort()

/**
 * Get state details by state name
 */
export function getIndianStateByName(stateName: string) {
	return State.getStatesOfCountry(INDIA_ISO_CODE).find(
		(state) => state.name.toLowerCase() === stateName.toLowerCase()
	)
}

/**
 * Get cities for a given Indian state
 */
export function getCitiesOfState(stateName: string): string[] {
	const state = getIndianStateByName(stateName)
	if (!state) return []
	return City.getCitiesOfState(INDIA_ISO_CODE, state.isoCode)
		.map((city) => city.name)
		.sort()
}

/**
 * Get all Indian cities (flat list)
 */
export function getAllIndianCities(): string[] {
	return City.getCitiesOfCountry(INDIA_ISO_CODE)
		?.map((city) => city.name)
		.sort() || []
}

// ============================================================================
// E-COMMERCE & PRODUCTS
// ============================================================================

export const E_COMMERCE_PLATFORMS = [
	"Amazon",
	"Flipkart",
	"Myntra",
	"Ajio",
	"Nykaa",
	"Tata CLiQ",
	"Reliance Digital",
	"Croma",
	"Any Platform",
]

export const PRODUCT_CATEGORIES = [
	"Electronics",
	"Fashion",
	"Footwear",
	"Beauty & Personal Care",
	"Home & Kitchen",
	"Sports & Fitness",
	"Toys & Games",
	"Books",
	"Automotive",
	"Other",
]

// ============================================================================
// PLATFORM COLORS (for badges)
// ============================================================================

export const PLATFORM_COLORS: Record<string, string> = {
	Amazon: "bg-orange-100 text-orange-700",
	Flipkart: "bg-yellow-100 text-yellow-700",
	Myntra: "bg-pink-100 text-pink-700",
	Ajio: "bg-purple-100 text-purple-700",
	Nykaa: "bg-rose-100 text-rose-700",
	"Tata CLiQ": "bg-blue-100 text-blue-700",
	"Reliance Digital": "bg-red-100 text-red-700",
	Croma: "bg-green-100 text-green-700",
	"Any Platform": "bg-gray-100 text-gray-600",
} as const

export function getPlatformColor(platform: string | null | undefined): string {
	if (!platform) return "bg-gray-100 text-gray-600"
	return PLATFORM_COLORS[platform] ?? "bg-gray-100 text-gray-600"
}

// ============================================================================
// GST STATE CODES
// ============================================================================

export const GST_STATE_CODES: Record<string, string> = {
	"01": "Jammu & Kashmir",
	"02": "Himachal Pradesh",
	"03": "Punjab",
	"04": "Chandigarh",
	"05": "Uttarakhand",
	"06": "Haryana",
	"07": "Delhi",
	"08": "Rajasthan",
	"09": "Uttar Pradesh",
	"10": "Bihar",
	"11": "Sikkim",
	"12": "Arunachal Pradesh",
	"13": "Nagaland",
	"14": "Manipur",
	"15": "Mizoram",
	"16": "Tripura",
	"17": "Meghalaya",
	"18": "Assam",
	"19": "West Bengal",
	"20": "Jharkhand",
	"21": "Odisha",
	"22": "Chhattisgarh",
	"23": "Madhya Pradesh",
	"24": "Gujarat",
	"26": "Dadra & Nagar Haveli and Daman & Diu",
	"27": "Maharashtra",
	"28": "Andhra Pradesh",
	"29": "Karnataka",
	"30": "Goa",
	"31": "Lakshadweep",
	"32": "Kerala",
	"33": "Tamil Nadu",
	"34": "Puducherry",
	"35": "Andaman & Nicobar Islands",
	"36": "Telangana",
	"37": "Andhra Pradesh (New)",
} as const

export function getStateFromGSTCode(code: string): string {
	return GST_STATE_CODES[code] || "India"
}
