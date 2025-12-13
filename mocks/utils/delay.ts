/**
 * Delay utility for MSW mock handlers
 * Simulates realistic network latency in development
 */

// Delay durations in milliseconds
export const DELAY = {
    INSTANT: 0,
    FAST: 100,
    STANDARD: 200,
    MEDIUM: 300,
    NORMAL: 300,
    SLOW: 800,
    VERY_SLOW: 1500,
} as const

/**
 * Creates a promise that resolves after the specified delay
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
