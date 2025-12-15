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
				console.log("[MSW Server] Starting database seeding...")
				const { seedDatabase } = await import("./db/seed")
				await seedDatabase("full", "1") // Seed with org ID "1"
				console.log("[MSW Server] ✅ Database seeded with complete dummy organization and data")
				
				// Verify seeding
				const { db } = await import("./db")
				const campaignCount = db.campaigns.findMany().length
				const enrollmentCount = db.enrollments.findMany().length
				console.log(`[MSW Server] ✅ Verified: ${campaignCount} campaigns, ${enrollmentCount} enrollments seeded`)
			} catch (seedError) {
				console.error("[MSW Server] ❌ Failed to seed database:", seedError)
				console.error("[MSW Server] Error details:", seedError instanceof Error ? seedError.stack : String(seedError))
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
			console.log("[MSW Browser] Importing worker...")
			const { worker, startOptions } = await import("./browser")
			const { handlers } = await import("./handlers")
			
			console.log("[MSW Browser] Starting worker...")
			console.log("[MSW Browser] Handler count:", handlers.length)
			console.log("[MSW Browser] Base URL:", process.env.NEXT_PUBLIC_ENCORE_URL || "http://localhost:4000")
			
			await worker.start({
				...startOptions,
				onUnhandledRequest: (req) => {
					// Log ALL requests to help debug
					console.log(`[MSW Browser] Request received: ${req.method} ${req.url}`)
					
					// Only warn about unhandled requests to your API
					if (req.url.includes("localhost:4000") || req.url.includes("encore.dev")) {
						console.warn(
							`[MSW Browser] ⚠️ Unhandled request: ${req.method} ${req.url}`,
							"\n  → This request is not mocked. Check if handler exists in mocks/handlers/"
						)
					}
					return "bypass"
				},
			})
			browserInitialized = true
			console.log("[MSW] ✅ Browser mocking enabled")
			console.log("[MSW Browser] Worker started successfully")
			console.log("[MSW Browser] Service worker should be active - check DevTools → Application → Service Workers")
			
			// Verify service worker registration
			if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
				navigator.serviceWorker.getRegistrations().then((regs) => {
					const mswWorker = regs.find((r) => r.scope.includes("/") && r.active?.scriptURL?.includes("mockServiceWorker"))
					if (mswWorker) {
						console.log("[MSW Browser] ✅ Service Worker registered:", mswWorker.active?.scriptURL)
						console.log("[MSW Browser] ✅ Service Worker state:", mswWorker.active?.state)
					} else {
						console.warn("[MSW Browser] ⚠️ MSW Service Worker not found in registrations")
						console.log("[MSW Browser] All registered workers:", regs.map((r) => r.active?.scriptURL))
					}
				})
			}
			
			// Seed database with complete dummy data (browser side - multiple organizations)
			try {
				console.log("[MSW Browser] Starting database seeding...")
				const { seedDatabase } = await import("./db/seed")
				await seedDatabase("full", "1") // Seed with org ID "1" (will seed all demo orgs)
				console.log("[MSW Browser] ✅ Database seeded with multiple organizations and complete data")
				
				// Verify seeding
				const { db } = await import("./db")
				const campaignCount = db.campaigns.findMany().length
				const enrollmentCount = db.enrollments.findMany().length
				console.log(`[MSW Browser] ✅ Verified: ${campaignCount} campaigns, ${enrollmentCount} enrollments seeded`)
			} catch (seedError) {
				console.error("[MSW Browser] ❌ Failed to seed database:", seedError)
				console.error("[MSW Browser] Error details:", seedError instanceof Error ? seedError.stack : String(seedError))
				// Don't throw - continue even if seeding fails
			}
		} catch (error) {
			console.error("[MSW] Failed to initialize browser mocking:", error)
		}
	}
}

// Re-export handlers for testing
export { handlers } from "./handlers"
