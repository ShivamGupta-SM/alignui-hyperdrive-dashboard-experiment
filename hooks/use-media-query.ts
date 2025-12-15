/**
 * useMediaQuery Hook
 * 
 * React hook for responsive design using media queries
 * Replaces direct window.innerWidth usage
 */

import { useState, useEffect } from "react"

/**
 * Hook to check if a media query matches
 * 
 * @param query - Media query string (e.g., "(min-width: 1024px)")
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * const isDesktop = useMediaQuery("(min-width: 1024px)")
 * const isMobile = useMediaQuery("(max-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		// Check if window is available (client-side)
		if (typeof window === "undefined") {
			return
		}

		const mediaQuery = window.matchMedia(query)
		
		// Set initial value
		setMatches(mediaQuery.matches)

		// Create event handler
		const handler = (event: MediaQueryListEvent) => {
			setMatches(event.matches)
		}

		// Add listener
		// Modern browsers support addEventListener
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", handler)
			return () => mediaQuery.removeEventListener("change", handler)
		} else {
			// Fallback for older browsers
			mediaQuery.addListener(handler)
			return () => mediaQuery.removeListener(handler)
		}
	}, [query])

	return matches
}

/**
 * Common breakpoint hooks
 */
export function useIsDesktop(): boolean {
	return useMediaQuery("(min-width: 1024px)")
}

export function useIsTablet(): boolean {
	return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}

export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 767px)")
}

