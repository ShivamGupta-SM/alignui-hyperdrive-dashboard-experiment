"use client"

import * as React from "react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { NotificationsDrawer } from "@/components/dashboard/notifications-drawer"
import { CommandMenu } from "@/components/dashboard/command-menu"
import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { StatusBanner } from "@/components/dashboard/status-banner"
import { useBreadcrumbs, useIsDesktop } from "@/hooks/ui"
import { useSignOut, useSession } from "@/features/auth"
import { useOrganization } from "@/features/organizations"
import { useUIStore } from "@/lib/stores/ui-store"
import { useNotifications as useBackendNotifications, useUnreadNotificationCount as useBackendUnreadCount, useMarkAllNotificationsRead as useBackendMarkAllRead, useMarkNotificationRead as useBackendMarkRead, useDashboard } from "@/hooks/shared"
import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"

interface DashboardShellProps {
	children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
	return <DashboardShellInner>{children}</DashboardShellInner>
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()
	const params = useParams<{ organizationId: string }>()
	const organizationId = params.organizationId || ""
	const queryClient = useQueryClient()
	const { theme, setTheme, resolvedTheme } = useTheme()
	const {
		sidebarCollapsed,
		setSidebarCollapsed,
		notificationsDrawerOpen,
		setNotificationsDrawerOpen,
		commandMenuOpen,
		setCommandMenuOpen,
		settingsPanelOpen,
		setSettingsPanelOpen,
	} = useUIStore()

	// ✅ Organization check - redirect to onboarding if not approved
	const { organization, needsOnboarding, isDraft, isPending: isOrgPending } = useOrganization()

	React.useEffect(() => {
		// Wait for org data to load, then redirect if needed
		if (!isOrgPending && needsOnboarding) {
			router.replace("/onboarding")
		}
	}, [isOrgPending, needsOnboarding, router])

	// Mobile menu uses local state (as per UIState design)
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
	const mobileSidebarOpen = mobileMenuOpen
	const setMobileSidebarOpen = setMobileMenuOpen

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
	
	const unreadCount = backendUnreadCount.data ?? 0
	
	const markAllRead = () => {
		backendMarkAllRead.mutate()
	}
	
	const markRead = (id: string) => {
		backendMarkRead.mutate(id)
	}

	// Prevent hydration mismatch by using consistent initial state
	// MUST be declared before useDashboard to avoid "Cannot access before initialization" error
	const [mounted, setMounted] = React.useState(false)
	React.useEffect(() => {
		setMounted(true)
	}, [])

	// Dashboard data for pending enrollments count
	// URL-based multi-tenancy: organizationId from URL params
	const dashboardQuery = useDashboard({
		organizationId,
		enabled: mounted && !!organizationId, // Only fetch after mount and if org exists
	})
	const pendingEnrollmentsCount = dashboardQuery.data?.stats?.pendingEnrollments ?? 0

	// Get auto-generated breadcrumbs from pathname
	const breadcrumbItems = useBreadcrumbs()

	// Close mobile sidebar on route change
	React.useEffect(() => {
		setMobileMenuOpen(false)
	}, [pathname, setMobileMenuOpen])

	// Use media query hook instead of direct window.innerWidth
	const isDesktop = useIsDesktop()
	
	// Close mobile sidebar when switching to desktop
	React.useEffect(() => {
		if (isDesktop) {
			setMobileMenuOpen(false)
		}
	}, [isDesktop, setMobileMenuOpen])

	// Command menu keyboard shortcut - TODO: implement useKeyboardShortcut hook
	// useKeyboardShortcut({ key: "k", modifiers: ["ctrl", "meta"], preventDefault: true }, () => {
	// 	setCommandMenuOpen(true)
	// }, { enabled: true })

	// Close mobile sidebar on Escape - TODO: implement useKeyboardShortcut hook
	// useKeyboardShortcut("Escape", () => {
	// 	setMobileMenuOpen(false)
	// }, { enabled: mobileSidebarOpen })

	// Sign out - single source of truth
	const { signOut: handleSignOut } = useSignOut("/sign-in")

	const handleMobileSidebarToggle = React.useCallback(() => {
		setMobileMenuOpen(!mobileMenuOpen)
	}, [mobileMenuOpen, setMobileMenuOpen])

