'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { signOut as signOutAction } from '@/app/actions/auth'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Modern sign out hook - React Query as single source of truth
 * Clears all React Query cache instead of Zustand
 * 
 * @param redirectTo - Path to redirect after sign out (default: '/sign-in')
 * @returns { signOut, isSigningOut }
 * 
 * @example
 * const { signOut, isSigningOut } = useSignOut()
 * <Button onClick={signOut} disabled={isSigningOut}>
 *   {isSigningOut ? 'Signing out...' : 'Sign Out'}
 * </Button>
 */
export function useSignOut(redirectTo: string = '/sign-in') {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = useCallback(async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      await signOutAction()
      // Clear all React Query cache
      queryClient.clear()
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear cache even if server call fails
      queryClient.clear()
    } finally {
      // Always redirect, even if signOut fails
      router.push(redirectTo)
      router.refresh()
      setIsSigningOut(false)
    }
  }, [isSigningOut, redirectTo, router, queryClient])

  return { signOut, isSigningOut }
}
