/**
 * Centralized Date/Time Utilities
 *
 * All date/time formatting and calculations should use these functions
 * to prevent duplication and ensure consistency across the app.
 */

import { THRESHOLDS } from "@/lib/types/constants"
import { CAMPAIGN_ENDING_SOON_DAYS } from "@/lib/constants"

// =============================================================================
// Time Ago Calculations
// =============================================================================

/**
 * Get hours ago from a date
 * @param date - Date to calculate from
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Number of hours ago (floored)
 */
export function getHoursAgo(date: Date | string, referenceTime: number = Date.now()): number {
	const dateMs = new Date(date).getTime()
	return Math.floor((referenceTime - dateMs) / (1000 * 60 * 60))
}

/**
 * Get time ago as human-readable string
 * @param date - Date to format
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Formatted string like "Just now", "2h ago", "3 days ago"
 */
export function getTimeAgo(date: Date | string, referenceTime: number = Date.now()): string {
	const diffMs = referenceTime - new Date(date).getTime()
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

	if (diffHours < 1) return "Just now"
	if (diffHours < 24) return `${diffHours}h ago`

	const diffDays = Math.floor(diffHours / 24)
	if (diffDays === 1) return "1 day ago"
	if (diffDays < 7) return `${diffDays} days ago`

	const diffWeeks = Math.floor(diffDays / 7)
	if (diffWeeks === 1) return "1 week ago"
	if (diffWeeks < 4) return `${diffWeeks} weeks ago`

	const diffMonths = Math.floor(diffDays / 30)
	if (diffMonths === 1) return "1 month ago"
	return `${diffMonths} months ago`
}

/**
 * Format time ago with short format
 * @param hoursAgo - Number of hours ago
 * @returns Formatted string like "2h ago", "3d ago"
 */
export function formatTimeAgoShort(hoursAgo: number): string {
	if (hoursAgo < 24) return `${hoursAgo}h ago`
	return `${Math.floor(hoursAgo / 24)}d ago`
}

// =============================================================================
// Overdue Checks
// =============================================================================

/**
 * Check if a date is overdue based on enrollment threshold
 * @param date - Date to check
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if overdue (more than ENROLLMENT_OVERDUE_HOURS hours ago)
 */
export function isOverdue(date: Date | string, referenceTime: number = Date.now()): boolean {
	const diffMs = referenceTime - new Date(date).getTime()
	return diffMs > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS * 60 * 60 * 1000
}

/**
 * Check if a campaign is ending soon
 * @param endDate - Campaign end date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if ending within CAMPAIGN_ENDING_SOON_DAYS days
 */
export function isEndingSoon(endDate: Date | string, referenceTime: number = Date.now()): boolean {
	const daysUntilEnd = getDaysUntil(endDate, referenceTime)
	return daysUntilEnd <= CAMPAIGN_ENDING_SOON_DAYS && daysUntilEnd > 0
}

// =============================================================================
// Days Calculations
// =============================================================================

/**
 * Get number of days until a date
 * @param date - Target date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Number of days (can be negative if in past)
 */
export function getDaysUntil(date: Date | string, referenceTime: number = Date.now()): number {
	const targetMs = new Date(date).getTime()
	return Math.ceil((targetMs - referenceTime) / (1000 * 60 * 60 * 24))
}

/**
 * Get number of days since a date
 * @param date - Past date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Number of days since (floored)
 */
export function getDaysSince(date: Date | string, referenceTime: number = Date.now()): number {
	const dateMs = new Date(date).getTime()
	return Math.floor((referenceTime - dateMs) / (1000 * 60 * 60 * 24))
}

// =============================================================================
// Date Comparisons
// =============================================================================

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if same calendar day
 */
export function isToday(date: Date | string): boolean {
	const d = new Date(date)
	const today = new Date()
	return (
		d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear()
	)
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if date is before reference time
 */
export function isPast(date: Date | string, referenceTime: number = Date.now()): boolean {
	return new Date(date).getTime() < referenceTime
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if date is after reference time
 */
export function isFuture(date: Date | string, referenceTime: number = Date.now()): boolean {
	return new Date(date).getTime() > referenceTime
}

// =============================================================================
// Date Range Helpers
// =============================================================================

/**
 * Get start and end of a date range for querying
 * @param days - Number of days to look back
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns { startDate, endDate } as ISO strings
 */
export function getDateRange(days: number, referenceTime: number = Date.now()): { startDate: string; endDate: string } {
	const endDate = new Date(referenceTime)
	const startDate = new Date(referenceTime - days * 24 * 60 * 60 * 1000)

	return {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
	}
}

/**
 * Get the week number for a date
 * @param date - Date to check
 * @returns Week number (1-52)
 */
export function getWeekNumber(date: Date | string): number {
	const d = new Date(date)
	d.setHours(0, 0, 0, 0)
	d.setDate(d.getDate() + 4 - (d.getDay() || 7))
	const yearStart = new Date(d.getFullYear(), 0, 1)
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// =============================================================================
// Deadline Helpers
// =============================================================================

/**
 * Check if a deadline is approaching (within 24 hours)
 * @param deadline - Deadline date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if deadline is within 24 hours
 */
export function isDeadlineApproaching(deadline: Date | string, referenceTime: number = Date.now()): boolean {
	const hoursUntil = getDaysUntil(deadline, referenceTime) * 24
	return hoursUntil > 0 && hoursUntil <= 24
}

/**
 * Get deadline status
 * @param deadline - Deadline date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Status string: "overdue", "approaching", "upcoming", "distant"
 */
export function getDeadlineStatus(deadline: Date | string, referenceTime: number = Date.now()): "overdue" | "approaching" | "upcoming" | "distant" {
	const daysUntil = getDaysUntil(deadline, referenceTime)

	if (daysUntil < 0) return "overdue"
	if (daysUntil <= 1) return "approaching"
	if (daysUntil <= 7) return "upcoming"
	return "distant"
}
