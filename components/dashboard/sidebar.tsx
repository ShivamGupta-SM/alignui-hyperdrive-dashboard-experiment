'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import { AvatarWithFallback } from '@/components/ui/avatar'
import * as Badge from '@/components/ui/badge'
import * as Tooltip from '@/components/ui/tooltip'
import * as Dropdown from '@/components/ui/dropdown'
import { Logo, LogoIcon } from '@/components/ui/logo'
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
} from '@phosphor-icons/react/dist/ssr'
import type { Organization, User as UserType } from '@/lib/types'
import { ORGANIZATION_STATUS_CONFIG } from '@/lib/constants'

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  pendingEnrollments?: number
  organizations?: Organization[]
  currentOrganization?: Organization | null
  onOrganizationChange?: (org: Organization) => void
  onCreateOrganization?: () => void
  user?: UserType | null
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
    icon: House,
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Megaphone,
  },
  {
    id: 'enrollments',
    label: 'Enrollments',
    href: '/dashboard/enrollments',
    icon: UserPlus,
    hasBadge: true,
  },
  {
    id: 'products',
    label: 'Products',
    href: '/dashboard/products',
    icon: ShoppingBag,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    id: 'team',
    label: 'Team',
    href: '/dashboard/team',
    icon: UsersThree,
  },
]

const footerNavigation = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Gear,
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/dashboard/help',
    icon: Question,
  },
]

export function Sidebar({
  collapsed = false,
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
          'group relative flex items-center rounded-xl',
          'text-label-sm transition-all duration-200 ease-out',
          // Premium active state with dark mode
          // Premium active state with dark mode
          active
            ? (isDarkMode 
                ? 'bg-primary-base text-white font-medium shadow-sm ring-1 ring-primary-base' 
                : 'bg-bg-white-0 text-text-strong-950 font-medium shadow-sm ring-1 ring-stroke-soft-200')
            : (isDarkMode
                ? 'text-white hover:bg-primary-base/80 hover:text-white hover:ring-primary-base/50 hover:shadow-sm hover:ring-1'
                : 'text-text-strong-950 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-sm hover:ring-1 hover:ring-stroke-soft-200/50'),
          // Collapsed: fixed size centered, Expanded: normal padding
          collapsed ? 'justify-center size-11' : 'gap-3 px-3 py-2.5'
        )}
      >
        <Icon 
          weight="duotone"
          className={cn(
            'size-5 shrink-0 transition duration-200 ease-out',
            active ? 'text-primary-base' : 'text-text-sub-600 group-hover:text-text-strong-950'
          )} 
        />
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            <div className="flex items-center gap-1.5">
              {showBadge && (
                <Badge.Root color="red" variant="lighter" size="small">
                  {pendingEnrollments > 99 ? '99+' : pendingEnrollments}
                </Badge.Root>
              )}
              {active && (
                <CaretRight weight="bold" className="size-5 text-text-sub-600" />
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
        // Both mobile and desktop: Transparent sidebar on gray shell
        // Individual elements (nav items, org switcher) have their own backgrounds
        'w-full lg:w-auto',
        'bg-transparent',
        'transition-all duration-300',
        collapsed ? 'lg:w-[72px]' : 'lg:w-[280px]'
      )}
    >
      {/* Logo Section - Only visible on desktop (mobile has logo in header) */}
      <div className={cn(
        "hidden lg:flex h-14 sm:h-16 items-center",
        collapsed ? "justify-center px-2" : "px-5"
      )}>
        <Link href="/dashboard" onClick={onMobileClose} className="flex items-center">
          {collapsed ? (
            <LogoIcon size={32} />
          ) : (
            <Logo width={130} height={28} />
          )}
        </Link>
      </div>

      {/* Engraved Divider - Only visible on desktop */}
      <div className="hidden lg:block mx-3 h-px bg-stroke-soft-200/60" />


      {/* Organization Switcher */}
      <div className="px-3 py-3">
        <OrganizationSwitcher
          organizations={organizations}
          currentOrganization={currentOrganization}
          onOrganizationChange={onOrganizationChange}
          onCreateOrganization={onCreateOrganization}
          collapsed={collapsed}
          isDarkMode={isDarkMode}
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
              <NavItem item={item} />
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
  user: UserType
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
        'mt-3 flex items-center rounded-xl transition-all duration-200',
        'hover:bg-bg-weak-50 hover:shadow-sm',
        'border border-transparent hover:border-stroke-soft-200/60',
        collapsed ? 'justify-center size-11' : 'w-full gap-3 p-2'
      )}
    >
      <AvatarWithFallback
        src={user.avatar}
        name={user.name || user.email}
        size={collapsed ? '32' : '40'}
        color="blue"
      />
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-label-sm truncate text-text-strong-950">
              {user.name || 'User'}
            </div>
            <div className="text-paragraph-xs truncate text-text-sub-600">
              {user.email}
            </div>
          </div>
          <DotsThree weight="bold" className="size-5 text-text-sub-600 shrink-0" />
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
            <Dropdown.ItemIcon as={User} />
            My Profile
          </Link>
        </Dropdown.Item>
        <Dropdown.Item asChild>
          <Link href="/dashboard/security">
            <Dropdown.ItemIcon as={Lock} />
            Change Password
          </Link>
        </Dropdown.Item>
        <Dropdown.Item onClick={onToggleDarkMode}>
          <Dropdown.ItemIcon as={isDarkMode ? Sun : Moon} />
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
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


