"use client"

import { useEffect, useCallback } from "react"

type ModifierKey = "ctrl" | "meta" | "alt" | "shift"

interface KeyboardShortcutOptions {
	/**
	 * Whether the shortcut is enabled
	 * @default true
	 */
	enabled?: boolean
	/**
	 * Whether to prevent default browser behavior
	 * @default true
	 */
	preventDefault?: boolean
	/**
	 * Whether to stop event propagation
	 * @default false
	 */
	stopPropagation?: boolean
}

interface KeyboardShortcutConfig {
	/**
	 * The key to listen for (e.g., "k", "Escape", "Enter")
	 */
	key: string
	/**
	 * Modifier keys required (ctrl, meta, alt, shift)
	 * Use "meta" for Cmd on Mac and Ctrl on Windows/Linux
	 */
	modifiers?: ModifierKey[]
}

/**
 * Hook for handling keyboard shortcuts
 *
 * @example
 * // Simple escape key handler
 * useKeyboardShortcut("Escape", () => setOpen(false))
 *
 * @example
 * // Ctrl/Cmd + K to open command menu
 * useKeyboardShortcut(
 *   { key: "k", modifiers: ["ctrl", "meta"] },
 *   () => setCommandMenuOpen(true),
 *   { preventDefault: true }
 * )
 */
export function useKeyboardShortcut(
	shortcut: string | KeyboardShortcutConfig,
	callback: () => void,
	options: KeyboardShortcutOptions = {}
): void {
	const {
		enabled = true,
		preventDefault = true,
		stopPropagation = false,
	} = options

	const config: KeyboardShortcutConfig = typeof shortcut === "string"
		? { key: shortcut, modifiers: [] }
		: shortcut

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return

			// Guard against undefined event.key (edge case with some keyboard events)
			if (!event.key || !config.key) return

			// Check if the key matches (case-insensitive)
			const keyMatches = event.key.toLowerCase() === config.key.toLowerCase()
			if (!keyMatches) return

			// Check modifiers
			const modifiers = config.modifiers || []

			// For "ctrl" or "meta", we accept either (cross-platform support)
			const needsCtrlOrMeta = modifiers.includes("ctrl") || modifiers.includes("meta")
			const hasCtrlOrMeta = event.ctrlKey || event.metaKey

			if (needsCtrlOrMeta && !hasCtrlOrMeta) return
			if (!needsCtrlOrMeta && hasCtrlOrMeta) return

			// Check other modifiers
			const needsAlt = modifiers.includes("alt")
			const needsShift = modifiers.includes("shift")

			if (needsAlt !== event.altKey) return
			if (needsShift !== event.shiftKey) return

			// Don't trigger in input fields unless it's Escape
			const target = event.target as HTMLElement
			const isInputField =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable

			if (isInputField && config.key.toLowerCase() !== "escape") {
				return
			}

			if (preventDefault) {
				event.preventDefault()
			}

			if (stopPropagation) {
				event.stopPropagation()
			}

			callback()
		},
		[enabled, config.key, config.modifiers, preventDefault, stopPropagation, callback]
	)

	useEffect(() => {
		if (!enabled) return

		document.addEventListener("keydown", handleKeyDown)
		return () => {
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [enabled, handleKeyDown])
}
