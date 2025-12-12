/**
 * Simple delay utility for simulating async operations
 * In production, these would be actual API calls
 */

export async function delay(ms: number): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    return Promise.resolve()
  }
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const DELAY = {
  INSTANT: 0,
  FAST: 100,
  STANDARD: 200,
  MEDIUM: 300,
  SLOW: 400,
  FORM: 500,
  VERIFICATION: 800,
  LONG_VERIFICATION: 1000,
  EXPORT: 500,
} as const
