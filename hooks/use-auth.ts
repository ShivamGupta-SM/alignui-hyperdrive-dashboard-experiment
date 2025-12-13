'use client'

import { useAuthStore } from '@/lib/stores/auth-store'

/**
 * Hook to access auth store directly
 * Use this when you need auth state without React Query
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  return {
    user,
    session,
    token,
    isAuthenticated,
    isLoading,
  }
}
