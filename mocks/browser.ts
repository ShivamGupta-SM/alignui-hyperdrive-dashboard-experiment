/**
 * MSW Browser Worker Setup
 *
 * This file sets up the Mock Service Worker for browser environments.
 * It intercepts fetch/XHR requests and returns mocked responses.
 */

import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

// Create the browser worker with all handlers
export const worker = setupWorker(...handlers)

// Start options for development
export const startOptions = {
	// Don't warn about unhandled requests in development
	// since we only mock API routes, not all requests
	onUnhandledRequest: (req) => {
		// Log ALL unhandled requests to help debug
		if (req.url.includes("localhost:4000") || req.url.includes("encore.dev")) {
			console.warn(
				`[MSW] ⚠️ Unhandled request: ${req.method} ${req.url}`,
				"\n  → This request is not mocked. Check if handler exists in mocks/handlers/"
			)
		}
		return "bypass"
	},

	// Service worker options
	serviceWorker: {
		url: "/mockServiceWorker.js",
		options: {
			// Ensure service worker is active
			scope: "/",
		},
	},
}
