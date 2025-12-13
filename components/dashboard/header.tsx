'use client'

import * as React from 'react'
import * as Avatar from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import { NotificationCenter, FallbackNotificationBell } from '@/components/dashboard/notification-center'
import { cn } from '@/utils/cn'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  MagnifyingGlass,
  Command,
  SidebarSimple,
  X,
  SquaresFour,
} from '@phosphor-icons/react'

import { useSession } from '@/hooks/use-session'

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
  
  const isDark = mounted && resolvedTheme === 'dark'

  // Common button styles with semantic tokens
  const iconButtonStyles = cn(
    "flex items-center justify-center rounded-full shadow-sm ring-1 transition-all duration-200 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2",
    "bg-bg-white-0 text-text-sub-600 ring-stroke-soft-200 hover:text-text-strong-950"
  )
  
  return (
    <header className="relative flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 transition-colors duration-200 lg:border-b lg:border-stroke-soft-200">
      {/* Left: Mobile Menu Toggle + Desktop Collapse Toggle + Search */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Menu Toggle - Only visible on mobile */}
        {onMobileMenuClick && (
          <button
            type="button"
            onClick={onMobileMenuClick}
            className={cn(
              iconButtonStyles,
              "lg:hidden size-11 sm:size-10 shrink-0 relative"
            )}
            aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
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
          </button>
        )}

        {/* Desktop Sidebar Collapse Toggle - Hidden on mobile */}
        {onSidebarCollapsedChange && (
          <button
            type="button"
            onClick={() => onSidebarCollapsedChange(!sidebarCollapsed)}
            className={cn(
              iconButtonStyles,
              "hidden lg:flex size-10 shrink-0"
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <SidebarSimple 
              className={cn(
                "size-5 transition-transform duration-200",
                sidebarCollapsed && "rotate-180"
              )} 
              weight="duotone" 
            />
          </button>
        )}

        {/* Search / Command Menu - Hidden on mobile when sidebar is open */}
        <button
          type="button"
          onClick={onCommandMenuClick}
          className={cn(
            iconButtonStyles,
            "size-11 sm:size-10 sm:w-auto sm:min-w-[180px] md:min-w-[220px] sm:px-3 shrink-0",
            isMobileSidebarOpen && "hidden lg:flex" // Hide on mobile when sidebar open
          )}
        >
          <MagnifyingGlass className="size-4 shrink-0" weight="duotone" />
          <span className="hidden sm:inline text-paragraph-sm ml-2">Search...</span>
          <kbd className="hidden sm:flex ml-auto items-center gap-0.5 rounded bg-bg-weak-50 px-1.5 py-0.5 text-label-xs font-medium text-text-soft-400">
            <Command className="size-3" />K
          </kbd>
        </button>
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
          <FallbackNotificationBell
            count={unreadNotifications}
            onClick={onNotificationsClick}
          />
        )}

        {/* Profile Avatar - Opens Settings Panel */}
        {user && onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className={cn(
              iconButtonStyles,
              "size-11 sm:size-10 p-[3px]"
            )}
            aria-label="Open settings"
          >
            <Avatar.Root size="32" color="blue" className="size-full rounded-full overflow-hidden">
              {user.avatar ? (
                <Avatar.Image src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                <span className="text-label-xs sm:text-label-sm font-semibold">
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

