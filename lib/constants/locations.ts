/**
 * India Location Data
 *
 * State/City data and GST codes for India.
 * Uses dynamic imports to avoid bundling the large country-state-city library.
 */

// ============================================================================
// INDIA LOCATION DATA (Lazy loaded)
// ============================================================================

export const INDIA_ISO_CODE = "IN"

// Cache for loaded data
let _statesCache: string[] | null = null
const _citiesCache: Map<string, string[]> = new Map()

/**
 * Get all Indian states sorted alphabetically (async, cached)
 */
export async function getIndianStates(): Promise<string[]> {
	if (_statesCache) return _statesCache
	const { State } = await import("country-state-city")
	_statesCache = State.getStatesOfCountry(INDIA_ISO_CODE)
		.map((state) => state.name)
		.sort()
	return _statesCache
}

/**
 * Get state details by state name (async)
 */
export async function getIndianStateByName(stateName: string) {
	const { State } = await import("country-state-city")
	return State.getStatesOfCountry(INDIA_ISO_CODE).find(
		(state) => state.name.toLowerCase() === stateName.toLowerCase()
	)
}

/**
 * Get cities for a given Indian state (async, cached)
 */
export async function getCitiesOfState(stateName: string): Promise<string[]> {
	if (_citiesCache.has(stateName)) return _citiesCache.get(stateName)!
	const { State, City } = await import("country-state-city")
	const state = State.getStatesOfCountry(INDIA_ISO_CODE).find(
		(s) => s.name.toLowerCase() === stateName.toLowerCase()
	)
	if (!state) return []
	const cities = City.getCitiesOfState(INDIA_ISO_CODE, state.isoCode)
		.map((city) => city.name)
		.sort()
	_citiesCache.set(stateName, cities)
	return cities
}

/**
 * Get all Indian cities (flat list) - async
 */
export async function getAllIndianCities(): Promise<string[]> {
	const { City } = await import("country-state-city")
	return City.getCitiesOfCountry(INDIA_ISO_CODE)
		?.map((city) => city.name)
		.sort() || []
}

/**
 * @deprecated Use getIndianStates() async version instead
 * Kept for backwards compatibility - returns empty array, use async version
 */
export const INDIAN_STATES: string[] = []

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
