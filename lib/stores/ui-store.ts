"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
	// Sidebar state (persisted)
	sidebarCollapsed: boolean
	setSidebarCollapsed: (collapsed: boolean) => void
	toggleSidebar: () => void

	// Drawers/Panels (global UI state - these are truly global)
	notificationsDrawerOpen: boolean
	setNotificationsDrawerOpen: (open: boolean) => void
	toggleNotificationsDrawer: () => void

	commandMenuOpen: boolean
	setCommandMenuOpen: (open: boolean) => void
	toggleCommandMenu: () => void

	settingsPanelOpen: boolean
	setSettingsPanelOpen: (open: boolean) => void
	toggleSettingsPanel: () => void

	// View preferences (persisted)
	viewPreferences: {
		campaignsView: "grid" | "list"
		enrollmentsView: "grid" | "list"
		tablePageSize: number
		showAdvancedFilters: boolean
	}
	setViewPreference: <K extends keyof UIState["viewPreferences"]>(
		key: K,
		value: UIState["viewPreferences"][K]
	) => void
}

/**
 * UI store using Zustand with persistence
 * Simplified: Only manages truly global, persisted UI state
 * 
 * Removed:
 * - Modals (use local component state)
 * - Notifications (use Sonner for toasts)
 * - Loading states (use React Query or local state)
 * - Mobile menu (use local component state)
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
			setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
			toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

			// Drawers/Panels (global UI state)
			notificationsDrawerOpen: false,
			setNotificationsDrawerOpen: (open) => set({ notificationsDrawerOpen: open }),
			toggleNotificationsDrawer: () =>
				set((state) => ({ notificationsDrawerOpen: !state.notificationsDrawerOpen })),

			commandMenuOpen: false,
			setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
			toggleCommandMenu: () => set((state) => ({ commandMenuOpen: !state.commandMenuOpen })),

			settingsPanelOpen: false,
			setSettingsPanelOpen: (open) => set({ settingsPanelOpen: open }),
			toggleSettingsPanel: () => set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen })),

			// View preferences (persisted)
			viewPreferences: {
				campaignsView: "grid",
				enrollmentsView: "grid",
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
			name: "ui-storage",
			// Only persist sidebar and view preferences
			partialize: (state) => ({
				sidebarCollapsed: state.sidebarCollapsed,
				viewPreferences: state.viewPreferences,
			}),
		}
	)
)
