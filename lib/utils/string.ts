// =============================================================================
// String Formatting Utilities
// =============================================================================

/**
 * Capitalize the first letter of a string
 * @example capitalizeFirst("hello") => "Hello"
 * @example capitalizeFirst("HELLO") => "HELLO" (only first letter affected)
 */
export function capitalizeFirst(str: string): string {
	if (!str) return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get the first character of a string, uppercased
 * Useful for avatars/initials
 * @example getInitial("John") => "J"
 * @example getInitial("") => "U" (fallback)
 */
export function getInitial(str: string | null | undefined, fallback = "U"): string {
	if (!str) return fallback
	return str.charAt(0).toUpperCase()
}

/**
 * Convert a slug or kebab-case string to Title Case
 * @example toTitleCase("hello-world") => "Hello World"
 * @example toTitleCase("user_profile") => "User Profile"
 */
export function toTitleCase(str: string): string {
	if (!str) return str
	return str
		.replace(/[-_]/g, " ")
		.split(" ")
		.map((word) => capitalizeFirst(word))
		.join(" ")
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @example truncate("Hello World", 5) => "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
	if (!str || str.length <= maxLength) return str
	return str.slice(0, maxLength) + "..."
}
