/**
 * Hydration-safe hooks for client-side only rendering
 *
 * Use these hooks to prevent hydration mismatches when rendering
 * content that depends on client-side state (like Date.now(), window, etc.)
 */

"use client"

import { useState, useEffect } from "react"

/**
 * Returns true after component has mounted on the client.
 *
 * @example
 * const isMounted = useIsMounted()
 * if (!isMounted) return <Skeleton />
 * return <div>Current time: {Date.now()}</div>
 */
export function useIsMounted(): boolean {
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])
	return mounted
}

/**
 * Returns current timestamp after hydration, null during SSR.
 * Updates every `updateInterval` ms (default: 60000 = 1 minute).
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
 *
 * @example
 * const referenceTime = useStableTime()
 * // referenceTime stays constant, won't cause re-renders
 */
export function useStableTime(): number | null {
	const [time, setTime] = useState<number | null>(null)
	useEffect(() => setTime(Date.now()), [])
	return time
}

/**
 * Returns formatted current date string after hydration.
 *
 * @example
 * const dateString = useFormattedDate({ weekday: 'long', day: 'numeric', month: 'short' })
 * // Returns: "Monday, 30 Dec" (after mount)
 */
export function useFormattedDate(
	options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short" },
	locale = "en-IN"
): string {
	const [dateString, setDateString] = useState("")

	useEffect(() => {
		setDateString(new Date().toLocaleDateString(locale, options))
	}, [locale, options])

	return dateString
}
