"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "@phosphor-icons/react"
import * as Button from "@/components/ui/primitives/button"
import { cn } from "@/lib/utils"

export interface BackButtonProps {
	/**
	 * Custom label text. Defaults to "Back"
	 */
	label?: string
	/**
	 * Whether to show label text. Defaults to true on desktop, false on mobile
	 */
	showLabel?: boolean
	/**
	 * Custom href to navigate to. If not provided, uses router.back()
	 */
	href?: string
	/**
	 * Custom onClick handler. If provided, overrides default navigation
	 */
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
	/**
	 * Size variant. Defaults to "small"
	 */
	size?: "xsmall" | "small" | "medium"
	/**
	 * Additional className
	 */
	className?: string
	/**
	 * Whether to show only icon on mobile. Defaults to true
	 */
	iconOnlyOnMobile?: boolean
	/**
	 * Button type. Defaults to "button" to prevent form submission
	 */
	type?: "button" | "submit" | "reset"
}

/**
 * Consistent Back Button Component
 *
 * Provides a polished, sleek back button that's consistent across the app.
 * Automatically handles responsive behavior (icon-only on mobile, with label on desktop).
 */
export function BackButton({
	label = "Back",
	showLabel,
	href,
	onClick,
	size = "small",
	className,
	iconOnlyOnMobile = true,
	type = "button",
}: BackButtonProps) {
	const router = useRouter()

	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault()
			e.stopPropagation()
			
		if (onClick) {
				onClick(e)
		} else if (href) {
			router.push(href)
		} else {
			router.back()
		}
		},
		[onClick, href, router]
	)

	// Determine if label should be shown
	const shouldShowLabel =
		showLabel !== undefined ? showLabel : !iconOnlyOnMobile || typeof window === "undefined" // SSR: show label by default

	return (
		<Button.Root
			type={type}
			variant="ghost"
			size={size}
			onClick={handleClick}
			className={cn(
				"-ml-2", // Negative margin to align with content
				className
			)}
			aria-label={label}
		>
			<Button.Icon><ArrowLeft className="size-5" /></Button.Icon>
			{shouldShowLabel && (
				<span className={cn(iconOnlyOnMobile && "hidden sm:inline")}>{label}</span>
			)}
		</Button.Root>
	)
}

/**
 * Inline Back Button - For use in content areas (not sticky headers)
 *
 * More subtle styling, typically used in detail pages within content cards.
 */
export function InlineBackButton({
	label = "Back",
	href,
	onClick,
	className,
}: Omit<BackButtonProps, "size" | "showLabel" | "iconOnlyOnMobile">) {
	const router = useRouter()

	const handleClick = React.useCallback(() => {
		if (onClick) {
			onClick()
		} else if (href) {
			router.push(href)
		} else {
			router.back()
		}
	}, [onClick, href, router])

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"inline-flex items-center gap-1.5",
				"text-text-sub-600 hover:text-text-strong-950",
				"transition-colors duration-200",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2",
				"rounded-lg px-2 py-1.5",
				"hover:bg-bg-weak-50",
				className
			)}
			aria-label={label}
		>
			<ArrowLeft weight="bold" className="size-4" />
			<span className="text-label-sm">{label}</span>
		</button>
	)
}
