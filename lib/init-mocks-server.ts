/**
 * Server-Side MSW Initialization
 * 
 * This file ensures MSW is initialized early on the server side
 * before any RSC or Server Actions execute.
 * 
 * Import this at the top of your server entry points or in middleware.
 */

let initialized = false
let initPromise: Promise<void> | null = null

export async function initServerMocks() {
	// Only in development
	if (process.env.NODE_ENV !== "development") {
		return
	}

	// Only if mocking is enabled
	if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") {
		return
	}

	// Only on server
	if (typeof window !== "undefined") {
		return
	}

	// If already initialized, return immediately
	if (initialized) {
		return
	}

	// If initialization is in progress, wait for it
	if (initPromise) {
		return initPromise
	}

	// Start initialization
	initPromise = (async () => {
		try {
			console.log("[MSW Init] Starting server mocks initialization...")
			const { initMocks } = await import("@/mocks")
			await initMocks()
			
			// Wait a bit more to ensure fetch is fully patched
			await new Promise((resolve) => setTimeout(resolve, 100))
			
			// Verify fetch is available and patched
			if (typeof globalThis.fetch === "undefined") {
				console.error("[MSW Init] ❌ ERROR: globalThis.fetch is undefined after initialization!")
			} else {
				console.log("[MSW Init] ✅ globalThis.fetch is available")
				const fetchStr = globalThis.fetch.toString()
				if (fetchStr.includes("msw") || fetchStr.includes("intercept") || fetchStr.length > 100) {
					console.log("[MSW Init] ✅ Fetch appears to be patched by MSW")
				} else {
					console.warn("[MSW Init] ⚠️ Fetch may not be fully patched (length:", fetchStr.length, ")")
				}
			}
			
			initialized = true
			console.log("[MSW Init] ✅ Server mocks initialized successfully")
		} catch (error) {
			console.error("[MSW Init] ❌ Failed to initialize server mocks:", error)
			console.error("[MSW Init] Error details:", error instanceof Error ? error.stack : String(error))
			// Don't throw - allow app to continue even if MSW fails
		}
	})()

	return initPromise
}

// Auto-initialize if this module is imported
// This runs at module load time to ensure MSW is ready before any fetch calls
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
	// Use setImmediate to ensure this runs after module load but before any async operations
	if (typeof setImmediate !== "undefined") {
		setImmediate(() => {
			initServerMocks().catch((error) => {
				console.error("[MSW] Failed to auto-initialize server mocks:", error)
			})
		})
	} else {
		// Fallback for environments without setImmediate
		Promise.resolve().then(() => {
			initServerMocks().catch((error) => {
				console.error("[MSW] Failed to auto-initialize server mocks:", error)
			})
		})
	}
}
