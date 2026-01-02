/**
 * Hydration-safe hooks for client-side only rendering
 *
 * Use these hooks to prevent hydration mismatches when rendering
 * content that depends on client-side state (like Date.now(), window, etc.)
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { logWarn } from "@/lib/logging"

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

/**
 * Hydration-safe localStorage hook.
 * Prevents hydration mismatch by only reading localStorage after mount.
 *
 * @param key - localStorage key
 * @param initialValue - Initial value (used during SSR and before hydration)
 * @returns [value, setValue, isHydrated] tuple
 *
 * @example
 * const [viewMode, setViewMode, isHydrated] = useHydratedLocalStorage('view-mode', 'list')
 * if (!isHydrated) return <Skeleton />
 */
export function useHydratedLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
	const [isHydrated, setIsHydrated] = useState(false)
	const [storedValue, setStoredValue] = useState<T>(initialValue)

	// Read from localStorage after mount (hydration-safe)
	useEffect(() => {
		try {
			const item = localStorage.getItem(key)
			if (item !== null) {
				setStoredValue(JSON.parse(item))
			}
		} catch (error) {
			logWarn(`Error reading localStorage key "${key}"`, { source: "useHydratedLocalStorage", data: { key, error } })
		}
		setIsHydrated(true)
	}, [key])

	// Setter that persists to localStorage
	// Using useCallback with functional update to avoid stale closure
	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			try {
				setStoredValue((prev) => {
					const valueToStore = value instanceof Function ? value(prev) : value
					if (typeof window !== "undefined") {
						localStorage.setItem(key, JSON.stringify(valueToStore))
					}
					return valueToStore
				})
			} catch (error) {
				logWarn(`Error setting localStorage key "${key}"`, { source: "useHydratedLocalStorage", data: { key, error } })
			}
		},
		[key]
	)

	return [storedValue, setValue, isHydrated]
}
