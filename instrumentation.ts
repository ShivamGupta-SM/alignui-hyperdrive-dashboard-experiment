/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js at startup.
 * Used to initialize MSW for server-side mocking during development.
 *
 * IMPORTANT: This runs early, but Next.js may override fetch patching.
 * We also initialize MSW in other places to ensure it works.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
	// Only run in Node.js runtime (not Edge)
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Only enable mocking in development when explicitly enabled
		if (
			process.env.NODE_ENV === "development" &&
			process.env.NEXT_PUBLIC_API_MOCKING === "enabled"
		) {
			try {
				const { server, isListening, markListening } = await import("./mocks/server")
				
				// Only start if not already listening
				if (!isListening()) {
					// Start listening - this patches fetch
					server.listen({
						onUnhandledRequest: (req) => {
							// Only log unhandled requests to your API
							if (req.url.includes("localhost:4000") || req.url.includes("encore.dev")) {
								console.warn(
									`[MSW Instrumentation] Unhandled request: ${req.method} ${req.url}`,
									"\n  → This request is not mocked. Add a handler in mocks/handlers/"
								)
							}
							return "bypass"
						},
					})
					markListening()
					
					console.log("[MSW Instrumentation] ✅ Server-side mocking initialized")
					console.log("[MSW Instrumentation] Fetch should be patched (but Next.js may override)")
				} else {
					console.log("[MSW Instrumentation] Server already listening, skipping initialization")
				}
				
				// Seed database
				try {
					const { seedDatabase } = await import("./mocks/db/seed")
					await seedDatabase("full", "1").catch(() => {
						// Ignore if already seeded
					})
					console.log("[MSW Instrumentation] ✅ Database seeded")
				} catch (seedError) {
					console.error("[MSW Instrumentation] Failed to seed database:", seedError)
				}
			} catch (error) {
				console.error("[MSW Instrumentation] Failed to initialize:", error)
			}
		}
	}
}
