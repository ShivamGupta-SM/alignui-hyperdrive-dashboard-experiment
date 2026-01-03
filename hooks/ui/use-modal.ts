"use client"

import { useCallback, useMemo, useState } from "react"

/**
 * useModal - Simple modal state management
 *
 * SIMPLIFIED: Object-first API with tuple support for backwards compatibility.
 *
 * @example Recommended usage (object pattern)
 * ```tsx
 * const modal = useModal()
 *
 * <Button onClick={modal.open}>Open</Button>
 * <Modal {...modal.props}>...</Modal>
 * ```
 *
 * @example With data
 * ```tsx
 * const modal = useModal<User>()
 *
 * <Button onClick={() => modal.openWith(user)}>Edit</Button>
 * <Modal {...modal.props}>
 *   <UserForm data={modal.data} />
 * </Modal>
 * ```
 *
 * @example Legacy tuple pattern (backwards compatible)
 * ```tsx
 * const [isOpen, open, close, toggle, setIsOpen] = useModal()
 * ```
 */
export function useModal<T = undefined>(initialOpen = false) {
	const [isOpen, setIsOpen] = useState(initialOpen)
	const [data, setData] = useState<T | undefined>(undefined)

	const open = useCallback(() => setIsOpen(true), [])

	const openWith = useCallback((value: T) => {
		setData(value)
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
		// Clear data after animation
		setTimeout(() => setData(undefined), 300)
	}, [])

	const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

	// Props spread for Modal components
	const props = useMemo(
		() => ({
			open: isOpen,
			onOpenChange: (value: boolean) => {
				if (!value) close()
				else setIsOpen(true)
			},
		}),
		[isOpen, close]
	)

	// Create result object
	const result = {
		isOpen,
		data,
		open,
		openWith,
		close,
		toggle,
		props,
		setData,
		setIsOpen,
	}

	// Support tuple destructuring for backwards compatibility
	// [isOpen, open, close, toggle, setIsOpen]
	return Object.assign([isOpen, open, close, toggle, setIsOpen] as const, result)
}

export type UseModalReturn<T = undefined> = ReturnType<typeof useModal<T>>

/**
 * useMultiModal - Manage multiple modals with single state
 *
 * Ensures only one modal is open at a time.
 *
 * @example
 * ```tsx
 * const modals = useMultiModal(["delete", "edit", "create"] as const)
 *
 * <Button onClick={() => modals.open("delete")}>Delete</Button>
 * <DeleteModal {...modals.getProps("delete")} />
 * ```
 */
export function useMultiModal<T extends readonly string[]>(modalNames: T) {
	type ModalName = T[number]
	const [activeModal, setActiveModal] = useState<ModalName | null>(null)

	const open = useCallback((name: ModalName) => setActiveModal(name), [])
	const close = useCallback(() => setActiveModal(null), [])
	const isOpen = useCallback((name: ModalName) => activeModal === name, [activeModal])

	const getProps = useCallback(
		(name: ModalName) => ({
			open: activeModal === name,
			onOpenChange: (value: boolean) => setActiveModal(value ? name : null),
		}),
		[activeModal]
	)

	return { activeModal, open, close, isOpen, getProps }
}

export type UseMultiModalReturn<T extends readonly string[]> = ReturnType<typeof useMultiModal<T>>
