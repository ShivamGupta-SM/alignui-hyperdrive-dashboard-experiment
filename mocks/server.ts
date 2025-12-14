/**
 * MSW Server Setup for Node.js (SSR/RSC)
 *
 * This module sets up MSW's Node.js server for intercepting fetch requests
 * in Server Components and Server Actions.
 *
 * The server patches the global `fetch` function to intercept all HTTP requests
 * and route them through MSW handlers.
 *
 * State Management:
 * - MSW doesn't expose a `listening` property, so we track it manually
 * - This prevents double initialization and ensures proper cleanup
 *
 * Usage:
 * ```ts
 * import { server } from '@/mocks/server'
 * server.listen({ onUnhandledRequest: 'bypass' })
 * ```
 */

import { setupServer } from "msw/node"
import { handlers } from "./handlers"

// Create MSW server instance with all handlers
export const server = setupServer(...handlers)

// =============================================================================
// SERVER STATE TRACKING
// =============================================================================
// MSW doesn't expose a `listening` property, so we track it manually

let isServerListening = false

/**
 * Check if the MSW server is currently listening
 */
export function isListening(): boolean {
	return isServerListening
}

/**
 * Mark the server as listening (call after server.listen())
 */
export function markListening(): void {
	isServerListening = true
}

/**
 * Mark the server as not listening (call after server.close())
 */
export function markNotListening(): void {
	isServerListening = false
}
