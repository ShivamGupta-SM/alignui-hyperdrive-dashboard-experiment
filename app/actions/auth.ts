'use server'

import { getEncoreClient } from '@/lib/encore'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { auth } from '@/lib/encore-client'

/**
 * Sign in with email and password
 */
export async function signInEmail(email: string, password: string, rememberMe?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.signInEmail({ email, password, rememberMe })
    
    // Handle 2FA redirect if needed
    if (result.twoFactorRedirect) {
      return {
        success: true,
        requiresTwoFactor: true,
        twoFactorToken: result.twoFactorToken,
      }
    }

    // Handle redirect if needed
    if (result.redirect && result.url) {
      redirect(result.url)
    }

    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days if remember me, else 7 days
      })
    }

    // Revalidate session query to trigger refetch (like Better Auth does)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: true, 
      user: result.user,
      token: result.token,
      redirect: result.redirect,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Invalid email or password' 
    }
  }
}

/**
 * Sign up with email and password
 */
export async function signUpEmail(email: string, password: string, name?: string, rememberMe?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.signUpEmail({ 
      email, 
      password,
      name: name || email.split('@')[0],
      rememberMe,
    })
    
    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days if remember me, else 7 days
      })
    }

    // Revalidate session query to trigger refetch (like Better Auth does)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: true, 
      user: result.user,
      token: result.token,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to create account' 
    }
  }
}

/**
 * Sign in with social provider (OAuth)
 */
export async function signInSocial(provider: 'google' | 'github' | 'microsoft') {
  const client = getEncoreClient()

  try {
    const result = await client.auth.signInSocial({ provider })
    
    // If redirect URL is returned, redirect to OAuth provider
    if (result.redirect && result.url) {
      redirect(result.url)
    }

    // If token is returned, set cookie
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Revalidate session query to trigger refetch (like Better Auth does)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: true, 
      user: result.user,
      token: result.token,
      redirect: result.redirect,
      url: result.url,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to sign in with social provider' 
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const client = getEncoreClient()

  try {
    await client.auth.signOut()
    
    // Clear auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    // Revalidate to trigger session refetch (will return null)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error: any) {
    // Still clear cookie and revalidate even on error
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
    
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    }
  }
}

/**
 * Get current user session
 * Returns session with user object (Better Auth compatible format)
 */
export async function getSession(): Promise<{
  success: boolean
  session?: auth.SessionResponse & { user?: auth.UserResponse }
  user?: auth.UserResponse
  error?: string
}> {
  const client = getEncoreClient()

  try {
    const sessionResult = await client.auth.getSession()
    
    // If no session, return null
    if (!sessionResult.session || !sessionResult.user) {
      return { 
        success: true, 
        session: undefined,
        user: undefined,
      }
    }

    // Map userID to id for Better Auth compatibility
    const userWithId = {
      ...sessionResult.user,
      id: sessionResult.user.id, // UserResponse already has id
    }

    // Return session with user embedded (Better Auth format)
    return { 
      success: true, 
      session: {
        ...sessionResult.session,
        user: userWithId,
      },
      user: userWithId,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'No active session' 
    }
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{
  success: boolean
  user?: auth.MeResponse
  error?: string
}> {
  const client = getEncoreClient()

  try {
    const user = await client.auth.me()
    return { 
      success: true, 
      user,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get user info' 
    }
  }
}

/**
 * Forgot password - Request password reset email
 */
export async function forgotPassword(email: string, redirectTo?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.forgotPassword({ email, redirectTo })
    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to send password reset email' 
    }
  }
}

/**
 * Reset password callback - Verify token validity
 */
export async function resetPasswordCallback(token: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.resetPasswordCallback(token)
    return { 
      success: true,
      valid: result.valid,
      email: result.email,
    }
  } catch (error: any) {
    return { 
      success: false, 
      valid: false,
      error: error.message || 'Invalid or expired token' 
    }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.resetPassword({ token, newPassword })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to reset password' 
    }
  }
}

/**
 * Change password (authenticated)
 */
export async function changePassword(currentPassword: string, newPassword: string, revokeOtherSessions?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.changePassword({ 
      currentPassword, 
      newPassword,
      revokeOtherSessions,
    })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to change password' 
    }
  }
}

/**
 * Change email address
 */
