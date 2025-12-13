'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar state (persisted)
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Mobile menu state
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void

  // Drawers/Panels (global UI state)
  notificationsDrawerOpen: boolean
  setNotificationsDrawerOpen: (open: boolean) => void
  toggleNotificationsDrawer: () => void

  commandMenuOpen: boolean
  setCommandMenuOpen: (open: boolean) => void
  toggleCommandMenu: () => void

  settingsPanelOpen: boolean
  setSettingsPanelOpen: (open: boolean) => void
  toggleSettingsPanel: () => void

  // Modals/Dialogs
  modals: Record<string, boolean>
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void

  // Notifications (client-side toast notifications)
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    timestamp: number
  }>
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Loading states
  loadingStates: Record<string, boolean>
  setLoading: (key: string, loading: boolean) => void
  clearLoading: () => void

  // View preferences (persisted)
  viewPreferences: {
    campaignsView: 'grid' | 'list'
    enrollmentsView: 'grid' | 'list'
    tablePageSize: number
    showAdvancedFilters: boolean
  }
  setViewPreference: <K extends keyof UIState['viewPreferences']>(
    key: K,
    value: UIState['viewPreferences'][K]
  ) => void
}

/**
 * UI store using Zustand with persistence
 * Manages UI state globally (modals, sidebars, notifications, view preferences, etc.)
 * 
 * Benefits of Zustand here:
 * - Global UI state accessible anywhere
 * - Persisted preferences (sidebar, view settings)
 * - No prop drilling
 * - Better performance with selective subscriptions
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar (persisted)
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) =>
        set({ mobileMenuOpen: open }),
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      // Drawers/Panels
      notificationsDrawerOpen: false,
      setNotificationsDrawerOpen: (open) =>
        set({ notificationsDrawerOpen: open }),
      toggleNotificationsDrawer: () =>
        set((state) => ({ notificationsDrawerOpen: !state.notificationsDrawerOpen })),

      commandMenuOpen: false,
      setCommandMenuOpen: (open) =>
        set({ commandMenuOpen: open }),
      toggleCommandMenu: () =>
        set((state) => ({ commandMenuOpen: !state.commandMenuOpen })),

      settingsPanelOpen: false,
      setSettingsPanelOpen: (open) =>
        set({ settingsPanelOpen: open }),
      toggleSettingsPanel: () =>
        set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen })),

      // Modals
      modals: {},
      openModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),
      closeModal: (modalId) =>
        set((state) => {
          const newModals = { ...state.modals }
          delete newModals[modalId]
          return { modals: newModals }
        }),
      closeAllModals: () =>
        set({ modals: {} }),

      // Notifications (client-side toast notifications)
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () =>
        set({ notifications: [] }),

      // Loading states
      loadingStates: {},
      setLoading: (key, loading) =>
        set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading },
        })),
      clearLoading: () =>
        set({ loadingStates: {} }),

      // View preferences (persisted)
      viewPreferences: {
        campaignsView: 'grid',
        enrollmentsView: 'grid',
        tablePageSize: 50,
        showAdvancedFilters: false,
      },
      setViewPreference: (key, value) =>
        set((state) => ({
          viewPreferences: {
            ...state.viewPreferences,
            [key]: value,
          },
        })),
    }),
    {
      name: 'ui-storage',
      // Only persist sidebar and view preferences
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        viewPreferences: state.viewPreferences,
      }),
    }
  )
)
