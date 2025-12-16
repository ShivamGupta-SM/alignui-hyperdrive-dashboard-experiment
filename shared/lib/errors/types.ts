/**
 * Result Pattern for Error Handling
 * 
 * @description
 * Makes error handling explicit and type-safe.
 * All server actions and API functions should return this type.
 * 
 * @example
 * ```ts
 * const result = await createCampaign(data)
 * if (result.success) {
 *   // TypeScript knows result.data exists
 *   console.log(result.data)
 * } else {
 *   // TypeScript knows result.error exists
 *   console.error(result.error)
 * }
 * ```
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