export async function changeEmail(newEmail: string, callbackURL?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.changeEmail({ newEmail, callbackURL })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.status,
      message: result.message,
      user: result.user,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to change email' 
    }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; image?: string }) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.updateUser(data)
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/profile')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to update profile' 
    }
  }
}

/**
 * Delete user account
 */
export async function deleteUser(password?: string, callbackURL?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.deleteUser({ password, callbackURL })
    
    // Clear auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to delete account' 
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email?: string, callbackURL?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.sendVerificationEmail({ 
      email: email || '', 
      callbackURL 
    })
    
    return { 
      success: result.status,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to send verification email' 
    }
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string, callbackURL?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.verifyEmail({ token, callbackURL })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to verify email' 
    }
  }
}

/**
 * List all sessions
 */
export async function listSessions() {
  const client = getEncoreClient()

  try {
    const result = await client.auth.listSessions()
    return { 
      success: true,
      sessions: result.sessions || [],
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to list sessions' 
    }
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(token: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.revokeSession({ token })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.status,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to revoke session' 
    }
  }
}

/**
 * Revoke all other sessions (keep current)
 */
export async function revokeOtherSessions() {
  const client = getEncoreClient()

  try {
    const result = await client.auth.revokeOtherSessions()
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.status,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to revoke sessions' 
    }
  }
}

/**
 * List device sessions
 */
export async function listDeviceSessions() {
  const client = getEncoreClient()

  try {
    const result = await client.auth.listDeviceSessions()
    return { 
      success: true,
      sessions: result.sessions || [],
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to list device sessions' 
    }
  }
}

/**
 * Set active session
 */
export async function setActiveSession(sessionToken: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.setActiveSession({ sessionToken })
    
    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
      token: result.token,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to set active session' 
    }
  }
}

/**
 * Enable 2FA
 */
export async function enable2FA(password: string, issuer?: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorEnable({ password, issuer })
    return { 
      success: result.success,
      backupCodes: result.backupCodes,
      totpURI: result.totpURI,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to enable 2FA' 
    }
  }
}

/**
 * Disable 2FA
 */
export async function disable2FA(password: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorDisable({ password })
    
    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to disable 2FA' 
    }
  }
}

/**
 * Get TOTP URI for 2FA setup
 */
export async function get2FATotpURI(password: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorGetTotpUri({ password })
    return { 
      success: true,
      totpURI: result.totpURI,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to get TOTP URI' 
    }
  }
}

/**
 * Generate backup codes for 2FA
 */
export async function generate2FABackupCodes(password: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorGenerateBackupCodes({ password })
    return { 
      success: true,
      backupCodes: result.backupCodes,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to generate backup codes' 
    }
  }
}

/**
 * View backup codes (requires password)
 */
export async function view2FABackupCodes(password: string) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorViewBackupCodes({ password })
    return { 
      success: true,
      backupCodes: result.backupCodes,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to view backup codes' 
    }
  }
}

/**
 * Verify TOTP code during 2FA flow
 */
export async function verify2FATotp(twoFactorToken: string, code: string, trustDevice?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorVerifyTotp({ 
      twoFactorToken, 
      code, 
      trustDevice 
    })
    
    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
      token: result.token,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to verify TOTP code' 
    }
  }
}

/**
 * Verify OTP for 2FA
 */
export async function verify2FAOtp(twoFactorToken: string, otp: string, trustDevice?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorVerifyOtp({ 
      twoFactorToken, 
      otp, 
      trustDevice 
    })
    
    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
      token: result.token,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to verify OTP' 
    }
  }
}

/**
 * Verify backup code during 2FA flow
 */
export async function verify2FABackupCode(twoFactorToken: string, code: string, trustDevice?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorVerifyBackupCode({ 
      twoFactorToken, 
      code, 
      trustDevice 
    })
    
    // Set auth cookie if token is returned
    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Revalidate to trigger session refetch
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
      token: result.token,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to verify backup code' 
    }
  }
}

/**
 * Send OTP for 2FA verification
 */
export async function send2FAOtp(twoFactorToken: string, trustDevice?: boolean) {
  const client = getEncoreClient()

  try {
    const result = await client.auth.twoFactorSendOtp({ twoFactorToken, trustDevice })
    return { 
      success: result.success,
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to send OTP' 
    }
  }
}
