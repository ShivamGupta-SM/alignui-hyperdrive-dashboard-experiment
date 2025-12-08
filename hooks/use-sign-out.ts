'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { authClient } from '@/lib/auth-client'

/**
 * Single source of truth for sign out functionality.
 * Use this hook anywhere you need to sign out the user.
 * 
 * @example
 * const { signOut, isSigningOut } = useSignOut()
 * 
 * <Button onClick={signOut} disabled={isSigningOut}>
 *   {isSigningOut ? 'Signing out...' : 'Sign Out'}
 * </Button>
 */
export function useSignOut(redirectTo: string = '/sign-in') {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = useCallback(async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      await authClient.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // Always redirect, even if signOut fails (clears local state)
      router.push(redirectTo)
      router.refresh()
    }
  }, [isSigningOut, redirectTo, router])

  return { signOut, isSigningOut }
}
