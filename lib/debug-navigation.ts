/**
 * Navigation Debugging Utilities
 * 
 * Add this to debug navigation issues in development
 */

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	// Log all navigation attempts
	const originalPushState = history.pushState
	const originalReplaceState = history.replaceState

	history.pushState = function (...args) {
		console.log("[Navigation Debug] pushState:", args[2])
		return originalPushState.apply(history, args)
	}

	history.replaceState = function (...args) {
		console.log("[Navigation Debug] replaceState:", args[2])
		return originalReplaceState.apply(history, args)
	}

	// Listen for popstate (back/forward)
	window.addEventListener("popstate", (e) => {
		console.log("[Navigation Debug] popstate:", window.location.pathname)
	})

	// Log link clicks
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement
		const link = target.closest("a")
		if (link && link.href) {
			const href = link.getAttribute("href")
			if (href && href.startsWith("/")) {
				console.log("[Navigation Debug] Link clicked:", href, {
					target: link,
					preventDefault: e.defaultPrevented,
					stopPropagation: e.cancelBubble,
				})
			}
		}
	}, true) // Use capture phase to catch all clicks

	// Log router.push calls (if using Next.js router)
	if (typeof window !== "undefined") {
		const originalConsoleLog = console.log
		console.log = function (...args) {
			if (args[0]?.includes?.("router") || args[0]?.includes?.("navigation")) {
				originalConsoleLog("[Navigation Debug]", ...args)
			}
			return originalConsoleLog.apply(console, args)
		}
	}
}

// Export empty object to make this a module
export {}
