"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"
import { AvatarWithFallback } from "@/components/ui/primitives/avatar"
import * as Badge from "@/components/ui/data-display/badge"
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
	X,
} from "@phosphor-icons/react"
import { useSession } from "@/features/auth"
import {
	useOrganizations,
	useSwitchOrganization,
} from "@/features/organizations"
import { useActiveOrganization } from "@/features/organizations"
import { useSignOut } from "@/features/auth"
import { ORGANIZATION_STATUS_CONFIG } from "@/lib/constants"
import { useRouter } from "next/navigation"
import type { organizations } from "@/lib/api/encore-client"
import type { OrganizationStatus } from "@/lib/types"

type Organization = organizations.Organization

interface SidebarProps {
	collapsed?: boolean
	onCollapsedChange?: (collapsed: boolean) => void
	pendingEnrollments?: number
	onMobileClose?: () => void
	onSettingsClick?: () => void
}

const navigation = [
	{
		id: "dashboard",
		label: "Dashboard",
		href: "/dashboard",
		icon: House,
	},
	{
		id: "campaigns",
		label: "Campaigns",
		href: "/dashboard/campaigns",
		icon: Megaphone,
	},
	{
		id: "enrollments",
		label: "Enrollments",
		href: "/dashboard/enrollments",
		icon: UserPlus,
		hasBadge: true,
	},
	{
		id: "products",
		label: "Products",
		href: "/dashboard/products",
		icon: ShoppingBag,
	},
	{
		id: "wallet",
		label: "Wallet",
		href: "/dashboard/wallet",
		icon: Wallet,
	},
	{
		id: "invoices",
		label: "Invoices",
		href: "/dashboard/invoices",
		icon: FileText,
	},
	{
		id: "team",
		label: "Team",
		href: "/dashboard/team",
		icon: UsersThree,
	},
]

const footerNavigation = [
	{
		id: "settings",
		label: "Settings",
		href: "/dashboard/settings",
		icon: Gear,
		// Will open SettingsPanel instead of navigating
	},
	{
		id: "help",
		label: "Help & Support",
		href: "/dashboard/help",
		icon: Question,
	},
]

