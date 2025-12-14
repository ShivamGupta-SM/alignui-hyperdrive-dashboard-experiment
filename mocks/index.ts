/**
 * MSW Entry Point - Enhanced for RSC + Server Actions
 *
 * This is the main entry point for Mock Service Worker (MSW) setup.
 * It handles initialization for both browser (Service Worker) and server (Node.js) environments.
 *
 * Architecture:
 * - Browser: Uses Service Worker to intercept fetch requests
 * - Server: Uses Node.js server to intercept fetch in RSC and Server Actions
 *
 * IMPORTANT: MSW works with RSC and Server Actions because:
 * - Server Actions use `fetch` internally
 * - MSW server intercepts `fetch` in Node.js
 * - RSC runs on server, so MSW server catches it
 *
 * Initialization Flow:
 * 1. `instrumentation.ts` - Early initialization (Next.js startup)
 * 2. `app/layout.tsx` - Re-initialization (workaround for Next.js fetch patching)
 * 3. Server Actions - Explicit initialization before API calls
 *
 * Usage:
 * ```ts
 * import { initMocks } from '@/mocks'
 * await initMocks()
 * ```
 */

let serverInitialized = false
let browserInitialized = false

export async function initMocks() {
	// Only initialize mocks in development
	if (process.env.NODE_ENV !== "development") {
		return
	}

	// Check if mocking is enabled via environment variable
	// This allows easily toggling mocks on/off
	if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") {
		console.log("[MSW] Mocking disabled (set NEXT_PUBLIC_API_MOCKING=enabled to enable)")
		return
	}

	if (typeof window === "undefined") {
		// Server-side: use Node.js server (for RSC and Server Actions)
		// Prevent double initialization
		if (serverInitialized) {
			return
		}

		try {
			const { server, isListening, markListening } = await import("./server")
			
			// Only start if not already listening
			if (!isListening()) {
				// CRITICAL: Start listening - this patches the global fetch
				// This MUST happen before any fetch calls are made
				// Note: Next.js may override fetch, so we need to ensure this runs after Next.js setup
				server.listen({
					onUnhandledRequest: (req) => {
						// Only log unhandled requests to your API
						if (req.url.includes("localhost:4000") || req.url.includes("encore.dev")) {
							console.warn(
								`[MSW] Unhandled server request: ${req.method} ${req.url}`,
								"\n  → This request is not mocked. Add a handler in mocks/handlers/"
							)
						}
						return "bypass"
					},
				})
				markListening()
				
				console.log("[MSW] ✅ Server mocking enabled (RSC + Server Actions)")
				console.log("[MSW] Fetch has been patched - all requests to localhost:4000 will be intercepted")
				console.log("[MSW] Server is now listening for requests")
			} else {
				console.log("[MSW] Server already listening, skipping initialization")
			}
			
			// Verify fetch is patched
			if (typeof globalThis.fetch !== "undefined") {
				console.log("[MSW] ✅ globalThis.fetch is available")
				// Check if it's the MSW-patched version (it should have request interception)
				const fetchString = globalThis.fetch.toString()
				if (fetchString.includes("msw") || fetchString.includes("intercept")) {
					console.log("[MSW] ✅ Fetch appears to be patched by MSW")
				} else {
					console.warn("[MSW] ⚠️ Fetch may not be fully patched by MSW")
				}
			} else {
				console.error("[MSW] ❌ globalThis.fetch is undefined!")
			}
			
			// Seed database with complete dummy data
			try {
				const { seedDatabase } = await import("./db/seed")
				await seedDatabase("full", "1") // Seed with org ID "1"
				console.log("[MSW] ✅ Database seeded with complete dummy organization and data")
			} catch (seedError) {
				console.error("[MSW] Failed to seed database:", seedError)
				// Don't throw - continue even if seeding fails
			}
			
			// Wait longer to ensure server is fully ready and fetch is patched
			// MSW needs time to patch the global fetch
			await new Promise((resolve) => setTimeout(resolve, 200))
		} catch (error) {
			console.error("[MSW] Failed to initialize server mocking:", error)
			console.error("[MSW] Error details:", error instanceof Error ? error.stack : String(error))
			// Don't throw - allow app to continue even if MSW fails
		}
	} else {
		// Client-side: use Service Worker
		// Prevent double initialization
		if (browserInitialized) {
			return
		}

		try {
			const { worker, startOptions } = await import("./browser")
			await worker.start({
				...startOptions,
				onUnhandledRequest: (req) => {
					// Only log unhandled requests to your API
					if (req.url.includes("localhost:4000") || req.url.includes("encore.dev")) {
						console.warn(
							`[MSW] Unhandled browser request: ${req.method} ${req.url}`,
							"\n  → This request is not mocked. Add a handler in mocks/handlers/"
						)
					}
					return "bypass"
				},
			})
			browserInitialized = true
			console.log("[MSW] ✅ Browser mocking enabled")
			
			// Seed database with complete dummy data (browser side - multiple organizations)
			try {
				const { seedDatabase } = await import("./db/seed")
				await seedDatabase("full", "1") // Seed with org ID "1" (will seed all demo orgs)
				console.log("[MSW] ✅ Database seeded with multiple organizations and complete data")
			} catch (seedError) {
				console.error("[MSW] Failed to seed database:", seedError)
				// Don't throw - continue even if seeding fails
			}
		} catch (error) {
			console.error("[MSW] Failed to initialize browser mocking:", error)
		}
	}
}

// Re-export handlers for testing
export { handlers } from "./handlers"
