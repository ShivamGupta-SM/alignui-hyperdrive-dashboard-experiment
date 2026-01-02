"use client"

import { useCallback, useMemo, useState } from "react"

// ============================================
// Types
// ============================================

export type UseModalReturn<T = undefined> = readonly [
	isOpen: boolean,
	open: () => void,
	close: () => void,
	toggle: () => void,
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
] & {
	isOpen: boolean
	data: T | undefined
	open: () => void
	openWith: (value: T) => void
	close: () => void
	toggle: () => void
	props: { open: boolean; onOpenChange: (value: boolean) => void }
	setData: React.Dispatch<React.SetStateAction<T | undefined>>
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// ============================================
// Unified Modal Hook
// ============================================

/**
 * useModal - Universal modal state management hook
 *
 * Supports two usage patterns:
 * 1. Simple tuple return for basic open/close
 * 2. Object return with data support for complex modals
 *
 * @example Simple usage (tuple pattern)
 * ```tsx
 * const [isOpen, open, close, toggle] = useModal()
 *
 * <Button onClick={open}>Open</Button>
 * <Modal open={isOpen} onOpenChange={(v) => !v && close()}>...</Modal>
 * ```
 *
 * @example With data (object pattern)
 * ```tsx
 * const modal = useModal<User>()
 *
 * <Button onClick={() => modal.openWith(user)}>Edit</Button>
 * <Modal {...modal.props}>
 *   <UserForm data={modal.data} />
 * </Modal>
 * ```
 */
export function useModal<T = undefined>(initialOpen = false): UseModalReturn<T> {
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
		setTimeout(() => setData(undefined), 300)
	}, [])

	const toggle = useCallback(() => {
		setIsOpen((prev) => !prev)
	}, [])

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

	// Create tuple array
	const tuple = [isOpen, open, close, toggle, setIsOpen] as const

	// Attach object properties to tuple
	return Object.assign(tuple, {
		isOpen,
		data,
		open,
		openWith,
		close,
		toggle,
		props,
		setData,
		setIsOpen,
	}) as UseModalReturn<T>
}

/**
 * Multi-Modal State Hook
 *
 * Manages multiple modals with a single hook, ensuring only one is open at a time.
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

	const setOpen = useCallback((name: ModalName, value: boolean) => {
		setActiveModal(value ? name : null)
	}, [])

	const getProps = useCallback(
		(name: ModalName) => ({
			open: activeModal === name,
			onOpenChange: (value: boolean) => setOpen(name, value),
		}),
		[activeModal, setOpen]
	)

	return { activeModal, open, close, isOpen, setOpen, getProps }
}

export type UseMultiModalReturn<T extends readonly string[]> = ReturnType<typeof useMultiModal<T>>

// ============================================
// Backward Compatibility
// ============================================

/** @deprecated Use `useModal` instead */
export const useModalState = useModal
export type UseModalStateReturn = ReturnType<typeof useModal>
