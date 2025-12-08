'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import * as Avatar from '@/components/ui/avatar'
import { AvatarWithFallback } from '@/components/ui/avatar'
import * as Badge from '@/components/ui/badge'
import * as Tooltip from '@/components/ui/tooltip'
import * as Dropdown from '@/components/ui/dropdown'
import { Logo, LogoIcon } from '@/components/ui/logo'
import {
  RiDashboardLine,
  RiMegaphoneLine,
  RiUserFollowLine,
  RiShoppingBag3Line,
  RiWallet3Line,
  RiFileList3Line,
  RiTeamLine,
  RiSettings4Line,
  RiQuestionLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiExpandUpDownLine,
  RiCheckLine,
  RiAddLine,
  RiUserLine,
  RiLockLine,
  RiMoonLine,
  RiSunLine,
  RiLogoutBoxLine,
  RiMoreLine,
  RiCloseLine,
} from '@remixicon/react'
import type { Organization, User } from '@/lib/types'
import { ORGANIZATION_STATUS_CONFIG } from '@/lib/constants'

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  pendingEnrollments?: number
  organizations?: Organization[]
  currentOrganization?: Organization | null
  onOrganizationChange?: (org: Organization) => void
  onCreateOrganization?: () => void
  user?: User | null
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onSignOut?: () => void
  onMobileClose?: () => void
}

const navigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: RiDashboardLine,
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: RiMegaphoneLine,
  },
  {
    id: 'enrollments',
    label: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: RiUserFollowLine,
    hasBadge: true,
  },
  {
    id: 'products',
    label: 'Products',
    href: '/dashboard/products',
    icon: RiShoppingBag3Line,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    href: '/dashboard/wallet',
    icon: RiWallet3Line,
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: RiFileList3Line,
  },
  {
    id: 'team',
    label: 'Team',
    href: '/dashboard/team',
    icon: RiTeamLine,
  },
]

const footerNavigation = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: RiSettings4Line,
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/dashboard/help',
    icon: RiQuestionLine,
  },
]

