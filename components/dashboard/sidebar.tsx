"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { logError } from "@/lib/logging/error-logger-simple"
import { AvatarWithFallback } from "@/components/ui/primitives/avatar"
import * as Badge from "@/components/ui/data-display/badge"
import * as Button from "@/components/ui/primitives/button"
import * as Tooltip from "@/components/ui/layout/tooltip"
import * as Dropdown from "@/components/ui/layout/dropdown"
import { Logo, LogoIcon } from "@/components/ui/branding/logo"
import {
	House,
	Megaphone,
	UserPlus,
	ShoppingBag,
	Wallet,
	FileText,
	UsersThree,
	Gear,
	Question,
	CaretRight,
	CaretUpDown,
	Check,
	Plus,
	User,
	Lock,
	Moon,
	Sun,
	SignOut,
	DotsThree,
	Clock,
	PencilSimple,
	XCircle,
} from "@phosphor-icons/react"
import { useSession } from "@/features/auth"
import { useOrganizations } from "@/features/organizations"
import { useSignOut } from "@/features/auth"
import { StatusBadge } from "@/components/dashboard/status-banner"
import { useRouter } from "next/navigation"
import type { OrganizationListItem } from "@/features/organizations/types"
import { getInitial } from "@/lib/utils"
import { toast } from "sonner"
import { routes } from "@/lib/routes"
import { useQueryClient } from "@tanstack/react-query"

interface SidebarProps {
	collapsed?: boolean
	onCollapsedChange?: (collapsed: boolean) => void
	pendingEnrollments?: number
	onMobileClose?: () => void
	onSettingsClick?: () => void
	/** SSR-fetched organizations - prevents client-side loading flash */
	initialOrganizations?: OrganizationListItem[]
}

// Navigation items - hrefs are generated dynamically based on organizationId
const getNavigation = (organizationId: string) => [
	{
		id: "dashboard",
		label: "Dashboard",
		href: `/dashboard/${organizationId}`,
		icon: House,
	},
	{
		id: "campaigns",
		label: "Campaigns",
		href: `/dashboard/${organizationId}/campaigns`,
		icon: Megaphone,
	},
	{
		id: "enrollments",
		label: "Enrollments",
		href: `/dashboard/${organizationId}/enrollments`,
		icon: UserPlus,
		hasBadge: true,
	},
	{
		id: "products",
		label: "Products",
		href: `/dashboard/${organizationId}/products`,
		icon: ShoppingBag,
	},
	{
		id: "wallet",
		label: "Wallet",
		href: `/dashboard/${organizationId}/wallet`,
		icon: Wallet,
	},
	{
		id: "invoices",
		label: "Invoices",
		href: `/dashboard/${organizationId}/invoices`,
		icon: FileText,
	},
	{
		id: "team",
		label: "Team",
		href: `/dashboard/${organizationId}/team`,
		icon: UsersThree,
	},
]

const getFooterNavigation = (organizationId: string) => [
	{
		id: "settings",
		label: "Settings",
		href: `/dashboard/${organizationId}/settings`,
		icon: Gear,
		// Will open SettingsPanel instead of navigating
	},
	{
		id: "help",
		label: "Help & Support",
		href: `/dashboard/${organizationId}/help`,
		icon: Question,
	},
]

// Navigation item type
type NavigationItem = ReturnType<typeof getNavigation>[0]
type FooterNavigationItem = ReturnType<typeof getFooterNavigation>[0]

// NavItem extracted outside Sidebar to prevent recreation on every render
interface NavItemProps {
	item: NavigationItem | FooterNavigationItem
	isActive: boolean
	collapsed: boolean
	pendingEnrollments: number
	isDarkMode?: boolean
	onMobileClose?: () => void
	onSettingsClick?: () => void
}

// Helper to get nav item classes - simplifies dark mode logic
function getNavItemClasses(active: boolean, isDarkMode: boolean): string {
	if (active) {
		return isDarkMode
			? "bg-primary-base text-white font-medium shadow-sm ring-1 ring-primary-base"
			: "bg-bg-white-0 text-text-strong-950 font-medium shadow-sm ring-1 ring-stroke-soft-200"
	}
	return isDarkMode
		? "text-white hover:bg-primary-base/80 hover:text-white hover:ring-primary-base/50 hover:shadow-sm hover:ring-1"
		: "text-text-strong-950 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-sm hover:ring-1 hover:ring-stroke-soft-200/50"
}

