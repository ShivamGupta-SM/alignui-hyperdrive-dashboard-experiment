"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { NotificationsDrawer } from "@/components/dashboard/notifications-drawer"
import { CommandMenu } from "@/components/dashboard/command-menu"
import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { StatusBanner } from "@/components/dashboard/status-banner"
import { useBreadcrumbs, useIsDesktop, useModal } from "@/hooks/ui"
import { useHotkeys } from "react-hotkeys-hook"
import { useLocalStorage } from "@/hooks/state/use-local-storage"
import { useNotifications as useBackendNotifications, useUnreadNotificationCount as useBackendUnreadCount, useMarkAllNotificationsRead as useBackendMarkAllRead, useMarkNotificationRead as useBackendMarkRead, useDashboard } from "@/hooks/shared"
import { cn } from "@/lib/utils"
import { isValidInternalUrl } from "@/lib/routes"

import type { OrganizationListItem } from "@/features/organizations/types"

interface DashboardShellProps {
	children: React.ReactNode
	/** SSR-fetched organizations for sidebar - prevents client-side loading flash */
	initialOrganizations?: OrganizationListItem[]
}

export function DashboardShell({ children, initialOrganizations }: DashboardShellProps) {
	return <DashboardShellInner initialOrganizations={initialOrganizations}>{children}</DashboardShellInner>
}