export function Sidebar({
  collapsed = false,
  onCollapsedChange,
  pendingEnrollments = 0,
  organizations = [],
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
  user,
  isDarkMode,
  onToggleDarkMode,
  onSignOut,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const active = isActive(item.href)
    const Icon = item.icon
    const showBadge = item.hasBadge && pendingEnrollments > 0

    const content = (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
          'text-label-sm transition-all duration-200 ease-out',
          // Keel-style: Subtle floating pill with soft shadow, minimal border
          active
            ? 'bg-bg-white-0 text-text-strong-950 font-medium shadow-sm'
            : 'text-text-sub-600 hover:bg-bg-white-0/80 hover:text-text-strong-950 hover:shadow-sm'
        )}
      >
        <Icon 
          className={cn(
            'size-5 shrink-0 transition duration-200 ease-out',
            active ? 'text-primary-base' : 'text-text-sub-600 group-hover:text-text-sub-600'
          )} 
        />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            <div className="flex items-center gap-1.5">
              {showBadge && (
                <Badge.Root color="red" variant="light" size="small">
                  {pendingEnrollments > 99 ? '99+' : pendingEnrollments}
                </Badge.Root>
              )}
              {active && (
                <RiArrowRightSLine className="size-5 text-text-sub-600" />
              )}
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
            {showBadge && (
              <span className="ml-2 text-error-base">({pendingEnrollments})</span>
            )}
          </Tooltip.Content>
        </Tooltip.Root>
      )
    }

    return content
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col',
        // Keel style: Sidebar is TRANSPARENT, sits on gray shell
        // Only nav items become white pills when active
        // Mobile: white background for overlay
        // Desktop: transparent (blends with gray shell)
        'bg-bg-white-0 lg:bg-transparent',
        'transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Logo Section - h-16 to match header height */}
      <div className={cn(
        "flex h-14 sm:h-16 items-center",
        collapsed ? "justify-center px-2" : "justify-between px-5"
      )}>
        <Link href="/dashboard" onClick={onMobileClose} className="flex items-center">
          {collapsed ? (
            <LogoIcon size={32} />
          ) : (
            <Logo width={130} height={28} />
          )}
        </Link>
        {/* Mobile Close Button - Only visible on mobile when sidebar is open */}
        {!collapsed && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-8 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
            aria-label="Close sidebar"
          >
            <RiCloseLine className="size-5" />
          </button>
        )}
        {/* Metallic logo temporarily disabled - visit /dashboard/metallic-demo to test */}
      </div>

      {/* Engraved Divider */}
      <div className="mx-3 h-px bg-stroke-soft-200 shadow-[0_1px_0_0_rgba(255,255,255,0.8)]" />

      {/* Organization Switcher */}
      <div className={cn(
        collapsed ? "px-2 py-3" : "px-3 py-3"
      )}>
        {currentOrganization ? (
          collapsed ? (
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <button 
                  className={cn(
                    'flex w-full items-center justify-center rounded-xl p-2 transition-all',
                    'hover:bg-bg-soft-200/50',
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
                    <span className="text-label-sm text-text-sub-600 font-semibold">
                      {currentOrganization.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              </Dropdown.Trigger>
              <Dropdown.Content align="start" side="right" className="w-72">
                <Dropdown.Group>
                  <Dropdown.Label>Your Organizations</Dropdown.Label>
                  {organizations.map((org) => {
                    const statusConfig = ORGANIZATION_STATUS_CONFIG[org.status]
                    const isSelected = org.id === currentOrganization?.id

                    return (
                      <Dropdown.Item
                        key={org.id}
                        onClick={() => onOrganizationChange?.(org)}
                        className="flex items-start gap-3 py-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-base">
                          <span className="text-label-sm text-white font-bold">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-label-sm text-text-strong-950 truncate">
                              {org.name}
                            </span>
                            {isSelected && <RiCheckLine className="size-4 text-primary-base shrink-0" />}
                          </div>
                          <div className="text-paragraph-xs text-text-sub-600 truncate">
                            {org.slug}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge.Root
                              color={statusConfig.color === 'green' ? 'green' : statusConfig.color === 'yellow' ? 'yellow' : 'gray'} 
                              variant="light"
                              size="small"
                            >
                              {statusConfig.label}
                            </Badge.Root>
                            {org.status === 'approved' && (
                              <span className="text-paragraph-xs text-text-soft-400">
                                {org.campaignCount} campaigns
                              </span>
                            )}
                          </div>
                        </div>
                      </Dropdown.Item>
                    )
                  })}
                </Dropdown.Group>

                <Dropdown.Separator />

                <Dropdown.Item onClick={onCreateOrganization}>
                  <Dropdown.ItemIcon as={RiAddLine} />
                  Create New Organization
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Root>
          ) : (
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-bg-soft-200/50">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
                    <span className="text-label-sm text-text-sub-600 font-semibold">
                      {currentOrganization.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <span className="text-label-sm font-semibold text-text-strong-950 truncate">
                      {currentOrganization.name}
                    </span>
                    <span className="text-paragraph-xs text-text-sub-600 truncate">
                      {currentOrganization.slug}
                    </span>
                  </div>
                  <RiExpandUpDownLine className="size-4 shrink-0 text-text-soft-400" />
                </button>
              </Dropdown.Trigger>
              <Dropdown.Content align="start" className="w-72">
                <Dropdown.Group>
                  <Dropdown.Label>Your Organizations</Dropdown.Label>
                  {organizations.map((org) => {
                    const statusConfig = ORGANIZATION_STATUS_CONFIG[org.status]
                    const isSelected = org.id === currentOrganization?.id

                    return (
                      <Dropdown.Item
                        key={org.id}
                        onClick={() => onOrganizationChange?.(org)}
                        className="flex items-start gap-3 py-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-soft-200">
                          <span className="text-label-sm text-text-sub-600 font-semibold">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-label-sm text-text-strong-950 truncate">
                              {org.name}
                            </span>
                            {isSelected && <RiCheckLine className="size-4 text-primary-base shrink-0" />}
                          </div>
                          <div className="text-paragraph-xs text-text-sub-600 truncate">
                            {org.slug}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge.Root
                              color={statusConfig.color === 'green' ? 'green' : statusConfig.color === 'yellow' ? 'yellow' : 'gray'} 
                              variant="light"
                              size="small"
                            >
                              {statusConfig.label}
                            </Badge.Root>
                            {org.status === 'approved' && (
                              <span className="text-paragraph-xs text-text-soft-400">
                                {org.campaignCount} campaigns
                              </span>
                            )}
                          </div>
                        </div>
                      </Dropdown.Item>
                    )
                  })}
                </Dropdown.Group>

                <Dropdown.Separator />

                <Dropdown.Item onClick={onCreateOrganization}>
                  <Dropdown.ItemIcon as={RiAddLine} />
                  Create New Organization
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Root>
          )
        ) : (
          <button
            onClick={onCreateOrganization}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-2.5 transition-all',
              'hover:bg-bg-soft-200/50',
              collapsed && 'justify-center'
            )}
          >
            <div className={cn(
              "flex shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-stroke-soft-200",
              collapsed ? "size-8" : "size-9"
            )}>
              <RiAddLine className={cn("text-text-sub-600", collapsed ? "size-4" : "size-5")} />
            </div>
            {!collapsed && (
              <span className="text-label-sm text-text-sub-600">
                Create Organization
              </span>
            )}
          </button>
        )}
      </div>

      {/* Engraved Divider - creates carved/inset appearance */}
      <div className="mx-3 h-px bg-stroke-soft-200 shadow-[0_1px_0_0_rgba(255,255,255,0.8)]" />

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
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Engraved Divider between Scrollable Nav and Fixed Footer */}
      <div className="mx-3 h-px bg-stroke-soft-200 shadow-[0_1px_0_0_rgba(255,255,255,0.8)]" />

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
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        {/* User Profile Menu */}
        {user && (
          <UserProfileMenu
            user={user}
            collapsed={collapsed}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </aside>
  )
}

// User Profile Menu Component
interface UserProfileMenuProps {
  user: User
  collapsed: boolean
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onSignOut?: () => void
}

function UserProfileMenu({
  user,
  collapsed,
  isDarkMode,
  onToggleDarkMode,
  onSignOut,
}: UserProfileMenuProps) {
  const trigger = (
    <button
      className={cn(
        'mt-3 flex w-full items-center gap-3 rounded-10 p-2 transition-colors',
        'hover:bg-bg-weak-50',
        collapsed && 'justify-center'
      )}
    >
      <AvatarWithFallback
        src={user.avatar}
        name={user.name || user.email}
        size="40"
        color="blue"
      />
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-label-sm text-text-strong-950 truncate">
              {user.name || 'User'}
            </div>
            <div className="text-paragraph-xs text-text-sub-600 truncate">
              {user.email}
            </div>
          </div>
          <RiMoreLine className="size-5 text-text-sub-600 shrink-0" />
        </>
      )}
    </button>
  )

  const menuContent = (
    <Dropdown.Content
      align={collapsed ? 'center' : 'end'}
      side="top"
      sideOffset={8}
      className="w-64"
    >
      {/* User Info Header */}
      <div className="px-3 py-3 border-b border-stroke-soft-200">
        <div className="flex items-center gap-3">
          <AvatarWithFallback
            src={user.avatar}
            name={user.name || user.email}
            size="48"
            color="blue"
          />
          <div className="flex-1 min-w-0">
            <div className="text-label-sm text-text-strong-950 truncate">
              {user.name || 'User'}
            </div>
            <div className="text-paragraph-xs text-text-sub-600 truncate">
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <Dropdown.Group>
        <Dropdown.Item asChild>
          <Link href="/dashboard/profile">
            <Dropdown.ItemIcon as={RiUserLine} />
            My Profile
          </Link>
        </Dropdown.Item>
        <Dropdown.Item asChild>
          <Link href="/dashboard/security">
            <Dropdown.ItemIcon as={RiLockLine} />
            Change Password
          </Link>
        </Dropdown.Item>
        <Dropdown.Item onClick={onToggleDarkMode}>
          <Dropdown.ItemIcon as={isDarkMode ? RiSunLine : RiMoonLine} />
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Dropdown.Item>
      </Dropdown.Group>

      <Dropdown.Separator />

      {/* Sign Out */}
      <Dropdown.Item onClick={onSignOut} className="text-error-base">
        <Dropdown.ItemIcon as={RiLogoutBoxLine} />
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
          <Tooltip.Content side="right">
            {user.name || user.email}
          </Tooltip.Content>
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

