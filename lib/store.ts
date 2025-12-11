import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================
// UI Store - Transient UI state (not persisted)
// ============================================
interface UIState {
  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Command menu
  commandMenuOpen: boolean
  setCommandMenuOpen: (open: boolean) => void

  // Mobile navigation
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Command menu
  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),

  // Mobile navigation
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))

// ============================================
// Preferences Store - Persisted to localStorage
// ============================================
type Density = 'compact' | 'comfortable' | 'spacious'

interface PreferencesState {
  // Display
  density: Density
  accentColor: string
  setDensity: (density: Density) => void
  setAccentColor: (color: string) => void

  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  setEmailNotifications: (enabled: boolean) => void
  setPushNotifications: (enabled: boolean) => void

  // Locale
  locale: string
  timezone: string
  setLocale: (locale: string) => void
  setTimezone: (timezone: string) => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (search: string) => void
  clearRecentSearches: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Display
      density: 'comfortable',
      accentColor: 'blue',
      setDensity: (density) => set({ density }),
      setAccentColor: (color) => set({ accentColor: color }),

      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
      setPushNotifications: (enabled) => set({ pushNotifications: enabled }),

      // Locale
      locale: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setLocale: (locale) => set({ locale }),
      setTimezone: (timezone) => set({ timezone }),

      // Recent searches
      recentSearches: [],
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [search, ...state.recentSearches.filter((s) => s !== search)].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        density: state.density,
        accentColor: state.accentColor,
        emailNotifications: state.emailNotifications,
        pushNotifications: state.pushNotifications,
        locale: state.locale,
        timezone: state.timezone,
        recentSearches: state.recentSearches,
      }),
    }
  )
)