// Organization Switcher Component - Based on AccountSwitcher patterns
interface OrganizationSwitcherProps {
  organizations: Organization[]
  currentOrganization?: Organization | null
  onOrganizationChange?: (org: Organization) => void
  onCreateOrganization?: () => void
  collapsed?: boolean
  isDarkMode?: boolean
}

function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  onCreateOrganization,
  collapsed = false,
  isDarkMode,
}: OrganizationSwitcherProps) {
  if (!currentOrganization) {
    return (
      <button
        onClick={onCreateOrganization}
        className={cn(
          'flex items-center gap-3 rounded-xl border border-dashed border-stroke-soft-200',
          'bg-bg-white-0/80 transition-all duration-200',
          'hover:bg-bg-white-0 hover:border-stroke-sub-300 hover:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
          collapsed ? 'justify-center size-11' : 'w-full p-2.5'
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
        'flex items-center rounded-xl',
        'border border-stroke-soft-200 bg-bg-white-0',
        'cursor-pointer transition-all duration-200',
        'hover:bg-bg-weak-50 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base',
        collapsed ? 'justify-center size-11' : 'w-full gap-3 p-2.5 pr-3'
      )}
    >
      {collapsed ? (
        <span className="text-label-sm font-semibold text-text-strong-950">
          {currentOrganization.name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <>
          <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            "bg-bg-soft-200"
          )}>
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
      side={collapsed ? 'right' : 'bottom'}
      sideOffset={8}
      className="w-72"
    >
      {/* Switch Organization Section */}
      <Dropdown.Group>
        <Dropdown.Label>Switch organization</Dropdown.Label>
        <div className="flex flex-col gap-0.5 px-1.5">
          {organizations.map((org) => {
            const statusConfig = ORGANIZATION_STATUS_CONFIG[org.status]
            const isSelected = org.id === currentOrganization?.id

            return (
              <button
                key={org.id}
                type="button"
                onClick={() => onOrganizationChange?.(org)}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-md px-2 py-2',
                  'cursor-pointer transition-colors duration-150 outline-none',
                  'hover:bg-bg-weak-50 focus:bg-bg-weak-50',
                  isSelected && 'bg-bg-weak-50'
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
                    <span className="truncate">
                      {org.slug}
                    </span>
                    {org.status === 'approved' && org.campaignCount !== undefined && (
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
            'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2',
            'text-label-sm font-semibold text-text-sub-600',
            'border border-stroke-soft-200',
            'cursor-pointer transition-colors duration-150',
            'hover:bg-bg-weak-50 hover:text-text-strong-950'
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
          <Tooltip.Content side="right">
            {currentOrganization.name}
          </Tooltip.Content>
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