const NavItem = React.memo(function NavItem({
	item,
	isActive: active,
	collapsed,
	pendingEnrollments,
	isDarkMode,
	onMobileClose,
	onSettingsClick,
}: NavItemProps) {
	const Icon = item.icon
	const showBadge = "hasBadge" in item && item.hasBadge && pendingEnrollments > 0
	
	// Settings link opens SettingsPanel instead of navigating
	const isSettings = item.id === "settings"
	const handleClick = (e: React.MouseEvent) => {
		if (isSettings && onSettingsClick) {
			e.preventDefault()
			onSettingsClick()
			onMobileClose?.()
		} else {
			onMobileClose?.()
		}
	}

	const content = (
		<Link
			href={item.href}
			onClick={handleClick}
			className={cn(
				"group relative flex items-center rounded-xl",
				"text-label-sm transition-colors duration-200 ease-out",
				getNavItemClasses(active, !!isDarkMode),
				collapsed ? "justify-center size-11" : "gap-3 px-3 py-2.5"
			)}
		>
			<Icon
				weight="duotone"
				className={cn(
					"size-5 shrink-0 transition-colors duration-200 ease-out",
					active ? "text-primary-base" : "text-text-sub-600 group-hover:text-text-strong-950"
				)}
			/>
			{!collapsed && (
				<>
					<span className="flex-1">{item.label}</span>
					<div className="flex items-center gap-1.5">
						{showBadge && (
							<Badge.Root color="red" variant="lighter" size="small">
								{pendingEnrollments > 99 ? "99+" : pendingEnrollments}
							</Badge.Root>
						)}
						{active && <CaretRight weight="bold" className="size-5 text-text-sub-600" />}
					</div>
				</>
			)}
		</Link>
	)

	if (collapsed) {
		return (
			<Tooltip.Root>
				<Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
				<Tooltip.Content side="right">
					<span>{item.label}</span>
					{showBadge && <span className="ml-2 text-error-base">({pendingEnrollments})</span>}
				</Tooltip.Content>
			</Tooltip.Root>
		)
	}

	return content
})

