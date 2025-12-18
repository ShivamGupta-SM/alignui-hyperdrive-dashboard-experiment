"use server"

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
import { getAuthenticatedEncoreClient, getEncoreClient } from "@/lib/api/encore"
import { extractErrorMessage, isAuthenticationError } from "@/lib/errors/encore-error-handler"
import { logError, logWarn } from "@/lib/logging/error-logger-simple"
import type Client from "@/lib/api/encore-client"

/**
 * Base action client with global error handling
 * Use this for public actions that don't require auth
 */
export const actionClient = createSafeActionClient({
	handleServerError: (error) => {
		// Log all errors
		logError(error, { source: "ServerAction" })

		// Return user-friendly error message
		return extractErrorMessage(error)
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
	const token = cookieStore.get("auth-token")?.value

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
