"use client"

import * as React from "react"
import * as Avatar from "@/components/ui/primitives/avatar"
import * as CompactButton from "@/components/ui/primitives/compact-button"
import { Logo } from "@/components/ui/branding/logo"
import {
	NotificationCenter,
	FallbackNotificationBell,
} from "@/components/dashboard/notification-center"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { MagnifyingGlass, Command, SidebarSimple, X, SquaresFour } from "@phosphor-icons/react"

import { useSession } from "@/features/auth"
import { getInitial } from "@/lib/utils/string"

interface HeaderProps {
	unreadNotifications?: number
	onNotificationsClick?: () => void
	onCommandMenuClick?: () => void
	sidebarCollapsed?: boolean
	onSidebarCollapsedChange?: (collapsed: boolean) => void
	onMobileMenuClick?: () => void
	isMobileSidebarOpen?: boolean
	onSettingsClick?: () => void
}

export function Header({
	unreadNotifications = 0,
	onNotificationsClick,
	onCommandMenuClick,
	sidebarCollapsed = false,
	onSidebarCollapsedChange,
	onMobileMenuClick,
	isMobileSidebarOpen = false,
	onSettingsClick,
}: HeaderProps) {
	const { data: session } = useSession()
	const user = session?.user
	const { resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isDark = mounted && resolvedTheme === "dark"


	return (
		<header className="relative flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 transition-colors duration-200 lg:border-b lg:border-stroke-soft-200">
			{/* Left: Mobile Menu Toggle + Desktop Collapse Toggle + Search */}
			<div className="flex items-center gap-1.5 sm:gap-2">
				{/* Mobile Menu Toggle - Only visible on mobile */}
				{onMobileMenuClick && (
					<CompactButton.Root
						variant="stroke"
						size="xlarge"
						fullRadius
						onClick={onMobileMenuClick}
						className="lg:hidden shrink-0 relative"
						aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
						aria-expanded={isMobileSidebarOpen}
					>
						{/* Animated icon swap */}
						<SquaresFour
							className={cn(
								"size-5 absolute transition-all duration-200 ease-out",
								isMobileSidebarOpen
									? "opacity-0 rotate-90 scale-0"
									: "opacity-100 rotate-0 scale-100"
							)}
							weight="duotone"
						/>
						<X
							className={cn(
								"size-5 absolute transition-all duration-200 ease-out",
								isMobileSidebarOpen
									? "opacity-100 rotate-0 scale-100"
									: "opacity-0 -rotate-90 scale-0"
							)}
							weight="bold"
						/>
					</CompactButton.Root>
				)}

				{/* Desktop Sidebar Collapse Toggle - Hidden on mobile */}
				{onSidebarCollapsedChange && (
					<CompactButton.Root
						variant="stroke"
						size="xlarge"
						fullRadius
						onClick={() => onSidebarCollapsedChange(!sidebarCollapsed)}
						className="hidden lg:flex shrink-0"
						aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<SidebarSimple
							className={cn(
								"size-5 transition-transform duration-200",
								sidebarCollapsed && "rotate-180"
							)}
							weight="duotone"
						/>
					</CompactButton.Root>
				)}

				{/* Search / Command Menu - Hidden on mobile when sidebar is open */}
				<CompactButton.Root
					variant="stroke"
					size="xlarge"
					fullRadius
					onClick={onCommandMenuClick}
					className={cn(
						"sm:w-auto sm:min-w-[180px] md:min-w-[220px] sm:px-3 sm:rounded-xl shrink-0",
						isMobileSidebarOpen && "hidden lg:flex"
					)}
					aria-label="Open command menu (Cmd+K)"
				>
					<MagnifyingGlass className="size-4 shrink-0" weight="duotone" aria-hidden="true" />
					<span className="hidden sm:inline text-paragraph-sm ml-2">Search...</span>
					<kbd className="hidden sm:flex ml-auto items-center gap-0.5 rounded bg-bg-weak-50 px-1.5 py-0.5 text-label-xs font-medium text-text-soft-400">
						<Command className="size-3" aria-hidden="true" />
						<span className="sr-only">Command+</span>K
					</kbd>
				</CompactButton.Root>
			</div>

			{/* Center: Logo - Only visible on mobile, always shown (sidebar has no logo) */}
			<div className="lg:hidden absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
				<Logo width={100} height={24} />
			</div>

			{/* Right: Notifications + Profile */}
			<div className="flex items-center gap-1.5 sm:gap-2">
				{/* Notification Center - Uses Novu when configured, fallback otherwise */}
				{process.env.NEXT_PUBLIC_NOVU_APP_ID ? (
					<NotificationCenter />
				) : (
					<FallbackNotificationBell count={unreadNotifications} onClick={onNotificationsClick} />
				)}

				{/* Profile Avatar - Opens Settings Panel */}
				{user && onSettingsClick && (
					<CompactButton.Root
						variant="stroke"
						size="xlarge"
						fullRadius
						onClick={onSettingsClick}
						className="p-[3px]"
						aria-label="Open settings"
					>
						<Avatar.Root size="32" color="blue" className="size-full rounded-full overflow-hidden">
							{"image" in user && user.image ? (
								<Avatar.Image
									src={user.image}
									alt={user.name}
									className="size-full object-cover"
								/>
							) : (
								<span className="text-label-xs sm:text-label-sm font-semibold">
									{getInitial(user.name) || getInitial(user.email)}
								</span>
							)}
						</Avatar.Root>
					</CompactButton.Root>
				)}
			</div>
		</header>
	)
}
