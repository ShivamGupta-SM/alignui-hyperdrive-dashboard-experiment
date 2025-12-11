/**
 * Utility for simulating network delays (for mock APIs)
 *
 * Environment-based configuration:
 * - NODE_ENV === 'production': No delays
 * - ENABLE_MOCK_DELAYS === 'false': No delays (useful for testing)
 * - Otherwise: Apply delays in development
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const MOCK_DELAYS_DISABLED = process.env.ENABLE_MOCK_DELAYS === 'false'

/**
 * Check if mock delays should be applied
 */
export function shouldApplyDelays(): boolean {
  if (IS_PRODUCTION) return false
  if (MOCK_DELAYS_DISABLED) return false
  return true
}

/**
 * Simulate network delay for mock APIs
 * @param ms - Milliseconds to delay (only applied when delays are enabled)
 */
export function delay(ms: number): Promise<void> {
  if (!shouldApplyDelays()) {
    return Promise.resolve()
  }
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Delay constants for consistent mock timing
 */
export const DELAY = {
  /** Instant operations (0ms) - for immediate responses */
  INSTANT: 0,
  /** Fast operations (200ms) */
  FAST: 200,
  /** Standard operations (300ms) */
  STANDARD: 300,
  /** Medium operations (400ms) */
  MEDIUM: 400,
  /** Slower operations like form submissions (500ms) */
  SLOW: 500,
  /** Long operations like bulk updates (800ms) */
  LONG: 800,
  /** Form submissions (1000ms) */
  FORM: 1000,
  /** Verification operations (1500ms) */
  VERIFICATION: 1500,
  /** Long verification like GST lookup (2000ms) */
  LONG_VERIFICATION: 2000,
  /** Very long operations like exports (1000ms) */
  EXPORT: 1000,
} as const
