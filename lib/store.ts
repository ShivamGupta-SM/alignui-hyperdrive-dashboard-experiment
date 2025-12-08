import { create } from "zustand"
import { persist } from "zustand/middleware"

// Example app store - customize based on your needs
interface AppState {
    // Sidebar state
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    toggleSidebar: () => void

    // Theme preferences beyond light/dark
    accentColor: string
    setAccentColor: (color: string) => void

    // Any global UI state
    commandMenuOpen: boolean
    setCommandMenuOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Sidebar
            sidebarCollapsed: false,
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            // Accent color
            accentColor: "blue",
            setAccentColor: (color) => set({ accentColor: color }),

            // Command menu
            commandMenuOpen: false,
            setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
        }),
        {
            name: "app-storage",
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                accentColor: state.accentColor,
            }),
        }
    )
)
