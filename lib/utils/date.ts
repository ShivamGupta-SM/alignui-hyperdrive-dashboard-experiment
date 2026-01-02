/**
 * Centralized Date/Time Utilities
 *
 * Using date-fns for battle-tested, tree-shakeable date operations.
 * All date/time formatting and calculations should use these functions.
 */

import {
	formatDistanceToNow,
	differenceInHours,
	differenceInDays,
	isToday as dateFnsIsToday,
	subDays,
	getWeek,
	parseISO,
} from "date-fns"

import { THRESHOLDS } from "@/lib/types/constants"
import { CAMPAIGN_ENDING_SOON_DAYS } from "@/lib/constants"

// =============================================================================
// Helper to normalize date input
// =============================================================================

function toDate(date: Date | string): Date {
	if (typeof date === "string") {
		return parseISO(date)
	}
	return date
}

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
	return differenceInHours(new Date(referenceTime), toDate(date))
}

/**
 * Get time ago as human-readable string
 * @param date - Date to format
 * @param referenceTime - Reference timestamp (defaults to now, accepts null for hydration safety)
 * @returns Formatted string like "Just now", "2h ago", "3 days ago"
 */
export function getTimeAgo(date: Date | string, referenceTime: number | null = Date.now()): string {
	const now = referenceTime ?? Date.now()
	const dateObj = toDate(date)
	const diffHours = differenceInHours(new Date(now), dateObj)

	if (diffHours < 1) return "Just now"
	if (diffHours < 24) return `${diffHours}h ago`

	const diffDays = differenceInDays(new Date(now), dateObj)
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
 * Get relative time using date-fns formatDistanceToNow
 * More accurate relative time for display purposes
 */
export function getRelativeTime(date: Date | string): string {
	return formatDistanceToNow(toDate(date), { addSuffix: true })
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
 * @param referenceTime - Reference timestamp (defaults to now, accepts null for hydration safety)
 * @returns True if overdue (more than ENROLLMENT_OVERDUE_HOURS hours ago)
 */
export function isOverdue(date: Date | string, referenceTime: number | null = Date.now()): boolean {
	const now = referenceTime ?? Date.now()
	const hours = differenceInHours(new Date(now), toDate(date))
	return hours > THRESHOLDS.ENROLLMENT_OVERDUE_HOURS
}

/**
 * Check if a campaign is ending soon
 * @param endDate - Campaign end date
 * @param referenceTime - Reference timestamp (defaults to now, accepts null for hydration safety)
 * @returns True if ending within CAMPAIGN_ENDING_SOON_DAYS days
 */
export function isEndingSoon(endDate: Date | string, referenceTime: number | null = Date.now()): boolean {
	const now = referenceTime ?? Date.now()
	const daysUntilEnd = getDaysUntil(endDate, now)
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
	return differenceInDays(toDate(date), new Date(referenceTime))
}

/**
 * Get number of days since a date
 * @param date - Past date
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns Number of days since (floored)
 */
export function getDaysSince(date: Date | string, referenceTime: number = Date.now()): number {
	return differenceInDays(new Date(referenceTime), toDate(date))
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
	return dateFnsIsToday(toDate(date))
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if date is before reference time
 */
export function isPast(date: Date | string, referenceTime: number = Date.now()): boolean {
	const dateObj = toDate(date)
	// For referenceTime comparison, use direct comparison
	return dateObj.getTime() < referenceTime
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @param referenceTime - Reference timestamp (defaults to now)
 * @returns True if date is after reference time
 */
export function isFuture(date: Date | string, referenceTime: number = Date.now()): boolean {
	const dateObj = toDate(date)
	return dateObj.getTime() > referenceTime
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
	const startDate = subDays(endDate, days)

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
	return getWeek(toDate(date))
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
	const hoursUntil = differenceInHours(toDate(deadline), new Date(referenceTime))
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
