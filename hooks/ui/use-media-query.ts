/**
 * useMediaQuery Hook
 *
 * Re-exports from usehooks-ts for consistent API.
 * Provides common breakpoint utilities on top.
 */

"use client"

import { useMediaQuery as useMediaQueryBase } from "usehooks-ts"

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
	return useMediaQueryBase(query)
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
