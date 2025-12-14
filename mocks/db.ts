/**
 * MSW Database Module
 *
 * Central export point for all MSW database utilities.
 * This provides a clean import path: `import { db } from '@/mocks/db'`
 *
 * Exports:
 * - `db` - Database collections object with all data collections
 * - `seedDatabase()` - Function to seed the database with dummy data
 * - `clearDatabase()` - Function to clear all data
 * - `resetDatabase()` - Function to reset database to initial state
 * - All Zod schemas for type safety
 * - All collection instances
 */

export * from "./db/index"
