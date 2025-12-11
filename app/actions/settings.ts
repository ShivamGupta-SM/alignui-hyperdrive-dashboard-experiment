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
import { delay, DELAY } from '@/lib/utils/delay'

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

  await delay(DELAY.SLOW)

  // In a real app, this would update user profile in database
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/profile')

  return { success: true }
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

  await delay(DELAY.SLOW)

  // In a real app, this would update organization in database
  revalidatePath('/dashboard/settings')

  return { success: true }
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

  await delay(DELAY.SLOW)

  // In a real app, this would verify current password and update
  return { success: true, message: 'Password updated successfully' }
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

  await delay(DELAY.STANDARD)

  // In a real app, this would update notification preferences
  revalidatePath('/dashboard/settings')

  return { success: true }
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

  await delay(DELAY.LONG)

  const accountId = `ba_${Date.now()}`

  revalidatePath('/dashboard/settings')

  return {
    success: true,
    accountId,
    message: 'Bank account added. Verification pending.',
  }
}

export async function removeBankAccount(accountId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!accountId || typeof accountId !== 'string') {
    return { success: false, error: 'Account ID is required' }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would remove the bank account
  revalidatePath('/dashboard/settings')

  return { success: true }
}

export async function setDefaultBankAccount(accountId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!accountId || typeof accountId !== 'string') {
    return { success: false, error: 'Account ID is required' }
  }

  await delay(DELAY.STANDARD)

  revalidatePath('/dashboard/settings')

  return { success: true }
}

export async function enable2FA(): Promise<SettingsActionResult> {
  await delay(DELAY.SLOW)

  // Generate a cryptographically secure TOTP secret
  const secret = generateTOTPSecret()
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/Hypedrive:user@example.com?secret=${secret}&issuer=Hypedrive`)}`

  return {
    success: true,
    secret,
    qrCodeUrl,
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

  await delay(DELAY.STANDARD)

  revalidatePath('/dashboard/settings')

  return { success: true, message: '2FA enabled successfully' }
}

export async function disable2FA(password: string): Promise<SettingsActionResult> {
  // Validate password
  if (!password || typeof password !== 'string' || password.length < 1) {
    return { success: false, error: 'Password is required' }
  }

  await delay(DELAY.SLOW)

  // In a real app, this would verify password and disable 2FA
  revalidatePath('/dashboard/settings')

  return { success: true }
}

export async function revokeSession(sessionId: string): Promise<SettingsActionResult> {
  // Validate id
  if (!sessionId || typeof sessionId !== 'string') {
    return { success: false, error: 'Session ID is required' }
  }

  await delay(DELAY.STANDARD)

  // In a real app, this would invalidate the session
  revalidatePath('/dashboard/settings')

  return { success: true }
}

export async function revokeAllSessions(): Promise<SettingsActionResult> {
  await delay(DELAY.SLOW)

  // In a real app, this would invalidate all sessions except current
  revalidatePath('/dashboard/settings')

  return { success: true, message: 'All other sessions have been signed out' }
}