	// Don't render until mounted to prevent hydration mismatch
	// The skeleton must match the exact structure and dimensions of the real layout
	if (!mounted) {
		return (
			<div
				className="h-dvh lg:p-3 bg-linear-to-br from-bg-weak-50 via-bg-weak-50 to-bg-soft-200 pb-[env(safe-area-inset-bottom,0px)]"
			>
				{/* Desktop skeleton */}
				<div className="hidden lg:flex h-full gap-3">
					{/* Placeholder sidebar - matches collapsed=false width */}
					<div className="w-[280px] shrink-0" />
					{/* Main Content Card */}
					<div className="flex flex-1 flex-col overflow-hidden min-w-0 rounded-2xl bg-bg-white-0 border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3">
						{/* Placeholder header - matches h-14 sm:h-16 */}
						<div className="h-16 border-b border-stroke-soft-200" />
						{/* Page Content */}
							<main className="flex-1 overflow-y-auto">
								<div 
									className="container mx-auto max-w-7xl px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
								>
									{children}
								</div>
							</main>
					</div>
				</div>

				{/* Mobile skeleton - matches mobile layout structure */}
				<div className="lg:hidden flex flex-col h-full">
					{/* Mobile Header placeholder */}
					<div className="shrink-0 px-2 pt-2">
						<div className="h-14 sm:h-16" />
					</div>
					{/* Content Area */}
					<div className="flex-1 relative overflow-hidden p-2 pt-2">
						<div className="relative z-10 flex flex-col h-full bg-bg-white-0 rounded-2xl border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3">
							<main className="flex-1 overflow-y-auto">
								<div
									className="container mx-auto max-w-7xl px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
								>
									{children}
								</div>
							</main>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
			<div
			className="h-dvh lg:p-3 bg-linear-to-br from-bg-weak-50 via-bg-weak-50 to-bg-soft-200 transition-colors duration-200"
				style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
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
						onSettingsClick={() => setSettingsPanelOpen(true)}
					/>
				</div>

				{/* Main Area - Desktop */}
				<div className="flex flex-1 flex-col overflow-hidden min-w-0">
					{/* Content Card - Top aligned with sidebar */}
					<div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-bg-white-0 border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3 transition-colors duration-200">
						{/* Header first - aligns with sidebar logo */}
						<Header
							unreadNotifications={unreadCount}
							onNotificationsClick={() => setNotificationsDrawerOpen(true)}
							onCommandMenuClick={() => setCommandMenuOpen(true)}
							sidebarCollapsed={sidebarCollapsed}
							onSidebarCollapsedChange={setSidebarCollapsed}
							onSettingsClick={() => setSettingsPanelOpen(true)}
						/>
						{/* Breadcrumbs - Below header, above content */}
						{breadcrumbItems.length > 0 && (
							<nav
								className="flex items-center gap-1.5 px-4 lg:px-6 py-2 border-b border-stroke-soft-200 bg-bg-weak-50/50"
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
												<a
													href={item.href}
													className="text-paragraph-xs text-text-sub-600 hover:text-primary-base transition-colors duration-150"
												>
													{item.label}
												</a>
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
						<main className="flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
							<div
								className="container mx-auto max-w-7xl px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
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
						onNotificationsClick={() => setNotificationsDrawerOpen(true)}
						onCommandMenuClick={() => setCommandMenuOpen(true)}
						onMobileMenuClick={handleMobileSidebarToggle}
						isMobileSidebarOpen={mobileSidebarOpen}
						onSettingsClick={() => setSettingsPanelOpen(true)}
					/>
				</div>

				{/* Content Area - Relative container for basement reveal */}
				<div className="flex-1 relative overflow-hidden p-2 pt-2">
					{/* Basement Layer - Sidebar (underneath content) */}
					<div
						className={cn(
							"absolute inset-2 z-0",
							"transition-opacity duration-300",
							mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
						)}
					>
					<Sidebar
						collapsed={false}
						pendingEnrollments={pendingEnrollmentsCount}
						onMobileClose={() => setMobileSidebarOpen(false)}
						onSettingsClick={() => {
							setSettingsPanelOpen(true)
							setMobileSidebarOpen(false)
						}}
					/>
					</div>

					{/* Content Sheet - Inset floating card, slides down to reveal sidebar */}
					<div
						className={cn(
							"relative z-10 flex flex-col h-full",
							"bg-bg-white-0 rounded-2xl border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3",
							"transition-[transform,box-shadow] duration-300 ease-out will-change-transform",
							mobileSidebarOpen
								? "translate-y-[70%] scale-[0.96] shadow-2xl"
								: "translate-y-0 scale-100"
						)}
					>
						{/* Page Content */}
						<main
							className="flex-1 overflow-y-auto overscroll-contain"
							style={{ WebkitOverflowScrolling: "touch" }}
						>
							<div
								className="container mx-auto max-w-7xl px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
							>
								{/* Status banner for non-approved organizations */}
								<StatusBanner />
								{children}
							</div>
						</main>
					</div>

					{/* Tap outside to close - when sidebar is open (covers visible content sheet area) */}
					{mobileSidebarOpen && (
						<button
							type="button"
							className="absolute inset-x-2 bottom-2 z-20 h-[35%] cursor-pointer"
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								setMobileSidebarOpen(false)
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
				open={notificationsDrawerOpen}
				onOpenChange={setNotificationsDrawerOpen}
				notifications={notificationsData?.data?.map((n: any) => ({
					id: n.id,
					userId: n.userId || "1",
					type: n.type,
					title: n.title,
					message: n.message,
					actionUrl: n.actionUrl,
					isRead: n.isRead,
					createdAt: n.createdAt,
				}))}
				onMarkAllRead={markAllRead}
				onNotificationClick={(notification) => {
					markRead(notification.id)
					if (notification.actionUrl) {
						router.push(notification.actionUrl)
					}
					setNotificationsDrawerOpen(false)
				}}
			/>

			{/* Command Menu */}
			<CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />

			{/* Settings Panel */}
			<SettingsPanel open={settingsPanelOpen} onOpenChange={setSettingsPanelOpen} />
			</div>
	)
}
