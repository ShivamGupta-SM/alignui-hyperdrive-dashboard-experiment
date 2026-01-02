"use client"

import { useLocalStorage as useLocalStorageBase } from "usehooks-ts"
import { useCallback, useRef, useState, useEffect } from "react"

/**
 * Custom hook for persisting state in localStorage
 * Wraps usehooks-ts useLocalStorage with additional utilities
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple of [storedValue, setValue, removeValue, isHydrated]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useLocalStorageBase<T>(key, initialValue)
	const [isHydrated, setIsHydrated] = useState(false)

	// Track hydration state
	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Store initialValue in ref for stable reference in removeValue
	const initialValueRef = useRef(initialValue)

	// Remove item from localStorage
	const removeValue = useCallback(() => {
		setStoredValue(initialValueRef.current)
		if (typeof window !== "undefined") {
			window.localStorage.removeItem(key)
		}
	}, [key, setStoredValue])

	return [storedValue, setStoredValue, removeValue, isHydrated] as const
}
