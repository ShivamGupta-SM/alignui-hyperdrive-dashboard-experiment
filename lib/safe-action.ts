// NOTE: This file should NOT have "use server" - it exports objects (actionClient, authAction, etc.)
// The actual server actions are defined in features/*/actions/*.ts files which have "use server"

/**
 * Safe Action Client - Centralized Server Action Handler
 *
 * Uses next-safe-action for:
 * - Type-safe input validation with Zod
 * - Automatic error handling
 * - Auth middleware
 * - Consistent Result pattern
 *
 * @see https://next-safe-action.dev/
 */

import { createSafeActionClient } from "next-safe-action"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthenticatedEncoreClient, getEncoreClient } from "@/lib/api/server"
import { getErrorMessage } from "@/lib/errors/encore-error-handler"
import { logError, logWarn } from "@/lib/logging/error-logger-simple"
import { getAuthTokenFromCookies } from "@/lib/constants"
import type Client from "@/brand-client"

/**
 * Base action client with global error handling
 * Use this for public actions that don't require auth
 */
export const actionClient = createSafeActionClient({
	handleServerError: (error) => {
		// Log all errors
		logError(error, { source: "ServerAction" })

		// Return user-friendly error message
		return getErrorMessage(error)
	},
})

/**
 * Authenticated action client
 * Automatically checks auth and provides token + client in context
 *
 * @example
 * export const myAction = authAction
 *   .schema(z.object({ id: z.string() }))
 *   .action(async ({ parsedInput, ctx }) => {
 *     const result = await ctx.client.something.doSomething(parsedInput.id)
 *     return result
 *   })
 */
export const authAction = actionClient.use(async ({ next }) => {
	const cookieStore = await cookies()
	// SSOT: Use centralized cookie name checking from @/lib/constants
	const token = getAuthTokenFromCookies((name) => cookieStore.get(name)?.value)

	// No token = redirect to sign in
	if (!token) {
		logWarn("No auth token found, redirecting to sign-in", { source: "authAction" })
		redirect("/sign-in")
	}

	// Create authenticated client
	const client = getAuthenticatedEncoreClient(token)

	return next({
		ctx: {
			token,
			client,
		},
	})
})

/**
 * Public action client (no auth required)
 * Provides unauthenticated client in context
 *
 * @example
 * export const publicAction = publicActionClient
 *   .schema(z.object({ query: z.string() }))
 *   .action(async ({ parsedInput, ctx }) => {
 *     const result = await ctx.client.public.search(parsedInput.query)
 *     return result
 *   })
 */
export const publicActionClient = actionClient.use(async ({ next }) => {
	const client = getEncoreClient()

	return next({
		ctx: {
			client,
		},
	})
})

/**
 * Type for authenticated action context
 */
export type AuthActionContext = {
	token: string
	client: Client
}

/**
 * Type for public action context
 */
export type PublicActionContext = {
	client: Client
}

// ============================================
// Schema Helpers - Reduce organizationId boilerplate
// ============================================

import { z } from "zod"

/**
 * Base schema fields for organization-scoped actions
 * Use this instead of manually adding organizationId to every schema
 *
 * @example
 * const createProductSchema = orgSchema.extend({
 *   name: z.string().min(1),
 *   price: z.number().min(0),
 * })
 */
export const orgSchema = z.object({
	organizationId: z.string().min(1, "Organization ID is required"),
})

/**
 * Creates an organization-scoped schema with common fields
 *
 * @example
 * const deleteSchema = createOrgSchema({
 *   id: z.string().min(1),
 * })
 * // Equivalent to: z.object({ organizationId: z.string().min(1), id: z.string().min(1) })
 */
export function createOrgSchema<T extends z.ZodRawShape>(shape: T) {
	return orgSchema.extend(shape)
}

/**
 * Common schema patterns for entity operations
 * These can be composed with other fields
 */
export const entitySchemas = {
	/** Schema for operations that only need an entity ID */
	byId: createOrgSchema({
		id: z.string().min(1, "ID is required"),
	}),

	/** Schema for list operations with pagination */
	list: createOrgSchema({
		skip: z.number().min(0).optional(),
		take: z.number().min(1).max(100).optional(),
	}),

	/** Schema for operations on a specific entity in a parent context */
	nested: (parentField: string) =>
		createOrgSchema({
			[parentField]: z.string().min(1, `${parentField} is required`),
			id: z.string().min(1, "ID is required"),
		}),
}

/**
 * Type helper to extract input type from organization-scoped schema
 * Removes organizationId from the type (handled by hooks)
 *
 * @example
 * type CreateProductInput = OrgActionInput<typeof createProductSchema>
 * // Results in: { name: string; price: number } (without organizationId)
 */
export type OrgActionInput<T extends z.ZodType> = Omit<z.infer<T>, "organizationId">
