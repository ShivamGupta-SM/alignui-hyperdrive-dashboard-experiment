'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { NotificationsDrawer } from '@/components/dashboard/notifications-drawer'
import { CommandMenu } from '@/components/dashboard/command-menu'
import { SettingsPanel } from '@/components/dashboard/settings-panel'
import { BreadcrumbProvider, useBreadcrumbItems } from '@/contexts/breadcrumb-context'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useSignOut } from '@/hooks/use-sign-out'
import { useTheme } from 'next-themes'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import type { Organization } from '@/lib/types'

// Mock data - replace with actual data fetching
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockOrganizations = [
  {
    id: '1',
    name: 'Nike India',
    slug: '@nike-india',
    status: 'approved' as const,
    campaignCount: 8,
    logo: 'https://logo.clearbit.com/nike.com',
    gstVerified: true,
    panVerified: true,
    creditLimit: 500000,
    billRate: 18,
    platformFee: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Samsung Electronics',
    slug: '@samsung-india',
    status: 'approved' as const,
    campaignCount: 3,
    logo: 'https://logo.clearbit.com/samsung.com',
    gstVerified: true,
    panVerified: true,
    creditLimit: 300000,
    billRate: 18,
    platformFee: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BreadcrumbProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </BreadcrumbProvider>
  )
}

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [sidebarCollapsed, setSidebarCollapsed, , isHydrated] = useLocalStorage('sidebar-collapsed', false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [commandMenuOpen, setCommandMenuOpen] = React.useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = React.useState(false)
  const [currentOrganization, setCurrentOrganization] = React.useState(mockOrganizations[0])
  
  // Get breadcrumbs from context (set by pages), or auto-generate from pathname
  const contextBreadcrumbs = useBreadcrumbItems()
  
  // Auto-generate breadcrumbs from pathname when not set by page
  const autoBreadcrumbs = React.useMemo(() => {
    if (contextBreadcrumbs.length > 0) return contextBreadcrumbs
    
    // Generate from pathname
    const segments = pathname.split('/').filter(Boolean)
    const items: { label: string; href?: string }[] = []
    
    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      
      // Skip 'dashboard' prefix in display but keep in path
      if (segment === 'dashboard' && i === 0) {
        items.push({ label: 'Dashboard', href: '/dashboard' })
        continue
      }
      
      // Format segment name (capitalize, replace hyphens with spaces)
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Dynamic route segments (e.g., [id]) - just show as "Details" or skip
      if (segment.startsWith('[') || /^\d+$/.test(segment)) {
        items.push({ label: 'Details' })
      } else {
        const isLast = i === segments.length - 1
        items.push({ 
          label, 
          href: isLast ? undefined : currentPath 
        })
      }
    }
    
    return items
  }, [pathname, contextBreadcrumbs])
  
  // Prevent hydration mismatch by using consistent initial state
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // Close mobile sidebar on route change or resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Command menu keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandMenuOpen(true)
      }
      // Close mobile sidebar on Escape
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileSidebarOpen])

  // Sign out - single source of truth
  const { signOut: handleSignOut } = useSignOut('/sign-in')

  const handleOrganizationChange = (org: Organization) => {
    setCurrentOrganization(org as typeof mockOrganizations[0])
    setMobileSidebarOpen(false)
    router.refresh()
  }

  const handleCreateOrganization = () => {
    setMobileSidebarOpen(false)
    router.push('/onboarding')
  }

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-dvh p-0 lg:p-3 bg-linear-to-br from-bg-weak-50 via-bg-weak-50 to-bg-soft-200 pb-safe">
        <div className="flex h-full">
          {/* Placeholder sidebar - transparent on gray shell */}
          <div className="hidden lg:block w-[280px] shrink-0" />
          {/* Main Content Card */}
          <div className="flex flex-1 flex-col overflow-hidden bg-bg-white-0 lg:rounded-2xl lg:border lg:border-stroke-soft-200 lg:shadow-md lg:ring-1 lg:ring-black/3 dark:lg:ring-white/3">
            {/* Placeholder header */}
            <div className="h-16 border-b border-stroke-soft-200" />
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }



  return (
      <div className="h-dvh lg:p-3 bg-linear-to-br from-bg-weak-50 via-bg-weak-50 to-bg-soft-200 transition-colors duration-200 pb-safe">
      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Traditional Inset Sidebar */}
      {/* ============================================ */}
      <div className="hidden lg:flex h-full">
        {/* Sidebar - Desktop: visible in flow */}
        <div className="shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            pendingEnrollments={45}
            organizations={mockOrganizations}
            currentOrganization={currentOrganization}
            onOrganizationChange={handleOrganizationChange}
            onCreateOrganization={handleCreateOrganization}
            user={mockUser}
            isDarkMode={resolvedTheme === 'dark'}
            onToggleDarkMode={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Main Area - Desktop */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Breadcrumbs - On gray shell, above content card (Desktop only) */}
          {autoBreadcrumbs.length > 0 && (
            <nav 
              className="flex items-center gap-1 px-3 sm:px-4 lg:px-6 pt-1 pb-2" 
              aria-label="Breadcrumb"
            >
              {autoBreadcrumbs.map((item, index) => {
                const isLast = index === autoBreadcrumbs.length - 1
                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span className="text-[11px] mx-0.5 text-text-soft-400/60">/</span>
                    )}
                    {item.href && !isLast ? (
                      <a 
                        href={item.href}
                        className="text-[13px] text-text-sub-600 hover:text-primary-base transition-colors duration-150"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={cn(
                        "text-[13px]",
                        isLast 
                          ? "text-text-strong-950 font-medium"
                          : "text-text-sub-600"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                )
              })}
            </nav>
          )}

          {/* Content Card */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-bg-white-0 border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3 transition-all duration-200">
            <Header
              unreadNotifications={3}
              onNotificationsClick={() => setNotificationsOpen(true)}
              onCommandMenuClick={() => setCommandMenuOpen(true)}
              sidebarCollapsed={sidebarCollapsed}
              onSidebarCollapsedChange={setSidebarCollapsed}
              onSettingsClick={() => setSettingsPanelOpen(true)}
              user={mockUser}
            />
            <main className="flex-1 overflow-y-auto overscroll-contain -webkit-overflow-scrolling-touch">
              <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
        <div className="shrink-0 px-2 pt-2">
          <Header
            unreadNotifications={3}
            onNotificationsClick={() => setNotificationsOpen(true)}
            onCommandMenuClick={() => setCommandMenuOpen(true)}
            onMobileMenuClick={handleMobileSidebarToggle}
            isMobileSidebarOpen={mobileSidebarOpen}
            onSettingsClick={() => setSettingsPanelOpen(true)}
            user={mockUser}
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
              pendingEnrollments={45}
              organizations={mockOrganizations}
              currentOrganization={currentOrganization}
              onOrganizationChange={handleOrganizationChange}
              onCreateOrganization={handleCreateOrganization}
              user={mockUser}
              isDarkMode={theme === 'dark'}
              onToggleDarkMode={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              onSignOut={handleSignOut}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />
          </div>

          {/* Content Sheet - Inset floating card, slides down to reveal sidebar */}
          <div
            className={cn(
              "relative z-10 flex flex-col h-full",
              "bg-bg-white-0 rounded-2xl border border-stroke-soft-200 shadow-md ring-1 ring-black/3 dark:ring-white/3",
              "transition-all duration-300 ease-out",
              // When sidebar is open, slide content down (70% to show more peek)
              mobileSidebarOpen 
                ? "translate-y-[70%] scale-[0.96] shadow-2xl" 
                : "translate-y-0 scale-100"
            )}
          >
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overscroll-contain rounded-2xl" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div
                className="container mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8"
                style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
              >
                {children}
              </div>
            </main>
          </div>

          {/* Tap outside to close - when sidebar is open */}
          {mobileSidebarOpen && (
            <div
              className="absolute inset-x-2 bottom-2 z-20 h-[30%]"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* SHARED OVERLAYS */}
      {/* ============================================ */}
      
      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

      {/* Command Menu */}
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
      />

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsPanelOpen}
        onOpenChange={setSettingsPanelOpen}
        user={mockUser}
        organization={currentOrganization}
        isDarkMode={theme === 'dark'}
        onToggleDarkMode={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onSignOut={handleSignOut}
      />
    </div>
  )
}

