import { z } from 'zod'
import crypto from 'node:crypto'
import { delay, DELAY } from '@/lib/utils/delay'
import { successResponse, serverErrorResponse, parseBody, errorResponse } from '@/lib/api-utils'
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-helpers'
import { LIMITS, VALIDATION } from '@/lib/types/constants'

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

const enable2FASchema = z.object({
  code: z.string().length(VALIDATION.TWO_FA_CODE_LENGTH, `Code must be ${VALIDATION.TWO_FA_CODE_LENGTH} digits`).regex(/^\d+$/, 'Code must be numeric'),
})

const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

// GET - Generate 2FA setup (secret and QR code)
export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    await delay(DELAY.FAST)

    // Generate a cryptographically secure TOTP secret
    const secret = generateTOTPSecret()
    const qrCodeUrl = `otpauth://totp/Hyprive:${auth.context.user.email}?secret=${secret}&issuer=Hyprive`

    return successResponse({
      secret,
      qrCodeUrl,
      // In production, generate an actual QR code image or data URL
      qrCodeDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${LIMITS.QR_CODE_SIZE}x${LIMITS.QR_CODE_SIZE}&data=${encodeURIComponent(qrCodeUrl)}`,
    })
  } catch (error) {
    console.error('2FA GET error:', error)
    return serverErrorResponse('Failed to generate 2FA setup')
  }
}

// POST - Enable 2FA (verify code and activate)
export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, enable2FASchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { code } = parsed.data

    // In production, verify the TOTP code
    // For mock, accept any 6-digit code except '000000'
    if (code === '000000') {
      return errorResponse('Invalid verification code', 400)
    }

    await delay(DELAY.MEDIUM)

    // Generate backup codes
    const backupCodes = Array.from({ length: LIMITS.BACKUP_CODES_COUNT }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    return successResponse({
      message: 'Two-factor authentication enabled successfully',
      backupCodes,
    })
  } catch (error) {
    console.error('2FA POST error:', error)
    return serverErrorResponse('Failed to enable 2FA')
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth.success) {
      return unauthorizedResponse(auth.error)
    }

    const parsed = await parseBody(request, disable2FASchema)
    if ('error' in parsed) {
      return parsed.error
    }

    const { password } = parsed.data

    // In production, verify password
    if (password === 'wrong') {
      return errorResponse('Incorrect password', 400)
    }

    await delay(DELAY.MEDIUM)

    return successResponse({
      message: 'Two-factor authentication disabled successfully',
    })
  } catch (error) {
    console.error('2FA DELETE error:', error)
    return serverErrorResponse('Failed to disable 2FA')
  }
}
