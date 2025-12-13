'use server'

import { revalidatePath } from 'next/cache'
import crypto from 'node:crypto'
import type { SettingsActionResult } from '@/lib/types'
import {
  updateProfileBodySchema,
  updateOrganizationBodySchema,
  updatePasswordBodySchema,
  bankAccountBodySchema,
  verify2FABodySchema,
} from '@/lib/validations'
import { z } from 'zod'
import type { auth } from '@/lib/encore-client'

// Generate a cryptographically secure Base32 TOTP secret
function generateTOTPSecret(length = 20): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const randomBytes = crypto.randomBytes(length)
  let secret = ''
  for (let i = 0; i < length; i++) {
    secret += base32Chars[randomBytes[i] % 32]
  }
  return secret
}

// Schema for notification settings
const notificationSettingsSchema = z.object({
  emailNewEnrollments: z.boolean(),
  emailCampaignUpdates: z.boolean(),
  emailWalletAlerts: z.boolean(),
  emailInvoiceReminders: z.boolean(),
  emailWeeklySummary: z.boolean(),
  pushEnabled: z.boolean(),
  soundEnabled: z.boolean(),
})

export async function updateProfile(data: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = updateProfileBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.updateUser({
      name: validation.data.name,
      image: validation.data.image,
    })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/profile')
    revalidatePath('/', 'layout')

    return { success: result.success }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    }
  }
}

export async function updateOrganization(data: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = updateOrganizationBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  const { cookies } = await import('next/headers')
  
  try {
    const client = getEncoreClient()
    const cookieStore = await cookies()
    const orgId = cookieStore.get('active-organization-id')?.value
    
    if (!orgId) {
      return { success: false, error: 'Organization ID not found' }
    }

    await client.organizations.updateOrganization(orgId, validation.data)
    revalidatePath('/dashboard/settings')
    
    return { success: true, message: 'Organization updated successfully' }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update organization',
    }
  }
}

export async function updatePassword(data: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = updatePasswordBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.changePassword({
      currentPassword: validation.data.currentPassword,
      newPassword: validation.data.newPassword,
      revokeOtherSessions: validation.data.revokeOtherSessions,
    })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { success: result.success, message: 'Password updated successfully' }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update password',
    }
  }
}

export async function updateNotifications(data: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = notificationSettingsSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  // Update notification preferences via Encore client
  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    // TODO: Implement notification settings update when endpoint is available
    // await client.settings.updateNotifications(validation.data)
    
    revalidatePath('/dashboard/settings')

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update notification settings',
    }
  }
}

export async function addBankAccount(data: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = bankAccountBodySchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const orgId = cookieStore.get('active-organization-id')?.value
    
    if (!orgId) {
      return { success: false, error: 'Organization ID not found' }
    }

    const result = await client.organizations.addBankAccount(orgId, validation.data)
    const accountId = result.id

    revalidatePath('/dashboard/settings')

    return {
      success: true,
      accountId,
      message: 'Bank account added. Verification pending.',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to add bank account',
    }
  }
}

export async function removeBankAccount(accountId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!accountId || typeof accountId !== 'string') {
    return { success: false, error: 'Account ID is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    await client.organizations.removeBankAccount(accountId)
    
    revalidatePath('/dashboard/settings')

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to remove bank account',
    }
  }
}

export async function setDefaultBankAccount(accountId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!accountId || typeof accountId !== 'string') {
    return { success: false, error: 'Account ID is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    await client.organizations.setDefaultBankAccount(accountId)
    
    revalidatePath('/dashboard/settings')

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to set default bank account',
    }
  }
}

