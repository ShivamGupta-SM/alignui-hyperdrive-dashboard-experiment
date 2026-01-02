/**
 * Hydration-safe hooks for client-side only rendering
 *
 * Use these hooks to prevent hydration mismatches when rendering
 * content that depends on client-side state (like Date.now(), window, etc.)
 */

import { useState, useEffect, useRef } from "react"

/**
 * Returns true after component has mounted on the client.
 * Use this to conditionally render client-only content.
 *
 * @example
 * const isMounted = useIsMounted()
 * if (!isMounted) return <Skeleton />
 * return <div>Current time: {Date.now()}</div>
 */
export function useIsMounted(): boolean {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	return mounted
}

/**
 * Returns current timestamp after hydration, null during SSR.
 * Updates every `updateInterval` ms (default: 60000 = 1 minute).
 *
 * @param updateInterval - How often to update the time in ms (default: 60000)
 * @returns Current timestamp or null during SSR
 *
 * @example
 * const currentTime = useHydratedTime()
 * if (!currentTime) return <Skeleton />
 * return <div>{getTimeAgo(someDate, currentTime)}</div>
 */
export function useHydratedTime(updateInterval = 60000): number | null {
	const [currentTime, setCurrentTime] = useState<number | null>(null)

	useEffect(() => {
		setCurrentTime(Date.now())
		const interval = setInterval(() => setCurrentTime(Date.now()), updateInterval)
		return () => clearInterval(interval)
	}, [updateInterval])

	return currentTime
}

/**
 * Returns a stable reference time that doesn't change during component lifecycle.
 * Use this when you need a consistent "now" for calculations without re-renders.
 *
 * @returns Stable timestamp (set once on mount) or null during SSR
 *
 * @example
 * const referenceTime = useStableTime()
 * // referenceTime stays constant, won't cause re-renders
 */
export function useStableTime(): number | null {
	const [time, setTime] = useState<number | null>(null)

	useEffect(() => {
		setTime(Date.now())
	}, [])

	return time
}

/**
 * Returns formatted current date string after hydration.
 * Prevents hydration mismatch for date displays.
 *
 * @param options - Intl.DateTimeFormat options
 * @param locale - Locale string (default: 'en-IN')
 * @returns Formatted date string or empty string during SSR
 *
 * @example
 * const dateString = useFormattedDate({
 *   weekday: 'long',
 *   day: 'numeric',
 *   month: 'short'
 * })
 * // Returns: "Monday, 30 Dec" (after mount)
 */
export function useFormattedDate(
	options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		day: "numeric",
		month: "short",
	},
	locale = "en-IN"
): string {
	const [dateString, setDateString] = useState("")

	// Use ref to track options and avoid re-running effect on every render
	const optionsRef = useRef(options)
	const optionsKey = JSON.stringify(options)
	const prevOptionsKeyRef = useRef(optionsKey)

	// Only update ref when options actually change
	if (prevOptionsKeyRef.current !== optionsKey) {
		optionsRef.current = options
		prevOptionsKeyRef.current = optionsKey
	}

	useEffect(() => {
		setDateString(new Date().toLocaleDateString(locale, optionsRef.current))
		// optionsKey triggers re-run when options change (ref doesn't trigger effects)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [locale, optionsKey])

	return dateString
}

