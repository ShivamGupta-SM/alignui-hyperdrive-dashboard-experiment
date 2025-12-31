// Centralized formatting utilities to prevent re-creation on every render

// SSOT: Re-export error utility for backward compatibility
export { getErrorMessage } from "@/lib/errors/encore-error-handler"

// =============================================================================
// Currency Formatting
// =============================================================================

/**
 * Format a number as Indian currency (INR)
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount)
}

/**
 * Format a number as compact Indian currency (e.g., ₹1.5L, ₹10K)
 */
export function formatCurrencyCompact(amount: number): string {
	if (amount >= 10000000) {
		return `₹${(amount / 10000000).toFixed(1)}Cr`
	}
	if (amount >= 100000) {
		return `₹${(amount / 100000).toFixed(1)}L`
	}
	if (amount >= 1000) {
		return `₹${(amount / 1000).toFixed(1)}K`
	}
	return `₹${amount}`
}

// =============================================================================
// Date Formatting
// =============================================================================

/**
 * Format a date as short date (e.g., "15 Jan")
 */
export function formatDateShort(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
	})
}

/**
 * Format a date as medium date (e.g., "15 Jan 2024")
 */
export function formatDateMedium(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
}

/**
 * Format a date as full date (e.g., "Monday, 15 January 2024")
 */
export function formatDateFull(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	})
}

/**
 * Format a date with weekday (e.g., "Monday, 15 Jan")
 */
export function formatDateWithWeekday(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "short",
	})
}

// NOTE: formatTimeAgo was removed - use formatTimeAgoShort from @/lib/utils/date directly

// =============================================================================
// Number Formatting
// =============================================================================

/**
 * Format a number with Indian number system (lakhs, crores)
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-IN").format(num)
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
	return `${value.toFixed(decimals)}%`
}

/**
 * Format bytes to human readable (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B"
	const k = 1024
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
