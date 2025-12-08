'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { NotificationsDrawer } from '@/components/dashboard/notifications-drawer'
import { CommandMenu } from '@/components/dashboard/command-menu'
import { SettingsPanel } from '@/components/dashboard/settings-panel'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useSignOut } from '@/hooks/use-sign-out'
import { useTheme } from 'next-themes'
import { cn } from '@/utils/cn'
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
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed, , isHydrated] = useLocalStorage('sidebar-collapsed', false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [commandMenuOpen, setCommandMenuOpen] = React.useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = React.useState(false)
  const [currentOrganization, setCurrentOrganization] = React.useState(mockOrganizations[0])
  
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
      <div className="h-screen p-0 lg:p-2 xl:p-3">
        <div className="flex h-full">
          {/* Placeholder sidebar - hidden on mobile */}
          <div className="hidden lg:block w-[280px] shrink-0" />
          {/* Main Content Card */}
          <div className="flex flex-1 flex-col overflow-hidden bg-bg-white-0 lg:rounded-2xl lg:shadow-custom-md">
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
    <div className="h-screen p-0 lg:p-2 xl:p-3">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Flex container for sidebar and content */}
      <div className="flex h-full">
        {/* Sidebar - Desktop: visible in flow, Mobile: fixed overlay */}
        <div
          className={cn(
            // Mobile: fixed overlay
            'fixed inset-y-0 left-0 z-50',
            // Desktop: relative, in flow
            'lg:relative lg:z-auto lg:shrink-0',
            'transform transition-transform duration-300 ease-in-out lg:transform-none',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
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

        {/* Main Content Card - Floating sheet on desktop */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-bg-white-0 lg:rounded-2xl lg:shadow-custom-md">
        {/* Header */}
        <Header
          unreadNotifications={3}
          onNotificationsClick={() => setNotificationsOpen(true)}
          onCommandMenuClick={() => setCommandMenuOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapsedChange={setSidebarCollapsed}
          onMobileMenuClick={handleMobileSidebarToggle}
          isMobileSidebarOpen={mobileSidebarOpen}
          onSettingsClick={() => setSettingsPanelOpen(true)}
          user={mockUser}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
        </div>
      </div>

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

