"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"
import { UI_DEFAULTS, type ViewMode } from "@/lib/constants"

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
		campaignsView: ViewMode
		enrollmentsView: ViewMode
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

			// View preferences (persisted) - uses centralized UI_DEFAULTS
			viewPreferences: {
				campaignsView: UI_DEFAULTS.VIEW_MODE,
				enrollmentsView: UI_DEFAULTS.VIEW_MODE,
				tablePageSize: UI_DEFAULTS.TABLE_PAGE_SIZE,
				showAdvancedFilters: UI_DEFAULTS.SHOW_ADVANCED_FILTERS,
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

// ============================================
// Optimized Selectors - Prevent unnecessary re-renders
// ============================================

/**
 * Selector for sidebar state only
 * Components using this won't re-render when other UI state changes
 */
export const useSidebar = () =>
	useUIStore(
		useShallow((state) => ({
			collapsed: state.sidebarCollapsed,
			setCollapsed: state.setSidebarCollapsed,
			toggle: state.toggleSidebar,
		}))
	)

/**
 * Selector for notifications drawer state only
 */
export const useNotificationsDrawer = () =>
	useUIStore(
		useShallow((state) => ({
			open: state.notificationsDrawerOpen,
			setOpen: state.setNotificationsDrawerOpen,
			toggle: state.toggleNotificationsDrawer,
		}))
	)

/**
 * Selector for command menu state only
 */
export const useCommandMenu = () =>
	useUIStore(
		useShallow((state) => ({
			open: state.commandMenuOpen,
			setOpen: state.setCommandMenuOpen,
			toggle: state.toggleCommandMenu,
		}))
	)

/**
 * Selector for settings panel state only
 */
export const useSettingsPanel = () =>
	useUIStore(
		useShallow((state) => ({
			open: state.settingsPanelOpen,
			setOpen: state.setSettingsPanelOpen,
			toggle: state.toggleSettingsPanel,
		}))
	)

/**
 * Selector for view preferences only
 */
export const useViewPreferences = () =>
	useUIStore(
		useShallow((state) => ({
			preferences: state.viewPreferences,
			setPreference: state.setViewPreference,
		}))
	)

/**
 * Selector for a specific view preference
 */
export const useCampaignsView = () =>
	useUIStore((state) => state.viewPreferences.campaignsView)

export const useEnrollmentsView = () =>
	useUIStore((state) => state.viewPreferences.enrollmentsView)

export const useTablePageSize = () =>
	useUIStore((state) => state.viewPreferences.tablePageSize)