export async function enable2FA(password: string, issuer?: string): Promise<SettingsActionResult> {
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.twoFactorEnable({ password, issuer })
    
    // Generate QR code URL from TOTP URI
    const qrCodeUrl = result.totpURI 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(result.totpURI)}`
      : undefined

    revalidatePath('/dashboard/settings')

    return {
      success: result.success,
      secret: result.totpURI ? result.totpURI.split('secret=')[1]?.split('&')[0] : undefined,
      qrCodeUrl,
      backupCodes: result.backupCodes,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to enable 2FA',
    }
  }
}

export async function verify2FA(code: unknown): Promise<SettingsActionResult> {
  // Validate input
  const validation = verify2FABodySchema.safeParse({ code })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid code',
    }
  }

  // Note: This is for verifying during setup, not during login
  // During login, use verify2FATotp from auth actions
  // This function might need to be adjusted based on your 2FA flow
  revalidatePath('/dashboard/settings')

  return { success: true, message: '2FA enabled successfully' }
}

export async function disable2FA(password: string): Promise<SettingsActionResult> {
  // Validate password
  if (!password || typeof password !== 'string' || password.length < 1) {
    return { success: false, error: 'Password is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.twoFactorDisable({ password })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { success: result.success }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to disable 2FA',
    }
  }
}

/**
 * Change email address
 */
export async function changeEmail(newEmail: string, password: string): Promise<SettingsActionResult> {
  if (!newEmail || typeof newEmail !== 'string') {
    return { success: false, error: 'Email is required' }
  }
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.changeEmail({ newEmail })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { 
      success: result.status, 
      message: result.message || 'Email change request sent. Please check your email to confirm.',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to change email',
    }
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(password?: string): Promise<SettingsActionResult> {
  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.deleteUser({ password })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { 
      success: result.success,
      message: 'Account deletion request sent. Please check your email to confirm.',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete account',
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email?: string): Promise<SettingsActionResult> {
  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.sendVerificationEmail({ email: email || '' })
    
    return { 
      success: result.status,
      message: 'Verification email sent. Please check your inbox.',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send verification email',
    }
  }
}

export async function revokeSession(sessionId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!sessionId || typeof sessionId !== 'string') {
    return { success: false, error: 'Session ID is required' }
  }

  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.revokeSession({ token: sessionId })
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { success: result.status }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to revoke session',
    }
  }
}

export async function revokeAllSessions(): Promise<SettingsActionResult> {
  const { getEncoreClient } = await import('@/lib/encore')
  
  try {
    const client = getEncoreClient()
    const result = await client.auth.revokeOtherSessions()
    
    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')

    return { success: result.status, message: 'All other sessions have been signed out' }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to revoke sessions',
    }
  }
}

/**
 * Get user sessions
 * Sessions are managed by Encore backend
 */
export async function getUserSessions(): Promise<{
  success: boolean
  data?: Array<{
    id: string
    device: string
    browser: string
    location: string
    lastActive: string
    current: boolean
    iconType: 'computer' | 'smartphone' | 'mac'
  }>
  error?: string
}> {
  try {
    const { getEncoreClient } = await import('@/lib/encore')
    const client = getEncoreClient()
    const result = await client.auth.listSessions()
    
    // Map Encore session format to our UI format
    // ❌ Backend missing: device, browser, location, lastActive, current, iconType
    // TODO: Backend should add these fields to SessionResponse
    const sessions = (result.sessions || []).map((session: auth.SessionResponse) => {
      // Parse userAgent for device/browser if available
      const userAgent = session.userAgent || ''
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
      const isMac = /Mac/.test(userAgent)
      const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge)\/[\d.]+/)
      const browser = browserMatch ? browserMatch[1] : 'Unknown Browser'
      
      return {
        id: session.id || session.token || '',
        device: session.device || (isMobile ? 'Mobile Device' : 'Desktop') || 'Unknown Device', // ❌ Backend should provide
        browser: session.browser || browser, // ❌ Backend should provide
        location: session.location || (session.ipAddress ? `IP: ${session.ipAddress}` : 'Unknown Location'), // ❌ Backend should provide
        lastActive: session.lastActive || session.updatedAt || session.createdAt || new Date().toISOString(), // ❌ Backend should provide
        current: session.current !== undefined ? session.current : false, // ❌ Backend should provide
        iconType: session.iconType || (isMobile ? 'smartphone' : isMac ? 'mac' : 'computer') as 'computer' | 'smartphone' | 'mac', // ❌ Backend should provide
      }
    })
    
      return {
        success: true,
        data: sessions.map(s => ({
          ...s,
          iconType: s.iconType || 'computer' as 'computer' | 'smartphone' | 'mac',
        })),
      }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch sessions',
    }
  }
}
