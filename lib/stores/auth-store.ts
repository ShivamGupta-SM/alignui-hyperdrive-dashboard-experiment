'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { auth } from '@/lib/encore-client'

interface AuthState {
  // Session data
  user: auth.MeResponse | null
  session: auth.SessionResponse | null
  token: string | null
  
  // Loading states
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: auth.MeResponse | null) => void
  setSession: (session: auth.SessionResponse | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

/**
 * Auth store using Zustand
 * Manages authentication state globally
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) =>
        set({
          session,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      clearAuth: () =>
        set({
          user: null,
          session: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        // Don't persist user/session - fetch fresh on mount
      }),
    }
  )
)
