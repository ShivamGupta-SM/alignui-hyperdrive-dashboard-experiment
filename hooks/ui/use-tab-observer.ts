/**
 * useTabObserver - Observe active tab changes in tab lists
 *
 * Uses usehooks-ts for observer utilities.
 */

import * as React from "react"
import { useResizeObserver } from "usehooks-ts"

interface TabObserverOptions {
	onActiveTabChange?: (index: number, element: HTMLElement) => void
}

export function useTabObserver({ onActiveTabChange }: TabObserverOptions = {}) {
	const [mounted, setMounted] = React.useState(false)
	const listRef = React.useRef<HTMLDivElement>(null)
	const onActiveTabChangeRef = React.useRef(onActiveTabChange)

	React.useEffect(() => {
		onActiveTabChangeRef.current = onActiveTabChange
	}, [onActiveTabChange])

	const handleUpdate = React.useCallback(() => {
		if (listRef.current) {
			const tabs = listRef.current.querySelectorAll('[role="tab"]')
			tabs.forEach((el, i) => {
				if (el.getAttribute("data-state") === "active") {
					onActiveTabChangeRef.current?.(i, el as HTMLElement)
				}
			})
		}
	}, [])

	// Use usehooks-ts resize observer
	useResizeObserver({ ref: listRef as React.RefObject<HTMLElement>, onResize: handleUpdate })

	// Still need MutationObserver for attribute changes (data-state)
	React.useEffect(() => {
		setMounted(true)

		const mutationObserver = new MutationObserver(handleUpdate)

		if (listRef.current) {
			mutationObserver.observe(listRef.current, {
				childList: true,
				subtree: true,
				attributes: true,
			})
		}

		handleUpdate()

		return () => {
			mutationObserver.disconnect()
		}
	}, [handleUpdate])

	return { mounted, listRef }
}