// NavItem extracted outside Sidebar to prevent recreation on every render
interface NavItemProps {
	item: (typeof navigation)[0] | (typeof footerNavigation)[0]
	isActive: boolean
	collapsed: boolean
	pendingEnrollments: number
	isDarkMode?: boolean
	onMobileClose?: () => void
	onSettingsClick?: () => void
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
				active
					? isDarkMode
						? "bg-primary-base text-white font-medium shadow-sm ring-1 ring-primary-base"
						: "bg-bg-white-0 text-text-strong-950 font-medium shadow-sm ring-1 ring-stroke-soft-200"
					: isDarkMode
						? "text-white hover:bg-primary-base/80 hover:text-white hover:ring-primary-base/50 hover:shadow-sm hover:ring-1"
						: "text-text-strong-950 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-sm hover:ring-1 hover:ring-stroke-soft-200/50",
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
}: SidebarProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { theme, setTheme, resolvedTheme } = useTheme()
	const { data: session } = useSession()
	const user = session?.user
	const { data: organizationsData, isLoading: isLoadingOrgs } = useOrganizations()
	const organizations = organizationsData?.organizations || []
	const currentOrganization = useActiveOrganization()
	const switchOrganization = useSwitchOrganization()
	const { signOut: handleSignOut } = useSignOut()

	const isDarkMode = resolvedTheme === "dark"
	const onToggleDarkMode = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
	const onSignOut = handleSignOut

	const handleOrganizationChange = (org: Organization) => {
		// Don't switch if already the active organization
		if (currentOrganization?.id === org.id) {
			return
		}
		
		// Don't switch if mutation is already in progress
		if (switchOrganization.isPending) {
			return
		}
		
		// Call mutation - all success/error handling is in the hook
		switchOrganization.mutate(org.id)
	}

	const handleCreateOrganization = () => {
		// Navigate to onboarding or create org page
		router.push("/onboarding")
	}

	const isActiveHref = (href: string) => {
		if (href === "/dashboard") {
			return pathname === "/dashboard"
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
				"transition-[width] duration-300",
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
				<Link href="/dashboard" onClick={onMobileClose} className="flex items-center">
					{collapsed ? <LogoIcon size={32} /> : <Logo width={130} height={28} />}
				</Link>
			</div>

			{/* Engraved Divider - Only visible on desktop */}
			<div className="hidden lg:block mx-3 h-px bg-stroke-soft-200/60" />

			{/* Organization Switcher */}
			<div className="px-3 py-3">
				<OrganizationSwitcher
					organizations={organizations as Organization[]}
					currentOrganization={currentOrganization as Organization | null}
					onOrganizationChange={handleOrganizationChange}
					onCreateOrganization={handleCreateOrganization}
					collapsed={collapsed}
					isDarkMode={isDarkMode}
					isLoading={isLoadingOrgs || switchOrganization.isPending}
				/>
			</div>

			{/* Engraved Divider */}
			<div className="mx-3 h-px bg-stroke-soft-200/60" />

			{/* Main Navigation */}
			<nav className="flex-1 overflow-y-auto p-3">
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
		<button
			className={cn(
				"mt-3 flex items-center rounded-xl transition-all duration-200",
				"hover:bg-bg-weak-50 hover:shadow-sm",
				"border border-transparent hover:border-stroke-soft-200/60",
				collapsed ? "justify-center size-11" : "w-full gap-3 p-2"
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
		</button>
	)

	const menuContent = (
		<Dropdown.Content
			align={collapsed ? "center" : "end"}
			side="top"
			sideOffset={8}
			className="w-64"
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
	organizations: Organization[]
	currentOrganization?: Organization | null
	onOrganizationChange?: (org: Organization) => void
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
	isDarkMode,
	isLoading = false,
}: OrganizationSwitcherProps) {
	// If no organizations or no current organization, show create button
	if (isLoading) {
		return (
			<div
				className={cn(
					"flex items-center gap-3 rounded-xl border border-stroke-soft-200",
					"bg-bg-white-0/80",
					collapsed ? "justify-center size-11" : "w-full p-2.5"
				)}
			>
				{!collapsed && <div className="size-10 rounded-full bg-bg-weak-50 animate-pulse" />}
				{!collapsed && (
					<div className="flex-1 space-y-1.5">
						<div className="h-4 bg-bg-weak-50 rounded w-3/4 animate-pulse" />
						<div className="h-3 bg-bg-weak-50 rounded w-1/2 animate-pulse" />
					</div>
				)}
			</div>
		)
	}

	if (!currentOrganization || organizations.length === 0) {
		return (
			<button
				onClick={onCreateOrganization}
				className={cn(
					"flex items-center gap-3 rounded-xl border border-dashed border-stroke-soft-200",
					"bg-bg-white-0/80 transition-all duration-200",
					"hover:bg-bg-white-0 hover:border-stroke-sub-300 hover:shadow-sm",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
					collapsed ? "justify-center size-11" : "w-full p-2.5"
				)}
			>
				{collapsed ? (
					<Plus weight="bold" className="size-5 text-text-sub-600" />
				) : (
					<>
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
							<Plus weight="bold" className="size-5 text-text-sub-600" />
						</div>
						<span className="text-label-sm text-text-sub-600">Create Organization</span>
					</>
				)}
			</button>
		)
	}

	const triggerContent = (
		<button
			type="button"
			className={cn(
				"flex items-center rounded-xl",
				"border border-stroke-soft-200 bg-bg-white-0",
				"cursor-pointer transition-all duration-200",
				"hover:bg-bg-weak-50 hover:shadow-sm",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
				collapsed ? "justify-center size-11" : "w-full gap-3 p-2.5 pr-3"
			)}
		>
			{collapsed ? (
				<span className="text-label-sm font-semibold text-text-strong-950">
					{currentOrganization.name.charAt(0).toUpperCase()}
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
							{currentOrganization.name.charAt(0).toUpperCase()}
						</span>
					</div>
					<div className="flex min-w-0 flex-1 flex-col text-left">
						<span className="truncate text-label-sm font-semibold text-text-strong-950">
							{currentOrganization.name}
						</span>
						<span className="truncate text-paragraph-xs text-text-sub-600">
							{currentOrganization.slug}
						</span>
					</div>
					<CaretUpDown weight="bold" className="size-4 shrink-0 text-text-soft-400" />
				</>
			)}
		</button>
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
						// Map approvalStatus to OrganizationStatus for config lookup
						const orgStatus = org.approvalStatus === "approved" ? "approved" : 
						                  org.approvalStatus === "pending" ? "pending" :
						                  org.approvalStatus === "rejected" ? "rejected" : "suspended"
						const statusConfig = ORGANIZATION_STATUS_CONFIG[orgStatus]
						const isSelected = org.id === currentOrganization?.id

						return (
							<button
								key={org.id}
								type="button"
								onClick={() => onOrganizationChange?.(org)}
								aria-current={isSelected ? "true" : undefined}
								className={cn(
									"relative flex w-full items-center gap-3 rounded-md px-2 py-2",
									"cursor-pointer transition-colors duration-200 outline-none",
									"hover:bg-bg-weak-50 focus:bg-bg-weak-50",
									isSelected && "bg-bg-weak-50"
								)}
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
									<span className="text-label-xs font-semibold text-text-strong-950">
										{org.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div className="flex min-w-0 flex-1 flex-col text-left">
									<span className="truncate text-label-sm font-medium text-text-strong-950">
										{org.name}
									</span>
									<div className="flex items-center gap-1 text-paragraph-xs text-text-sub-600">
										<span className="truncate">{org.slug}</span>
										{org.approvalStatus === "approved" && "campaignCount" in org && typeof org.campaignCount === "number" && (
											<span className="shrink-0 whitespace-nowrap">
												· {org.campaignCount} campaigns
											</span>
										)}
									</div>
								</div>
								{isSelected ? (
									<div className="flex size-5 items-center justify-center rounded-full bg-primary-base">
										<Check weight="bold" className="size-3 text-white" />
									</div>
								) : (
									<div className="size-5 rounded-full border border-stroke-soft-200" />
								)}
							</button>
						)
					})}
				</div>
			</Dropdown.Group>

			{/* Add Organization Button */}
			<div className="px-2 pt-1 pb-2">
				<button
					type="button"
					onClick={onCreateOrganization}
					className={cn(
						"flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2",
						"text-label-sm font-semibold text-text-sub-600",
						"border border-stroke-soft-200",
						"cursor-pointer transition-colors duration-200",
						"hover:bg-bg-weak-50 hover:text-text-strong-950"
					)}
				>
					<Plus weight="bold" className="size-4" />
					Add organization
				</button>
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
