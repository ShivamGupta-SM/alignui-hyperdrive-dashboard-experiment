import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// ============================================
// UI Store - For transient UI state
// ============================================
interface UIState {
    // Sidebar
    sidebarOpen: boolean
    sidebarCollapsed: boolean
    setSidebarOpen: (open: boolean) => void
    setSidebarCollapsed: (collapsed: boolean) => void
    toggleSidebar: () => void

    // Modals/Dialogs
    commandMenuOpen: boolean
    setCommandMenuOpen: (open: boolean) => void

    // Mobile
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

    // Mobile
    mobileNavOpen: false,
    setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))

// ============================================
// Preferences Store - Persisted to localStorage
// ============================================
interface PreferencesState {
    // Display
    density: "compact" | "comfortable" | "spacious"
    setDensity: (density: "compact" | "comfortable" | "spacious") => void

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

    // Recent items
    recentSearches: string[]
    addRecentSearch: (search: string) => void
    clearRecentSearches: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            // Display
            density: "comfortable",
            setDensity: (density) => set({ density }),

            // Notifications
            emailNotifications: true,
            pushNotifications: true,
            setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
            setPushNotifications: (enabled) => set({ pushNotifications: enabled }),

            // Locale
            locale: "en",
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
            name: "preferences-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// ============================================
// Cart Store (Example for e-commerce apps)
// ============================================
interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
}

interface CartState {
    items: CartItem[]
    addItem: (item: Omit<CartItem, "quantity">) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    total: () => number
    itemCount: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id)
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        }
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] }
                }),

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),

            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((i) => i.id !== id)
                            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
                })),

            clearCart: () => set({ items: [] }),

            total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

            itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
)