export function Sidebar({
	collapsed = false,
	pendingEnrollments = 0,
	onMobileClose,
	onSettingsClick,
	initialOrganizations = [],
}: SidebarProps) {
	const router = useRouter()
	const pathname = usePathname()
	const params = useParams<{ organizationId: string }>()
	const organizationId = params.organizationId
	const { setTheme, resolvedTheme } = useTheme()
	const { data: session } = useSession()
	const user = session?.user

	// Use SSR data when available, fall back to client fetch for updates
	const hasSSRData = initialOrganizations.length > 0
	const { data: organizationsData, isPending: isLoadingOrgs } = useOrganizations({
		// Only fetch client-side if no SSR data provided
		enabled: !hasSSRData,
	})
	// Prefer SSR data, fall back to client-fetched data
	const organizations = hasSSRData ? initialOrganizations : (organizationsData?.organizations || [])
	const currentOrganization = organizations.find(org => org.id === organizationId) || null
	const { signOut: handleSignOut } = useSignOut()
	const queryClient = useQueryClient()

	// Track if organization switch is in progress to prevent double-clicks
	const [isSwitching, setIsSwitching] = React.useState(false)

	const isDarkMode = resolvedTheme === "dark"
	const onToggleDarkMode = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
	const onSignOut = handleSignOut

	// Generate navigation items with current organizationId
	const navigation = React.useMemo(() => getNavigation(organizationId || ""), [organizationId])
	const footerNavigation = React.useMemo(() => getFooterNavigation(organizationId || ""), [organizationId])

	const handleOrganizationChange = async (org: OrganizationListItem) => {
		// Don't switch if already the active organization or if switch is in progress
		if (organizationId === org.id || isSwitching) {
			return
		}

		setIsSwitching(true)

		try {
			const status = org.approvalStatus
			if (status === "draft" || status === "rejected") {
				// Draft/Rejected orgs → go to onboarding to complete/fix
				router.push(routes.onboarding.root)
				return
			}
			if (status === "pending") {
				// Pending orgs → go to pending approval page
				router.push(routes.onboarding.pending)
				return
			}

			// ✅ FIX: Targeted cache removal - only remove queries for the OLD org
			// This prevents data leaks and unnecessary refetches
			queryClient.removeQueries({
				predicate: (query) => {
					const key = query.queryKey
					// Remove queries that contain the old orgId
					return key.some(k => k === organizationId)
				}
			})

			// ✅ PURE URL: Just navigate! No session sync needed.
			// Layout validates access. Multi-tab support. Zero DB writes.
			router.push(routes.dashboard.home(org.id))
			toast.success(`Switched to ${org.name}`)
		} catch (error) {
			logError(error, { source: "Sidebar", data: { action: "switchOrganization" } })
			toast.error("Failed to switch organization. Please try again.")
		} finally {
			// Reset switching state after a short delay to allow navigation
			setTimeout(() => setIsSwitching(false), 500)
		}
	}

	const handleCreateOrganization = () => {
		// Navigate to onboarding or create org page
		router.push(routes.onboarding.root)
	}

	const isActiveHref = (href: string) => {
		// For organization dashboard root, exact match
		if (href === `/dashboard/${organizationId}`) {
			return pathname === `/dashboard/${organizationId}`
		}
		return pathname.startsWith(href)
	}

	return (
		<aside
			className={cn(
				"flex h-full flex-col",
				// Both mobile and desktop: Transparent sidebar on gray shell
				// Individual elements (nav items, org switcher) have their own backgrounds
				"w-full lg:w-auto",
				"bg-transparent",
				"transition-[width] duration-300 ease-out",
				collapsed ? "lg:w-[72px]" : "lg:w-[280px]"
			)}
		>
			{/* Logo Section - Only visible on desktop (mobile has logo in header) */}
			<div
				className={cn(
					"hidden lg:flex h-14 sm:h-16 items-center",
					collapsed ? "justify-center px-2" : "px-5"
				)}
			>
				<Link href={organizationId ? `/dashboard/${organizationId}` : "/dashboard"} onClick={onMobileClose} className="flex items-center">
					{collapsed ? <LogoIcon size={32} /> : <Logo width={130} height={28} />}
				</Link>
			</div>

			{/* Engraved Divider - Only visible on desktop */}
			<div className="hidden lg:block mx-3 h-px bg-stroke-soft-200/60" />

			{/* Organization Switcher */}
			<div className="px-3 py-3">
				<OrganizationSwitcher
					organizations={organizations}
					currentOrganization={currentOrganization}
					onOrganizationChange={handleOrganizationChange}
					onCreateOrganization={handleCreateOrganization}
					collapsed={collapsed}
					isDarkMode={isDarkMode}
					isLoading={(!hasSSRData && isLoadingOrgs) || isSwitching}
				/>
			</div>

			{/* Engraved Divider */}
			<div className="mx-3 h-px bg-stroke-soft-200/60" />

			{/* Main Navigation */}
			<nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
				{/* Main Section Label */}
				{!collapsed && (
					<p className="mb-2 px-3 py-1 text-subheading-xs font-semibold uppercase text-text-soft-400">
						Main
					</p>
				)}
				<ul className="space-y-1">
					{navigation.map((item) => (
						<li key={item.id}>
							<NavItem
								item={item}
								isActive={isActiveHref(item.href)}
								collapsed={collapsed}
								pendingEnrollments={pendingEnrollments}
								isDarkMode={isDarkMode}
								onMobileClose={onMobileClose}
							/>
						</li>
					))}
				</ul>
			</nav>

			{/* Engraved Divider */}
			<div className="mx-3 h-px bg-stroke-soft-200/60" />

			{/* Footer Navigation */}
			<div className="p-3">
				{/* Settings Section Label */}
				{!collapsed && (
					<p className="mb-2 px-3 py-1 text-subheading-xs font-semibold uppercase text-text-soft-400">
						Settings
					</p>
				)}
				<ul className="space-y-1">
					{footerNavigation.map((item) => (
						<li key={item.id}>
							<NavItem
								item={item}
								isActive={isActiveHref(item.href)}
								collapsed={collapsed}
								pendingEnrollments={pendingEnrollments}
								isDarkMode={isDarkMode}
								onMobileClose={onMobileClose}
								onSettingsClick={onSettingsClick}
							/>
						</li>
					))}
				</ul>

				{/* User Profile Menu */}
				{user && (
					<UserProfileMenu
						collapsed={collapsed}
						isDarkMode={isDarkMode}
						onToggleDarkMode={onToggleDarkMode}
						onSignOut={onSignOut}
						onSettingsClick={onSettingsClick}
					/>
				)}
			</div>
		</aside>
	)
}

