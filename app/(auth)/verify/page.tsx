'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Button from '@/components/ui/button'
import * as DigitInput from '@/components/ui/digit-input'
import { Callout } from '@/components/ui/callout'
import { ShieldCheck, ArrowClockwise, Key } from '@phosphor-icons/react'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const twoFactorToken = searchParams.get('token')
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [resendCooldown, setResendCooldown] = React.useState(0)

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    if (!twoFactorToken) {
      setError('Invalid verification token')
      return
    }

    setIsLoading(true)

    try {
      const { verify2FATotp } = await import('@/app/actions/auth')
      const result = await verify2FATotp(twoFactorToken, code)
      
      if (result.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(result.error || 'Invalid code. Please try again.')
      }
    } catch (err) {
      setError('Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [code, router, twoFactorToken])

  const handleResend = async () => {
    if (resendCooldown > 0 || !twoFactorToken) return

    setResendCooldown(30)
    try {
      const { send2FAOtp } = await import('@/app/actions/auth')
      await send2FAOtp(twoFactorToken)
    } catch {
      // Silently fail - user can try again
    }
  }

  // Auto-submit when code is complete
  const codeCompleteRef = React.useRef(false)
  React.useEffect(() => {
    if (code.length === 6 && !codeCompleteRef.current) {
      codeCompleteRef.current = true
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    } else if (code.length < 6) {
      codeCompleteRef.current = false
    }
  }, [code, handleSubmit])

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-bg-white-0 p-6 sm:p-8 ring-1 ring-inset ring-stroke-soft-200 shadow-lg">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary-base to-primary-darker mx-auto mb-4 shadow-md">
            <ShieldCheck weight="duotone" className="size-7 sm:size-8 text-white" />
          </div>
          <h1 className="text-title-h5 sm:text-title-h4 text-text-strong-950 mb-1">
            Two-Factor Authentication
          </h1>
          <p className="text-paragraph-xs sm:text-paragraph-sm text-text-sub-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Callout variant="error" size="sm" className="mb-6">
            {error}
          </Callout>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div className="flex flex-col items-center">
            <DigitInput.Root
              numInputs={6}
              value={code}
              onChange={setCode}
            />
            <p className="mt-3 text-paragraph-xs text-text-soft-400 text-center">
              Code expires in 30 seconds
            </p>
          </div>

          {/* Verify Button */}
          <Button.Root
            type="submit"
            variant="primary"
            className="w-full h-11"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button.Root>

          {/* Resend Code */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-1.5 text-paragraph-sm text-primary-base hover:text-primary-darker disabled:text-text-soft-400 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowClockwise className="size-4" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-stroke-soft-200" />

        {/* Backup Code Option */}
        <div className="rounded-xl bg-bg-weak-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200 shrink-0">
              <Key weight="duotone" className="size-5 text-text-sub-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-label-sm text-text-strong-950 mb-0.5">
                Lost access to your authenticator?
              </h3>
              <p className="text-paragraph-xs text-text-sub-600 mb-2">
                Use one of your backup codes to sign in
              </p>
              <Link
                href="/verify/backup"
                className="inline-flex items-center text-paragraph-sm text-primary-base font-medium hover:text-primary-darker hover:underline transition-colors"
              >
                Use backup code →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
