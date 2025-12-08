/**
 * Currency Formatting Utilities
 * Provides consistent currency formatting across the application
 */

/**
 * Format currency with INR symbol
 * @param amount - Amount in rupees
 * @param options - Formatting options
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean
    decimals?: number
  }
): string {
  const { showSymbol = true, decimals = 0 } = options || {}
  
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  
  return showSymbol ? `₹${formatted}` : formatted
}

/**
 * Format currency in short form (e.g., ₹2.5L, ₹50K)
 * @param amount - Amount in rupees
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 10000000) {
    // Crores (10 million+)
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    // Lakhs (100,000+)
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    // Thousands (1,000+)
    return `₹${(amount / 1000).toFixed(0)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format currency with compact notation
 * Similar to formatCurrencyShort but more aggressive
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

/**
 * Parse currency string to number
 * Handles INR formatted strings
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol, commas, and spaces
  const cleaned = value.replace(/[₹,\s]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with Indian grouping
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN')
}