// User Profile Menu Component
interface UserProfileMenuProps {
	collapsed: boolean
	isDarkMode?: boolean
	onToggleDarkMode?: () => void
	onSignOut?: () => void
	onSettingsClick?: () => void
}

function UserProfileMenu({
	collapsed,
	isDarkMode,
	onToggleDarkMode,
	onSignOut,
	onSettingsClick,
}: UserProfileMenuProps) {
	const { data: session } = useSession()
	const user = session?.user
	const trigger = (
		<Button.Root
			variant="ghost"
			size="medium"
			aria-label="User menu"
			className={cn(
				"mt-3 rounded-xl h-auto",
				"border border-transparent hover:border-stroke-soft-200/60",
				collapsed ? "justify-center size-11 p-0" : "w-full gap-3 p-2"
			)}
		>
			<AvatarWithFallback
				src={user?.image ?? undefined}
				name={user?.name || user?.email || ""}
				size={collapsed ? "32" : "40"}
				color="blue"
			/>
			{!collapsed && (
				<>
					<div className="flex-1 min-w-0 text-left">
						<div className="text-label-sm truncate text-text-strong-950">{user?.name || "User"}</div>
						<div className="text-paragraph-xs truncate text-text-sub-600">{user?.email || ""}</div>
					</div>
					<DotsThree weight="bold" className="size-5 text-text-sub-600 shrink-0" />
				</>
			)}
		</Button.Root>
	)

	const menuContent = (
		<Dropdown.Content
			align={collapsed ? "center" : "end"}
			side="top"
			sideOffset={8}
			className="w-[min(256px,calc(100vw-2rem))]"
		>
			{/* User Info Header */}
			<div className="px-3 py-3 border-b border-stroke-soft-200">
				<div className="flex items-center gap-3">
				<AvatarWithFallback
					src={user?.image ?? undefined}
					name={user?.name || user?.email || ""}
					size="48"
					color="blue"
				/>
					<div className="flex-1 min-w-0">
						<div className="text-label-sm text-text-strong-950 truncate">{user?.name || "User"}</div>
						<div className="text-paragraph-xs text-text-sub-600 truncate">{user?.email || ""}</div>
					</div>
				</div>
			</div>

			{/* Account Section */}
			<Dropdown.Group>
				<Dropdown.Item onClick={onSettingsClick}>
					<Dropdown.ItemIcon as={User} />
					My Profile
				</Dropdown.Item>
				<Dropdown.Item onClick={onSettingsClick}>
					<Dropdown.ItemIcon as={Lock} />
					Change Password
				</Dropdown.Item>
				<Dropdown.Item onClick={onToggleDarkMode}>
					<Dropdown.ItemIcon as={isDarkMode ? Sun : Moon} />
					{isDarkMode ? "Light Mode" : "Dark Mode"}
				</Dropdown.Item>
			</Dropdown.Group>

			<Dropdown.Separator />

			{/* Sign Out */}
			<Dropdown.Item onClick={onSignOut} className="text-error-base">
				<Dropdown.ItemIcon as={SignOut} />
				Sign Out
			</Dropdown.Item>
		</Dropdown.Content>
	)

	if (collapsed) {
		return (
			<Dropdown.Root>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">{user?.name || user?.email || "User"}</Tooltip.Content>
				</Tooltip.Root>
				{menuContent}
			</Dropdown.Root>
		)
	}

	return (
		<Dropdown.Root>
			<Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
			{menuContent}
		</Dropdown.Root>
	)
}

