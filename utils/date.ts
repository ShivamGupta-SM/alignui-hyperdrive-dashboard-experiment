/**
 * Date/Time Utility Functions
 * Provides relative time formatting and date utilities
 */

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()

  // Handle future dates
  if (diff < 0) {
    return formatFutureTime(Math.abs(diff))
  }

  // Just now
  if (diff < MINUTE) {
    return 'Just now'
  }

  // Minutes
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }

  // Hours
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }

  // Days
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY)
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  // Weeks
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }

  // Months
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }

  // Years
  const years = Math.floor(diff / YEAR)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

/**
 * Format future time
 */
function formatFutureTime(diff: number): string {
  if (diff < MINUTE) {
    return 'In a moment'
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE)
    return `In ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY)
    if (days === 1) return 'Tomorrow'
    return `In ${days} days`
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK)
    return `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH)
    return `In ${months} ${months === 1 ? 'month' : 'months'}`
  }

  const years = Math.floor(diff / YEAR)
  return `In ${years} ${years === 1 ? 'year' : 'years'}`
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const target = new Date(date)
  return target.toLocaleDateString('en-IN', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | number): string {
  const target = new Date(date)
  return target.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string | number): string {
  const target = new Date(date)
  return target.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const target = new Date(date)
  const today = new Date()
  return (
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const target = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    target.getDate() === yesterday.getDate() &&
    target.getMonth() === yesterday.getMonth() &&
    target.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Get smart date label (Today, Yesterday, or formatted date)
 */
export function getSmartDateLabel(date: Date | string | number): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return formatDate(date, { month: 'short', day: 'numeric' })
}
