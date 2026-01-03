/**
 * useMediaQuery - Responsive breakpoint utilities
 *
 * SIMPLIFIED: Direct re-export from usehooks-ts with preset breakpoints.
 * For custom queries, import directly: import { useMediaQuery } from "usehooks-ts"
 */

"use client"

// Re-export base hook for custom queries
export { useMediaQuery } from "usehooks-ts"

// Preset breakpoint hooks - these add actual value by standardizing breakpoints
import { useMediaQuery } from "usehooks-ts"

export function useIsDesktop(): boolean {
	return useMediaQuery("(min-width: 1024px)")
}

export function useIsTablet(): boolean {
	return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}

export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 767px)")
}