// Organization Switcher Component - Based on AccountSwitcher patterns
interface OrganizationSwitcherProps {
	organizations: OrganizationListItem[]
	currentOrganization?: OrganizationListItem | null
	onOrganizationChange?: (org: OrganizationListItem) => void
	onCreateOrganization?: () => void
	collapsed?: boolean
	isDarkMode?: boolean
	isLoading?: boolean
}

function OrganizationSwitcher({
	organizations,
	currentOrganization,
	onOrganizationChange,
	onCreateOrganization,
	collapsed = false,
	isLoading = false,
}: OrganizationSwitcherProps) {
	// Memoized helper to get status indicator for org
	const getOrgStatusIndicator = React.useCallback((org: OrganizationListItem, isSelected: boolean) => {
		const status = org.approvalStatus

		// Selected approved org → green checkmark
		if (isSelected && status === "approved") {
			return (
				<div
					className="flex size-5 items-center justify-center rounded-full bg-primary-base"
					role="img"
					aria-label="Selected and approved"
				>
					<Check weight="bold" className="size-3 text-white" />
				</div>
			)
		}

		// Pending org → yellow clock
		if (status === "pending") {
			return (
				<div
					className="flex size-5 items-center justify-center rounded-full bg-warning-lighter"
					role="img"
					aria-label="Pending approval"
				>
					<Clock weight="fill" className="size-3 text-warning-base" />
				</div>
			)
		}

		// Draft org → gray pencil
		if (status === "draft") {
			return (
				<div
					className="flex size-5 items-center justify-center rounded-full bg-bg-soft-200"
					role="img"
					aria-label="Draft - incomplete"
				>
					<PencilSimple weight="fill" className="size-3 text-text-sub-600" />
				</div>
			)
		}

		// Rejected org → red X
		if (status === "rejected") {
			return (
				<div
					className="flex size-5 items-center justify-center rounded-full bg-error-lighter"
					role="img"
					aria-label="Rejected - needs fix"
				>
					<XCircle weight="fill" className="size-3 text-error-base" />
				</div>
			)
		}

		// Approved but not selected → empty circle
		return <div className="size-5 rounded-full border border-stroke-soft-200" aria-hidden="true" />
	}, [])

	// Memoized helper to get status label
	const getOrgStatusLabel = React.useCallback((status: string | undefined) => {
		switch (status) {
			case "pending": return "Pending approval"
			case "draft": return "Draft - incomplete"
			case "rejected": return "Rejected - needs fix"
			default: return null
		}
	}, [])

	// Show skeleton while loading - non-blocking, allows layout to render
	if (isLoading) {
		return (
			<div
				className={cn(
					"flex items-center gap-3 rounded-xl border border-stroke-soft-200",
					"bg-bg-white-0/80",
					collapsed ? "justify-center size-11" : "w-full p-2.5"
				)}
				aria-busy="true"
				aria-label="Loading organizations"
			>
				{collapsed ? (
					<div className="size-6 bg-bg-weak-50 rounded-full animate-pulse" />
				) : (
					<>
						<div className="size-10 rounded-full bg-bg-weak-50 animate-pulse" />
						<div className="flex-1 space-y-1.5">
							<div className="h-4 bg-bg-weak-50 rounded w-3/4 animate-pulse" />
							<div className="h-3 bg-bg-weak-50 rounded w-1/2 animate-pulse" />
						</div>
					</>
				)}
			</div>
		)
	}

	if (!currentOrganization || organizations.length === 0) {
		return (
			<Button.Root
				variant="basic"
				size="medium"
				aria-label="Create organization"
				onClick={onCreateOrganization}
				className={cn(
					"rounded-xl border-dashed h-auto",
					collapsed ? "justify-center size-11 p-0" : "w-full p-2.5 gap-3"
				)}
			>
				{collapsed ? (
					<Button.Icon><Plus weight="bold" /></Button.Icon>
				) : (
					<>
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
							<Plus weight="bold" className="size-5 text-text-sub-600" />
						</div>
						<span className="text-label-sm text-text-sub-600">Create Organization</span>
					</>
				)}
			</Button.Root>
		)
	}

	const triggerContent = (
		<Button.Root
			variant="basic"
			size="medium"
			aria-label="Switch organization"
			aria-haspopup="menu"
			aria-expanded={false}
			disabled={isLoading}
			className={cn(
				"rounded-xl h-auto",
				collapsed ? "justify-center size-11 p-0" : "w-full gap-3 p-2.5 pr-3",
				isLoading && "opacity-70 cursor-not-allowed"
			)}
		>
			{collapsed ? (
				<span className="text-label-sm font-semibold text-text-strong-950">
					{getInitial(currentOrganization.name)}
				</span>
			) : (
				<>
					<div
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-full",
							"bg-bg-soft-200"
						)}
					>
						<span className="text-label-sm font-semibold text-text-strong-950">
							{getInitial(currentOrganization.name)}
						</span>
					</div>
					<div className="flex min-w-0 flex-1 flex-col text-left">
						<div className="flex items-center gap-2">
							<span className="truncate text-label-sm font-semibold text-text-strong-950">
								{currentOrganization.name}
							</span>
							{/* Status badge for non-approved orgs */}
							<StatusBadge />
						</div>
						<span className="truncate text-paragraph-xs text-text-sub-600">
							{currentOrganization.slug}
						</span>
					</div>
					<CaretUpDown weight="bold" className="size-4 shrink-0 text-text-soft-400" />
				</>
			)}
		</Button.Root>
	)

	const dropdownContent = (
		<Dropdown.Content
			align="start"
			side={collapsed ? "right" : "bottom"}
			sideOffset={8}
			className="w-[min(288px,calc(100vw-2rem))]"
		>
			{/* Switch Organization Section */}
			<Dropdown.Group>
				<Dropdown.Label>Switch organization</Dropdown.Label>
				<div className="flex flex-col gap-0.5 px-1.5">
					{organizations.map((org) => {
						const isSelected = org.id === currentOrganization?.id
						const statusLabel = getOrgStatusLabel(org.approvalStatus)

						return (
							<Button.Root
								key={org.id}
								variant="ghost"
								size="small"
								onClick={() => onOrganizationChange?.(org)}
								aria-current={isSelected ? "true" : undefined}
								className={cn(
									"w-full gap-3 rounded-md px-2 py-2 h-auto justify-start",
									isSelected && "bg-bg-weak-50"
								)}
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
									<span className="text-label-xs font-semibold text-text-strong-950">
										{getInitial(org.name)}
									</span>
								</div>
								<div className="flex min-w-0 flex-1 flex-col text-left">
									<span className="truncate text-label-sm font-medium text-text-strong-950">
										{org.name}
									</span>
									{statusLabel ? (
										<span className={cn(
											"truncate text-paragraph-xs",
											org.approvalStatus === "rejected" ? "text-error-base" :
											org.approvalStatus === "pending" ? "text-warning-base" :
											"text-text-soft-400"
										)}>
											{statusLabel}
										</span>
									) : (
										<span className="truncate text-paragraph-xs text-text-sub-600">
											{org.slug}
										</span>
									)}
								</div>
								{getOrgStatusIndicator(org, isSelected)}
							</Button.Root>
						)
					})}
				</div>
			</Dropdown.Group>

			{/* Add Organization Button */}
			<div className="px-2 pt-1 pb-2">
				<Button.Root
					variant="basic"
					size="small"
					aria-label="Add new organization"
					onClick={onCreateOrganization}
					className="w-full"
				>
					<Button.Icon><Plus weight="bold" /></Button.Icon>
					Add organization
				</Button.Root>
			</div>
		</Dropdown.Content>
	)

	if (collapsed) {
		return (
			<Dropdown.Root>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Dropdown.Trigger asChild>{triggerContent}</Dropdown.Trigger>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">{currentOrganization.name}</Tooltip.Content>
				</Tooltip.Root>
				{dropdownContent}
			</Dropdown.Root>
		)
	}

	return (
		<Dropdown.Root>
			<Dropdown.Trigger asChild>{triggerContent}</Dropdown.Trigger>
			{dropdownContent}
		</Dropdown.Root>
	)
}
