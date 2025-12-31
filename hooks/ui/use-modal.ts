"use client"

import { useCallback, useMemo, useState } from "react"

/**
 * Modal State Hook
 *
 * Provides consistent modal state management with open/close handlers.
 * Reduces boilerplate for managing modal open/close state.
 *
 * @example Basic usage
 * ```tsx
 * const deleteModal = useModal()
 *
 * return (
 *   <>
 *     <Button onClick={deleteModal.open}>Delete</Button>
 *     <DeleteModal {...deleteModal.props} />
 *   </>
 * )
 * ```
 *
 * @example With data
 * ```tsx
 * const editModal = useModal<User>()
 *
 * <Button onClick={() => editModal.openWith(user)}>Edit</Button>
 * <EditModal {...editModal.props} data={editModal.data} />
 * ```
 */
export function useModal<T = undefined>(initialOpen = false) {
	const [isOpen, setIsOpen] = useState(initialOpen)
	const [data, setData] = useState<T | undefined>(undefined)

	const open = useCallback(() => {
		setIsOpen(true)
	}, [])

	const openWith = useCallback((value: T) => {
		setData(value)
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
		// Clear data after a delay to allow exit animations
		setTimeout(() => setData(undefined), 300)
	}, [])

	const toggle = useCallback(() => {
		setIsOpen((prev) => !prev)
	}, [])

	// Standard props for modal components
	const props = useMemo(
		() => ({
			open: isOpen,
			onOpenChange: (value: boolean) => {
				if (!value) {
					close()
				} else {
					setIsOpen(true)
				}
			},
		}),
		[isOpen, close]
	)

	return {
		isOpen,
		data,
		open,
		openWith,
		close,
		toggle,
		props,
		setData,
	}
}

/**
 * Multi-Modal State Hook
 *
 * Manages multiple modals with a single hook, ensuring only one is open at a time.
 * Useful for pages with many modals that shouldn't overlap.
 *
 * @example
 * ```tsx
 * const modals = useMultiModal(["delete", "edit", "create"] as const)
 *
 * return (
 *   <>
 *     <Button onClick={() => modals.open("delete")}>Delete</Button>
 *     <Button onClick={() => modals.open("edit")}>Edit</Button>
 *
 *     <DeleteModal open={modals.isOpen("delete")} onOpenChange={(open) => modals.setOpen("delete", open)} />
 *     <EditModal open={modals.isOpen("edit")} onOpenChange={(open) => modals.setOpen("edit", open)} />
 *   </>
 * )
 * ```
 */
export function useMultiModal<T extends readonly string[]>(modalNames: T) {
	type ModalName = T[number]
	const [activeModal, setActiveModal] = useState<ModalName | null>(null)

	const open = useCallback((name: ModalName) => {
		setActiveModal(name)
	}, [])

	const close = useCallback(() => {
		setActiveModal(null)
	}, [])

	const isOpen = useCallback(
		(name: ModalName) => activeModal === name,
		[activeModal]
	)

	const setOpen = useCallback((name: ModalName, value: boolean) => {
		if (value) {
			setActiveModal(name)
		} else {
			setActiveModal(null)
		}
	}, [])

	const getProps = useCallback(
		(name: ModalName) => ({
			open: activeModal === name,
			onOpenChange: (value: boolean) => setOpen(name, value),
		}),
		[activeModal, setOpen]
	)

	return {
		activeModal,
		open,
		close,
		isOpen,
		setOpen,
		getProps,
	}
}

export type UseModalReturn<T = undefined> = ReturnType<typeof useModal<T>>
export type UseMultiModalReturn<T extends readonly string[]> = ReturnType<typeof useMultiModal<T>>