function DashboardShellInner({ children, initialOrganizations = [] }: { children: React.ReactNode; initialOrganizations?: OrganizationListItem[] }) {
	const router = useRouter()
	const pathname = usePathname()
	const params = useParams<{ organizationId: string }>()
	const organizationId = params.organizationId || ""

	// Sidebar collapsed state - persisted to localStorage, hydration-safe
	const [storedSidebarCollapsed, setSidebarCollapsed, , sidebarHydrated] = useLocalStorage("sidebar-collapsed", false)
	const sidebarCollapsed = sidebarHydrated ? storedSidebarCollapsed : false

	// Drawer/Panel states - using object pattern for cleaner API
	const notificationsDrawer = useModal(false)
	const commandMenu = useModal(false)
	const settingsPanel = useModal(false)
	const mobileMenu = useModal(false)

	// Notifications API integration
	// Use backend hooks - they handle both Novu enabled and disabled cases
	// The backend API syncs with Novu when enabled, so we get consistent data
	const backendNotifications = useBackendNotifications()
	const backendUnreadCount = useBackendUnreadCount()
	const backendMarkAllRead = useBackendMarkAllRead()
	const backendMarkRead = useBackendMarkRead()

	// Use backend data (which syncs with Novu when enabled)
	const notificationsData = backendNotifications.data?.notifications
		? { data: backendNotifications.data.notifications }
		: { data: [] }

	const unreadCount = backendUnreadCount.data?.count ?? 0

	const markAllRead = () => {
		backendMarkAllRead.mutate()
	}

	// Note: Backend doesn't support single notification marking, so this marks all as read
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const markRead = (_id: string) => {
		backendMarkRead.mutate()
	}

	// Dashboard data for pending enrollments count
	// URL-based multi-tenancy: organizationId from URL params
	// No need for mounted check - SSR data is available immediately
	const dashboardQuery = useDashboard({
		organizationId,
		enabled: !!organizationId,
	})
	const pendingEnrollmentsCount = dashboardQuery.data?.stats?.pendingEnrollments ?? 0

	// Get auto-generated breadcrumbs from pathname
	const breadcrumbItems = useBreadcrumbs()

	// Close mobile sidebar on route change
	React.useEffect(() => {
		mobileMenu.close()
	}, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

	// Use media query hook instead of direct window.innerWidth
	const isDesktop = useIsDesktop()

	// Close mobile sidebar when switching to desktop
	React.useEffect(() => {
		if (isDesktop) {
			mobileMenu.close()
		}
	}, [isDesktop]) // eslint-disable-line react-hooks/exhaustive-deps

	// Command menu keyboard shortcut (Ctrl/Cmd + K)
	useHotkeys("mod+k", commandMenu.open, {
		preventDefault: true,
		enableOnFormTags: false,
	})

	// Close mobile sidebar on Escape
	useHotkeys("escape", mobileMenu.close, {
		enabled: mobileMenu.isOpen,
	})

	const handleMobileSidebarToggle = React.useCallback(() => {
		mobileMenu.toggle()
	}, [mobileMenu])

	return (
			<div
			className="h-dvh lg:p-3 bg-linear-to-br from-bg-weak-50 via-bg-weak-50 to-bg-soft-200 transition-colors duration-200"
				style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
			>
			{/* ============================================ */}
			{/* DESKTOP LAYOUT - Traditional Inset Sidebar */}
			{/* ============================================ */}
			<div className="hidden lg:flex h-full gap-3">
				{/* Sidebar - Desktop: visible in flow */}
				<div className="shrink-0">
					<Sidebar
						collapsed={sidebarCollapsed}
						onCollapsedChange={setSidebarCollapsed}
						pendingEnrollments={pendingEnrollmentsCount}
						onSettingsClick={settingsPanel.open}
						initialOrganizations={initialOrganizations}
					/>
				</div>

				{/* Main Area - Desktop */}
				<div className="flex flex-1 flex-col min-w-0">
					{/* Content Card - Top aligned with sidebar */}
					<div className="flex flex-1 flex-col rounded-2xl bg-bg-white-0 border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3 transition-colors duration-200">
						{/* Header first - aligns with sidebar logo */}
						<Header
							unreadNotifications={unreadCount}
							onNotificationsClick={notificationsDrawer.open}
							onCommandMenuClick={commandMenu.open}
							sidebarCollapsed={sidebarCollapsed}
							onSidebarCollapsedChange={setSidebarCollapsed}
							onSettingsClick={settingsPanel.open}
						/>
						{/* Breadcrumbs - Below header, above content */}
						{breadcrumbItems.length > 0 && (
							<nav
								className="shrink-0 flex items-center gap-1.5 px-4 lg:px-6 py-2 border-b border-stroke-soft-200 bg-bg-weak-50/50"
								aria-label="Breadcrumb"
							>
								{breadcrumbItems.map((item, index) => {
									const isLast = index === breadcrumbItems.length - 1
									return (
										<React.Fragment key={`breadcrumb-${item.label}-${index}`}>
											{index > 0 && (
												<span className="text-paragraph-xs mx-1 text-text-soft-400">/</span>
											)}
											{item.href && !isLast ? (
												<Link
													href={item.href}
													className="text-paragraph-xs text-text-sub-600 hover:text-primary-base transition-colors duration-150"
												>
													{item.label}
												</Link>
											) : (
												<span
													className={cn(
														"text-paragraph-xs",
														isLast ? "text-text-strong-950 font-medium" : "text-text-sub-600"
													)}
												>
													{item.label}
												</span>
											)}
										</React.Fragment>
									)
								})}
							</nav>
						)}
						<main className="flex-1 min-h-0 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
							<div
								className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
							>
								{/* Status banner for non-approved organizations */}
								<StatusBanner />
								{children}
							</div>
						</main>
					</div>
				</div>
			</div>

			{/* ============================================ */}
			{/* MOBILE LAYOUT - Basement Reveal Pattern */}
			{/* Header and sidebar on gray shell (transparent), content as floating sheet */}
			{/* ============================================ */}
			<div className="lg:hidden flex flex-col h-full">
				{/* Mobile Header - Transparent on gray shell, only elements have bg */}
				<div
					className="shrink-0 px-2 pt-2"
					style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))" }}
				>
					<Header
						unreadNotifications={unreadCount}
						onNotificationsClick={notificationsDrawer.open}
						onCommandMenuClick={commandMenu.open}
						onMobileMenuClick={handleMobileSidebarToggle}
						isMobileSidebarOpen={mobileMenu.isOpen}
						onSettingsClick={settingsPanel.open}
					/>
				</div>

				{/* Content Area - Relative container for basement reveal */}
				<div className="flex-1 relative overflow-hidden px-2 pb-2">
					{/* Basement Layer - Sidebar (underneath content) */}
					<div
						className={cn(
							"absolute inset-x-2 top-0 bottom-2 z-0",
							"transition-opacity duration-300",
							mobileMenu.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
						)}
					>
						<Sidebar
							collapsed={false}
							pendingEnrollments={pendingEnrollmentsCount}
							onMobileClose={mobileMenu.close}
							onSettingsClick={() => {
								settingsPanel.open()
								mobileMenu.close()
							}}
							initialOrganizations={initialOrganizations}
						/>
					</div>

					{/* Content Sheet - Inset floating card, slides down to reveal sidebar */}
					<div
						className={cn(
							"relative z-10 flex flex-col h-full",
							"bg-bg-white-0 rounded-2xl border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3",
							"transition-[transform,box-shadow] duration-300 ease-out will-change-transform",
							mobileMenu.isOpen
								? "translate-y-[70%] scale-[0.96] shadow-2xl"
								: "translate-y-0 scale-100"
						)}
					>
						{/* Page Content */}
						<main
							className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
							style={{ WebkitOverflowScrolling: "touch" }}
						>
							<div
								className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
							>
								{/* Status banner for non-approved organizations */}
								<StatusBanner />
								{children}
							</div>
						</main>
					</div>

					{/* Tap outside to close - when sidebar is open (covers visible content sheet area) */}
					{mobileMenu.isOpen && (
						<button
							type="button"
							className="absolute inset-x-2 bottom-2 z-20 h-[30%] cursor-pointer"
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								mobileMenu.close()
							}}
							onMouseDown={(e) => {
								// Prevent this from blocking other clicks
								e.stopPropagation()
							}}
							aria-label="Close sidebar"
						/>
					)}
				</div>
			</div>

			{/* ============================================ */}
			{/* SHARED OVERLAYS */}
			{/* ============================================ */}

			{/* Notifications Drawer */}
			<NotificationsDrawer
				{...notificationsDrawer.props}
				notifications={notificationsData?.data?.map((n) => ({
					id: n.id,
					userId: "1",
					type: n.type,
					title: n.title,
					message: n.body || "",
					actionUrl: undefined,
					isRead: n.isRead,
					createdAt: n.createdAt,
				}))}
				onMarkAllRead={markAllRead}
				onNotificationClick={(notification) => {
					markRead(notification.id)
					// Only navigate to valid internal URLs (security)
					if (isValidInternalUrl(notification.actionUrl)) {
						router.push(notification.actionUrl!)
					}
					notificationsDrawer.close()
				}}
			/>

			{/* Command Menu */}
			<CommandMenu {...commandMenu.props} />

			{/* Settings Panel */}
			<SettingsPanel {...settingsPanel.props} />
			</div>
	)
}
