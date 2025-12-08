'use client'

import * as React from 'react'
import * as Avatar from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import {
  RiNotification3Line,
  RiSearchLine,
  RiCommandLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMenuLine,
  RiCloseLine,
} from '@remixicon/react'

interface HeaderProps {
  unreadNotifications?: number
  onNotificationsClick?: () => void
  onCommandMenuClick?: () => void
  sidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  onMobileMenuClick?: () => void
  isMobileSidebarOpen?: boolean
  onSettingsClick?: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
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
  user,
}: HeaderProps) {
  return (
    <header className="relative flex h-14 sm:h-16 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 sm:px-6">
      {/* Left: Mobile Menu Toggle + Desktop Collapse Toggle + Search */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Toggle - Only visible on mobile */}
        {onMobileMenuClick && (
          <button
            onClick={onMobileMenuClick}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha-30"
            aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileSidebarOpen ? (
              <RiCloseLine className="size-5" />
            ) : (
              <RiMenuLine className="size-5" />
            )}
          </button>
        )}

        {/* Desktop Sidebar Collapse Toggle - Hidden on mobile */}
        {onSidebarCollapsedChange && (
          <button
            onClick={() => onSidebarCollapsedChange(!sidebarCollapsed)}
            className="hidden lg:flex h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha-30"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <RiMenuUnfoldLine className="size-5" />
            ) : (
              <RiMenuFoldLine className="size-5" />
            )}
          </button>
        )}

        {/* Search / Command Menu - Full on desktop, icon only on mobile */}
        <button
          onClick={onCommandMenuClick}
          className="flex h-10 items-center gap-2 rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha-30 w-10 sm:w-auto sm:min-w-[180px] md:min-w-[220px]"
        >
          <RiSearchLine className="size-4 shrink-0" />
          <span className="hidden sm:inline text-paragraph-sm">Search...</span>
          <kbd className="hidden sm:flex ml-auto items-center gap-0.5 rounded bg-bg-weak-50 px-1.5 py-0.5 text-[11px] font-medium text-text-soft-400">
            <RiCommandLine className="size-3" />K
          </kbd>
        </button>
      </div>

      {/* Center: Logo - Only visible on mobile */}
      <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
        <Logo width={100} height={24} />
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNotificationsClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-10 border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha-30"
          aria-label="Notifications"
        >
          <RiNotification3Line className="size-5" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-error-base text-[10px] font-medium text-white">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile Avatar - Opens Settings Panel */}
        {user && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-primary-alpha-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha-30"
            aria-label="Open settings"
          >
            <Avatar.Root size="32" color="blue">
              {user.avatar ? (
                <Avatar.Image src={user.avatar} alt={user.name} />
              ) : (
                <span className="text-label-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </Avatar.Root>
          </button>
        )}
      </div>
    </header>
  )
}

