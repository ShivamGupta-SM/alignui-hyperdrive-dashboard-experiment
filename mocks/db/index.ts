/**
 * MSW Database Module
 *
 * Central export point for all MSW database utilities.
 *
 * Structure:
 * - `schemas.ts` - Zod schemas for type-safe data validation
 * - `collections.ts` - @msw/data Collection instances with persistence
 * - `seed.ts` - Database seeding functions for dummy data
 *
 * Usage:
 * ```ts
 * import { db } from '@/mocks/db'
 * import { seedDatabase } from '@/mocks/db'
 * ```
 */

// Export all schemas for type safety
export * from "./schemas"

// Export all collections and the db object
export * from "./collections"

// Export database management functions
export { seedDatabase, clearDatabase, resetDatabase, type SeedScenario } from "./seed"
